### 常见问题

### 通用问题

  * [NATS 是什么？](faq.md#NATS-是什么)
  * [NATS 是用什么语言编写的？](faq.md#NATS-是用什么语言编写的)
  * [谁在维护 NATS？](faq.md#谁在维护-NATS)
  * [NATS 支持哪些客户端？](faq.md#NATS-支持哪些客户端)
  * [NATS 这个缩写代表什么？](faq.md#NATS-这个缩写代表什么)
  * [JetStream 和 NATS Streaming 有什么关系？](faq.md#JetStream-和-NATS-Streaming-有什么关系)

### 技术问题

  * [Request() 和 Publish() 有什么区别？](faq.md#Request-和-Publish-有什么区别)
  * [多个订阅者可以接收一个 Request 吗？](faq.md#多个订阅者可以接收一个-Request-吗)
  * [如何监控我的 NATS 集群？](faq.md#如何监控我的-NATS-集群)
  * [NATS 支持队列吗？NATS 支持负载均衡吗？](faq.md#NATS-支持队列吗-NATS-支持负载均衡吗)
  * [我可以列出 NATS 集群中存在的所有主题吗？](faq.md#我可以列出-NATS-集群中存在的所有主题吗)
  * [NATS 主题支持通配符吗？](faq.md#NATS-主题支持通配符吗)
  * [应该使用哪种类型的流消费者（Stream consumer）？](faq.md#应该使用哪种类型的流消费者)
  * [使用 CONNECT 时，‘verbose’ 和 ‘pedantic’ 是什么意思？](faq.md#使用-CONNECT-时-verbose-和-pedantic-是什么意思)
  * [NATS 对消息顺序有任何保证吗？](faq.md#NATS-对消息顺序有任何保证吗)
  * [NATS 有消息大小限制吗？](faq.md#NATS-有消息大小限制吗)
  * [NATS 对主题数量有限制吗？](faq.md#NATS-对主题数量有限制吗)
  * [NATS 保证消息送达吗？](faq.md#NATS-保证消息送达吗)
  * [NATS 支持重放/重传历史数据吗？](faq.md#NATS-支持重放重传历史数据吗)
  * [如何优雅地关闭一个异步订阅者？](faq.md#如何优雅地关闭一个异步订阅者)
  * [如何创建主题？](faq.md#如何创建主题)
  * [可以同时连接多少个客户端？](faq.md#可以同时连接多少个客户端)

## 通用问题

### NATS 是什么？

NATS 是一个开源、轻量级、高性能的云原生基础设施消息系统。它实现了一个高度可扩展且优雅的发布-订阅（pub/sub）分发模型。NATS 的高性能特性使其成为构建现代化、可靠、可扩展的云原生分布式系统的理想基础。

NATS 在一个名为 "NATS Server"（在本站中常被称为 `nats-server`）的二进制文件中提供了两个可互操作的模块：

  * '**Core NATS**' 是 NATS 的核心功能集和服务质量。
  * ['**JetStream**'](../using-nats/jetstream/develop_jetstream.md) 是一个（可选启用的）内置持久化层，它为 Core NATS 增加了流式处理、至少一次和恰好一次送达保证、历史数据重放、解耦的流控以及键值存储等功能。

NATS 由 Derek Collison 创建，他在设计、构建和使用发布-订阅消息系统方面拥有超过 25 年的经验。NATS 由一个卓越的开源生态系统维护，更多信息请访问 [GitHub](https://www.github.com/nats-io)。

### NATS 这个缩写代表什么？

NATS 代表神经自主传输系统（Neural Autonomic Transport System）。Derek Collison 将 NATS 构想为一个像中枢神经系统一样工作的消息平台。

### JetStream 和 NATS Streaming 有什么关系？

从 NATS Server 2.2 版本开始，NATS [JetStream](../using-nats/jetstream/develop_jetstream.md) 是实现持久化、流式处理和更高消息保障的推荐选项。[NATS Streaming](https://github.com/nats-io/nats-streaming-server)（也称为 'STAN'）现已弃用。

### NATS 是用什么语言编写的？

NATS 服务器（`nats-server`）是用 Go 语言编写的。同时，它为多种语言提供了客户端支持。更多信息请参阅[使用 NATS 开发](../using-nats/developing-with-nats/developer.md)页面。

### 谁在维护 NATS？

NATS 由一组精选的维护者根据[云原生计算基金会（CNCF）](http://cncf.io)的治理流程进行维护。[Synadia](https://www.synadia.com?utm_source=nats_docs&utm_medium=nats) 的工程师团队与社区维护者一起，共同维护 NATS 服务器、NATS Streaming 服务器，以及官方的 Go、Ruby、Node.js、C、C#、Java 和其他几个客户端库。我们非常活跃的用户社区也贡献了其他多种语言的客户端库和连接器。请参阅[下载](https://nats.io/download)页面获取完整列表，以及相关源代码仓库和文档的链接。

### NATS 支持哪些客户端？

关于 Synadia 和社区维护的 NATS 客户端的最新列表，请参阅[使用 NATS 开发](../using-nats/developing-with-nats/developer.md)页面。

## 技术问题

### Request() 和 Publish() 有什么区别？

`Publish()` 向 `nats-server` 发送一条消息，并以一个主题作为其地址。`nats-server` 会将该消息投递给所有订阅了该主题的感兴趣/符合条件的订阅者。作为可选项，你也可以在消息中附带一个回复主题，这样接收到你消息的订阅者就可以通过它向你回传消息。

`Request()` 只是一个方便的 API，它以一种伪同步的方式为你完成了上述操作，并使用你提供的一个超时时间。它会创建一个 INBOX（一种对请求者来说唯一的特殊主题），订阅这个 INBOX，然后发布你的请求消息，并将回复地址设置为这个 INBOX 主题。接着，它会等待响应，或者直到超时时间结束，以先到者为准。

### 多个订阅者可以接收一个 Request 吗？

可以。NATS 是一个发布-订阅系统，同时也为每个订阅者提供了分布式队列功能。当你发布一条消息（例如，在请求的开始），每个订阅者都会收到这条消息。如果这些订阅者组成了一个队列组（queue group），那么只有一个订阅者会被随机选中来接收这条消息。但是请注意，请求者并不知道也不控制这些信息。请求者所控制的是，它只想要一个对该请求的答复，而 NATS 通过主动修剪兴趣图（interest graph）来很好地处理了这一点。

### 如何监控我的 NATS 集群？

NATS 可以部署一个 HTTP(s) 监控端口——可以参考这里的演示服务器：[https://demo.nats.io:8222/](https://demo.nats.io:8222/)。此外，还有其他几个可用的选项，其中一些来自活跃的 NATS 社区：

  * [Prometheus NATS Exporter](https://github.com/nats-io/prometheus-nats-exporter) 使用 Prometheus 配置指标，并用 Grafana 创建可视化仪表盘。
  * [nats-top](https://github.com/nats-io/nats-top) 一个由 Synadia 公司成员 Wally Quevedo 开发的类似 `top` 命令的监控工具。
  * [natsboard](https://github.com/cmfatih/natsboard) 一个由 Fatih Cetinkaya 开发的监控工具。
  * [nats-mon](https://github.com/repejota/nats-mon) 一个由 Raül Pérez 和 Adrià Cidre 开发的监控工具。

关于监控的更详细概述，请参阅[NATS 服务器监控](../running-a-nats-service/configuration/monitoring.md)。

### NATS 支持队列吗？NATS 支持负载均衡吗？

“队列”这个词在不同上下文中有不同含义，所以我们必须谨慎使用。NATS 通过订阅者队列组（subscriber queue groups）实现了非持久化的分布式队列。订阅者队列组提供了一种消息分发负载均衡的形式。在 NATS 中，主题订阅可以是“独立”订阅，也可以是队列组订阅。是否加入队列组是在创建订阅时通过提供一个可选的队列组名称来决定的。对于独立的主题订阅者，`nats-server` 会尝试将发布到该主题的**每一条**消息的副本都投递给**每一个**符合条件的订阅者。而对于队列组中的订阅者，`nats-server` 会尝试将每一条后续消息准确地投递给组内**随机选择的一个**订阅者。

这种形式的分布式队列是实时进行的，消息不会被持久化到二级存储。此外，分发是基于兴趣图（即订阅关系）的，所以它不是一个由发布者控制的操作，而是完全由 `nats-server` 控制的。

### 我可以列出 NATS 集群中存在的所有主题吗？

NATS 实时维护并不断更新兴趣图（即主题及其订阅者）。不要把它想象成一个随时间聚合的“目录”。兴趣图是动态的，会随着发布者和订阅者的加入和离开而不断变化。

如果你执意要收集这些信息，可以在任何时刻通过轮询监控端点的 `/connz` 和 `/routez` 接口间接获取。更多信息请参阅[服务器监控](../running-a-nats-service/configuration/monitoring.md)。

### NATS 主题支持通配符吗？

是的。有效的通配符如下：

点号 `.` 是 token 分隔符。

星号 `*` 是单个 token 的通配符匹配。

```
例如，foo.* 匹配 foo.bar、foo.baz，但不匹配 foo.bar.baz。
```

大于号 `>` 是完整的通配符匹配，可以匹配多个 token。

```
例如，foo.> 匹配 foo.bar、foo.baz、foo.bar.baz、foo.bar.1 等。
```

### 应该使用哪种类型的流消费者（Stream consumer）？

这取决于使用流的应用的访问模式：如果你想横向扩展对流中所有消息的处理，和/或使用批处理方式实时处理高吞吐量的消息流，那么应该使用共享的拉取型消费者（shared pull consumer），因为它们可以很好地横向扩展，并且批处理是实现高吞-吐量的关键。但如果访问模式更像是单个应用实例需要按需独立地重放流中的消息，那么“有序推送型消费者”（ordered push consumer）是最佳选择。如果你希望对插入流中的消息进行可扩展的低延迟实时处理，可以考虑为客户端使用带有队列组的持久化推送型消费者（durable push consumer）。

### 使用 CONNECT 时，‘verbose’ 和 ‘pedantic’ 是什么意思？

‘**Verbose**’（详细模式）意味着所有的协议命令都会得到一个 `+OK` 或 `-ERR` 的确认。如果关闭了 verbose，你就不会收到每个命令的 `+OK`。‘**Pedantic**’（严格模式）意味着服务器会进行大量额外的检查，主要围绕主题格式是否正确等。对于新连接，Verbose 模式默认是开启的；大多数客户端实现在连接时的 INFO 握手过程中会默认禁用 verbose 模式。

### NATS 对消息顺序有任何保证吗？

NATS 为每个发布者实现了来源有序（source ordered）的投递。也就是说，来自**同一个发布者**的消息将按照它们最初发布的顺序投递给所有符合条件的订阅者。在**多个不同发布者之间**，则没有消息投递顺序的保证。

### NATS 有消息大小限制吗？

消息有最大尺寸限制（在服务器配置中通过 `max_payload` 设置），该限制由服务器强制执行，并在客户端连接建立时告知客户端。默认大小为 1 MB，但如果需要，可以增加到 64 MB（尽管我们建议将最大消息大小保持在一个更合理的值，如 8 MB）。

### NATS 对主题数量有限制吗？

没有。从 `nats-server` v0.8.0 开始，对主题的最大数量没有硬性限制。

### NATS 保证消息送达吗？

**Core NATS** 提供“**最多一次**”（at-most-once）的投递保证。这意味着消息保证完整、按序（从单个发布者来看）到达，但不能跨不同发布者保证顺序。NATS 会尽一切努力保持可用并提供服务。但是，如果一个订阅者出现问题或下线，它将不会收到消息，因为基本的 NATS 平台是一个简单的发布-订阅传输系统，只提供 TCP 级别的可靠性。

从 NATS Server 2.2 版本开始，**NATS JetStream** 提供了持久化，支持“**至少一次**”（at-least-once）和（在时间窗口内的）“**恰好一次**”（exactly-once）的投递保证。详细信息请参阅 [JetStream](../using-nats/jetstream/develop_jetstream.md) 文档。

### NATS 支持重放/重传历史数据吗？

NATS [JetStream](../using-nats/jetstream/develop_jetstream.md) 提供了按时间或序列号存储和重放消息的功能。

### 如何优雅地关闭一个异步订阅者？

要优雅地关闭一个异步订阅者，以便任何正在处理的 MsgHandlers 有机会完成其工作，请调用 `sub.Unsubscribe()`。每个订阅都有一个对应的 Go 协程。这些协程会在调用 `Unsubscribe()` 时或在连接断开时被清理。

### 如何创建主题？

主题是根据兴趣（即订阅）动态创建和修剪（删除）的。这意味着，直到有客户端订阅一个主题，该主题才在 NATS 集群中存在；而当最后一个订阅该主题的客户端取消订阅后，该主题就会消失。

### 可以同时连接多少个客户端？

单个服务器的默认设置是 65,536 个。尽管 NATS 支持的连接数没有明确的上限，但有一些环境因素会影响你决定允许每个服务器支持多少连接。

大多数系统无需任何更改即可处理每个服务器数千个 NATS 连接，但有些系统（如 OS X）的默认值非常低。你需要查看内核/操作系统设置来提高这个限制。你还需要关注默认的 TCP 缓冲区大小，以根据你的流量特性来优化机器性能。

如果你正在使用 TLS，你需要确保硬件能够处理 TLS 协商所产生的 CPU 负载，尤其是在发生服务中断或网络分区事件后出现大量客户端同时涌入连接（惊群效应）时。这个经常被忽视的因素通常是限制单个服务器应支持连接数的瓶颈。选择一个有 TLS 加速支持的加密套件（例如，在 x86 架构上的 AES）可以缓解这个问题。从整个系统的角度来看，你还需要考虑设置一系列的重连延迟时间或为 NATS 客户端添加重连抖动（jitter），以使连接尝试在时间上更均匀地分布，从而减少 CPU 峰值。

总而言之，每个服务器都可以通过调优来处理大量客户端。考虑到 NATS 通过集群、超级集群和叶子节点提供的灵活性和可扩展性，可以构建一个支持数百万连接的 NATS 部署。