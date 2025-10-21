# nats bench

NATS 速度快、重量轻，并将性能作为优先事项。`nats` CLI 工具功能众多，其中之一是可用于运行基准测试和衡量你的目标 NATS 服务基础设施的性能。在本教程中，你将学习如何在你自己的系统和环境中对 NATS 进行基准测试和调优。

## 先决条件

*   [安装 NATS CLI 工具](./)
*   [安装 NATS 服务器](../../../running-a-nats-service/installation.md)

## 启用监控功能后启动 NATS 服务器

```bash
nats-server -m 8222 -js
```

验证 NATS 服务器是否成功启动，以及 HTTP 监控器是否正常：

```
[89075] 2021/10/05 23:26:35.342816 [INF] Starting nats-server
[89075] 2021/10/05 23:26:35.342971 [INF]   Version:  2.6.1
[89075] 2021/10/05 23:26:35.342974 [INF]   Git:      [not set]
[89075] 2021/10/05 23:26:35.342976 [INF]   Name:     NDUYLGUUNSD53IUR77SQE2XK4PRCDJNPTICAGMGTAYAFN22KNL2GLJ23
[89075] 2021/10/05 23:26:35.342979 [INF]   Node:     ESalpH2B
[89075] 2021/10/05 23:26:35.342981 [INF]   ID:       NDUYLGUUNSD53IUR77SQE2XK4PRCDJNPTICAGMGTAYAFN22KNL2GLJ23
[89075] 2021/10/05 23:26:35.343583 [INF] Starting JetStream
[89075] 2021/10/05 23:26:35.343946 [INF]     _ ___ _____ ___ _____ ___ ___   _   __  __
[89075] 2021/10/05 23:26:35.343955 [INF]  _ | | __|_   _/ __|_   _| _ \ __| /_\ |  \/  |
[89075] 2021/10/05 23:26:35.343957 [INF] | || | _|  | | __ \ | | |   / _| / _ \| |\/| |
[89075] 2021/10/05 23:26:35.343959 [INF]  __/|___| |_| |___/ |_| |_|____/_/ __|  |_|
[89075] 2021/10/05 23:26:35.343960 [INF]
[89075] 2021/10/05 23:26:35.343962 [INF]          https://docs.nats.io/jetstream
[89075] 2021/10/05 23:26:35.343964 [INF]
[89075] 2021/10/05 23:26:35.343967 [INF] ---------------- JETSTREAM ----------------
[89075] 2021/10/05 23:26:35.343970 [INF]   Max Memory:      48.00 GB
[89075] 2021/10/05 23:26:35.343973 [INF]   Max Storage:     581.03 GB
[89075] 2021/10/05 23:26:35.343974 [INF]   Store Directory: "/var/folders/1b/wb_d92cd6cl_fshyy5qy2tlc0000gn/T/nats/jetstream"
[89075] 2021/10/05 23:26:35.343979 [INF] -------------------------------------------
```

## 运行发布者吞吐量测试

让我们运行一个测试，看看单个发布者向 NATS 服务器发布一百万条 16 字节消息的速度有多快。

```bash
nats bench foo --pub 1 --size 16
```

输出结果会告诉你客户端每秒能够发布的消息数量和有效载荷字节数：

```
23:33:51 Starting pub/sub benchmark [msgs=100,000, msgsize=16 B, pubs=1, subs=0, js=false]
23:33:51 Starting publisher, publishing 100,000 messages
Finished      0s [======================================================================================================================================================] 100%

Pub stats: 5,173,828 msgs/sec ~ 78.95 MB/sec
```

现在增加发布的消息数量：

```bash
nats bench foo --pub 1 --size 16 --msgs 10000000
```

```
23:34:29 Starting pub/sub benchmark [msgs=10,000,000, msgsize=16 B, pubs=1, subs=0, js=false]
23:34:29 Starting publisher, publishing 10,000,000 messages
Finished      2s [======================================================================================================================================================] 100%

Pub stats: 4,919,947 msgs/sec ~ 75.07 MB/sec
```

## 运行 发布/订阅 吞吐量测试

当同时使用发布者和订阅者时，`nats bench` 会报告聚合的以及单独的发布和订阅吞吐量性能。

让我们看看单个发布者和单个订阅者的吞吐量：

```bash
nats bench foo --pub 1 --sub 1 --size 16
```

请注意，输出显示了聚合吞吐量以及单独的发布者和订阅者性能：

```
23:36:00 Starting pub/sub benchmark [msgs=100,000, msgsize=16 B, pubs=1, subs=1, js=false]
23:36:00 Starting subscriber, expecting 100,000 messages
23:36:00 Starting publisher, publishing 100,000 messages
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%

NATS Pub/Sub stats: 5,894,441 msgs/sec ~ 89.94 MB/sec
 Pub stats: 3,517,660 msgs/sec ~ 53.68 MB/sec
 Sub stats: 2,957,796 msgs/sec ~ 45.13 MB/sec
```

## 运行 1:N 吞吐量测试

当指定多个发布者或多个订阅者时，`nats bench` 还会报告每个发布者和订阅者的单独统计数据，以及最小值/最大值/平均值和标准差。

让我们增加消息数量和订阅者数量：

```bash
nats bench foo --pub 1 --sub 5 --size 16 --msgs 1000000
```

```
23:38:08 Starting pub/sub benchmark [msgs=1,000,000, msgsize=16 B, pubs=1, subs=5, js=false]
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting publisher, publishing 1,000,000 messages
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%

NATS Pub/Sub stats: 7,123,965 msgs/sec ~ 108.70 MB/sec
 Pub stats: 1,188,419 msgs/sec ~ 18.13 MB/sec
 Sub stats: 5,937,525 msgs/sec ~ 90.60 MB/sec
  [1] 1,187,633 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [2] 1,187,597 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [3] 1,187,526 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [4] 1,187,528 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [5] 1,187,505 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  min 1,187,505 | avg 1,187,557 | max 1,187,633 | stddev 48 msgs
```

## 运行 N:M 吞吐量测试

当指定超过 1 个发布者时，`nats bench` 会将总消息数（`-msgs`）平均分配给发布者数量（`-pub`）。

现在让我们增加发布者数量并检查输出：

```bash
nats bench foo --pub 5 --sub 5 --size 16 --msgs 1000000
```

```
23:39:28 Starting pub/sub benchmark [msgs=1,000,000, msgsize=16 B, pubs=5, subs=5, js=false]
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%

NATS Pub/Sub stats: 7,019,849 msgs/sec ~ 107.11 MB/sec
 Pub stats: 1,172,667 msgs/sec ~ 17.89 MB/sec
  [1] 236,240 msgs/sec ~ 3.60 MB/sec (200000 msgs)
  [2] 236,168 msgs/sec ~ 3.60 MB/sec (200000 msgs)
  [3] 235,541 msgs/sec ~ 3.59 MB/sec (200000 msgs)
  [4] 234,911 msgs/sec ~ 3.58 MB/sec (200000 msgs)
  [5] 235,545 msgs/sec ~ 3.59 MB/sec (200000 msgs)
  min 234,911 | avg 235,681 | max 236,240 | stddev 485 msgs
 Sub stats: 5,851,064 msgs/sec ~ 89.28 MB/sec
  [1] 1,171,181 msgs/sec ~ 17.87 MB/sec (1000000 msgs)
  [2] 1,171,169 msgs/sec ~ 17.87 MB/sec (1000000 msgs)
  [3] 1,170,867 msgs/sec ~ 17.87 MB/sec (1000000 msgs)
  [4] 1,170,641 msgs/sec ~ 17.86 MB/sec (1000000 msgs)
  [5] 1,170,250 msgs/sec ~ 17.86 MB/sec (1000000 msgs)
  min 1,170,250 | avg 1,170,821 | max 1,171,181 | stddev 349 msgs
```

## 运行 微服务 延迟测试

在一个 shell 中，以"服务模式"启动 nats bench 并让其运行

```bash
nats bench service serve foo --clients=1
```

在另一个 shell 中发送一些请求

```bash
nats bench service request foo --clients=1 --msgs=10000
```

```
23:29:05 Starting Core NATS service requester benchmark [clients=1, msg-size=128 B, msgs=10,000, sleep=0s, subject=foo]
23:29:05 [1] Starting Core NATS service requester, requesting 10,000 messages
Finished      0s [==================================================================================================================] 100%

NATS Core NATS service requester stats: 11,016 msgs/sec ~ 1.3 MiB/sec ~ 90.78us
```

在这种情况下，两个 `nats bench` 进程之间通过 NATS 进行请求-回复的平均延迟是 1/11016 秒（90.78 微秒）。

你现在可以按 control-c 来终止那个 `nats bench service serve` 进程。

注意：默认情况下，处于 "服务模式" 的 `nats bench` 订阅者会加入一个队列组，因此你可以使用 `nats bench` 来模拟一堆负载均衡的服务器进程。

## 运行 JetStream 基准测试

### 测量 JetStream 发布性能

首先，让我们将一些消息发布到一个流中，`nats bench` 将使用默认属性自动创建一个名为 `benchstream` 的流。

```bash
nats bench bar --js --pub 1 --size 16 --msgs 1000000
```

```
00:00:10 Starting JetStream benchmark [msgs=1,000,000, msgsize=16 B, pubs=1, subs=0, js=true, stream=benchstream  storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, pullbatch=100, maxackpending=-1, replicas=1, purge=false]
00:00:10 Starting publisher, publishing 1,000,000 messages
Finished      3s [======================================================================================================================================================] 100%

Pub stats: 272,497 msgs/sec ~ 4.16 MB/sec
```

### 测量 JetStream 消费（回放）性能

我们现在可以测量从流中存储的消息回放到消费者的速度

```bash
nats bench bar --js --sub 1 --msgs 1000000
```

```
00:05:04 JetStream ordered push consumer mode: subscribers will not acknowledge the consumption of messages
00:05:04 Starting JetStream benchmark [msgs=1,000,000, msgsize=128 B, pubs=0, subs=1, js=true, stream=benchstream  storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, pullbatch=100, maxackpending=-1, replicas=1, purge=false]
00:05:04 Starting subscriber, expecting 1,000,000 messages
Finished      1s [======================================================================================================================================================] 100%

Sub stats: 777,480 msgs/sec ~ 94.91 MB/sec
```

#### 推送和拉取消费者

默认情况下，`nats bench --js` 订阅者使用"有序推送型"消费者，它们是有序、可靠且流量可控的，但不会"确认"消息，这意味着订阅者从流中接收到每条消息后 _不会_ 向服务器发送确认。有序推送型消费者是单个应用程序实例获取流中所有（或部分）数据副本的首选方式。但是，你也可以对"拉取型消费者"进行基准测试，这是在水平扩展流中消息的处理（或消费）时的首选方式，订阅者 _确实_ 确认每条消息的处理，但可以利用批处理来提高处理吞吐量。

### 尝试调整各种参数

不要害怕测试不同的 JetStream 存储和复制选项（假设你可以访问启用了 JetStream 的服务器集群，如果你想超越 `--replicas 1` 的话），当然还有发布/订阅线程的数量以及发布或拉取订阅的批处理大小。

注意：如果你在两次运行之间更改了流的属性，你将不得不删除该流（例如运行 `nats stream rm benchstream`）

### 不留痕迹：完成后清理资源

完成流的基准测试后，请记住，如果你在流中存储了大量消息（这非常容易且快速），你的流可能会在 nats-server 基础设施上占用一定量的资源（即内存和文件），你可能需要回收这些资源。

你可以使用 `--purge` bench 命令标志指示 `nats` 在开始基准测试之前清除流中的消息，或者使用 `nats stream purge benchstream` 手动清除流，或者直接使用 `nats stream rm benchstream` 将其完全删除。