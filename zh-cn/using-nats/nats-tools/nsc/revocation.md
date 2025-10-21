# 撤销

NATS 支持两种类型的撤销。这些类型的撤销信息都存放在账户的 JWT 中，以便 nats-server 能够查看并应用这些撤销。

对用户的撤销通过公钥和时间进行。对某个导出（激活）的访问权限可以在特定时间针对特定账户进行撤销。这里使用 时间 概念可能会让人感到困惑，但其设计是为了支持撤销的主要用途。

当一个用户或激活在时间 T 被撤销时，意味着任何在此时间之前创建的用户 JWT 或激活令牌都将失效。如果在 T 之后创建了新的用户 JWT 或新的激活令牌，则可以继续使用。这使得账户所有者能够在撤销某个用户后，重新授予其访问权限。

让我们来看一个例子。假设您创建了一个拥有 “billing” 主题访问权限的用户 JWT。后来您决定不再希望该用户拥有 “billing” 的访问权限。于是您撤销该用户的访问权限（例如在2019年5月1日中午），并创建一个新的用户 JWT，这个新的用户 JWT 不再具有“billing”的访问权限。此时，该用户将无法再使用旧的 JWT 登录，因为该 JWT 已被撤销；但可以使用新创建的 JWT 登录，因为它是在2019年5月1日中午之后创建的。

`nsc` 提供了一系列命令来创建、移除或列出撤销：

```bash
nsc revocations -h
```
```text
Manage revocation for users and activations from an account

Usage:
  nsc revocations [command]

Available Commands:
  add-user          Revoke a user
  add_activation    Revoke an accounts access to an export
  delete-user       Remove a user revocation
  delete_activation Remove an account revocation from an export
  list-users        List users revoked in an account
  list_activations  List account revocations for an export

Flags:
  -h, --help   help for revocations

Global Flags:
  -i, --interactive          ask questions for various settings
  -K, --private-key string   private key

Use "nsc revocations [command] --help" for more information about a command.
```

两个添加命令都接受 `--at` 标志，默认值为 0，可用于设置如上所述的 Unix 时间戳。默认情况下，撤销发生在当前时间，但您也可以将其设置为过去的时间，以对应已知问题发生和修复的时间点。

删除撤销是永久性的，而且会使旧的激活或用户 JWT 再次有效。因此，只有在您确定相关令牌已经过期的情况下，才应使用删除功能。

### 将更改推送到 NATS 服务器

如果您的 NATS 服务器配置为使用内置的 NATS 解析器，那么请记住，如果您使用 `nsc revocations` 进行了本地更改，需要将这些更改推送到服务器，才能使这些更改生效。

即：`nsc push -i` 或 `nsc push -a B -u nats://localhost`

如果有任何客户端当前连接时使用的用户被添加到撤销列表中，一旦您将撤销推送到 NATS 服务器，这些客户端的连接将立即被终止。