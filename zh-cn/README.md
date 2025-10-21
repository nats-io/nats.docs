# 欢迎

## 官方 [NATS](https://nats.io/) 文档

NATS 是一个简单、安全且高性能的开源数据层，专为云原生应用、物联网消息传递和微服务架构而设计。

我们相信它应该成为您服务之间通信的骨干。无论您使用何种语言、协议或平台，NATS 都是连接您服务的最佳方式。

### 10,000 英尺俯瞰视角

* 每秒发布和订阅数百万条消息。最多一次交付。
* 支持扇入/扇出交付模式
* 请求/回复
* 支持所有主流编程语言
* 通过 JetStream 实现持久化
  * 至少一次交付或**精确一次**交付
  * 工作队列
  * 流处理
  * 数据复制
  * 数据保留
  * 数据去重
  * 更高级别的数据结构
    * 带观察者、版本控制和 TTL 的键值存储
    * 带版本控制的对象存储
* 安全性
  * TLS
  * 基于 JWT 的零信任安全
* 集群
  * 高可用性
  * 容错
  * 自动发现
* 支持的协议
  * TCP
  * MQTT
  * WebSockets

所有这些功能都集成于单一二进制文件中，部署管理简便。无需外部依赖，只需将其放入并添加一个配置文件以指向其他 NATS 服务器，即可开始使用。事实上，您甚至可以将 NATS 嵌入您的应用程序中（适用于 Go 用户）！

## 导览之旅

1. 一般来说，我们建议您首先尝试使用 [Core NATS](nats-concepts/core-nats/) 解决您的问题。
2. 如果您需要在服务之间共享状态，请查看 JetStream 中的 [KV](nats-concepts/jetstream/key-value-store/) 或 [对象存储](nats-concepts/jetstream/object-store/obj_store.md)。
3. 当您需要更底层的持久化流访问时，可直接使用 [JetStream](nats-concepts/jetstream/) 来实现更高级的消息传递模式。
4. 了解 [部署策略](nats-concepts/adaptive_edge_deployment.md)
5. 使用 [零信任安全](running-a-nats-service/configuration/securing_nats/jwt/) 保护您的部署。

## 贡献

NATS 是开源的，本文档也是开源的。如果您对这些文档有任何更新和/或建议，请[让我们知道](mailto:info@nats.io)。您也可以通过每页上的“在 GitHub 上编辑”链接创建 Pull Request。

## 其他问题？

欢迎随时在 Slack [slack.nats.io](https://slack.nats.io) 上与我们交流。

NATS 维护团队全体成员衷心感谢您对 NATS 的关注！
