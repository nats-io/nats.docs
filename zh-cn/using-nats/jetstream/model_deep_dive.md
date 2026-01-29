# JetStream 模型深度解析

## Stream 限制、保留与策略

Stream（流）将数据存储在磁盘上，但由于存储空间有限，我们无法永久保留所有数据，因此需要一套自动控制规模的机制。

在决定 Stream 存储数据的时间长短时，有三个关键特性在起作用。

`Retention Policy`（保留策略）描述了系统依据什么标准从存储中逐出（evict）消息：

| Retention Policy  | 说明 |
| ----------------- | ---- |
| `LimitsPolicy`    | 根据消息总数、存储总量以及消息的“保质期”（时长）来设置上限。 |
| `WorkQueuePolicy` | 消息会一直保留到被消费为止：也就是消息被投递给订阅应用（由某个 Consumer 根据 subject 过滤接收）。在这种模式下，同一条 Stream 覆盖到的每个 subject 同一时刻只能有一个 Consumer（不允许重叠 Consumer）。应用必须显式 ACK 该消息。 |
| `InterestPolicy`  | 只要流上还存在（与消息主题匹配的）消费者且该消息尚未被这些消费者确认（ACK），消息就会保留。一旦所有当前定义的消费者从订阅应用程序那里收到了对消息的明确确认（ACK），该消息随后就会从流中移除。 |

在所有的保留策略中，**基础限制（Basic Limits）**都作为“天花板”起作用，包括：

* `MaxMsgs`：总共保留多少条消息。
* `MaxBytes`：数据集的总大小上限。
* `MaxAge`：单条消息的最长保存时间。

对于 `LimitsPolicy`（限制策略）而言，它是唯一生效的规则。

而在另外两种策略中，消息可能会比这些限制预期的更早被移除：

- 在 **`WorkQueuePolicy`** 中，一旦“那个”消费者发回 ACK，消息即被清理。
- 在 `InterestPolicy` 中，只要该 subject 上的所有 Consumer 都对该消息发回了 ACK，消息即被清理。

即使消息还没被确认，如果触碰了 `MaxAge`、`MaxBytes` 或 `MaxMsgs` 的红线，它们依然会被强制移除。

最后还有一个重要控制项：单条消息的最大尺寸。NATS 本身对最大消息尺寸有默认限制（默认 1 MiB），但你可以通过 `MaxMsgSize` 进一步限制 Stream 只接收（例如）1024 字节以内的消息。

**丢弃策略（Discard Policy）**：定义了当达到 `LimitsPolicy` 设定的上限时该怎么办。

- `DiscardOld`：丢弃旧消息，为新消息腾出空间
- `DiscardNew`：拒收新消息

`WorkQueuePolicy` 是一种特殊模式：消息一旦被消费并 ACK，就会从 Stream 中删除。

## 消息去重（Message Deduplication）

JetStream 支持幂等写入：它会根据消息头中的 `Nats-Msg-Id` 字段自动忽略重复的消息。

```shell
nats req -H Nats-Msg-Id:1 ORDERS.new hello1
nats req -H Nats-Msg-Id:1 ORDERS.new hello2
nats req -H Nats-Msg-Id:1 ORDERS.new hello3
nats req -H Nats-Msg-Id:1 ORDERS.new hello4
```

这里我们设置了 `Nats-Msg-Id:1`，它告诉 JetStream：请确保这条消息不会重复写入。只会通过消息 ID 去重，不会比较 body。

```shell
nats stream info ORDERS
```

从输出可以看到：系统检测到了重复发布、Stream 实际只存储了一条消息（第一条）。

```
....
State:

            Messages: 1
               Bytes: 67 B
```

默认的消息去重追踪时间窗口为 2 分钟。创建 Stream 时可以用 `--dupe-window` 调整，但不建议设置得过大。

## 确认模型 (Acknowledgement Models)

流支持确认接收到的消息。如果你对 Stream 配置覆盖的 subject 发送 `Request()`，服务端就会在确保存储好消息后给你一个答复；但如果你只是简单的 publish（发布），它就不会理你。另外，你也可以在配置中将 `NoAck` 设为 `true` 来禁用流级别的确认机制。

Consumer 有 3 种确认模式：

| Mode          | 说明 |
| ------------- | ---- |
| `AckExplicit` | **显式确认**。要求对每一条消息都进行专门的确认。这是拉取型（Pull-based）消费者的唯一选择。 |
| `AckAll`      | **累计确认。** 在这种模式下，如果你确认了第 100 条消息，那么前面的第 1 到 99 条也会被视作已确认。这非常适合批量处理，能省掉不少确认开销。 |
| `AckNone`     | **无需确认。** 压根不支持任何确认操作。 |

为了弄清消费者是如何追踪消息的，我们先从一个干净的 `ORDERS` 流和一个 `DISPATCH` 消费者开始演示。

```shell
nats str info ORDERS
```

```
...
Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 0
             LastSeq: 0
    Active Consumers: 1
```

Stream 目前完全为空。

```shell
nats con info ORDERS DISPATCH
```

```
...
State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 1
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
        Pending Messages: 0
    Redelivered Messages: 0
```

该 Consumer 没有任何未完成消息，并且从未处理过消息（Consumer sequence 为 1）。

向 Stream 发布一条消息，并确认 Stream 已接收：

```shell
nats pub ORDERS.processed "order 4"
```

```
Published 7 bytes to ORDERS.processed
$ nats str info ORDERS
...
Statistics:

            Messages: 1
               Bytes: 53 B
            FirstSeq: 1
             LastSeq: 1
    Active Consumers: 1
```

由于这个 Consumer 是 pull-based 的，我们可以拉取消息、ACK，并查看 Consumer 状态：

```shell
nats con next ORDERS DISPATCH
```

```
--- received on ORDERS.processed
order 4

Acknowledged message

$ nats con info ORDERS DISPATCH
...
State:

  Last Delivered Message: Consumer sequence: 2 Stream sequence: 2
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 0
    Redelivered Messages: 0
```

消息已投递并完成 ACK：`Acknowledgement floor` 为 `1` 与 `1`；Consumer 的 sequence 为 `2`，表示它只处理过这一条消息且已 ACK。因为已经 ACK，所以没有 pending，也不会重新投递。

再发布一条消息；客户端这次拉取消息但不确认，观察状态：

```shell
nats pub ORDERS.processed "order 5"
```

```
Published 7 bytes to ORDERS.processed
```

从 Consumer 获取下一条消息（但不要确认它）

```shell
nats consumer next ORDERS DISPATCH --no-ack
```

```
--- received on ORDERS.processed
order 5
```

查看 Consumer 信息

```shell
nats consumer info ORDERS DISPATCH
```

```
State:

  Last Delivered Message: Consumer sequence: 3 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 1
    Redelivered Messages: 0
```

现在可以看到：Consumer 处理过 2 次投递（观察到 sequence 为 3，表示下一条将是第 3 次投递），但 Ack floor 仍然是 1，因此有 1 条消息处于“待确认（pending）”状态，这也在 `Pending Messages` 中得到了印证。

如果我反复拉取它，但一直不 ACK：

```shell
nats consumer next ORDERS DISPATCH --no-ack
```

```
--- received on ORDERS.processed
order 5
```

再次查看 Consumer 信息

```shell
nats consumer info ORDERS DISPATCH
```

```
State:

  Last Delivered Message: Consumer sequence: 4 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 1
    Redelivered Messages: 1
```

Consumer sequence 会增加——每一次投递尝试都会增加序号——同时 `Redelivered Messages` 也会递增。

最后，再拉取一次并在这次进行 ACK：

```shell
nats consumer next ORDERS DISPATCH 
```

```
--- received on ORDERS.processed
order 5

Acknowledged message
```

查看 Consumer 信息

```shell
nats consumer info ORDERS DISPATCH
```

```
State:

  Last Delivered Message: Consumer sequence: 5 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 0
    Redelivered Messages: 0
```

在确认完消息后，队列中就不再有待处理（pending）的消息了。

此外，确认（Acknowledgement）其实有多种类型：

| Type          | Bytes       | 说明 |
| ------------- | ----------- | ---- |
| `AckAck`      | nil, `+ACK` | 确认消息已完全处理完毕。 |
| `AckNak`      | `-NAK`      | 告知服务端：先不处理该消息、继续处理下一条；被 NAK 的消息稍后会被重试 |
| `AckProgress` | `+WPI`      | 在 AckWait 到期前发送，表示客户端还在处理这个消息，希望将等待期再延长一个 `AckWait` 的时长。 |
| `AckNext`     | `+NXT`      | 确认当前消息已处理，并请求将下一条消息投递到 reply subject；仅适用于 Pull 模式 |
| `AckTerm`     | `+TERM`     | 指示服务器停止重传该消息，且不将其标记为处理成功 |

到目前为止，我们的示例使用的都是 `AckAck` 类型。你可以根据 `Bytes` 列所示的 body 内容来选择想要的 ACK 模式。

注意： 这里描述的是 JetStream 的内部协议细节。在实际开发中，客户端库都提供了专门的 API 来执行这些确认操作，你完全不需要担心底层的 payload 该怎么写。

除 `AckNext` 外，以上 ACK 模式都支持“双重确认”（double acknowledgement）：如果你在发送 ACK 时设置了 reply subject，服务器在收到你的确认后会反过来再回复一次，确认它已经收到你的 ACK。

`+NXT` 有几种格式：例如 `+NXT 10` 表示请求 10 条消息；`+NXT {"no_wait": true}` 表示携带与 Pull Request 相同结构的数据。

## 恰好一次语义

JetStream 通过结合“消息去重”和“双重确认”，支持“恰好一次”的发布与消费语义。

在发布侧，你可以通过 [消息去重](model\_deep\_dive.md#message-deduplication) 来避免重复摄取消息。

在消费侧，若希望 100% 确认消息确实被正确处理，可以要求服务器确认“已收到你的 ACK”（也称 double-acking）。做法是调用消息的 `AckSync()`（而非 `Ack()`）：它会在 ACK 上设置 reply subject，并等待服务器对“ACK 已接收并处理”的回应。只要收到服务端的成功响应，你就可以确信：消费者永远不会（由于你的ACK在传递中丢失而）重发该消息给你。

## Consumer 的起始位置

创建 Consumer 时，你可以决定从哪里开始读取数据。。系统通过 `DeliverPolicy` 支持以下起点：

| Policy              | 说明 |
| ------------------- | ---- |
| `all`               | 投递所有可用消息 |
| `last`              | 只投递最新一条消息，类似 `tail -n 1 -f` |
| `new`               | 只投递订阅开始之后新到达的消息 |
| `by_start_time`     | 从指定时间点之后开始投递；需要设置 `OptStartTime` |
| `by_start_sequence` | 从指定的 Stream 序列号开始投递；需要设置 `OptStartSeq` |

无论你选择哪种策略，这都只是“起点”。一旦开始投递，Consumer 会始终给你提供那些“尚未见过”或“尚未确认”的消息。所以，这个策略只是用来决定它“迈出的第一步”在哪。

我们逐一看看这些策略。首先创建一个新 Stream `ORDERS`，并向其中写入 100 条消息。

现在，创建一个 `DeliverAll` 的拉取型消费者：

```shell
nats consumer add ORDERS ALL --pull --filter ORDERS.processed --ack none --replay instant --deliver all 
nats consumer next ORDERS ALL
```

```
--- received on ORDERS.processed
order 1

Acknowledged message
```

创建一个 `DeliverLast` 的拉取型消费者：

```shell
nats consumer add ORDERS LAST --pull --filter ORDERS.processed --ack none --replay instant --deliver last
nats consumer next ORDERS LAST
```

```
--- received on ORDERS.processed
order 100

Acknowledged message
```

创建一个 `MsgSetSeq` 的拉取型消费者：

```shell
nats consumer add ORDERS TEN --pull --filter ORDERS.processed --ack none --replay instant --deliver 10
nats consumer next ORDERS TEN
```

```
--- received on ORDERS.processed
order 10

Acknowledged message
```

最后是基于时间的 Consumer。先每隔 1 分钟写入一条消息：

```shell
nats stream purge ORDERS
for i in 1 2 3
do
  nats pub ORDERS.processed "order ${i}"
  sleep 60
done
```

然后创建一个 Consumer，从 2 分钟前开始：

```shell
nats consumer add ORDERS 2MIN --pull --filter ORDERS.processed --ack none --replay instant --deliver 2m
nats consumer next ORDERS 2MIN
```

```
--- received on ORDERS.processed
order 2

Acknowledged message
```

## 临时消费者 (Ephemeral Consumers)

到目前为止，你看到的 Consumer 都是“持久化”（Durable）的：即使你断开与 JetStream 的连接，它们仍然存在。但在我们的订单场景中，像 `MONITOR` 这样的 Consumer 可能只是运维人员在调试系统时的一个短命组件；如果你只是想观察实时状态，就没必要让服务器记住你上次看到哪儿了。

这种情况下，我们可以创建一个临时消费者（Ephemeral Consumer）。方法是：先订阅要投递到的主题，然后创建 消费者 时不设置持久化名称。只要该投递主题上还有活跃的订阅，临时消费者就会一直存在；一旦没有了订阅者，系统在一段处理重启的短暂宽限期之后，系统会自动将其删除。

Terminal 1:

```shell
nats sub my.monitor
```

Terminal 2:

```shell
nats consumer add ORDERS --filter '' --ack none --target 'my.monitor' --deliver last --replay instant --ephemeral
```

`--ephemeral` 选项用于告诉系统创建 Ephemeral Consumer。

## 消费者消息速率 (Consumer Message Rates)

通常情况下，当你创建一个新消费者时，你希望它能尽快把选中的消息发给你。但有时你希望按“原始到达速率”回放：例如消息最初每分钟到达一次，那么你新建 Consumer 后也希望每分钟收到一条。

这在压测等场景很有用。该行为由 `ReplayPolicy` 控制，取值包括 `ReplayInstant` 与 `ReplayOriginal`。

`ReplayPolicy` 只能用于 push-based Consumer。

```shell
nats consumer add ORDERS REPLAY --target out.original --filter ORDERS.processed --ack none --deliver all --sample 100 --replay original
```

```
...
     Replay Policy: original
...
```

Now let's publish messages into the Set 10 seconds apart:

```shell
for i in 1 2 3                                                                                                                                                      <15:15:35
do
  nats pub ORDERS.processed "order ${i}"
  sleep 10
done
```

```
Published [ORDERS.processed] : 'order 1'
Published [ORDERS.processed] : 'order 2'
Published [ORDERS.processed] : 'order 3'
```

And when we consume them they will come to us 10 seconds apart:

```shell
nats sub -t out.original
```

```
Listening on [out.original]
2020/01/03 15:17:26 [#1] Received on [ORDERS.processed]: 'order 1'
2020/01/03 15:17:36 [#2] Received on [ORDERS.processed]: 'order 2'
2020/01/03 15:17:46 [#3] Received on [ORDERS.processed]: 'order 3'
^C
```

## ACK 采样（Ack Sampling）

前面的章节提到系统会向监控系统发送采样数据。这里我们深入看看：监控系统是如何工作的，以及采样内容包含什么。

当消息流经消费者时，你可能会关心：有多少消息被重传了？重传了多少次？以及确认一条消息到底花了多长时间？

Consumer 可以为你对已 ACK 的消息进行采样，并将样本发布出去，供监控系统观察该 Consumer 的健康状况。我们将把这一能力加入到 [NATS Surveyor](https://github.com/nats-io/nats-surveyor) 中。

### 配置

你可以在 `nats consumer add` 时通过 `--sample 80` 为 Consumer 启用采样，表示对 80% 的 ACK 进行采样。

查看 Consumer 信息时，可以判断是否启用了采样：

```shell
nats consumer info ORDERS NEW
```

输出中会包含：

```
...
     Sampling Rate: 100
...
```

## 存储开销（Storage Overhead）

JetStream 的文件存储非常高效，会尽可能少地存储与消息相关的额外信息。

但每条消息仍会附带存储一些数据，包括：

* 消息头 (Message headers)
* 消息接收时所在的主题 (Subject)
* 接收时间
* 消息体 payload
* 消息哈希值
* 消息序列号 (Sequence)
* 其他少量信息，如 subject 的长度、headers 的长度

不带 headers 时，大小计算如下：

```
消息记录长度 (4字节) + 序列号(8) + 时间戳(8) + 主题长度(2) + 主题内容 + 消息内容 + 哈希值(8)
```

一条 5 字节的 `hello` 消息（无 headers）会占用 39 字节。

带 headers 时：

```
消息记录长度 (4字节) + 序列号(8) + 时间戳(8) + 主题长度(2) + 主题内容 + Header长度(4) + Header内容 + 消息内容 + 哈希值(8)
```

因此，如果你发布大量的小消息，相对而言，额外开销会显得比较大；但对于大消息来说，这点开销就微乎其微了。如果你确实需要发布大量小消息，尝试优化（缩短）主题长度是值得一试的。
