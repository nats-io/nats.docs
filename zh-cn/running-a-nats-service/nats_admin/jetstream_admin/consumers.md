# 消费者

消息通过消费者从流中被读取或消费。我们支持基于拉取和推送的消费者，示例场景中两者都有，我们来详细了解一下。

## 创建拉取型消费者

`NEW` 和 `DISPATCH` 消费者是基于拉取的，这意味着从它们消费数据的服务必须主动向系统请求下一个可用的消息。这样你就可以通过增加更多工作进程来轻松地对你的服务进行扩容，消息将根据工作进程的可用性分布到它们之中。

拉取型消费者与推送型消费者创建方式相同，只是你不需要指定投递目标。

```shell
nats con ls ORDERS
```
```text
No Consumers defined
```

我们还没有消费者，让我们创建 `NEW` 这个：

我在 CLI 上提供了 `--sample` 选项，因为目前这不是交互式提示的一部分，其他所有内容都会有提示。CLI 中的帮助信息解释了每个选项：

```shell
nats con add --sample 100
```
```text
? Select a Stream ORDERS
? Consumer name NEW
? Delivery target
? Start policy (all, last, 1h, msg sequence) all
? Filter Stream by subject (blank for all) ORDERS.received
? Maximum Allowed Deliveries 20
Information for Consumer ORDERS > NEW

Configuration:

        Durable Name: NEW
           Pull Mode: true
             Subject: ORDERS.received
         Deliver All: true
        Deliver Last: false
          Ack Policy: explicit
            Ack Wait: 30s
       Replay Policy: instant
  Maximum Deliveries: 20
       Sampling Rate: 100

State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 1
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
        Pending Messages: 0
    Redelivered Messages: 0
```

这是一个拉取型消费者（空的投递目标），它从第一个可用的消息开始获取消息，并且要求对每个消息进行显式确认。

它只接收最初通过 `ORDERS.received` 主题进入流的消息。请记住，流订阅了 `ORDERS.*`，这使我们能够从流中选择一个消息子集。

设置了最大投递限制为 20，这意味着如果消息未被确认，它将被重试，但总投递次数不能超过此最大值。

同样，所有这些都可以通过一次 CLI 调用完成，让我们创建 `DISPATCH` 消费者：

```shell
nats con add ORDERS DISPATCH --filter ORDERS.processed --ack explicit --pull --deliver all --sample 100 --max-deliver 20
```

此外，可以将配置存储在 JSON 文件中，其格式与 `$ nats con info ORDERS DISPATCH -j | jq .config` 命令的输出相同：

```shell
nats con add ORDERS MONITOR --config monitor.json
```

## 创建推送型消费者

我们的 `MONITOR` 消费者是基于推送的，无需确认，只获取新消息，并且不被采样：

```shell
nats con add
```
```text
? Select a Stream ORDERS
? Consumer name MONITOR
? Delivery target monitor.ORDERS
? Start policy (all, last, 1h, msg sequence) last
? Acknowledgement policy none
? Replay policy instant
? Filter Stream by subject (blank for all)
? Maximum Allowed Deliveries -1
Information for Consumer ORDERS > MONITOR

Configuration:

      Durable Name: MONITOR
  Delivery Subject: monitor.ORDERS
       Deliver All: false
      Deliver Last: true
        Ack Policy: none
     Replay Policy: instant

State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 2
        Pending Messages: 0
    Redelivered Messages: 0
```

同样，你可以通过一条非交互式命令完成此操作：

```shell
nats con add ORDERS MONITOR --ack none --target monitor.ORDERS --deliver last --replay instant --filter ''
```

此外，可以将配置存储在 JSON 文件中，其格式与 `$ nats con info ORDERS MONITOR -j | jq .config` 命令的输出相同：

```shell
nats con add ORDERS --config monitor.json
```

## 列出消费者

你可以快速列出特定流的所有消费者：

```shell
nats con ls ORDERS
```
```text
Consumers for Stream ORDERS:

        DISPATCH
        MONITOR
        NEW
```

## 查询

可以查询消费者的所有详细信息，我们先看一个拉取型消费者：

```text
$ nats con info ORDERS DISPATCH
Information for Consumer ORDERS > DISPATCH

Configuration:

      Durable Name: DISPATCH
         Pull Mode: true
           Subject: ORDERS.processed
       Deliver All: true
      Deliver Last: false
        Ack Policy: explicit
          Ack Wait: 30s
     Replay Policy: instant
     Sampling Rate: 100

State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 1
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
        Pending Messages: 0
    Redelivered Messages: 0
```

关于 `State` 部分的更多细节将在后面深入讨论 ACK 模型时展示。

### 流序列号 vs 消费者序列号

这两个数字没有直接关系：流序列号指向确切的消息，而消费者序列号是消费者操作的一个递增计数器。

例如，一个包含 1 条消息的流，其流序列号为 1，但如果消费者尝试投递该消息 10 次，那么消费者序列号将是 10 或 11。

## 消费拉取型消费者

拉取型消费者要求你明确地请求消息并对其进行确认，通常你会使用客户端库的 `Request()` 功能来实现这一点，但 `nats` 工具提供了一个辅助功能：

首先，我们确保有一条消息：

```shell
nats pub ORDERS.processed "order 1"
nats pub ORDERS.processed "order 2"
nats pub ORDERS.processed "order 3"
```

我们现在可以使用 `nats` 来读取它们：

```shell
nats con next ORDERS DISPATCH
```
```text
--- received on ORDERS.processed
order 1

Acknowledged message
```
再消费一条：
```shell
nats con next ORDERS DISPATCH
```
```text
--- received on ORDERS.processed
order 2

Acknowledged message
```

你可以通过提供 `--no-ack` 来阻止发送 ACK。

要在代码中实现这一点，你可以向 `$JS.API.CONSUMER.MSG.NEXT.ORDERS.DISPATCH` 发送一个 `Request()`：

```shell
nats req '$JS.API.CONSUMER.MSG.NEXT.ORDERS.DISPATCH' ''
```
```text
Published [$JS.API.CONSUMER.MSG.NEXT.ORDERS.DISPATCH] : ''
Received [ORDERS.processed] : 'order 3'
```

这里 `nats req` 无法发送 ACK，但在你的代码中，你需要用一个空负载来回复收到的消息，作为对 JetStream 的 Ack。

## 消费推送型消费者

推送型消费者会将消息发布到一个主题，任何订阅了该主题的人都会收到它们。它们支持不同的确认模型，这将在后面介绍，但在这里的 `MONITOR` 消费者上，我们不需要确认。

```shell
nats con info ORDERS MONITOR
```
输出摘录
```text
...
  Delivery Subject: monitor.ORDERS
...
```

该消费者正在向该主题发布消息，所以让我们监听该主题：

```shell
nats sub monitor.ORDERS
```
```text
Listening on [monitor.ORDERS]
[#3] Received on [ORDERS.processed]: 'order 3'
[#4] Received on [ORDERS.processed]: 'order 4'
```

请注意，这里接收到的消息的主题报告为 `ORDERS.processed`，这有助于你在一个覆盖通配符或多个主题的流中区分你所看到的内容。

这个消费者不需要确认，所以任何进入 ORDERS 系统的新消息都会实时显示在这里。