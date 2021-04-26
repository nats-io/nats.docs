# Streams

Streams define how messages are stored and retention duration. Streams consume normal NATS subjects, any message found on those subjects will be delivered to the defined storage system. You can do a normal publish to the subject for unacknowledged delivery, else if you send a Request to the subject the JetStream server will reply with an acknowledgement that it was stored.

As of January 2020, in the tech preview we have `File` and `Memory` based storage systems, we do not yet support clustering.

In the diagram above we show the concept of storing all `ORDERS.*` in the Stream even though there are many types of order related messages. We'll show how you can selectively consume subsets of messages later. Relatively speaking the Stream is the most resource consuming component so being able to combine related data in this manner is important to consider.

Streams can consume many subjects. Here we have `ORDERS.*` but we could also consume `SHIPPING.state` into the same Stream should that make sense \(not shown here\).

Streams support various retention policies - they can be kept based on limits like max count, size or age but also more novel methods like keeping them as long as any Consumers have them unacknowledged, or work queue like behavior where a message is removed after first ack.

Streams support deduplication using a `Nats-Msg-Id` header and a sliding window within which to track duplicate messages. See the [Message Deduplication](../model_deep_dive.md#message-deduplication) section.

When defining Streams the items below make up the entire configuration of the set.

| Item | Description |
| :--- | :--- |
| Name | A name for the Stream that may not have spaces, tabs, period (`.`), greater than (`>`) or asterix (`*`) |
| Storage | The type of storage backend, `File` and `Memory` |
| Subjects | A list of subjects to consume, supports wildcards |
| Replicas | How many replicas to keep for each message in a clustered JetStream, maximum 5 |
| MaxAge | Maximum age of any message in the stream, expressed in nanoseconds. |
| MaxBytes | How many bytes the Stream may contain. Adheres to Discard Policy, removing oldest or refusing new messages if the Stream exceeds this number of messages. |
| MaxMsgs | How many messages may be in a Stream. Adheres to Discard Policy, removing oldest or refusing new messages if the Stream exceeds this size |
| MaxMsgSize | The largest message that will be accepted by the Stream |
| MaxConsumers | How many Consumers can be defined for a given Stream, `-1` for unlimited |
| NoAck | Disables acknowledging messages that are received by the Stream |
| Retention | How message retention is considered, `LimitsPolicy` \(default\), `InterestPolicy` or `WorkQueuePolicy` |
| Discard | When a Stream reached it's limits either, `DiscardNew` refuses new messages while `DiscardOld` \(default\) deletes old messages |
| Duplicates | The window within which to track duplicate messages, expressed in nanoseconds. |

