# Core NATS

Core NATS 是 NATS 系统的基础功能层。它基于 基于主题（subject / topic）寻址的发布-订阅模型 运作。这种模型带来了两个显著优势：位置无关性和默认的多对多（M:N）通信模式。这些基本概念使得在微服务等常见开发模式中，能够实现强大且创新的解决方案，而无需额外依赖负载均衡器、API 网关或 DNS 配置等技术。

NATS 系统可以通过 [JetStream](../../nats-concepts/jetstream) 进行增强，后者增加了持久化能力。虽然 Core NATS 提供尽力而为、最多一次的消息传递方式，但 JetStream 则引入了至少一次和精确一次的语义。