# NKey 认证

NKey 是一种基于 [Ed25519](https://ed25519.cr.yp.to/) 的新型、高度安全的公钥签名系统。

使用 NKey，服务器可以在不存储或查看私钥的情况下验证身份。认证系统通过要求连接客户端提供其公钥并使用其私钥对挑战进行数字签名来工作。服务器为每个连接请求生成随机挑战，使其免受重放攻击。生成的签名根据提供的公钥进行验证，从而证明客户端的身份。如果服务器知道该公钥，则认证成功。

> NKey 是令牌认证的绝佳替代方案，因为连接客户端必须证明它控制着授权公钥的私钥。

要生成 NKey，你需要使用 [`nk` 工具](../../../../using-nats/nats-tools/nk.md)。

## 生成 NKey 并配置服务器

生成 _用户_ NKEY：

```shell
nk -gen user -pubout
```
```text
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4
```

第一行输出以字母 `S` 开头，代表 _种子_。第二个字母 `U` 代表 _用户_。种子是私钥；你应该将它们视为秘密并小心保护。

第二行以字母 `U` 开头，代表 _用户_，是一个可以安全共享的公钥。

要使用 NKey 认证，添加一个用户，并将 `nkey` 属性设置为你想要认证的用户的公钥：

```text
authorization: {
  users: [
    { nkey: UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4 }
  ]
}
```

请注意，用户部分设置了 `nkey` 属性（不需要 user/password/token 属性）。根据需要添加 `permission` 部分。

## 客户端配置

现在你有了用户 NKey，让我们配置一个 [客户端](../../../../using-nats/developing-with-nats/connecting/security/nkey.md) 来使用它进行认证。例如，以下是 node 客户端的连接选项：

```javascript
const NATS = require('nats');
const nkeys = require('ts-nkeys');

const nkey_seed = 'SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY';
const nc = NATS.connect({
  port: PORT,
  nkey: 'UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4',
  sigCB: function (nonce) {
    // 客户端从文件安全加载种子
    // 或程序中定义的常量，如 `nkey_seed`
    const sk = nkeys.fromSeed(Buffer.from(nkey_seed));
    return sk.sign(nonce);
   }
});
...
```

客户端提供了一个函数，用于解析种子（私钥）并对连接挑战进行签名。
