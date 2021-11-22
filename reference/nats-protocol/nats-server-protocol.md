# NATS Cluster Protocol

## NATS Cluster Protocol

The NATS server clustering protocol describes the protocols passed between NATS servers within a [cluster](../running-a-nats-service/configuration/clustering/) to share accounts, subscriptions, forward messages, and share cluster topology regarding new servers. It is a simple text-based protocol. Servers communicate with each other through a regular TCP/IP or TLS socket using a small set of protocol operations that are terminated by newline.

The NATS server implements a [zero allocation byte parser](https://youtu.be/ylRKac5kSOk?t=10m46s) that is fast and efficient.

The NATS cluster protocol is very similar to that of the NATS client protocol. In the context of a cluster, it can be helpful to visualize a server being a proxy operating on behalf of its connected clients, subscribing, unsubscribing, sending and receiving messages.

## NATS Cluster protocol conventions

**Subject names and wildcards**: The NATS cluster protocol has the same features and restrictions as the client with respect to subject names and wildcards. Clients are bound to a single account, however the cluster protocol handles all accounts.

**Field Delimiters**: The fields of NATS protocol messages are delimited by whitespace characters '`` `'\(space\) or ``\t\` (tab). Multiple whitespace characters will be treated as a single field delimiter.

**Newlines**: Like other text-based protocols, NATS uses `CR` followed by `LF` (`CR+LF`, `\r\n`, `0x0D0A`) to terminate protocol messages. This newline sequence is also used to mark the beginning of the actual message payload in a `RMSG` protocol message.

## NATS Cluster protocol messages

The following table briefly describes the NATS cluster protocol messages. As in the client protocol, the NATS protocol operation names are case insensitive, thus `SUB foo 1\r\n` and `sub foo 1\r\n` are equivalent.

Click the name to see more detailed information, including syntax:

| OP Name                                      | Sent By       | Description                                                                  |
| -------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| [`INFO`](nats-server-protocol.md#info)       | All Servers   | Sent after initial TCP/IP connection and to update cluster knowledge         |
| [`CONNECT`](nats-server-protocol.md#connect) | All Servers   | Sent to establish a route                                                    |
| [`RS+`](nats-server-protocol.md#sub)         | All Servers   | Subscribes to a subject for a given account on behalf of interested clients. |
| [`RS-`](nats-server-protocol.md#unsub)       | All Servers   | Unsubscribe (or auto-unsubscribe) from subject for a given account.          |
| [`RMSG`](nats-server-protocol.md#rmsg)       | Origin Server | Delivers a message for a given subject and account to another server.        |
| [`PING`](nats-server-protocol.md#pingpong)   | All Servers   | PING keep-alive message                                                      |
| [`PONG`](nats-server-protocol.md#pingpong)   | All Servers   | PONG keep-alive response                                                     |
| [`-ERR`](nats-server-protocol.md#-err)       | All Servers   | Indicates a protocol error. May cause the remote server to disconnect.       |

The following sections explain each protocol message.

## INFO

### Description

As soon as the server accepts a connection from another server, it will send information about itself and the configuration and security requirements that are necessary for the other server to successfully authenticate with the server and exchange messages.

The connecting server also sends an `INFO` message. The accepting server will add an `ip` field containing the address and port of the connecting server, and forward the new server's `INFO` message to all servers it is routed to.

Any servers in a cluster receiving an `INFO` message with an `ip` field will attempt to connect to the server at that address, unless already connected. This propagation of `INFO` messages on behalf of a connecting server provides automatic discovery of new servers joining a cluster.

### Syntax

`INFO {["option_name":option_value],...}`

The valid options are as follows:

* `server_id`: The unique identifier of the NATS server
* `version`: The version of the NATS server
* `go`: The version of golang the NATS server was built with
* `host`: The host specified in the cluster parameter/options
* `port`: The port number specified in the cluster parameter/options
* `auth_required`: If this is set, then the server should try to authenticate upon connect.
* `tls_required`: If this is set, then the server must authenticate using TLS.
* `max_payload`: Maximum payload size that the server will accept.
* `connect_urls` : A list of server urls that a client can connect to.
* `ip`:  Optional route connection address of a server, `nats-route://<hostname>:<port>`

### Example

Below is an example of an `INFO` string received by a NATS server, with the `ip` field.

```
INFO {"server_id":"KP19vTlB417XElnv8kKaC5","version":"2.0.0","go":"","host":"localhost","port":5222,"auth_required":false,"tls_required":false,"tls_verify":false,"max_payload":1048576,"ip":"nats-route://127.0.0.1:5222/","connect_urls":["localhost:4222"]}
```

## CONNECT

### Description

The `CONNECT` message is analogous to the [`INFO`](nats-server-protocol.md#info) message. Once the NATS server has established a TCP/IP socket connection with another server, and an [`INFO`](nats-server-protocol.md#info) message has been received, the server will send a `CONNECT` message to provide more information about the current connection as well as security information.

### Syntax

`CONNECT {["option_name":option_value],...}`

The valid options are as follows:

* `tls_required`: Indicates whether the server requires an SSL connection.
* `auth_token`:  Authorization token
* `user`: Connection username (if `auth_required` is set)
* `pass`: Connection password (if `auth_required` is set)
* `name`: Generated Server Name
* `lang`: The implementation language of the server (go).
* `version`: The version of the server.

### Example

Here is an example from the default string from a server.

`CONNECT {"tls_required":false,"name":"wt0vffeQyoDGMVBC2aKX0b"}\r\n`

## RS+

### Description

`RS+` initiates a subscription to a subject on on a given account, optionally with a distributed queue group name and weighting factor. Note that queue subscriptions will use RS+ for increases and descreases to queue weight except when the weighting factor is 0.

### Syntax

**Subscription**: `RS+ <account> <subject>\r\n`

**Queue Subscription**: `RS+ <account> <subject> <queue> <weight>\r\n`

where:

* `account`: The account associated with the subject interest
* `subject`: The subject
* `queue`: Optional queue group name
* `weight`: Optional queue group weight representing how much interest/subscribers

## RS-

### Description

`RS-` unsubcribes from the specified subject on the given account. It is sent by a server when it no longer has interest in a given subject.

### Syntax

**Subscription**: `RS- <account> <subject>\r\n`

where:

* `account`: The account associated with the subject interest
* `subject`: The subject

## RMSG

### Description

The `RMSG` protocol message delivers a message to another server.

### Syntax

`RMSG <account> <subject> [reply-to] <#bytes>\r\n[payload]\r\n`

where:

* `account`: The account associated with the subject interest
* `subject`: Subject name this message was received on
* `reply-to`: The optional reply subject
* `#bytes`: Size of the payload in bytes
* `payload`: The message payload data

## PING/PONG

### Description

`PING` and `PONG` implement a simple keep-alive mechanism between servers. Once two servers establish a connection with each other, the NATS server will continuously send `PING` messages to other servers at a configurable interval. If another server fails to respond with a `PONG` message within the configured response interval, the server will terminate its connection. If your connection stays idle for too long, it is cut off.

If the another server sends a ping request, a server will reply with a pong message to notify the other server that it is still present.

### Syntax

`PING\r\n` `PONG\r\n`

## -ERR

### Description

The `-ERR` message is used by the server to indicate a protocol, authorization, or other runtime connection error to another server. Most of these errors result in the remote server closing the connection.
