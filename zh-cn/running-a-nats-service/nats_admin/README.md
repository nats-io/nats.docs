# 管理和监控您的 NATS 服务器基础设施

管理 NATS 服务器非常简单，典型的生命周期操作包括：

* 使用 [`nats`](../../using-nats/nats-tools/nats_cli/) CLI 工具检查服务器集群的连接性和延迟情况，获取账户信息，并管理流以及与流交互（以及其他 NATS 应用程序）。尝试以下示例以了解使用 `nats` 的最常见方式。
  * `nats cheat`
  * `nats cheat server`
  * `nats stream --help` 用于监控、管理以及和流交互
  * `nats consumer --help` 用于监控和管理流上的消费者
  * `nats context --help` 用于在服务器、集群或用户凭据之间切换
* 使用 [`nsc`](../../using-nats/nats-tools/nsc/) CLI 工具，在使用基于 JWT 的身份验证和授权时，创建、撤销操作员、账户和用户（即客户端应用）的 JWT 和密钥。
* 向服务器发送 [信号](signals.md) 以重新加载配置或轮换日志文件
* [升级](upgrading_cluster.md) 服务器（或集群）
* 了解 [慢速消费者](slow_consumers.md)
* 通过以下方式监控服务器：
  * 监控 [端点](monitoring/) 和工具（例如 [nats-top](../../using-nats/nats-tools/nats_top/)）
  * 订阅 [系统事件](../configuration/sys_accounts/)
* 使用 [Lame Duck 模式](lame_duck_mode.md) 优雅地关闭服务器