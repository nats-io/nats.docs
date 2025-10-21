# 认证

NATS 认证是多层级的。所有的安全模式都有一个 [_账户_](../../../../running-a-nats-service/configuration/securing_nats/auth_intro) 级别，[_用户_](./#用户配置映射) 隶属于这些账户。去中心化的 JWT 认证还有一个 _运营商_，账户隶属于运营商。

每个账户都有自己独立的主题命名空间：在一个账户中发布到主题 'foo' 的消息不会被其他账户中订阅 'foo' 的订阅者看到。但是，账户可以定义主题流的导出和导入，以及在账户之间公开 请求-回复 服务。账户内的用户将共享相同的主题命名空间，但可以限制为只能发布/订阅特定主题。

## 认证方法

NATS 服务器提供了多种认证客户端的方式：

- [令牌认证](tokens.md)
- [明文用户名/密码凭据](username_password.md#明文密码)
- [Bcrypt 加密的用户名/密码凭据](username_password.md#bcrypt-加密密码)
- [TLS 证书](tls_mutual_auth.md)
- [带挑战的 NKEY](nkey_auth.md)
- [去中心化 JWT 认证/授权](../jwt/)

认证处理允许 NATS 客户端连接到服务器。除了 JWT 认证外，认证和授权都在配置的 `authorization` 部分中配置。使用 JWT 认证时，账户和用户信息存储在 [解析器](../jwt/resolver.md) 中，而不是服务器配置文件中。

## Authorization Map

`authorization` 块提供 _认证_ 配置以及 [_授权_](../authorization.md)：

| Property                                       | Description                                                                                                                           |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| [`token`](tokens.md)                           | Specifies a global token that can be used to authenticate to the server \(exclusive of user and password\)                            |
| [`user`](username_password.md#single-user)     | Specifies a single _global_ user name for clients to the server \(exclusive of token\)                                                |
| [`password`](username_password.md)             | Specifies a single _global_ password for clients to the server \(exclusive of `token`\)                                               |
| [`users`](username_password.md#multiple-users) | A list of [user configuration](#user-configuration-map) maps. For multiple username and password credentials, specify a `users` list. |
| [`timeout`](auth_timeout.md)                   | Maximum number of seconds to wait for client authentication                                                                           |
| [`auth_callout`](../auth_callout.md)           | Enables the auth callout extension                                                                                                    |

## User Configuration Map

`user` 配置映射为单个用户指定凭据和权限选项：

| Property                             | Description                                                                                                                                   |
| :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| [`user`](username_password.md)       | username for client authentication. \(Can also be a user for [tls authentication](tls_mutual_auth.md#mapping-client-certificates-to-a-user)\) |
| [`password`](username_password.md)   | password for the user entry                                                                                                                   |
| [`nkey`](nkey_auth.md)               | public nkey identifying an user                                                                                                               |
| [`permissions`](../authorization.md) | permissions map configuring subjects accessible to the user                                                                                   |
