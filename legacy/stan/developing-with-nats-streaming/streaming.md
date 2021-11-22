# Developing With STAN

## WARNING Deprecation Notice

The NATS Streaming Server is being deprecated. Critical bug fixes and security fixes will be applied until June of 2023. NATS-enabled applications requiring persistence should use [JetStream](/nats-concepts/jetstream/readme.md).

## Deciding to Use At-Least-Once Delivery

The decision to use at least once delivery through NATS streaming is important. It will affect your deployment, usage, performance, and total cost of ownership.

In modern systems applications can expose services or produce and consume data streams. At a high level, if observability is required, applications need to consume messages in the future, need to come consume at their own pace, or need all messages, then at-least-once semantics (NATS streaming) makes sense. If observation needs to be realtime and the most recent message is the most important, then use _At-Most-Once_ delivery semantics with core NATS.

Just be aware that using an at least once guarantee is the facet of messaging with the highest cost in terms of compute and storage. The NATS Maintainers highly recommend a strategy of defaulting to core NATS using a service pattern (request/reply) to guarantee delivery at the application level and using streaming only when necessary. This ultimately results in a more stable distributed system. Entire systems such as Cloud Foundry have been built upon core NATS with no messaging persistence involved.

### When to use NATS Streaming

NATS streaming is ideal when:

*   A historical record of a stream is required. This is when a replay of data

    is required by a consumer.
*   The last message produced on a stream is required for initialization and

    the producer may be offline.
*   A-priori knowledge of consumers is not available, but consumers must receive

    messages. This is often a false assumption.
*   Data producers and consumers are highly decoupled. They may be online at

    different times and consumers must receive messages.
*   The data in messages being sent have a lifespan beyond that of the

    intended application lifespan.
* Applications need to consume data at their own pace.

Note that no assumptions should ever be made of who will receive and process data in the future, or for what purpose.

### When to use Core NATS

Using core NATS is ideal for the fast request path for scalable services where there is tolerance for message loss or when applications themselves handle message delivery guarantees.

These include:

* Service patterns where there is a tightly coupled request/reply
  *   A request is made, and the application handles error cases upon timeout

      (resends, errors, etc). __Relying on a messaging system to resend here is

      considered an anti-pattern.__
*   Where only the last message received is important and new messages will

    be received frequently enough for applications to tolerate a lost message.

    This might be a stock ticker stream, frequent exchange of messages in a

    service control plane, or device telemetry.
*   Message TTL is low, where the value of the data being transmitted degrades

    or expires quickly.
*   The expected consumer set for a message is available a-priori and consumers

    are expected to be live. The request/reply pattern works well here or

    consumers can send an application level acknowledgement.

We've found that core NATS is sufficient for most use cases. Also note that nothing precludes the use of both core NATS and NATS streaming side by side, leveraging the strengths of each to build a highly resilient distributed system.

## NATS Streaming Overview

Where NATS provides at most once quality of service, streaming adds at least once. Streaming is implemented as a request-reply service on top of NATS. Streaming messages are encoded as protocol buffers, the streaming clients use NATS to talk to the streaming server. The streaming server organizes messages in channels and stores them in files and databases. ACKs are used to ensure delivery in both directions.

> Sometimes the maintainers will refer to NATS as "nats core" and streaming as "stan" or "streaming".

Messages to the streaming service are opaque byte arrays, just as they are with NATS. However, the streaming server protocol uses protocol buffers to wrap these byte arrays. So if you listen to the NATS traffic the messages will appear as protocol buffers, while the actual data sent and received will simply be byte arrays.

NATS streaming uses the concept of a channel to represent an ordered collection of messages. Clients send to and receive from channels instead of subjects. The subjects used by the streaming libraries and server are managed internally. Channels do not currently support wildcards. Channels aren’t raw subjects. Streaming isn’t raw NATS. The streaming libraries hide some of the differences.

Think of channels as a First In First Out (FIFO) queue. Messages are added until the configured limit is reached. Old messages can be set to expire based on configuration, making room for new messages. Subscriptions don’t affect channel content, that is, when a message is acknowledged, it is not removed from the channel.

Positions in the channel are specified in multiple ways:

* Sequence number - counting from 1
* Time
* Time delta (converted to time on client)

New subscriptions can also specify last received to indicate they only want new messages. Sequence numbers are persistent so when message #1 goes away, the oldest message is then message #2. If you try to go to a position before the oldest message, you will be moved to the oldest message.

## Subscription Types

NATS Streaming supports several types of subscriptions:

* Regular
* Durable
* Queue
* Durable/Queue

All subscriptions define their position on creation. Regular subscriptions lose their position if the application crashes, the app disconnects or they unsubscribe. Durable subscriptions maintain their position through disconnect, subscriber close, but not through unsubscribe. The position on reconnect comes from the server not the options in both cases. Queue subscriptions share a position. Regular queue subscriptions lose their position on the last disconnect/unsubscribe. Durable queue subscriptions maintain their position through disconnect, but not through the last unsubscribe. Positions provided in options are ignored after the position is set.

## Acknowledgements

In order to implement at least once delivery NATS streaming uses ACK messages for publishers and subscribers. Each message sent from the streaming server to the client must be acknowledged or it will be re-delivered. Developers must switch their mind set. The same message can arrive more than once. Messages should be idempotent. The client libraries can help with ACKs. Subscriptions can use manual or automatic ACKs. Manual ACKs are safer, since the program controls when they happen. An ACK wait setting is used to define the timeout before an ACK is considered missing.

> Ack wait = 10s means that the server won’t redeliver for at least 10s

Using ACKs for each message sent can be a performance hit - round trip per message. NATS streaming allows subscriptions to set a max in flight value. Max in flight determines how many unacknowledged messages can be sent to the client. Ack Wait is used to decide when the ACK for a message has failed and it needs to be redelivered. New and redelivered messages are sent upon availability, in order.

Messages are sent in order, when they are available:

* Max inflight = 2
* Send msg 1 and msg 2
* ACK 2
* Message 3 arrives at the server
* Send message 3 (since it is available)
* When Ack wait expires, msg 1 is available
* Send msg 1 (1 and 3 are in flight)

The streaming server sends available messages in order, but 1 isn’t available until its Ack wait expires. If max in flight = 1 then only 1 message is on the wire at a time, it will be re-sent until it is acknowledged. Re-delivered messages will not come out of order in this situation.

Setting max in flight to a number greater than 1 requires some thought and foresight to deal with redelivery scenarios.

Max in flight is a per-subscription setting. In the case of queue subscribers, each client can set the value. Normally, each client will use the same value but this is not a requirement.

NATS streaming uses acknowledgements on the sending side as well as the subscribing side. The streaming server acknowledges messages it receives and has persisted. A maximum in flight setting is used for publishers. No more than max in flight can be on their way to the server at one time. The library may provide various mechanisms to handle publisher ACKs. **The application must manage redelivery to the server**.
