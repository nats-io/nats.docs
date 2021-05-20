# Consumers

Each Consumer, or related group of Consumers, of a Stream will need a Consumer defined. It's ok to define thousands of these pointing at the same Stream.

Consumers can either be `push` based where JetStream will deliver the messages as fast as possible to a subject of your choice or `pull` to have control by asking the server for messages. The rate of message delivery in both cases is subject to `ReplayPolicy`. A `ReplayInstant` Consumer will receive all messages as fast as possible while a `ReplayOriginal` Consumer will receive messages at the rate they were received, which is great for replaying production traffic in staging.

In the orders example above we have 3 Consumers. The first two select a subset of the messages from the Stream by specifying a specific subject like `ORDERS.processed`. The Stream consumes `ORDERS.*` and this allows you to receive just what you need. The final Consumer receives all messages in a `push` fashion.

Consumers track their progress, they know what messages were delivered, acknowledged, etc., and will redeliver messages they sent that were not acknowledged. When first created, the Consumer has to know what message to send as the first one. You can configure either a specific message in the set \(`StreamSeq`\), specific time \(`StartTime`\), all \(`DeliverAll`\) or last \(`DeliverLast`\). This is the starting point and from there, they all behave the same - delivering all of the following messages with optional Acknowledgement.

Acknowledgements default to `AckExplicit` - the only supported mode for pull-based Consumers - meaning every message requires a distinct acknowledgement. But for push-based Consumers, you can set `AckNone` that does not require any acknowledgement, or `AckAll` which quite interestingly allows you to acknowledge a specific message, like message `100`, which will also acknowledge messages `1` through `99`. The `AckAll` mode can be a great performance boost.

Some messages may cause your applications to crash and cause a never ending loop forever poisoning your system. The `MaxDeliver` setting allow you to set an upper bound to how many times a message may be delivered.

To assist with creating monitoring applications, one can set a `SampleFrequency` which is a percentage of messages for which the system should sample and create events. These events will include delivery counts and ack waits.

When defining Consumers the items below make up the entire configuration of the Consumer:

### AckPolicy
How messages should be acknowledged. The server will consider an ack ony if it comes within the Ack Wait window.
If the ack is not received in time, the message(s) will be redelivered.

#### AckExplicit

This is the default policy. It means that each individual message must be acknowledged. It is the only allowed option for pull consumers.

#### AckNone

You do not have to ack any messages, the server will assume ack on delivery.

#### AckAll

If you receive a series of messages, you only have to ack the last one you received.
All the previous messages received are automatically acknowledged.

### AckWait

Ack Wait is the time in nanoseconds that the server will wait for an ack for any individual message.
If an ack is not received in time, the message will be redelivered.


### DeliverPolicy / OptStartSeq / OptStartTime

When a consumer is first created, it can specify where in the stream it wants to start receiving messages.
This is the `DeliverPolicy` and it's options are as follows:

#### DeliverAll

All is the default policy. The consumer will start receiving from the earliest available message.

#### DeliverLast

The consumer will start receiving messages with the last message added to the stream, so the very last message in the stream when the server realizes the consumer is ready.

#### DeliverNew

The consumer will only start receiving messages that were created after the consumer was created.

#### DeliverByStartSequence

When first consuming messages from the Stream, start at this particular message in the set. The consumer is required to specify `OptStartSeq`, the sequence number to start on. It will receive the closest available sequence if that message was removed based on the stream limit policy.

#### DeliverByStartTime

When first consuming messages from the Stream start with messages on or after this time. The consumer is required to specify `OptStartTime`, the time in the stream to start at. It will receive the closest available message on or after that time.

### DeliverSubject

The subject to deliver observed messages. Useful to set up an alternate subject for a regular NatsSubcriber can listen on that subject. Not allowed for pull subscriptions.
Deliver subject essentially creates an alias core NATS subject for the stream. This means a core NATS subscriber could be set up to receive messages on the DeliverSubject,
starting wherever the DeliverPolicy was configured for the consumer. You could use a core NATS subscriber to access the stream by its original subject, but that would always start at
the next message that appears on the subject, instead of where the consumer configured start sequence or start time. This is only allowed for push subscriptions.

### Durable (Name)

The name of the Consumer, which the server will track, allowing resuming consumption where left off.
By default, a consumer is ephemeral. To make the consumer durable, set the name.

### FilterSubject

When consuming from a stream with a wildcard subject, this allows you to select a subset of the full wildcard subject to receive messages from.

### FlowControl

Flow control is another way for the consumer to manage back pressure. Instead of relying on the rate limit, it relies on the pending limits of max messages and/or max bytes.
If the server sends the number of messages or bytes without receiving an ack, it will send a status message letting you know it has reached this limit.
Once flow control is tripped, the server will not start sending messages again until the client tells the server, even if all messages have been acknowledged.
The message status header will have a code of 100 and the description "FlowControl Request"

### IdleHeartbeat

If the idle heartbeat period is set, the server will send a status message with to the client when the period has elapsed but it has not received any new messages.
This lets the client know that it's still there, but just isn't receiving messages.
The message status header will have a code of 100 and the description "Idle Heartbeat"

### MaxAckPending

The maximum number of messages without an acknowledgement that can be outstanding, once this limit is reached message delivery will be suspended.

### MaxDeliver

The maximum number of times a specific message will be delivered. Applies to any message that is re-sent due to ack policy.

### RateLimit

Used to throttle the delivery of messages to the consumer, in bits per second.

### ReplayPolicy

The replay policy applies when the DeliverPolicy is `All`, `ByStartSequence` or `ByStartTime` since those deliver policies begin reading the stream at a position other than the end.
If the policy is `ReplayOriginal`, the messages in the stream will be pushed to the client at the same rate that they were originally received, simulating the original timing of messages.
If the policy is `ReplayInstant` (the default), the messages will be pushed to the client as fast as possible while adhering to the Ack Policy, Max Ack Pending and the client's ability to consume those messages.

### SampleFrequency

Sets the percentage of acknowledgements that should be sampled for observability, 0-100
