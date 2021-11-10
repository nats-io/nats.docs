# Client Protocol

## Client Protocol

The wire protocol used to communicate between the NATS server and clients is a simple, text-based publish/subscribe style protocol. Clients connect to and communicate with `nats-server` (the NATS server) through a regular TCP/IP socket using a small set of protocol operations that are terminated by a new line.

Unlike traditional messaging systems that use a binary message format that require an API to consume, the text-based NATS protocol makes it easy to implement clients in a wide variety of programming and scripting languages. In fact, refer to the topic [NATS Protocol Demo](../nats-protocol-demo.md) to play with the NATS protocol for yourself using telnet.

The NATS server implements a [zero allocation byte parser](https://youtu.be/ylRKac5kSOk?t=10m46s) that is fast and efficient.

## Protocol conventions

**Control line w/Optional Content**: Each interaction between the client and server consists of a control, or protocol, line of text followed, optionally by message content. Most of the protocol messages don't require content, only `PUB` and `MSG` include payloads.

**Field Delimiters**: The fields of NATS protocol messages are delimited by whitespace characters '\`\`\`'(space) or\`\`\t\` (tab). Multiple whitespace characters will be treated as a single field delimiter.

**Newlines**: NATS uses `CR` followed by `LF` (`CR+LF`, `\r`, `0x0D0A`) to terminate protocol messages. This newline sequence is also used to mark the end of the message payload in a `PUB` or `MSG` protocol message.

**Subject names**: Subject names, including reply subject (INBOX) names, are case-sensitive and must be non-empty alphanumeric strings with no embedded whitespace. All ascii alphanumeric characters except spaces/tabs and separators which are "." and ">" are allowed. Subject names can be optionally token-delimited using the dot character (`.`), e.g.:

`FOO`, `BAR`, `foo.bar`, `foo.BAR`, `FOO.BAR` and `FOO.BAR.BAZ` are all valid subject names

`FOO. BAR`, `foo. .bar` and`foo..bar` are _not_ valid subject names

A subject is comprised of 1 or more tokens. Tokens are separated by "." and can be any non space ascii alphanumeric character. The full wildcard token ">" is only valid as the last token and matches all tokens past that point. A token wildcard, "\*" matches any token in the position it was listed. Wildcard tokens should only be used in a wildcard capacity and not part of a literal token.

**Character Encoding**: Subject names should be ascii characters for maximum interoperability. Due to language constraints and performance, some clients may support UTF-8 subject names, as may the server. No guarantees of non-ASCII support are provided.

**Wildcards**: NATS supports the use of wildcards in subject subscriptions.

* The asterisk character (`*`) matches a single token at any level of the subject.
* The greater than symbol (`>`), also known as the _full wildcard_, matches one or more tokens at the tail of a subject, and must be the last token. The wildcarded subject `foo.>` will match `foo.bar` or `foo.bar.baz.1`, but not `foo`.
* Wildcards must be a separate token (`foo.*.baz` or `foo.>` are syntactically valid; `foo*.bar`, `f*o.b*r` and `foo>` are not)

For example, the wildcard subscriptions `foo.*.quux` and `foo.>` both match `foo.bar.quux`, but only the latter matches `foo.bar.baz`. With the full wildcard, it is also possible to express interest in every subject that may exist in NATS: `sub > 1`, limited of course by authorization settings.

## Protocol messages

The following table briefly describes the NATS protocol messages. NATS protocol operation names are case insensitive, thus `SUB foo 1\r` and `sub foo 1\r` are equivalent.

Click the name to see more detailed information, including syntax:

| OP Name                 | Sent By | Description                                                 |
| ----------------------- | ------- | ----------------------------------------------------------- |
| [`INFO`](./#info)       | Server  | Sent to client after initial TCP/IP connection              |
| [`CONNECT`](./#connect) | Client  | Sent to server to specify connection information            |
| [`PUB`](./#pub)         | Client  | Publish a message to a subject, with optional reply subject |
| [`SUB`](./#sub)         | Client  | Subscribe to a subject (or subject wildcard)                |
| [`UNSUB`](./#unsub)     | Client  | Unsubscribe (or auto-unsubscribe) from subject              |
| [`MSG`](./#msg)         | Server  | Delivers a message payload to a subscriber                  |
| [`PING`](./#pingpong)   | Both    | PING keep-alive message                                     |
| [`PONG`](./#pingpong)   | Both    | PONG keep-alive response                                    |
| [`+OK`](./#okerr)       | Server  | Acknowledges well-formed protocol message in `verbose` mode |
| [`-ERR`](./#okerr)      | Server  | Indicates a protocol error. May cause client disconnect.    |

The following sections explain each protocol message.

## INFO

### Description

A client will need to start as a plain TCP connection, then when the server accepts a connection from the client, it will send information about itself, the configuration and security requirements necessary for the client to successfully authenticate with the server and exchange messages.

When using the updated client protocol (see [`CONNECT`](./#connect) below), `INFO` messages can be sent anytime by the server. This means clients with that protocol level need to be able to asynchronously handle `INFO` messages.

### Syntax

`INFO {["option_name":option_value],...}`

The valid options are as follows:

* `server_id`: The unique identifier of the NATS server
* `version`: The version of the NATS server
* `go`: The version of golang the NATS server was built with
* `host`: The IP address used to start the NATS server, by default this will be `0.0.0.0` and can be configured with `-client_advertise host:port`
* `port`: The port number the NATS server is configured to listen on
* `max_payload`: Maximum payload size, in bytes, that the server will accept from the client.
* `proto`: An integer indicating the protocol version of the server. The server version 1.2.0 sets this to `1` to indicate that it supports the "Echo" feature.
* `client_id`: An optional unsigned integer (64 bits) representing the internal client identifier in the server. This can be used to filter client connections in monitoring, correlate with error logs, etc...
* `auth_required`: If this is set, then the client should try to authenticate upon connect.
* `tls_required`: If this is set, then the client must perform the TLS/1.2 handshake. Note, this used to be `ssl_required` and has been updated along with the protocol from SSL to TLS.
* `tls_verify`: If this is set, the client must provide a valid certificate during the TLS handshake.
* `connect_urls` : An optional list of server urls that a client can connect to.
* `ldm`: If the server supports _Lame Duck Mode_ notifications, and the current server has transitioned to lame duck, `ldm` will be set to `true`.

#### connect_urls

The `connect_urls` field is a list of urls the server may send when a client first connects, and when there are changes to server cluster topology. This field is considered optional, and may be omitted based on server configuration and client protocol level.

When a NATS server cluster expands, an `INFO` message is sent to the client with an updated `connect_urls` list. This cloud-friendly feature asynchronously notifies a client of known servers, allowing it to connect to servers not originally configured.

The `connect_urls` will contain a list of strings with an IP and port, looking like this: `"connect_urls":["10.0.0.184:4333","192.168.129.1:4333","192.168.192.1:4333"]`

### Example

Below you can see a sample connection string from a telnet connection to the `demo.nats.io` site.

```bash
telnet demo.nats.io 4222
```

Output

```
Trying 107.170.221.32...
Connected to demo.nats.io.
Escape character is '^]'.
INFO {"server_id":"Zk0GQ3JBSrg3oyxCRRlE09","version":"1.2.0","proto":1,"go":"go1.10.3","host":"0.0.0.0","port":4222,"max_payload":1048576,"client_id":2392}
```

## CONNECT

### Description

The `CONNECT` message is the client version of the [`INFO`](./#info) message. Once the client has established a TCP/IP socket connection with the NATS server, and an [`INFO`](./#info) message has been received from the server, the client may send a `CONNECT` message to the NATS server to provide more information about the current connection as well as security information.

### Syntax

`CONNECT {["option_name":option_value],...}`

The valid options are as follows:

* `verbose`: Turns on [`+OK`](./#okerr) protocol acknowledgements.
* `pedantic`: Turns on additional strict format checking, e.g. for properly formed subjects
* `tls_required`: Indicates whether the client requires an SSL connection.
* `auth_token`: Client authorization token (if `auth_required` is set)
* `user`: Connection username (if `auth_required` is set)
* `pass`: Connection password (if `auth_required` is set)
* `name`: Optional client name
* `lang`: The implementation language of the client.
* `version`: The version of the client.
* `protocol`: _optional int_. Sending `0` (or absent) indicates client supports original protocol. Sending `1` indicates that the client supports dynamic reconfiguration of cluster topology changes by asynchronously receiving [`INFO`](./#info) messages with known servers it can reconnect to.
* `echo`: Optional boolean. If set to `true`, the server (version 1.2.0+) will not send originating messages from this connection to its own subscriptions. Clients should set this to `true` only for server supporting this feature, which is when `proto` in the `INFO` protocol is set to at least `1`.
* `sig`: In case the server has responded with a `nonce` on `INFO`, then a NATS client must use this field to reply with the signed `nonce`.
* `jwt`: The JWT that identifies a user permissions and acccount.

### Example

Here is an example from the default string of the Go client:

```
[CONNECT {"verbose":false,"pedantic":false,"tls_required":false,"name":"","lang":"go","version":"1.2.2","protocol":1}]\r
```

Most clients set `verbose` to `false` by default. This means that the server should not confirm each message it receives on this connection with a [`+OK`](./#okerr) back to the client.

## PUB

### Description

The `PUB` message publishes the message payload to the given subject name, optionally supplying a reply subject. If a reply subject is supplied, it will be delivered to eligible subscribers along with the supplied payload. Note that the payload itself is optional. To omit the payload, set the payload size to 0, but the second CRLF is still required.

### Syntax

`PUB <subject> [reply-to] <#bytes>\r\n[payload]\r`

where:

* `subject`: The destination subject to publish to
* `reply-to`: The optional reply inbox subject that subscribers can use to send a response back to the publisher/requestor
* `#bytes`: The payload size in bytes
* `payload`: The message payload data

### Example

To publish the ASCII string message payload "Hello NATS!" to subject FOO:

`PUB FOO 11\r\nHello NATS!\r`

To publish a request message "Knock Knock" to subject FRONT.DOOR with reply subject INBOX.22:

`PUB FRONT.DOOR INBOX.22 11\r\nKnock Knock\r`

To publish an empty message to subject NOTIFY:

`PUB NOTIFY 0\r\n\r`

## SUB

### Description

`SUB` initiates a subscription to a subject, optionally joining a distributed queue group.

### Syntax

`SUB <subject> [queue group] <sid>\r`

where:

* `subject`: The subject name to subscribe to
* `queue group`: If specified, the subscriber will join this queue group
* `sid`: A unique alphanumeric subscription ID, generated by the client

### Example

To subscribe to the subject `FOO` with the connection-unique subscription identifier (sid) `1`:

`SUB FOO 1\r`

To subscribe the current connection to the subject `BAR` as part of distribution queue group `G1` with sid `44`:

`SUB BAR G1 44\r`

## UNSUB

### Description

`UNSUB` unsubscribes the connection from the specified subject, or auto-unsubscribes after the specified number of messages has been received.

### Syntax

`UNSUB <sid> [max_msgs]`

where:

* `sid`: The unique alphanumeric subscription ID of the subject to unsubscribe from
* `max_msgs`: An optional number of messages to wait for before automatically unsubscribing

### Example

The following examples concern subject `FOO` which has been assigned sid `1`. To unsubscribe from `FOO`:

`UNSUB 1\r`

To auto-unsubscribe from `FOO` after 5 messages have been received:

`UNSUB 1 5\r`

## MSG

### Description

The `MSG` protocol message is used to deliver an application message to the client.

### Syntax

`MSG <subject> <sid> [reply-to] <#bytes>\r\n[payload]\r`

where:

* `subject`: Subject name this message was received on
* `sid`: The unique alphanumeric subscription ID of the subject
* `reply-to`: The inbox subject on which the publisher is listening for responses
* `#bytes`: Size of the payload in bytes
* `payload`: The message payload data

### Example

The following message delivers an application message from subject `FOO.BAR`:

`MSG FOO.BAR 9 11\r\nHello World\r`

To deliver the same message along with a reply inbox:

`MSG FOO.BAR 9 INBOX.34 11\r\nHello World\r`

## PING/PONG

### Description

`PING` and `PONG` implement a simple keep-alive mechanism between client and server. Once a client establishes a connection to the NATS server, the server will continuously send `PING` messages to the client at a configurable interval. If the client fails to respond with a `PONG` message within the configured response interval, the server will terminate its connection. If your connection stays idle for too long, it is cut off.

If the server sends a ping request, you can reply with a pong message to notify the server that you are still interested. You can also ping the server and will receive a pong reply. The ping/pong interval is configurable.

The server uses normal traffic as a ping/pong proxy, so a client that has messages flowing may not receive a ping from the server.

### Syntax

`PING\r`

`PONG\r`

### Example

The following example shows the demo server pinging the client and finally shutting it down.

```
telnet demo.nats.io 4222

Trying 107.170.221.32...
Connected to demo.nats.io.
Escape character is '^]'.
INFO {"server_id":"Zk0GQ3JBSrg3oyxCRRlE09","version":"1.2.0","proto":1,"go":"go1.10.3","host":"0.0.0.0","port":4222,"max_payload":1048576,"client_id":2392}
PING
PING
-ERR 'Stale Connection'
Connection closed by foreign host.
```

## +OK/ERR

### Description

When the `verbose` connection option is set to `true` (the default value), the server acknowledges each well-formed protocol message from the client with a `+OK` message. Most NATS clients set the `verbose` option to `false` using the [`CONNECT`](./#connect) message

The `-ERR` message is used by the server indicate a protocol, authorization, or other runtime connection error to the client. Most of these errors result in the server closing the connection.

Handling of these errors usually has to be done asynchronously.

### Syntax

`+OK`

`-ERR <error message>`

Some protocol errors result in the server closing the connection. Upon receiving these errors, the connection is no longer valid and the client should clean up relevant resources. These errors include:

* `-ERR 'Unknown Protocol Operation'`: Unknown protocol error
* `-ERR 'Attempted To Connect To Route Port'`: Client attempted to connect to a route port instead of the client port
* `-ERR 'Authorization Violation'`: Client failed to authenticate to the server with credentials specified in the [`CONNECT`](./#connect) message
* `-ERR 'Authorization Timeout'`: Client took too long to authenticate to the server after establishing a connection (default 1 second)
* `-ERR 'Invalid Client Protocol'`: Client specified an invalid protocol version in the [`CONNECT`](./#connect) message
* `-ERR 'Maximum Control Line Exceeded'`: Message destination subject and reply subject length exceeded the maximum control line value specified by the `max_control_line` server option. The default is 1024 bytes.
* `-ERR 'Parser Error'`: Cannot parse the protocol message sent by the client
* `-ERR 'Secure Connection - TLS Required'`: The server requires TLS and the client does not have TLS enabled.
* `-ERR 'Stale Connection'`: The server hasn't received a message from the client, including a `PONG` in too long.
* `-ERR 'Maximum Connections Exceeded`': This error is sent by the server when creating a new connection and the server has exceeded the maximum number of connections specified by the `max_connections` server option. The default is 64k.
* `-ERR 'Slow Consumer'`: The server pending data size for the connection has reached the maximum size (default 10MB).
* `-ERR 'Maximum Payload Violation'`: Client attempted to publish a message with a payload size that exceeds the `max_payload` size configured on the server. This value is supplied to the client upon connection in the initial [`INFO`](./#info) message. The client is expected to do proper accounting of byte size to be sent to the server in order to handle this error synchronously.

Protocol error messages where the connection remains open are listed below. The client should not close the connection in these cases.

* `-ERR 'Invalid Subject'`: Client sent a malformed subject (e.g. `sub foo. 90`)
* `-ERR 'Permissions Violation for Subscription to <subject>'`: The user specified in the [`CONNECT`](./#connect) message does not have permission to subscribe to the subject.
* `-ERR 'Permissions Violation for Publish to <subject>'`: The user specified in the [`CONNECT`](./#connect) message does not have permissions to publish to the subject.
