# The Streaming Protocol

You can find a list of all supported client libraries [here](https://nats.io/download/). There are also links to community contributed clients.

In the event you would want to write your own NATS Streaming library, you could have a look at existing libraries to understand the flow. But you need to use [Google Protocol Buffers](https://developers.google.com/protocol-buffers/) to exchange protocols between the client and the server.

## NATS Streaming Protocol

The NATS streaming protocol sits atop the core NATS protocol and uses [Google's Protocol Buffers](https://developers.google.com/protocol-buffers/). Protocol buffer messages are marshaled into bytes and published as NATS messages on specific subjects described below. In communicating with the NATS Streaming Server, the NATS request/reply pattern is used for all protocol messages that have a corresponding reply.

### NATS streaming protocol conventions

**Subject names**: Subject names, including reply subject \(INBOX\) names, are case-sensitive and must be non-empty alphanumeric strings with no embedded whitespace, and optionally token-delimited using the dot character \(`.`\), e.g.:

`FOO`, `BAR`, `foo.bar`, `foo.BAR`, `FOO.BAR` and `FOO.BAR.BAZ` are all valid subject names

`FOO. BAR`, `foo. .bar` and`foo..bar` are \*not- valid subject names

**Wildcards**: NATS streaming does **not** support wildcards in subject subscriptions

**Protocol definition**: The fields of NATS streaming protocol messages are defined in the NATS streaming client [protocol file](https://github.com/nats-io/stan.go/blob/master/pb/protocol.proto).

### NATS streaming protocol messages

The following table briefly describes the NATS streaming protocol messages.

Click the name to see more detailed information, including usage:

#### Protocols

| Message Name | Sent By | Description |
| :--- | :--- | :--- |
| [`ConnectRequest`](protocol.md#connectrequest) | Client | Request to connect to the NATS Streaming Server |
| [`ConnectResponse`](protocol.md#connectresponse) | Server | Result of a connection request |
| [`SubscriptionRequest`](protocol.md#subscriptionrequest) | Client | Request sent to subscribe and retrieve data |
| [`SubscriptionResponse`](protocol.md#subscriptionresponse) | Server | Result of a subscription request |
| [`UnsubscribeRequest`](protocol.md#unsubscriberequest) | Client | Unsubscribe from a subject |
| [`PubMsg`](protocol.md#pubmsg) | Client | Publish a message to a subject |
| [`PubAck`](protocol.md#puback) | Server | An acknowledgement that a published message has been processed on the server |
| [`MsgProto`](protocol.md#msgproto) | Server | A message from the NATS Streaming Server to a subscribing client |
| [`Ack`](protocol.md#ack) | Client | Acknowledges that a message has been received |
| [`Ping`](protocol.md#ping) | Client | Ping sent to server to detect connection loss |
| [`PingResponse`](protocol.md#pingresponse) | Server | Result of a Ping |
| [`CloseRequest`](protocol.md#closerequest) | Client | Request sent to close the connection to the NATS Streaming Server |
| [`CloseResponse`](protocol.md#closeresponse) | Server | Result of the close request |

The following sections explain each protocol message.

#### ConnectRequest

**Description**

A connection request is sent when a streaming client connects to the NATS Streaming Server. The connection request contains a unique identifier representing the client, and an inbox subject the client will listen on for incoming heartbeats. The identifier **must** be unique; a connection attempt with an identifier currently in use will fail. The inbox subject is the subject where the client receives incoming heartbeats, and responds by publishing an empty NATS message to the reply subject, indicating it is alive. The NATS Streaming Server will return a [ConnectResponse](protocol.md#connectresponse) message to the reply subject specified in the NATS request message.

More advanced libraries can set the protocol to 1 and send a connection ID which in combination with ping interval and ping max out allows the library to detect that the connection to the server is lost.

This request is published to a subject comprised of the `<discover-prefix>.cluster-id`. For example, if a NATS Streaming Server was started with a cluster-id of `mycluster`, and the default prefix was used, the client publishes to `_STAN.discover.mycluster`

**Message Structure**

* `clientID`: A unique identifier for a client
* `heartbeatInbox`: An inbox to which the NATS Streaming Server will send heartbeats for the client to process
* `protocol`: Protocol the client is at
* `connID`: Connection ID, a way to uniquely identify a connection \(no connection should ever have the same\)
* `pingInterval`: Interval at which client wishes to send PINGs \(expressed in seconds\)
* `pingMaxOut`: Maximum number of PINGs without a response after which the connection can be considered lost

[Back to table](protocol.md#protocols)

#### ConnectResponse

**Description**

After a `ConnectRequest` is published, the NATS Streaming Server responds with this message on the reply subject of the underlying NATS request. The NATS Streaming Server requires the client to make requests and publish messages on certain subjects \(described above\), and when a connection is successful, the client saves the information returned to be used in sending other NATS streaming protocol messages. In the event the connection was not successful, an error is returned in the `error` field.

**Message Structure**

* `pubPrefix`: Prefix to use when publishing
* `subRequests`: Subject used for subscription requests
* `unsubRequests`: Subject used for unsubscribe requests
* `closeRequests`: Subject for closing a connection
* `error`: An error string, which will be empty/omitted upon success
* `subCloseRequests`: Subject to use for subscription close requests
* `pingRequests`: Subject to use for PING requests
* `pingInterval`: Interval at which client should send PINGs \(expressed in seconds\).
* `pingMaxOut`: Maximum number of PINGs without a response after which the connection can be considered lost
* `protocol`: Protocol version the server is at
* `publicKey`:  Reserved for future use

[Back to table](protocol.md#protocols)

#### SubscriptionRequest

**Description**

A `SubscriptionRequest` is published on the subject returned in the `subRequests` field of a [ConnectResponse](protocol.md#connectresponse), and creates a subscription to a subject on the NATS Streaming Server. This will return a [SubscriptionResponse](protocol.md#subscriptionresponse) message to the reply subject specified in the NATS protocol request message.

**Message Structure**

* `clientID`: Client ID originally provided in the [ConnectRequest](protocol.md#connectrequest)
* `subject`: Formal subject to subscribe to, e.g. foo.bar
* `qGroup`: Optional queue group
* `inbox`: Inbox subject to deliver messages on
* `maxInFlight`:  Maximum inflight messages without an acknowledgement allowed
* `ackWaitInSecs`: Timeout for receiving an acknowledgement from the client
* `durableName`: Optional durable name which survives client restarts
* `startPosition`: An enumerated type specifying the point in history to start replaying data
* `startSequence`: Optional start sequence number
* `startTimeDelta`: Optional start time

**StartPosition enumeration**

* `NewOnly`: Send only new messages
* `LastReceived`: Send only the last received message
* `TimeDeltaStart`: Send messages from duration specified in the `startTimeDelta` field.
* `SequenceStart`:  Send messages starting from the sequence in the `startSequence` field.
* `First`:  Send all available messages

[Back to table](protocol.md#protocols)

#### SubscriptionResponse

**Description**

The `SubscriptionResponse` message is the response from the `SubscriptionRequest`. After a client has processed an incoming [MsgProto](protocol.md#msgproto) message, it must send an acknowledgement to the `ackInbox` subject provided here.

**Message Structure**

* `ackInbox`:  subject the client sends message acknowledgements to the NATS Streaming Server
* `error`: error string, empty/omitted if no error

[Back to table](protocol.md#protocols)

#### UnsubscribeRequest

**Description**

The `UnsubscribeRequest` closes or unsubcribes the subscription from the specified subject. The inbox specified is the `inbox` returned from the NATS Streaming Server in the `SubscriptionResponse`. Depending on which subject this request is sent, the action will result in close \(if sent to subject `subCloseRequests`\) or unsubscribe \(if sent to subject `unsubRequests`\)

**Message Structure**

* `clientID`: Client ID originally provided in the [ConnectRequest](protocol.md#connectrequest)
* `subject`: Subject for the subscription
* `inbox`: Inbox subject to identify subscription
* `durableName`: Optional durable name which survives client restarts

[Back to table](protocol.md#protocols)

#### PubMsg

**Description**

The `PubMsg` protocol message is published from a client to the NATS Streaming Server. The GUID must be unique, and is returned in the [PubAck](protocol.md#puback) message to correlate the success or failure of storing this particular message.

**Message Structure**

* `clientID`: Client ID originally provided in the [ConnectRequest](protocol.md#connectrequest)
* `guid`: a guid generated for this particular message
* `subject`: subject
* `data`: payload
* `connID`: Connection ID. For servers that know about this field, clientID can be omitted

[Back to table](protocol.md#protocols)

#### PubAck

**Description**

The `PubAck` message is an acknowledgement from the NATS Streaming Server that a message has been processed. The message arrives on the subject specified on the reply subject of the NATS message the `PubMsg` was published on. The GUID is the same GUID used in the `PubMsg` being acknowledged. If an error string is present, the message was not persisted by the NATS Streaming Server and no guarantees regarding persistence are honored. `PubAck` messages may be handled asynchronously from their corresponding `PubMsg` in the client.

**Message Structure**

* `guid`: GUID of the message being acknowledged by the NATS Streaming Server
* `error`: An error string, empty/omitted if no error

[Back to table](protocol.md#protocols)

#### MsgProto

**Description**

The `MsgProto` message is received by client from the NATS Streaming Server, containing the payload of messages sent by a publisher. A `MsgProto` message that is not acknowledged with an [Ack](protocol.md#ack) message within the duration specified by the `ackWaitInSecs` field of the subscription request will be redelivered.

**Message Structure**

* `sequence`: Globally ordered sequence number for the subject's channel
* `subject`: Subject
* `data`: Payload
* `timestamp`: Time the message was stored in the server. Represented as Unix time \(number of nanoseconds elapsed since January 1, 1970 UTC\)
* `redelivered`: Flag specifying if the message is being redelivered

[Back to table](protocol.md#protocols)

#### Ack

**Description**

An `Ack` message is an acknowledgement from the client that a [MsgProto](protocol.md#msgproto) message has been considered received. It is published to the `ackInbox` field of the [SubscriptionResponse](protocol.md#subscriptionresponse).

**Message Structure**

* `subject`: Subject of the message being acknowledged
* `sequence`: Sequence of the message being acknowledged

[Back to table](protocol.md#protocols)

#### Ping

**Description**

A `Ping` message is sent to the server at configured interval to check that the connection ID is still valid. This should be used only if client is at protocol 1, and has sent a `connID` in the [ConnectRequest](protocol.md#connectrequest) protocol.

**Message Structure**

* `connID`: The connection ID

[Back to table](protocol.md#protocols)

#### PingResponse

**Description**

This is a response from the server to a `Ping` from the client. If the content is not empty, it will be the error indicating to the client why the connection is no longer valid.

**Message Structure**

* `error`: Error string, empty/omitted if no error

[Back to table](protocol.md#protocols)

#### CloseRequest

**Description**

A `CloseRequest` message is published on the `closeRequests` subject from the [ConnectResponse](protocol.md#connectresponse), and notifies the NATS Streaming Server that the client connection is closing, allowing the server to free up resources. This message should **always** be sent when a client is finished using a connection.

**Message Structure**

* `clientID`: Client ID originally provided in the [ConnectRequest](protocol.md#connectrequest)

[Back to table](protocol.md#protocols)

#### CloseResponse

**Description**

The `CloseResponse` is sent by the NATS Streaming Server on the reply subject of the `CloseRequest` NATS message. This response contains any error that may have occurred with the corresponding close call.

**Message Structure**

* `error`: error string, empty/omitted if no error

[Back to table](protocol.md#protocols)

