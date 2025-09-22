# Streams

Streams are message stores, each stream defines how messages are stored and what the limits (duration, size, interest) of the retention are. Streams consume normal [NATS subjects](../subjects.md), any message published on those subjects will be captured in the defined storage system. You can do a normal publish to the subject for unacknowledged delivery, though it’s better to use the JetStream publish calls instead as the JetStream server will reply with an acknowledgement that it was successfully stored.

![Orders](../../.gitbook/assets/streams-and-consumers-75p.png)

The diagram above shows the concept of storing all `ORDERS.*` in the Stream even though there are many types of order related messages. We’ll show how you can selectively consume subsets of messages later. Relatively speaking the Stream is the most resource consuming component so being able to combine related data in this manner is important to consider.

Streams can consume many subjects. Here we have `ORDERS.*` but we could also consume `SHIPPING.state` into the same Stream should that make sense.

## Stream limits and message retention

Streams support various retention policies which define when messages in the stream can be automatically deleted, such as when stream limits are hit (like max count, size or age of messages), or also more novel options that apply on top of the limits such as interest-based retention or work-queue semantics (see [Retention Policy](#retentionpolicy)).

Upon reaching message limits, the server will automatically discard messages either by removing the oldest messages to make room for new ones (`DiscardOld`) or by refusing to store new messages (`DiscardNew`). For more details, see [Discard Policy](#discardpolicy).

Streams support deduplication using a `Nats-Msg-Id` header and a sliding window within which to track duplicate messages. See the [Message Deduplication](../../using-nats/jetstream/model_deep_dive.md#message-deduplication) section.

For examples on how to configure streams with your preferred NATS client, see [NATS by Example](https://natsbyexample.com).

## Configuration

Below are the set of stream configuration options that can be defined. The `Version` column indicates the version of the server the option was introduced. The `Editable` column indicates the option can be edited after the stream created. See client-specific examples [here](https://natsbyexample.com).

| Field                                 | Description                                                                                                                                                                                                                                                                                               | Version | Editable             |
|:--------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------|:---------------------|
| Name                                  | Identifies the stream and has to be unique within JetStream account. Names cannot contain whitespace, `.`, `*`, `>`, path separators (forward or backwards slash), and non-printable characters.                                                                                                          | 2.2.0   | No                   |
| [Storage](#storagetype)               | The storage type for stream data.                                                                                                                                                                                                                                                                         | 2.2.0   | No                   |
| [Subjects](#subjects)                 | A list of subjects to bind. Wildcards are supported. Cannot be set for [mirror](#mirrors) streams.                                                                                                                                                                                                        | 2.2.0   | Yes                  |
| Replicas                              | How many replicas to keep for each message in a clustered JetStream, maximum 5.                                                                                                                                                                                                                           | 2.2.0   | Yes                  |
| MaxAge                                | Maximum age of any message in the Stream, expressed in nanoseconds.                                                                                                                                                                                                                                       | 2.2.0   | Yes                  |
| MaxBytes                              | Maximum number of bytes stored in the stream. Adheres to Discard Policy, removing oldest or refusing new messages if the Stream exceeds this size.                                                                                                                                                        | 2.2.0   | Yes                  |
| MaxMsgs                               | Maximum number of messages stored in the stream. Adheres to Discard Policy, removing oldest or refusing new messages if the Stream exceeds this number of messages.                                                                                                                                       | 2.2.0   | Yes                  |
| MaxMsgSize                            | The largest message that will be accepted by the Stream. The size of a message is a sum of payload and headers.                                                                                                                                                                                           | 2.2.0   | Yes                  |
| MaxConsumers                          | Maximum number of Consumers that can be defined for a given Stream, `-1` for unlimited.                                                                                                                                                                                                                   | 2.2.0   | No                   |
| NoAck                                 | Default `false`. Disables acknowledging messages that are received by the Stream. This is mandatory when archiving messages which have a reply subject set. E.g. requests in an Request/Reply communication. By default JetStream will acknowledge each message with an empty reply on the reply subject. | 2.2.0   | Yes                  |
| [Retention](#retentionpolicy)         | Declares the retention policy for the stream.                                                                                                                                                                                                                                                             | 2.2.0   | No                   |
| [Discard](#discardpolicy)             | The behavior of discarding messages when any streams’ limits have been reached.                                                                                                                                                                                                                           | 2.2.0   | Yes                  |
| DuplicateWindow                       | The window within which to track duplicate messages, expressed in nanoseconds.                                                                                                                                                                                                                            | 2.2.0   | Yes                  |
| [Placement](#placement)               | Used to declare where the stream should be placed via tags and/or an explicit cluster name.                                                                                                                                                                                                               | 2.2.0   | Yes                  |
| [Mirror](#mirrors)                    | If set, indicates this stream is a mirror of another stream.                                                                                                                                                                                                                                              | 2.2.0   | Yes (since 2.12.0)   |
| [Sources](#stream-sources)            | If defined, declares one or more streams this stream will source messages from.                                                                                                                                                                                                                           | 2.2.0   | Yes                  |
| MaxMsgsPerSubject                     | Limits maximum number of messages in the stream to retain _per subject_.                                                                                                                                                                                                                                  | 2.3.0   | Yes                  |
| Description                           | A verbose description of the stream.                                                                                                                                                                                                                                                                      | 2.3.3   | Yes                  |
| Sealed                                | Sealed streams do not allow messages to be deleted via limits or API, sealed streams can not be unsealed via configuration update. Can only be set on already created streams via the Update API.                                                                                                         | 2.6.2   | Yes (once)           |
| DenyDelete                            | Restricts the ability to delete messages from a stream via the API.                                                                                                                                                                                                                                       | 2.6.2   | No                   |
| DenyPurge                             | Restricts the ability to purge messages from a stream via the API.                                                                                                                                                                                                                                        | 2.6.2   | No                   |
| [AllowRollup](#allowrollup)           | Allows the use of the `Nats-Rollup` header to replace all contents of a stream, or subject in a stream, with a single new message.                                                                                                                                                                        | 2.6.2   | Yes                  |
| [RePublish](#republish)               | If set, messages stored to the stream will be immediately _republished_ to the configured subject.                                                                                                                                                                                                        | 2.8.3   | Yes                  |
| AllowDirect                           | If true, and the stream has more than one replica, each replica will respond to _direct get_ requests for individual messages, not only the leader.                                                                                                                                                       | 2.9.0   | Yes                  |
| MirrorDirect                          | If true, and the stream is a mirror, the mirror will participate in a serving _direct get_ requests for individual messages from origin stream.                                                                                                                                                           | 2.9.0   | Yes                  |
| DiscardNewPerSubject                  | If true, applies discard new semantics on a per subject basis. Requires `DiscardPolicy` to be `DiscardNew` and the `MaxMsgsPerSubject` to be set.                                                                                                                                                         | 2.9.0   | Yes                  |
| Metadata                              | A set of application-defined key-value pairs for associating metadata on the stream.                                                                                                                                                                                                                      | 2.10.0  | Yes                  |
| Compression                           | If file-based and a compression algorithm is specified, the stream data will be compressed on disk. Valid options are nothing (empty string) or `s2` for Snappy compression.                                                                                                                              | 2.10.0  | Yes                  |
| FirstSeq                              | If specified, a new stream will be created with its initial sequence set to this value.                                                                                                                                                                                                                   | 2.10.0  | No                   |
| [SubjectTransform](#subjecttransform) | Applies a subject transform (to matching messages) before storing the message.                                                                                                                                                                                                                            | 2.10.0  | Yes                  |
| ConsumerLimits                        | Sets default limits for consumers created for a stream. Those can be overridden per consumer.                                                                                                                                                                                                             | 2.10.0  | Yes                  |
| AllowMsgTTL                           | If set, allows header initiated per-message TTLs, instead of relying solely on MaxAge.                                                                                                                                                                                                                    | 2.11.0  | No (can only enable) |
| SubjectDeleteMarkerTTL                | If set, a subject delete marker will be placed after the last message of a subject ages out. This defines the TTL of the delete marker that's left behind.                                                                                                                                                | 2.11.0  | Yes                  |
| AllowAtomicPublish                    | If set, allows atomically writing a batch of N messages into the stream.                                                                                                                                                                                                                                  | 2.12.0  | Yes                  |
| AllowMsgCounter                       | If set, the stream will function as a counter stream, hosting distributed counter CRDTs.                                                                                                                                                                                                                  | 2.12.0  | No                   |
| AllowMsgSchedules                     | If set, allows message scheduling in the stream.                                                                                                                                                                                                                                                          | 2.12.0  | No (can only enable) |

### StorageType

The storage types include:

- `File` (default) - Uses file-based storage for stream data.
- `Memory` - Uses memory-based storage for stream data.

### Subjects

_Note: a stream configured as a [mirror](#mirrors) cannot be configured with a set of subjects. A mirror implicitly sources a subset of the origin stream (optionally with a filter), but does not subscribe to additional subjects._

If no explicit subject is specified, the default subject will be the same name as the stream. Multiple subjects can be specified and edited over time. Note, if messages are stored by a stream on a subject that is subsequently removed from the stream config, consumers will still observe those messages if their subject filter overlaps.

### RetentionPolicy

The retention options include:

- `LimitsPolicy` (default) - Retention based on the various limits that are set including: `MaxMsgs`, `MaxBytes`, `MaxAge`, and `MaxMsgsPerSubject`. If any of these limits are set, whichever limit is hit first will cause the automatic deletion of the respective message(s). See a [full code example][limits-example].
- `WorkQueuePolicy` - Retention with the typical behavior of a FIFO queue. Each message can be consumed only once. This is enforced by only allowing _one_ consumer to be created _per subject_ for a work-queue stream (i.e. the consumers' subject filter(s) must _not_ overlap). Once a given message is ack’ed, it will be deleted from the stream. See a [full code example][workqueue-example].
- `InterestPolicy` - Retention based on the consumer _interest_ in the stream and messages. The base case is that there are zero consumers defined for a stream. If messages are published to the stream, they will be immediately deleted so there is no _interest_. This implies that consumers need to be bound to the stream ahead of messages being published to the stream. Once a given message is ack’ed by _all_ consumers filtering on the subject, the message is deleted (same behavior as `WorkQueuePolicy`). See a [full code example][interest-example].

{% hint style="warning" %}
If the `InterestPolicy` or `WorkQueuePolicy` is chosen for a stream, note that any limits, if defined, will still be enforced. For example, given a work-queue stream, if `MaxMsgs` are set and the default discard policy of _old_, messages will be automatically deleted even if the consumer did not receive them.
{% endhint %}

{% hint style="info" %}
`WorkQueuePolicy` streams will only delete messages enforced by limits or when a message has been successfully `Ack’d` by its consumer. Messages that have attempted redelivery and have reached `MaxDeliver` attempts for the consumer will remain in the stream and must be manually deleted via the JetStream API.
{% endhint %}

[limits-example]: https://natsbyexample.com/examples/jetstream/limits-stream/go
[interest-example]: https://natsbyexample.com/examples/jetstream/interest-stream/go
[workqueue-example]: https://natsbyexample.com/examples/jetstream/workqueue-stream/go

### DiscardPolicy

The discard behavior applies only for streams that have at least one limit defined. The options include:

- `DiscardOld` (default) - This policy will delete the oldest messages in order to maintain the limit. For example, if `MaxAge` is set to one minute, the server will automatically delete messages older than one minute with this policy.
- `DiscardNew` - This policy will reject _new_ messages from being appended to the stream if it would _exceed_ one of the limits. An extension to this policy is `DiscardNewPerSubject` which will apply this policy on a per-subject basis within the stream.

### Placement

Refers to the placement of the stream assets (data) within a NATS deployment, be it a single cluster or a supercluster. A given stream, including all replicas (not mirrors), are bound to a single cluster. So when creating or moving a stream, a cluster will be chosen to host the assets.

Without declaring explicit placement for a stream, by default, the stream will be created within the cluster that the client is connected to assuming it has sufficient storage available.

By declaring stream placement, where these assets are located can be controlled explicitly. This is generally useful to co-locate with the most active clients (publishers or consumers) or may be required for data sovereignty reasons.

Placement is supported in all client SDKs as well as the CLI. For example, adding a stream via the CLI to place a stream in a specific cluster looks like this:

```
nats stream add --cluster aws-us-east1-c1
```

For this to work, all servers in a given cluster must define the `name` field within the [`cluster`][cluster-config] server configuration block.

```
cluster {
  name: aws-us-east1-c1
  # etc..
}
```

If you have multiple clusters that form a supercluster, then each is required to have a different name.

Another placement option are _tags_. Each server can have its own set of tags, [defined in configuration][tag-config], typically describing properties of geography, hosting provider, sizing tiers, etc. In addition, tags are often used in conjunction with the `jetstream.unique_tag` config option to ensure that replicas must be placed on servers having _different_ values for the tag.

For example, a server A, B, and C in the above cluster might all the same configuration except for the availability zone they are deployed to.

```
// Server A
server_tags: ["cloud:aws", "region:us-east1", "az:a"]

jetstream: {
  unique_tag: "az"
}

// Server B
server_tags: ["cloud:aws", "region:us-east1", "az:b"]

jetstream: {
  unique_tag: "az"
}

// Server C
server_tags: ["cloud:aws", "region:us-east1", "az:c"]

jetstream: {
  unique_tag: "az"
}
```

Now we can create a stream by using tags, for example indicating we want a stream in us-east1.

```
nats stream add --tag region:us-east1
```

If we had a second cluster in Google Cloud with the same region tag, the stream could be placed in either the AWS or GCP cluster. However, the `unique_tag` constraint ensures each replica will be placed in a different AZ in the cluster that was selected implicitly by the placement tags.

Although less common, note that both the cluster _and_ tags can be used for placement. This would be used if a single cluster contains servers have different properties.

[cluster-config]: https://docs.nats.io/running-a-nats-service/configuration/clustering/cluster_config
[tag-config]: https://docs.nats.io/running-a-nats-service/configuration#cluster-configuration-monitoring-and-tracing

### Sources and Mirrors

When a stream is configured with a `source` or `mirror`, it will automatically and asynchronously replicate messages from the origin stream. There are several options when declaring the configuration.

A source or mirror stream can have its own retention policy, replication, and storage type. Changes to the source or mirror, e.g. deleting messages or publishing, do not reflect on the origin stream.


{% hint style="info" %}
`Sources` is a generalization of the `Mirror` and allows for sourcing data from one or more streams concurrently. We suggest to use `Sources` in new configurations.
If you require the target stream to act as a read-only replica:
- Configure the stream without listen subjects **or**
- Temporarily disable the listen subjects through client authorizations.
{% endhint %}

#### Stream sources

A stream defining `Sources` is a generalized replication mechanism and allows for sourcing data from one or more streams concurrently as well as allowing direct write/publish by clients. Essentially the source streams and client writes are aggregated into a single interleaved stream.
Subject transformation and filtering allow for powerful data distribution architectures.

#### Mirrors

A mirror can source its messages from exactly one stream and a clients can not directly write to the  mirror. Although messages cannot be published to a mirror directly by clients, messages can be deleted on-demand (beyond the retention policy), and consumers have all capabilities available on regular streams.

**For details see:**
* [Source and Mirror](source_and_mirror.md)


### AllowRollup

If enabled, the `AllowRollup` stream option allows for a published message having a `Nats-Rollup` header indicating all prior messages should be purged. The scope of the _purge_ is defined by the header value, either `all` or `sub`.

The `Nats-Rollup: all` header will purge all prior messages in the stream. Whereas the `sub` value will purge all prior messages for a given subject.

A common use case for rollup is for state snapshots, where the message being published has accumulated all the necessary state from the prior messages, relative to the stream or a particular subject.

### RePublish

If enabled, the `RePublish` stream option will result in the server re-publishing messages received into a stream automatically and immediately after a successful write, to a distinct destination subject.

For high scale needs where, currently, a dedicated consumer may add too much overhead, clients can establish a core NATS subscription to the destination subject and receive messages that were appended to the stream in real-time.

The fields for configuring republish include:

- `Source` - An optional subject pattern which is a subset of the subjects bound to the stream. It defaults to all messages in the stream, e.g. `>`.
- `Destination` - The destination subject messages will be re-published to. The source and destination must be a valid [subject mapping](../../nats-concepts/subject_mapping.md).
- `HeadersOnly` - If true, the message data will not be included in the re-published message, only an additional header `Nats-Msg-Size` indicating the size of the message in bytes.

For each message that is republished, a set of [headers](./headers.md) are automatically added.

### SubjectTransform

If configured, the `SubjectTransform` will perform a subject transform to matching subjects of messages received by the stream and transform the subject, before storing it in the stream. The transform configuration specifies a `Source` and `Destination` field, following the rules of [subject transform](../../running-a-nats-service/configuration/configuring_subject_mapping.md).
