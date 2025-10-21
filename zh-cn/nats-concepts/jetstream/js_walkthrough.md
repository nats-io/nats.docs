# NATS JetStream 操作指南

以下是一个简要的操作指南，介绍如何使用 [nats cli](https://github.com/nats-io/natscli) 创建一个流（stream）和消费者（consumer），以及如何与该流进行交互。

## 前提条件：启用 JetStream

如果你正在运行本地的 `nats-server`，请先停止它，并使用 `nats-server -js` 参数重新启动以启用 JetStream（如果尚未启用）。

然后，你可以通过以下命令检查 JetStream 是否已启用：

```shell
nats account info
```
```text
Account Information

                           User: 
                        Account: $G
                        Expires: never
                      Client ID: 5
                      Client IP: 127.0.0.1
                            RTT: 128µs
              Headers Supported: true
                Maximum Payload: 1.0 MiB
                  Connected URL: nats://127.0.0.1:4222
              Connected Address: 127.0.0.1:4222
            Connected Server ID: NAMR7YBNZA3U2MXG2JH3FNGKBDVBG2QTMWVO6OT7XUSKRINKTRFBRZEC
       Connected Server Version: 2.11.0-dev
                 TLS Connection: no

JetStream Account Information:

Account Usage:

                        Storage: 0 B
                         Memory: 0 B
                        Streams: 0
                      Consumers: 0

Account Limits:

            Max Message Payload: 1.0 MiB

  Tier: Default:

      Configuration Requirements:

        Stream Requires Max Bytes Set: false
         Consumer Maximum Ack Pending: Unlimited

      Stream Resource Usage Limits:

                               Memory: 0 B of Unlimited
                    Memory Per Stream: Unlimited
                              Storage: 0 B of Unlimited
                   Storage Per Stream: Unlimited
                              Streams: 0 of Unlimited
                            Consumers: 0 of Unlimited
```

如果你看到以下内容，则说明 JetStream 尚未启用：

```text
JetStream Account Information:

   JetStream is not supported in this account
```

## 1. 创建一个流

让我们从创建一个流开始，用于捕获并存储发布到主题 "foo" 的消息。

输入以下命令创建流：

```shell
nats stream add <Stream name>
```

在下面的示例中，我们将流命名为 "my_stream"，然后输入主题名称 "foo"，并按回车键接受所有其他流属性的默认值：

```shell
nats stream add my_stream
```
```text
? Subjects foo
? Storage file
? Replication 1
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Per Subject Messages Limit -1
? Total Stream Size -1
? Message TTL -1
? Max Message Size -1
? Duplicate tracking time window 2m0s
? Allow message Roll-ups No
? Allow message deletion Yes
? Allow purging subjects or the entire stream Yes
Stream my_stream was created

Information for Stream my_stream created 2024-06-07 12:29:36

              Subjects: foo
              Replicas: 1
               Storage: File

Options:

             Retention: Limits
       Acknowledgments: true
        Discard Policy: Old
      Duplicate Window: 2m0s
            Direct Get: true
     Allows Msg Delete: true
          Allows Purge: true
        Allows Rollups: false

Limits:

      Maximum Messages: unlimited
   Maximum Per Subject: unlimited
         Maximum Bytes: unlimited
           Maximum Age: unlimited
  Maximum Message Size: unlimited
     Maximum Consumers: unlimited

State:

              Messages: 0
                 Bytes: 0 B
        First Sequence: 0
         Last Sequence: 0
      Active Consumers: 0
```

你可以通过以下命令查看刚刚创建的流的信息：

```shell
nats stream info my_stream
```
```text
Information for Stream my_stream created 2024-06-07 12:29:36

              Subjects: foo
              Replicas: 1
               Storage: File

Options:

             Retention: Limits
       Acknowledgments: true
        Discard Policy: Old
      Duplicate Window: 2m0s
            Direct Get: true
     Allows Msg Delete: true
          Allows Purge: true
        Allows Rollups: false

Limits:

      Maximum Messages: unlimited
   Maximum Per Subject: unlimited
         Maximum Bytes: unlimited
           Maximum Age: unlimited
  Maximum Message Size: unlimited
     Maximum Consumers: unlimited

State:

              Messages: 0
                 Bytes: 0 B
        First Sequence: 0
         Last Sequence: 0
      Active Consumers: 0
```

## 2. 向流中发布一些消息

现在我们开始发布消息。运行以下命令：

```shell
nats pub foo --count=1000 --sleep 1s "publication #{{.Count}} @ {{.TimeStamp}}"
```

当消息被发布到主题 "foo" 时，它们不仅会被发布，也会被流捕获并存储。你可以通过 `nats stream info my_stream` 查看这些消息，甚至可以通过 `nats stream view my_stream` 或 `nats stream get my_stream` 查看流中的具体消息。

## 3. 创建消费者

此时，如果你创建一个非流式（即传统的 Core NATS）订阅者来监听主题 "foo" 上的消息，你只会收到订阅者启动后发布的消息。这是 Core NATS 消息传递的正常行为。为了接收流中所有消息的“回放”（包括过去发布的消息），我们现在将创建一个消费者。

我们可以使用 `nats consumer add <Consumer name>` 命令来创建一个消费者。在本示例中，我们将消费者命名为 "pull_consumer"，并将投递主题留空（即直接按回车键），因为我们正在创建一个“拉取消费者”，并选择 `all` 作为起始策略。然后你可以使用默认设置，对所有其他提示按回车键。消费者应创建在我们之前创建的流 "my_stream" 上。

```shell
nats consumer add
```
```text
? Consumer name pull_consumer
? Delivery target (empty for Pull Consumers) 
? Start policy (all, new, last, subject, 1h, msg sequence) all
? Acknowledgment policy explicit
? Replay policy instant
? Filter Stream by subjects (blank for all) 
? Maximum Allowed Deliveries -1
? Maximum Acknowledgments Pending 0
? Deliver headers only without bodies No
? Add a Retry Backoff Policy No
? Select a Stream my_stream
Information for Consumer my_stream > pull_consumer created 2024-06-07T12:32:09-05:00

Configuration:

                    Name: pull_consumer
               Pull Mode: true
          Deliver Policy: All
              Ack Policy: Explicit
                Ack Wait: 30.00s
           Replay Policy: Instant
         Max Ack Pending: 1,000
       Max Waiting Pulls: 512

State:

  Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
    Acknowledgment Floor: Consumer sequence: 0 Stream sequence: 0
        Outstanding Acks: 0 out of maximum 1,000
    Redelivered Messages: 0
    Unprocessed Messages: 74
           Waiting Pulls: 0 of maximum 512
```

你可以随时使用 `nats consumer info` 查看任何消费者的状况，或者使用 `nats stream view my_stream` 或 `nats stream get my_stream` 查看流中的消息，甚至可以使用 `nats stream rmm` 从流中删除单个消息。

## 4. 订阅消费者

现在消费者已经创建，由于流中已有消息，我们可以开始订阅消费者：

```shell
nats consumer next my_stream pull_consumer --count 1000
```

这将打印出流中的所有消息，从第一条消息（即过去发布的消息）开始，直到达到指定的消息数量为止。

注意，在本示例中，我们创建了一个具有“持久化”名称的拉取消费者，这意味着该消费者可以被多个消费进程共享。例如，你可以启动两个 `nats consumer` 实例，每个实例的计数为 500 条消息，而不是只运行一个 `nats consumer next` 并设置计数为 1000 条消息。在这种情况下，你会看到消息被这两个 `nats consumer` 实例分配着消费。

#### 再次回放消息

一旦你通过消费者遍历了流中的所有消息，你可以通过简单地创建一个新的消费者或删除现有消费者（`nats consumer rm`）并重新创建它（`nats consumer add`）再次获取这些消息。

## 5. 清理

你可以使用 `nats stream purge` 清理流并释放与之关联的资源（例如流中存储的消息）。

你也可以使用 `nats stream rm` 删除流，这将自动删除该流上定义的所有消费者。