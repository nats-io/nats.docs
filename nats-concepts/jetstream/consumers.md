A consumer is a stateful **view** of a stream. It acts as interface for clients to *consume* a subset of messages stored in a stream and will keep track of which messages were delivered and acknowledged by clients.

Unlike with [core NATS][core-nats] which provides an **at most once** delivery guarantee of a message, a consumer can provide an **at least once** delivery guarantee. This is achieved by the combination of published messages being persisted to the stream as well as the consumer tracking delivery and acknowledgement of each individual message as clients receive and process them.

Consumers can be **push**-based where messages will be delivered to a specified subject or **pull**-based which allows clients to request batches of messages on demand. The choice of what kind of consumer to use depends on the use-case but typically in the case of a client application that needs to get their own individual replay of messages from a stream you would use an 'ordered push consumer'. If there is a need to process messages and easily scale horizontally, you would use a 'pull consumer'.

In addition to the choice of being push or pull, a consumer can also be **ephemeral** or **durable**. A consumer is considered *durable* when an explicit name is set on the `Durable` field when creating the consumer, otherwise it is considered ephemeral. Durables and ephemeral behave exactly the same except that an ephemeral will be automatically *cleaned up* (deleted) after a period of inactivity, specifically when there are no subscriptions bound to the consumer. By default, durables will remain even when there are periods of inactivity (unless `InactiveThreshold` is set explicitly).

[core-nats]: https://docs.nats.io/nats-concepts/core-nats

# Configuration

Below are the set of consumer configuration options that can be defined. The `Version` column indicates the version of the server the option was introduced. The `Editable` column indicates the option can be edited after the consumer is created.

## General

| Field | Description | Version | Editable |
| :--- | :--- | :--- | :--- |
| Durable | If set, clients can have subscriptions bind to the consumer and _resume_ until the consumer is explicitly deleted. A durable name cannot contain whitespace, `.`, `*`, `>`, path separators (forward or backwards slash), and non-printable characters. | 2.2.0 | No |
| FilterSubject | An overlapping subject with the subjects bound to the stream which will filter the set of messages received by the consumer. | 2.2.0 | Yes |
| [AckPolicy](#ackpolicy) | The requirement of client acknowledgements, either `AckExplicit`, `AckNone`, or `AckAll`. | 2.2.0 | No |
| AckWait | The duration that the server will wait for an ack for any individual message _once it has been delivered to a consumer_. If an ack is not received in time, the message will be redelivered. | 2.2.0 | Yes |
| [DeliverPolicy](#deliverpolicy) | The point in the stream to receive messages from, either `DeliverAll`, `DeliverLast`, `DeliverNew`, `DeliverByStartSequence`, `DeliverByStartTime`, or `DeliverLastPerSubject`. | 2.2.0 | No |
| OptStartSeq | Used with the `DeliverByStartSequence` [deliver policy](#deliverpolicy).  | 2.2.0 | No |
| OptStartTime | Used with the `DeliverByStartTime` [deliver policy](#deliverpolicy). | 2.2.0 | No |
| Description | A description of the consumer. This can be particularly useful for ephemeral consumers to indicate their purpose since the durable name cannot be provided. | 2.3.3 | Yes |
| InactiveThreshold | Duration that instructs the server to cleanup consumers that are inactive for that long. Prior to 2.9, this only applied to ephemeral consumers. | 2.2.0 | Yes |
| [MaxAckPending](#maxackpending) | Defines the maximum number of messages, without an acknowledgement, that can be outstanding. Once this limit is reached message delivery will be suspended. This limit applies across _all_ of the consumer's bound subscriptions. A value of -1 means there can be any number of pending acks (i.e. no flow control). This does not apply when the `AckNone` policy is used. | 2.2.0 | Yes |
| MaxDeliver | The maximum number of times a specific message delivery will be attempted. Applies to any message that is re-sent due to ack policy (i.e. due to a negative ack, or no ack sent by the client). | 2.2.0 | Yes |
| ReplayPolicy | If the policy is `ReplayOriginal`, the messages in the stream will be pushed to the client at the same rate that they were originally received, simulating the original timing of messages. If the policy is `ReplayInstant` \(the default\), the messages will be pushed to the client as fast as possible while adhering to the Ack Policy, Max Ack Pending and the client's ability to consume those messages. | 2.2.0 | No |
| Replicas | Sets the number of replicas for the consumer's state. By default, when the value is set to zero, consumers inherit the number of replicas from the stream. | 2.8.3 | Yes |
| MemoryStorage | If set, forces the consumer state to be kept in memory rather than inherit the storage type of the stream (file in this case). | 2.8.3 | No |
| SampleFrequency | Sets the percentage of acknowledgements that should be sampled for observability, 0-100 This value is a string and for example allows both `30` and `30%` as valid values. | 2.2.0 | Yes |


### AckPolicy

The policies choices include:

- `AckExplicit` - The default policy. It means that each individual message must be acknowledged. It is the only allowed option for pull consumers.
- `AckNone` - You do not have to ack any messages, the server will assume ack on delivery.
- `AckAll` - If you receive a series of messages, you only have to ack the last one you received. All the previous messages received are automatically acknowledged.

If an ack is required but is not received within the `AckWait` window, the message will be redelivered.

{% hint style="warning" %}
The server may consider an ack arriving out of the window. If a first process fails to ack within the window it's entirely possible, for instance in queue situation, that the message has been redelivered to another consumer. Since this will technically restart the window, the ack from the first consumer will be considered.
{% endhint %}

### DeliverPolicy

The policies choices include:

- `DeliverAll` -  The default policy. The consumer will start receiving from the earliest available message.
- `DeliverLast` - When first consuming messages, the consumer will start receiving messages with the last message added to the stream, or the last message in the stream that matches the consumer's filter subject if defined.
- `DeliverLastPerSubject` - When first consuming messages, start with the latest one for each filtered subject currently in the stream.
- `DeliverNew` - When first consuming messages, the consumer will only start receiving messages that were created after the consumer was created.
- `DeliverByStartSequence` - When first consuming messages, start at the first message having the sequence number or the next one available. The consumer is required to specify `OptStartSeq` which defines the sequence number.
- `DeliverByStartTime` - When first consuming messages, start with messages on or after this time. The consumer is required to specify `OptStartTime` which defines this start time.

### MaxAckPending

The `MaxAckPending` capability provides one-to-many flow control and applies to both push and pull consumers. For push consumers, `MaxAckPending` is the _only_ form of flow control. However, for pull consumers because the delivery of the messages to the client application is client-driven (hence the 'pull') rather than server initiated (hence the 'push') there is an implicit one-to-one flow control with the subscribers (the maximum batch size of the Fetch calls). Therefore you should remember to set it to an appropriately high value (e.g. the default value of 1000), as it can otherwise place a limit on the horizontal scalability of the processing of the stream in high throughput situations.

## Pull-specific

These options apply only to pull consumers. For an example on how configure a pull consumer using your preferred client, see [NATS by Example](https://natsbyexample.com/examples/jetstream/pull-consumer/go).


| Field | Description | Version | Editable |
| :--- | :--- | :--- | :--- |
| MaxWaiting | The maximum number of waiting pull requests. | 2.2.0 | No |
| MaxRequestExpires | The maximum duration a single pull request will wait for messages to be available to pull. | 2.7.0 | Yes |
| MaxRequestBatch | The maximum batch size a single pull request can make. When set with `MaxRequestMaxBytes`, the batch size will be constrained by whichever limit is hit first. | 2.7.0 | Yes |
| MaxRequestMaxBytes | The maximum total bytes that can be requested in a given batch. When set with `MaxRequestBatch`, the batch size will be constrained by whichever limit is hit first. | 2.8.3 | Yes |


## Push-specific

These options apply only to push consumers. For an example on how to configure a push consumer using your preferred client, see [NATS by Example](https://natsbyexample.com/examples/jetstream/push-consumer/go).

| Field | Description | Version | Editable |
| :--- | :--- | :--- | :--- |
| DeliverSubject | The subject to deliver messages to. Note, setting this field implicitly decides whether the consumer is push or pull-based. With a deliver subject, the server will _push_ messages to client subscribed to this subject. | 2.2.0 | No |
| DeliverGroup | The queue group name which, if specified, is then used to distribute the messages between the subscribers to the consumer. This is analogous to a [queue group][queue-group] in core NATS. | 2.2.0 | Yes |
| FlowControl | Enables per-subscription flow control using a sliding-window protocol. This protocol relies on the server and client exchanging messages to regulate when and how many messages are pushed to the client. This one-to-one flow control mechanism works in tandem with the one-to-many flow control imposed by `MaxAckPending` across all subscriptions bound to a consumer. | 2.2.0 | Yes |
| IdleHeartbeat | If the idle heartbeat period is set, the server will regularly send a status message to the client (i.e. when the period has elapsed) while there are no new messages to send. This lets the client know that the JetStream service is still up and running, even when there is no activity on the stream. The message status header will have a code of 100. Unlike `FlowControl`, it will have no reply to address. It may have a description such "Idle Heartbeat". Note that this heartbeat mechanism is all handled transparently by supported clients and does not need to be handled by the application. | 2.2.0 | Yes |
| RateLimit | Used to throttle the delivery of messages to the consumer, in bits per second. | 2.2.0 | Yes |
| HeadersOnly | Delivers only the headers of messages in the stream and not the bodies. Additionally adds `Nats-Msg-Size` header to indicate the size of the removed payload. | 2.6.2 | Yes |

[queue-group]: https://docs.nats.io/nats-concepts/core-nats/queue
