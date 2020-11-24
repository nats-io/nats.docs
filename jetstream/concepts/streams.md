### Streams

Streams define how messages are stored and retention duration.  Streams consume normal NATS subjects, any message found on those subjects will be delivered to the defined storage system. You can do a normal publish to the subject for unacknowledged delivery, else if you send a Request to the subject the JetStream server will reply with an acknowledgement that it was stored.

As of January 2020, in the tech preview we have `file` and `memory` based storage systems, we do not yet support clustering.

In the diagram above we show the concept of storing all `ORDERS.*` in the Stream even though there are many types of order related messages. We'll show how you can selectively consume subsets of messages later. Relatively speaking the Stream is the most resource consuming component so being able to combine related data in this manner is important to consider.

Streams can consume many subjects. Here we have `ORDERS.*` but we could also consume `SHIPPING.state` into the same Stream should that make sense (not shown here).

Streams support various retention policies - they can be kept based on limits like max count, size or age but also more novel methods like keeping them as long as any Consumers have them unacknowledged, or work queue like behavior where a message is removed after first ack.

Streams support deduplication using a `Msg-Id` header and a sliding window within which to track duplicate messages. See the [Message Deduplication](#message-deduplication) section.

When defining Streams the items below make up the entire configuration of the set.

|Item|Description|
|----|-----------|
|MaxAge|Maximum age of any message in the stream, expressed in microseconds|
|MaxBytes|How big the Stream may be, when the combined stream size exceeds this old messages are removed|
|MaxMsgSize|The largest message that will be accepted by the Stream|
|MaxMsgs|How many messages may be in a Stream, oldest messages will be removed if the Stream exceeds this size|
|MaxConsumers|How many Consumers can be defined for a given Stream, `-1` for unlimited|
|Name|A name for the Stream that may not have spaces, tabs or `.`|
|NoAck|Disables acknowledging messages that are received by the Stream|
|Replicas|How many replicas to keep for each message (not implemented as of January 2020)|
|Retention|How message retention is considered, `LimitsPolicy` (default), `InterestPolicy` or `WorkQueuePolicy`|
|Discard|When a Stream reached it's limits either, `DiscardNew` refuses new messages while `DiscardOld` (default) deletes old messages| 
|Storage|The type of storage backend, `file` and `memory` as of January 2020|
|Subjects|A list of subjects to consume, supports wildcards|
|Duplicates|The window within which to track duplicate messages|
