# 示例

考虑以下架构

![订单](<../../.gitbook/assets/streams-and-consumers-75p (1).png>)

尽管这是一个不完整的架构，但它展示了几个关键点：

* 多个相关主题被存放在一个流（Stream）中
* 消费者可以有不同的操作模式，并且可以仅接收消息的子集
* 支持多种确认（ACK）模式

当新订单到达 `ORDERS.received` 时，它会被发送到 `NEW` 消费者，如果成功处理，则会在 `ORDERS.processed` 上创建一条新消息。这条 `ORDERS.processed` 消息再次进入流，由一个 `DISPATCH` 消费者接收并进行处理，处理完成后会创建一条 `ORDERS.completed` 消息，该消息也会再次进入流。这些操作都是基于拉取（pull）的方式，意味着它们是工作队列，可以水平扩展。所有操作都需要确认交付，以确保没有订单被遗漏。

所有消息都会被推送到一个 `MONITOR` 消费者，但不会进行任何确认，并且使用发布/订阅（Pub/Sub）语义——它们会被推送到监控系统。

当消息被 `NEW` 和 `DISPATCH` 消费者确认后，其中的一部分会被采样，同时包含重新投递次数、确认延迟等信息的消息会被发送到监控系统。

## 示例配置

[更多文档](/running-a-nats-service/configuration/clustering/jetstream_clustering/administration.md)中介绍了 `nats` 工具以及如何使用它来创建、监控和管理流与消费者，但为了完整性和参考，以下是创建 ORDERS 场景的方法。我们将为与订单相关的消息配置 1 年的保留时间：

```bash
nats stream add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard=old
nats consumer add ORDERS NEW --filter ORDERS.received --ack explicit --pull --deliver all --max-deliver=-1 --sample 100
nats consumer add ORDERS DISPATCH --filter ORDERS.processed --ack explicit --pull --deliver all --max-deliver=-1 --sample 100
nats consumer add ORDERS MONITOR --filter '' --ack none --target monitor.ORDERS --deliver last --replay instant
```
