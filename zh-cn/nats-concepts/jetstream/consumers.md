# 消费者

一个消费者 是 一个流中的一个有状态的**视图**。它充当客户端*消费*流中存储的消息子集的接口，并跟踪哪些消息已被送达和被客户端确认。

与提供至多一次（at most once）传递保证的 [Core NATS](https://docs.nats.io/nats-concepts/core-nats) 不同，JetStream 中的消费者可以提供**至少一次（at least once）**传递保证。

虽然**流**负责存储已发布的消息，但消费者负责跟踪传递和确认。
这种跟踪确保如果消息未被客户端确认（未确认或 'nacked'）时，消费者将自动尝试向客户端重发消息。JetStream 消费者支持多种确认类型和策略。若消息在用户指定的交付尝试次数内仍未被确认，系统将触发建议性通知。

## 分发类型 - 拉取（Pull）/ 推送（Push）
消费者可以是基于**推送**的，消息将被传递到指定的主题；也可以是基于**拉取**的，允许客户端按需请求消息批次。
使用哪种类型的消费者取决于用例。

若需以应用程序可控方式处理消息并实现轻松水平扩展，应选用“拉取式消费者”。对于希望顺序重放消息流的简单客户端应用，应选用“有序推送式消费者”。需要负载均衡或逐条确认消息的应用，则应选用常规推送式消费者。


{% hint style="info" %}
推荐新项目采用拉取式消费者，尤其在需要关注可扩展性、精细流控或错误处理时。
{% endhint %}

### 有序消费者 (Ordered Consumers)
有序消费者是推送和拉取消费者的便捷默认类型，专为希望高效消费流以进行数据检查或分析的应用程序而设计。
*   始终为临时对象
*   无需确认（如果检测到间隙，消费者会重新创建）
*   自动流量控制/拉取处理
*   单线程分发
*   不支持负载均衡

## 持久性 - 持久型（Durable）/ 临时型（Ephemeral）
除推送/拉取模式外，消费者还可选择**临时型**或**持久型**。当创建消费者时在 `Durable` 字段上设置了显式名称，或者设置了 `InactiveThreshold` 时，该消费者即被系统视为 _持久型_。

持久型与临时型具有相同的消息传递语义，但临时型消费者不具备持久化状态或容错能力（仅驻留在服务器内存），且在闲置一段时间（无订阅绑定）时即被自动清理（删除）。

默认情况下，消费者将继承所消费流的复制因子，并且即使在不活动期间也将保持存在（除非显式设置 `InactiveThreshold`）。消费者可从服务器、客户端故障中恢复。

{% embed url="https://youtu.be/334XuMma1fk" %} NATS JetStream 消费者 - 使 NATS 比 Kafka、Pulsar、RabbitMQ 和 redis 更强大的一个特性
{% endembed %}

## Configuration

以下是可定义的消费者配置选项集合。`Version` 列表示引入该选项的 nats-server 版本。`Editable` 列表示该选项在消费者创建后是否可以编辑。

### 常规选项

| Field             | Description                                                                                                                                                                                                                                                                                                                                 | Version | Editable |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| Durable           | If set, clients can have subscriptions bind to the consumer and _resume_ until the consumer is explicitly deleted. A durable name cannot contain whitespace, `.`, `*`, `>`, path separators (forward or backward slash), or non-printable characters.                                                                                          | 2.2.0   | No       |
| [FilterSubject](#filtersubjects)  | A subject that overlaps with the subjects bound to the stream to filter delivery to subscribers. Note: This cannot be used with the `FilterSubjects` field.                                                                                                                                                                                                                  | 2.2.0   | Yes      |
| [AckPolicy](#ackpolicy) | The requirement of client acknowledgments, either `AckExplicit`, `AckNone`, or `AckAll`.                                                                                                                                                                                                                                                                                          | 2.2.0   | No       |
| AckWait           | The duration that the server will wait for an acknowledgment for any individual message _once it has been delivered to a consumer_. If an acknowledgment is not received in time, the message will be redelivered. This setting is only effective when `BackOff` is **not configured**.  | 2.2.0   | Yes      |
| [DeliverPolicy](#deliverpolicy) | The point in the stream from which to receive messages: `DeliverAll`, `DeliverLast`, `DeliverNew`, `DeliverByStartSequence`, `DeliverByStartTime`, or `DeliverLastPerSubject`.                                                                                                                                                                                                                       | 2.2.0   | No       |
| OptStartSeq       | Used with the `DeliverByStartSequence` deliver policy.                                                                                                                                                                                                                                                                                                                               | 2.2.0   | No       |
| OptStartTime      | Used with the `DeliverByStartTime` deliver policy.                                                                                                                                                                                                                                                                                                                                  | 2.2.0   | No       |
| Description       | A description of the consumer. This can be particularly useful for ephemeral consumers to indicate their purpose since a durable name cannot be provided.                                                                                                                                                                                      | 2.3.3   | Yes      |
| InactiveThreshold | Duration that instructs the server to clean up consumers inactive for that long. Prior to 2.9, this only applied to ephemeral consumers.                                                                                                                                                                                                      | 2.2.0   | Yes      |
| [MaxAckPending](#maxackpending) | Defines the maximum number of messages, without acknowledgment, that can be outstanding. Once this limit is reached, message delivery will be suspended. This limit applies across _all_ of the consumer's bound subscriptions. A value of -1 means there can be any number of pending acknowledgments (i.e., no flow control). The default is 1000.                          | 2.2.0   | Yes      |
| MaxDeliver        | The maximum number of times a specific message delivery will be attempted. Applies to any message that is re-sent due to acknowledgment policy (i.e., due to a negative acknowledgment or no acknowledgment sent by the client). The default is -1 (redeliver until acknowledged). Messages that have reached the maximum delivery count will stay in the stream.                                                                                                                                                                                                          | 2.2.0   | Yes      |
| Backoff           | A sequence of delays controlling the re-delivery of messages on acknowledgment timeout (but not on `nak`). The sequence length must be less than or equal to `MaxDeliver`. If backoff is not set, a timeout will result in immediate re-delivery. E.g., `MaxDeliver=5` `backoff=[5s, 30s, 300s, 3600s, 84000s]` will re-deliver a message 5 times over one day. When `MaxDeliver` is larger than the backoff list, the last delay in the list will apply for the remaining deliveries. Note that backoff is NOT applied to `nak`ed messages. A `nak` will result in immediate re-delivery unless `nakWithDelay` is used to set the re-delivery delay explicitly. When `BackOff` is set, it **overrides `AckWait` entirely**. The first value in the BackOff determines the `AckWait` value. | 2.7.1   | Yes      |
| ReplayPolicy      | If the policy is `ReplayOriginal`, the messages in the stream will be pushed to the client at the same rate they were originally received, simulating the original timing. If the policy is `ReplayInstant` (default), the messages will be pushed to the client as fast as possible while adhering to the acknowledgment policy, Max Ack Pending, and the client's ability to consume those messages. | 2.2.0   | No       |
| Replicas          | Sets the number of replicas for the consumer's state. By default, when the value is set to zero, consumers inherit the number of replicas from the stream.                                                                                                                                                                                      | 2.8.3   | Yes      |
| MemoryStorage     | If set, forces the consumer state to be kept in memory rather than inherit the storage type of the stream (default is file storage). This reduces I/O from acknowledgments, useful for ephemeral consumers.                                                                                                                                   | 2.8.3   | No       |
| SampleFrequency   | Sets the percentage of acknowledgments that should be sampled for observability, 0-100. This value is a string and allows both `30` and `30%` as valid values.                                                                                                                                                                                 | 2.2.0   | Yes      |
| Metadata          | A set of application-defined key-value pairs for associating metadata with the consumer.                                                                                                                                                                                                                                                       | 2.10.0  | Yes      |
| [FilterSubjects](consumers.md#filtersubjects) | A set of subjects that overlap with the subjects bound to the stream to filter delivery to subscribers. Note: This cannot be used with the `FilterSubject` field.                                                                                                                                                                                                  | 2.10.0  | Yes      |
| HeadersOnly       | Delivers only the headers of messages in the stream, adding a `Nats-Msg-Size` header indicating the size of the removed payload.                                                                                                                                                                                                                                          | 2.6.2   | Yes      |

#### AckPolicy

本策略有以下可选项：

*   `AckExplicit`：默认策略。每条消息必须单独确认。推荐用于大多数可靠性和功能性场景。
*   `AckNone`：不需要确认；系统默认在消息送达时视为已确认。
*   `AckAll`：仅确认一系列消息中最后接收到的消息；所有先前的消息自动被确认。对于拉取式消费者，将确认所有订阅者的所有待处理消息。

如果需要确认但在 `AckWait` 所定义的时长内未收到确认，消息将被重新传递。

> **警告**：系统可能会把确认窗口外到达的确认消息视作有效。例如，在队列情况下，如果第一个进程未在窗口内确认并且消息已被重新传递给另一个消费者，则仍会采纳首个消费者的确认。

#### DeliverPolicy

本策略有以下可选项：

*   `DeliverAll`：默认策略。从流中最早可用的消息开始接收。
*   `DeliverLast`：从添加到流中的最后一条消息开始接收，或者如果定义了消费者的过滤主题，则从匹配该过滤主题的最后一条消息开始。
*   `DeliverLastPerSubject`：从流中当前每个已过滤主题的最新消息开始接收。
*   `DeliverNew`：从消费者创建后产生的消息开始接收。
* `DeliverByStartSequence`：从序列号为指定值的第一条消息开始接收。消费者必须通过 `OptStartSeq` 参数指定序列号。
* `DeliverByStartTime`：从指定时间点及之后的消息开始接收。消费者必须通过 `OptStartTime` 参数指定起始时间。

#### MaxAckPending

`MaxAckPending` 功能提供流控制，适用于推送型和拉取型消费者。对于推送型消费者，`MaxAckPending` 是唯一的流控制形式。对于拉取型消费者，客户端驱动的消息传递会与订阅者建立隐式一对一流控制。

对于高吞吐量，将 `MaxAckPending` 设置为较高的值。对于由于外部服务而导致高延迟的应用，使用较低的值并调整 `AckWait` 以避免重新传递。

#### FilterSubjects

FilterSubjects 可在消息传递至客户端前进行服务器端过滤。

例如，一个主题为 `factory-events.*.*` 的流 `factory-events` 可以有一个消费者 `factory-A`，其过滤器为 `factory-events.A.*`，以仅传递工厂 `A` 的事件。

一个消费者可以配置单个 `FilterSubject` 或多个 `FilterSubjects`。可以应用多重过滤器，例如 `[factory-events.A.*, factory-events.B.*]` 或特定事件类型 `[factory-events.*.item_produced, factory-events.*.item_packaged]`。

> **警告**： 若需精细化消费者权限控制，单个过滤器应使用 `$JS.API.CONSUMER.CREATE.{stream}.{consumer}.{filter}` 限制用户仅能使用特定过滤器。多个过滤器则使用通用配置 `$JS.API.CONSUMER.DURABLE.CREATE.{stream}.{consumer}`（不含 `{filter}` 标记）。精细化权限需采用其他策略。

### Pull-specific
这些选项仅适用于拉取型消费者。有关配置示例，请参见 [NATS by Example](https://natsbyexample.com/examples/jetstream/pull-consumer/go)。

| Field              | Description                                                                                                                                                          | Version | Editable |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| MaxWaiting         | The maximum number of waiting pull requests.                                                                                                                         | 2.2.0   | No       |
| MaxRequestExpires  | The maximum duration a single pull request will wait for messages to be available to pull.                                                                           | 2.7.0   | Yes      |
| MaxRequestBatch    | The maximum batch size a single pull request can make. When set with `MaxRequestMaxBytes`, the batch size will be constrained by whichever limit is hit first.       | 2.7.0   | Yes      |
| MaxRequestMaxBytes | The maximum total bytes that can be requested in a given batch. When set with `MaxRequestBatch`, the batch size will be constrained by whichever limit is hit first. | 2.8.3   | Yes      |

### Push-specific

这些选项仅适用于推送型消费者。有关配置示例，请参见 [NATS by Example](https://natsbyexample.com/examples/jetstream/push-consumer/go)。

| Field          | Description                                                                                                                                                                                                                                                                                                                                                               | Version | Editable |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| DeliverSubject | The subject to deliver messages to. Setting this field decides whether the consumer is push or pull-based. With a deliver subject, the server will _push_ messages to clients subscribed to this subject.                                                                                                                                                                | 2.2.0   | No       |
| DeliverGroup   | The queue group name used to distribute messages among subscribers. Analogous to a [queue group](https://docs.nats.io/nats-concepts/core-nats/queue) in core NATS.                                                                                                                                                                                                       | 2.2.0   | Yes      |
| FlowControl    | Enables per-subscription flow control using a sliding-window protocol. This protocol relies on the server and client exchanging messages to regulate when and how many messages are pushed to the client. This one-to-one flow control mechanism works in tandem with the one-to-many flow control imposed by `MaxAckPending` across all subscriptions bound to a consumer. | 2.2.0   | Yes      |
| IdleHeartbeat  | If set, the server will regularly send a status message to the client during inactivity, indicating that the JetStream service is up and running. The status message will have a code of 100 and no reply address. Note: This mechanism is handled transparently by supported clients.                                                                                      | 2.2.0   | Yes      |
| RateLimit      | Throttles the delivery of messages to the consumer, in bits per second.                                                                                                                                                                                                                                                                                                  | 2.2.0   | Yes      |

---
