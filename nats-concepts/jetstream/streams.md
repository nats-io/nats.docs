# Streams

Streams are 'message stores', each stream defines how messages are stored and what the limits (duration, size, interest) of the retention are. Streams consume normal NATS subjects, any message published on those subjects will be captured in the defined storage system. You can do a normal publish to the subject for unacknowledged delivery, though it's better to use the JetStream publish calls instead as the JetStream server will reply with an acknowledgement that it was successfully stored.

![Orders](../../.gitbook/assets/streams-and-consumers-75p.png)

In the diagram above we show the concept of storing all `ORDERS.*` in the Stream even though there are many types of order related messages. We'll show how you can selectively consume subsets of messages later. Relatively speaking the Stream is the most resource consuming component so being able to combine related data in this manner is important to consider.

Streams can consume many subjects. Here we have `ORDERS.*` but we could also consume `SHIPPING.state` into the same Stream should that make sense \(not shown here\).

Streams support various retention policies which define when messages in the stream can be automatically deleted, such as when stream limits are hit (like max count, size or age) - if the discard policy is set to 'discard old' - or also more novel options that apply on top of the limits such as 'interest' (automatically deleted after all consumers have received acknowledgement of the delivery of the message to client applications) and 'working queue' (where a message is automatically deleted from the stream when the consumer receives acknowledgement of its consumption from the client application).

Streams support deduplication using a `Nats-Msg-Id` header and a sliding window within which to track duplicate messages. See the [Message Deduplication](../../using-nats/jetstream/model_deep_dive.md#message-deduplication) section.

## Configuration

When defining Streams the items below make up the entire configuration of the set. The field names

| Field | Description | Version |
| :--- | :--- | :--- |
| Name | Names cannot contain whitespace, `.`, `*`, `>`, path separators (forward or backwards slash), and non-printable characters. | 2.2.0 |
| Storage | The type of storage backend, `File` and `Memory` | 2.2.0 |
| Subjects | A list of subjects to consume, supports wildcards | 2.2.0 |
| Replicas | How many replicas to keep for each message in a clustered JetStream, maximum 5 | 2.2.0 |
| MaxAge | Maximum age of any message in the Stream, expressed in nanoseconds. | 2.2.0 |
| MaxBytes | How many bytes the Stream may contain. Adheres to Discard Policy, removing oldest or refusing new messages if the Stream exceeds this size | 2.2.0 |
| MaxMsgs | How many messages may be in a Stream. Adheres to Discard Policy, removing oldest or refusing new messages if the Stream exceeds this number of messages | 2.2.0 |
| MaxMsgSize | The largest message that will be accepted by the Stream | 2.2.0 |
| MaxConsumers | How many Consumers can be defined for a given Stream, `-1` for unlimited | 2.2.0 |
| NoAck | Disables acknowledging messages that are received by the Stream | 2.2.0 |
| Retention | How message retention is considered, `LimitsPolicy` \(default\), `InterestPolicy` or `WorkQueuePolicy` | 2.2.0 |
| Discard | When a Stream reaches it's limits either, `DiscardNew` refuses new messages while `DiscardOld` \(default\) deletes old messages | 2.2.0 |
| Duplicates | The window within which to track duplicate messages, expressed in nanoseconds. | 2.2.0 |
| Placement | Used to declare where the stream should be placed via tags and/or an explicit cluster name. | 2.2.0 |
| Mirror | If defined, indicates this stream is a mirror of another stream. See [mirrors](/running-a-nats-service/nats_admin/jetstream_admin/replication#mirrors). | 2.2.0 |
| Sources | If defined, declares one or more stream this stream will source messages from. See [sources](/running-a-nats-service/nats_admin/jetstream_admin/replication#sources). | 2.2.0 |
| MaxMsgsPerSubject | How many messages be in the stream _per subject_. | 2.3.0 |
| Description | A verbose description of the stream. | 2.3.3 |
| Sealed | Sealed streams do not allow messages to be deleted via limits or API, sealed streams can not be unsealed via configuration update. Can only be set on already created streams via the Update API. | 2.6.2 |
| DenyDelete | Restricts the ability to delete messages from a stream via the API. Cannot be changed once set to true. | 2.6.2 |
| DenyPurge | Restricts the ability to purge messages from a stream via the API. Cannot be change once set to true. | 2.6.2 |
| AllowRollup | Allows the use of the `Nats-Rollup` header to replace all contents of a stream, or subject in a stream, with a single new message. | 2.6.2 |
| RePublish | If set, messages stored to the stream will be immediately *republished* to the configured subject. | 2.8.3 |
| AllowDirect | If true, and the stream has more than one replica, each replica will respond to *direct get* requests for individual messages, not only the leader. | 2.9.0 |
| MirrorDirect | If true, and the stream is a mirror, the mirror will participate in a serving *direct get* requests for individual messages from origin stream. | 2.9.0 |
