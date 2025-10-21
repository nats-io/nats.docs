# 安全性

NATS 提供了许多安全功能：

* 连接可以[通过 _TLS 加密_](/running-a-nats-service/configuration/securing_nats/tls.md)
* 客户端连接可以通过多种方式进行 [_身份验证_](../running-a-nats-service/configuration/securing_nats/auth_intro/)：
  * [令牌认证](../running-a-nats-service/configuration/securing_nats/auth_intro/tokens.md)
  * [用户名/密码认证](../running-a-nats-service/configuration/securing_nats/auth_intro/username_password.md)
  * [TLS 证书](../running-a-nats-service/configuration/securing_nats/auth_intro/tls_mutual_auth.md)
  * [带有 Challenge 的 NKEY](../running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth.md)
  * [去中心化的 JWT 身份验证/授权](../running-a-nats-service/configuration/securing_nats/jwt/)
  * 您还可以将 NATS 与您现有的身份验证/授权系统集成，或使用 [Auth 回调](../running-a-nats-service/configuration/securing_nats/auth_callout.md) 创建自定义的身份验证
* 已通过身份验证的客户端会被识别为用户，并拥有一组 [_授权_](../running-a-nats-service/configuration/securing_nats/authorization.md)

您可以使用 [_账户_](../running-a-nats-service/configuration/securing_nats/accounts.md) 实现多租户：每个账户都有自己的独立的 主题命名空间，并且您可以控制消息和服务在不同账户之间的导入/导出，以及客户端应用可以被认证为任意数量的用户。用户被允许发布和/或订阅的主题或主题通配符，可以通过服务器配置或作为签名 JWT 的一部分进行控制。

JWT 身份验证/授权管理是去中心化的，因为每个账户的私钥持有者都可以自行管理其用户及其授权，而无需对 NATS 服务器进行任何配置更改，只需生成自己的 JWT 并分发给用户即可。NATS 服务器无需存储任何用户私钥，因为它只需要验证客户端应用提供的用户 JWT 中包含的信任链签名，以确认该用户具有正确的公钥。

此外，NATS 的 JetStream 持久化层还提供了 [_静态数据加密_](../running-a-nats-service/nats_admin/jetstream_admin/encryption_at_rest.md)。