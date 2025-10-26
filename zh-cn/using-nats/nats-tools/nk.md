# nk

`nk` 是一个命令行工具，用于生成 `nkeys`。NKeys 是一种基于 [Ed25519](https://ed25519.cr.yp.to/) 的高度安全的公钥签名系统。

使用 NKeys，服务器可以在不存储任何秘密的情况下验证身份。该认证系统要求连接上的客户端提供其公钥，并用私钥对挑战进行数字签名。服务器在每次连接请求时都会生成一个随机挑战，从而防止重放攻击。生成的签名会通过公钥进行验证，从而证明客户端的身份。如果公钥验证成功，则认证成功。

> NKey 是令牌认证的一个极佳替代方案，因为连接上的客户端必须证明它拥有授权公钥对应的私钥。

## 安装 nk

要开始使用 NKeys，您需要从 [https://github.com/nats-io/nkeys/tree/master/nk](https://github.com/nats-io/nkeys/tree/master/nk) 仓库获取 `nk` 工具。如果您已安装了 _go_，请在命令提示符下输入以下命令：

```bash
go install github.com/nats-io/nkeys/nk@latest
```

## 生成 NKeys 并配置服务器

要生成一个 _User_ NKEY：

```shell
nk -gen user -pubout
```
```text
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4
```

第一行输出以字母 `S` 开头，代表 _Seed_（种子）。第二行以字母 `U` 开头，代表 _User_（用户）。种子是私钥，应被视为秘密并妥善保管。

第二行以字母 `U` 开头，代表 _User_（用户），是一个可以安全共享的公钥。

要使用 `nkey` 认证，添加一个用户，并将 `nkey` 属性设置为您希望认证的用户的公钥。您只需使用公钥，无需其他属性。以下是 `nats-server` 配置的片段：

```
authorization: {
  users: [
    { nkey: UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4 }
  ]
}
```

要完成端到端配置并使用 `nkey`，[客户端需配置](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth#client-configuration) 使用种子，即私钥。