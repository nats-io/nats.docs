# 使用 JetStream 进行开发

## 决定是否使用流式传输和更高服务质量

在现代系统中，应用程序可以提供服务或生成并消费数据流。发布-订阅消息传递模型的一个基本方面是时间上的耦合：订阅者需要处于运行状态才能在消息发布时接收它。从高层次来看，如果需要可观测性、应用程序需要在未来消费消息、需要以自己的节奏消费消息，或者需要所有消息，则 JetStream 的流式传输功能可为发布者和消费者之间提供时间上的解耦。

使用流式传输及其相关的更高服务质量，在计算和存储方面存在最高的成本。

### 何时使用流式传输

流式传输适用于以下情况：

* 数据生产者和消费者高度解耦。它们可能在不同时间上线，且消费者必须接收消息。

* 需要保留流中数据的历史记录。这是指消费者需要重放数据的情况。

* 初始化时需要流中的最后一条消息，而生产者可能处于离线状态。

* 无法得知关于消费者的先验知识，但有消费者需要接收消息。（通常这是一个错误的假设）

* 发出的消息中数据的生命周期 超出了 预期的应用程序生命周期。

* 应用程序需要以自己的节奏消费数据。

* 您希望在流的发布者和消费者之间实现解耦的流量控制。

* 您需要“精确一次” QoS，包括发布时去重和带双重 ACK 的消费。

请注意，永远不应假设未来谁将接收并处理数据，或出于何种目的。

### 何时使用 Core NATS

使用 core NATS 是作为可扩展服务的快速请求路径的理想选择，特别是在可以容忍消息丢失的情况下，或者当应用程序本身负责消息交付保证时。

这些情况包括：

* 服务模式中存在紧密耦合的 请求-回复
    * 发出请求后，应用程序本身会处理超时的错误情况（重新发送、显示错误等等）。__依赖于消息系统在此处重新发送被视为一个反模式。__
* 只有最后收到的消息才重要，并且新消息接收频率足够高，以至于应用程序可以容忍消息丢失。这可能是股票行情流、服务控制平面中频繁交换的消息 或 设备遥测。

* 消息 TTL 较低，即传输的数据价值迅速降低或过期。

* 已经知道消息的预期消费者集合，并且预计消费者将处于活动状态。请求-回复 模式在此处效果良好，或者消费者可以发送应用程序层面的 ACK。

* 控制平面上的消息。

## JetStream 功能概述

### 流
  * 您可以使用“Add Stream” 来幂等定义流及其属性（即源主题、保留策略和存储策略、限制）。
  * 您可以使用“Purge”来清空流中的消息。
  * 您可以使用“Delete”来删除流。

### 向流发布消息
在Core NATS 和 JetStream 之间存在互操作性，因为事实上，流正在监听 Core NATS 消息。*然而*，您会注意到 NATS 客户端库的 JetStream 调用中包含一些“Publish”调用，因此您可能想知道 “Core NATS Publish” 与 “JetStream Publish” 之间的区别。

嗯，是的，当一个 “Core NATS” 应用程序向流的主题发布消息时，该消息的确会被存储在流中，但把消息存储在流中并非真正的目的，因为您发布消息时使用的是 Core NATS 提供的较低质量的服务。
因此，虽然直接使用 Core NATS  publish 调用来向流发布消息肯定可行，但应将其视为一种便利措施，帮助您轻松地将应用程序迁移到使用流式传输，而不是作为最终目标或理想设计。

相反，应用程序更适合使用 JetStream publish 调用（未使用 Streams 的 Core NATS 订阅者仍然会像任何其他发布一样接收）来向流发布消息，因为：

* JetStream publish 调用会由启用 JetStream 的服务器确认（ACK 机制），从而解锁了以下更高质量的服务：
    * 如果发布者从服务器收到确认，就可以安全地丢弃该发布的任何状态，因为消息不仅已被服务器正确接收，而且也已成功持久化。
    * 无论您使用同步还是异步的 JetStream publish 调用，发布者和 JetStream 基础设施之间都存在隐含的流量控制。
    * JetStream 发布应用程序可以在消息的标头字段中插入唯一的发布 ID，从而实现“恰好一次”的服务质量。

#### 参考
* [Java 中的同步和异步 JetStream 发布](https://nats.io/blog/sync-async-publish-java-client/#synchronous-and-asynchronous-publishing-with-the-nats-java-library)

### 创建消费者

[消费者](../../nats-concepts/jetstream/consumers.md) 是流的“视图”，有自己的游标。它们是客户端应用从流中获取消息（即“重播”）进行处理或消费的方式。它们可以根据 “filtering subject” 筛选流中的消息，并根据“replay policy”选项定义流中哪些部分被重播。

您可以创建 *推送型* 或 *拉取型* 消费者：
* *推送型* 消费者（特别是有序推送型消费者）是应用程序接收流中所选消息的完整副本的最佳方式。
* *拉取型* 消费者是使用共享同一个拉取型消费者的多个客户端应用来水平扩容流中所选消息的处理（或消费）的最佳方式，而且还允许批量处理消息。

消费者可以是临时的或持久的，并支持不同的 ACK策略：无 ACK、针对此序列号的 ACK、针对此序列号及之前全部序列号的 ACK。

#### 重播策略

您选择希望将流中哪些消息传递给您的消费者：
* 所有消息
* 从某个序列号开始
* 从某个时间点开始
* 最后一条消息
* 流中全部主题的最后一条或多条消息

并且您可以选择重播速度为 即时（越快越好） 或 与消息本身一开始被发布到流中的速率相匹配的速率。

### 从消费者订阅

客户端应用使用 JetStream 的 Subscribe、QueueSubscribe 或 PullSubscribe（以及变体）函数调用来从消费者 “订阅”。请注意，自 JetStream 初始发布以来，客户端库的开发者们已经开发了一种更符合人体工程学的 API 来使用 [消费者](https://github.com/nats-io/nats.go/blob/main/jetstream/README.md#consumers) 处理消息。

#### 消息的 ACK 机制
某些消费者要求在客户端应用代码层面确认消息的 被处理/被消费，但确认（或不确认）消息的方式不止一种。

* `Ack`：确认消息已完全处理。
* `Nak`：表示消息现在不会被处理，处理流程可移至下一条消息，被客户端确认为 NAK 的消息将会被重新尝试投递。
* `InProgress`：在 `AckWait` 超时期限内发送此信号，表明处理工作仍在进行中，应将超时期限再延长一个等同于 `AckWait` 的时长。
* `Term`：指示服务器停止重新投递该消息，而不确认其已成功处理。

#### 参考
* Java
  * [JetStream Java tutorial](https://nats.io/blog/hello-world-java-client/)
  * [JetStream stream creation in Java](https://nats.io/blog/jetstream-java-client-01-stream-create/)
  * [JetStream publishing in Java](https://nats.io/blog/jetstream-java-client-02-publish/)
  * [Consumers in Java](https://nats.io/blog/jetstream-java-client-03-consume/)
  * [Push consumers in Java](https://nats.io/blog/jetstream-java-client-04-push-subscribe/#jetstream-push-consumers-with-the-natsio-java-library)
  * [Pull consumers in Java](https://nats.io/blog/jetstream-java-client-05-pull-subscribe/#jetstream-pull-consumers-with-the-natsio-java-library)