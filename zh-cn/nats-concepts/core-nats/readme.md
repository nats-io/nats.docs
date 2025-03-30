# Core NATS

所谓的 "Core NATS" 指的是由 NATS 服务基础设施提供的功能与服务质量保证(QoS)的基本集合，并且其中没有任何被配置为启用了 JetStream 的 `nats-server` 实例。

"Core NATS" 提供了基于主题寻址(subject-based-addressing)与队列的发布/订阅功能, 以及“最多一次消费”的服务质量保证。
