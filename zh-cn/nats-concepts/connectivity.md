# NATS 连接性

NATS 支持以下直接连接到 NATS 服务器的多种方式。

* 普通 NATS 连接
* TLS 加密的 NATS 连接
* [WebSocket](https://github.com/nats-io/nats.ws) NATS 连接
* [MQTT](/running-a-nats-service/configuration/mqtt/) 客户端连接

此外，还有一些适配器可用于在其他消息系统之间进行流量桥接：

* [Kafka 桥接](https://github.com/nats-io/nats-kafka)
* [JMS](https://github.com/nats-io/nats-jms-bridge)，也可用于桥接 MQ 和 RabbitMQ，因为它们都提供 JMS 接口