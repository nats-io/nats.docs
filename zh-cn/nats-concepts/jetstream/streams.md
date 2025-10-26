# 流

流是消息存储库，每个流定义了消息的存储方式以及保留的限制（持续时间、大小、兴趣）。流消费普通的 [NATS 主题](../subjects.md)，发布到这些主题上的任何消息都将被捕获到定义的存储系统中。您可以向该主题进行普通发布以实现无需确认的传递，不过最好改用 JetStream 的 publish 调用，因为 JetStream 服务器会回复一个确认，表明消息已成功存储（译者注：长话短说就是有 ack 机制确保消息成功被 NATS 服务器收到了）。

![订单](../../.gitbook/assets/streams-and-consumers-75p.png)

上图展示了将所有 `ORDERS.*` 存储在流中的概念，尽管存在多种与订单相关的消息类型。我们稍后将展示如何有选择地消费消息的子集。相对而言，流是最消耗资源的组件，因此能够以这种方式组合相关数据是需要考虑的重要因素。

一个流可以消费多个主题。例如这里的 `ORDERS.*`，但如果合理，我们也可以将 `SHIPPING.state` 消费到同一个流中。

## 流的限制和消息保留

流支持各种保留策略，这些策略定义了流中的消息何时可以被自动删除，例如当达到流限制时（如最大消息数量、大小或存在时间），或者还可以在限制之上应用更新颖的选项，例如基于兴趣的保留或工作队列语义（参见 [保留策略](#retentionpolicy)）。

达到消息限制后，服务器将通过删除最旧的消息来为新消息腾出空间（`DiscardOld`），或者拒绝存储新消息（`DiscardNew`）来自动丢弃消息。更多详情，请参见 [丢弃策略](#discardpolicy)。

流支持使用 `Nats-Msg-Id` 头和一个用于跟踪重复消息的滑动窗口进行去重。参见 [消息去重](../../using-nats/jetstream/model_deep_dive.md#message-deduplication) 部分。

关于如何使用您首选的 NATS 客户端配置流的示例，参见 [NATS by Example](https://natsbyexample.com)。

## 配置

以下是可定义的流配置选项集合。`Version` 列表示引入该选项的服务器版本。`Editable` 列表示该选项在流创建后是否可以编辑。[参见特定客户端的示例](https://natsbyexample.com)。



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

存储类型包括：

- `File`（默认）- 使用 基于文件 的存储方案来保存流数据。
- `Memory` - 使用 基于内存 的存储方案来保存流数据。

### Subjects

*注意：不可以为已 配置为[镜像](#mirrors)的流 配置一组主题。镜像会隐式获取 原始流 的子集（可选带过滤器），但不会订阅额外主题。*

若未显式指定主题，则默认主题与流同名。可以指定多个主题并在未来更改。请注意，在某个主题上，如果消息被流存储，而该主题随后被从流配置中删除，只要消费者主题过滤器存在重叠，消费者仍将接收到这些消息。

### RetentionPolicy

保留策略选项包括：

- `LimitsPolicy`（默认）- 基于设置的各种限制进行保留，包括：`MaxMsgs`、`MaxBytes`、`MaxAge` 和 `MaxMsgsPerSubject`。若设置了任何这些限制，当达到其中任意限制时，系统将自动删除对应消息。详见[完整代码示例][limits-example]。
- `WorkQueuePolicy` - 采用 典型 FIFO 队列（先入先出队列）行为的保留策略。每条消息只能被消费一次。这是通过 限制流中*每个主题*只允许创建*一个*消费者（即消费者的主题过滤器*不能*重叠）来实现的。一旦给定的消息被确认（ack’ed），它将被从流中删除。参见 [完整代码示例][workqueue-example]。
- `InterestPolicy` - 基于消费者对流和消息的*兴趣*进行保留。常见场景是流未定义任何消费者。如果将消息发布到这种流，它们将立即被删除，因此不存在*兴趣*。这意味着消费者需在消息发布前绑定至该流。一旦给定的消息被*所有*筛选该主题的消费者确认，该消息就会被删除（与 `WorkQueuePolicy` 行为相同）。参见 [完整代码示例][interest-example]。

{% hint style="warning" %}
如果为流选择了 `InterestPolicy` 或 `WorkQueuePolicy`，请注意，任何已定义的限制仍然有效。例如，给定一个工作队列流，如果设置了 `MaxMsgs` 并且丢弃策略为*旧的*（默认），则消息将被自动删除，即使消费者没有收到它们。
{% endhint %}

{% hint style="info" %}
`WorkQueuePolicy` 流只会在达到限制时或消息被其消费者成功 `Ack’d` 时删除消息。已达到消费者 `MaxDeliver` 尝试次数的重试消息将保留在流中，必须通过 JetStream API 手动删除。
{% endhint %}

[limits-example]: https://natsbyexample.com/examples/jetstream/limits-stream/go
[interest-example]: https://natsbyexample.com/examples/jetstream/interest-stream/go
[workqueue-example]: https://natsbyexample.com/examples/jetstream/workqueue-stream/go

### DiscardPolicy

丢弃行为仅适用于至少定义了一个限制的流。选项包括：

- `DiscardOld`（默认）- 此策略将删除最旧的消息以维持限制。例如，如果 `MaxAge` 设置为一分钟，服务器将自动删除超过一分钟的消息。
- `DiscardNew` - 此策略将*拒绝*将*新*消息附加到流中，如果这会*超出*其中一个限制。此策略的一个扩展是 `DiscardNewPerSubject`，它将在流内基于每个主题应用此策略。

### Placement

Placement 指的是流资产（数据）在 NATS 部署中的放置位置，无论是单个集群还是超级集群。给定的流，包括所有副本（非镜像），都绑定到单个集群。因此，在创建或移动流时，将选择一个集群来托管这些资产。

如果没有显式为流声明放置，默认情况下，流将在客户端连接到的集群中创建（假设该集群有足够的可用存储空间）。

通过声明流放置，可以显式控制这些资产的存放位置。这通常用于与最活跃的客户端（发布者或消费者）协同定位，或者可能由于数据主权原因而需要。

所有客户端 SDK 以及 CLI 都支持放置。例如，通过 CLI 添加一个流以将流放置在特定集群中如下所示：

```
nats stream add --cluster aws-us-east1-c1
```

为此，给定集群中的所有服务器都必须在 [`cluster`][cluster-config] 服务器配置块中定义 `name` 字段。

```
cluster {
  name: aws-us-east1-c1
  # etc..
}
```

如果您有多个形成超级集群的集群，则每个集群都需要有不同的名称。

另一个放置选项是*标签*。每个服务器都可以有自己的一组标签，[在配置中定义][tag-config]，通常描述地理、托管提供商、规模层级等属性。此外，标签通常与 `jetstream.unique_tag` 配置选项结合使用，以确保副本必须部署在具有*不同*标签值的服务器上。

例如，上述集群中的服务器 A、B、C 可能除部署的可用区外配置完全相同。

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

现在我们可以使用标签来创建一个流，例如指示我们希望在 us-east1 中有一个流。

```
nats stream add --tag region:us-east1
```

如果我们在 Google Cloud 中有第二个集群、具有相同区域标签，则该流可以放置在 AWS 或 GCP 集群中。但是，`unique_tag` 约束确保每个副本将放置在通过标签隐式选择的集群中的、**不同的 可用区** 中。

虽然不太常见，但请注意集群 *和* 标签都可以用于放置。如果单个集群包含具有不同属性的服务器，则会使用此方法。

[cluster-config]: https://docs.nats.io/running-a-nats-service/configuration/clustering/cluster_config
[tag-config]: https://docs.nats.io/running-a-nats-service/configuration#cluster-configuration-monitoring-and-tracing

### Sources 和 Mirrors

当一个流被配置了 `source` 或 `mirror` 时，它将自动且异步地从原始流复制消息。声明配置时有几个选项。

设置了 Sources 的流、镜像流（被配置了 `mirror` 的流）都可以有自己的保留策略、复制和存储类型。对这些流的更改，例如删除消息或发布，不会反映在原始流上。

{% hint style="info" %}
`Sources` 是 `Mirror` 的泛化形式，支持从一个或多个流并行获取数据。我们建议在新配置中使用 `Sources`。
如果您希望目标流充当只读副本，你可以：

- 配置没有监听任何主题的流**或者**
- 通过客户端授权临时禁用监听主题。
{% endhint %}

#### Stream sources

定义了 `Sources` 的流，可作为一种通用的复制机制，它允许同时从一个或多个流获取数据，并允许客户端直接写入/发布。本质上，来自 `Sources` 中的流的写入、和来自客户端的写入被交叉聚合到一个单一流中。

[主题转换](#SubjectTransform)和过滤 为你解锁了强大的数据分发架构！

#### Mirrors

镜像流只能从一个流获取消息，并且客户端不能直接写入镜像。虽然客户端不能直接向镜像发布消息，但可以按需删除消息（超出保留策略），并且消费者享有常规流上所有可用的功能。

**详见：**

* [Sources 和 Mirrors](source_and_mirror.md)

### AllowRollup

如果启用 `AllowRollup` 流选项，系统将允许已发布的消息带有 `Nats-Rollup` header，指示应清除所有先前的消息。*清除* 的范围由头值定义，可以是 `all` 或 `sub`。

`Nats-Rollup: all` header 将清除流中所有先前的消息。而 `sub` 值将清除给定主题下的所有先前消息。

Rollup 的一个常见用例是状态快照，其中正在发布的消息已累积了来自先前消息的所有必要状态，相对于流或特定主题（译注：例如一个 游戏服务器 在广播自己的在线人数（状态），而接收方只需要知道它最新的在线人数，这种情况就适合用 AllowRollup）。

### RePublish

如果启用 `RePublish` 流选项，系统将在成功写入接收到的消息后，立即自动将消息重新发布到不同的目标主题。

对于大规模需求，目前，一个专用的 JetStream 消费者 可能会增加过多开销，这种情况下，客户端就可以拿 `RePublish` 特性建立对目标主题的轻量的 Core NATS 订阅，并实时接收附加到流的消息。

配置 `RePublish` 的字段包括：

- `Source` - 一个可选的主题模式，它是绑定到流的主题的子集。它默认为流中的所有消息，例如 `>`。
- `Destination` - 消息将被重新发布到的目标主题。源和目标必须是有效的[主题映射](../../nats-concepts/subject_mapping.md)。
- `HeadersOnly` - 如果为 true，则消息数据将不会包含在重新发布的消息中，只会添加一个额外的头 `Nats-Msg-Size` 来指示消息的大小（字节）。

对于每条重新发布的消息，会自动添加一组 [headers](./headers.md)。

### SubjectTransform

如果配置了 `SubjectTransform`，系统就会对流接收到的消息中，**匹配到的主题**执行一次**主题转换**（SubjectTransform），并在将消息存储到流中之前变换其主题。转换配置指定了 `Source` 和 `Destination` 字段，遵循[主题转换](../../running-a-nats-service/configuration/configuring_subject_mapping.md)的规则。
