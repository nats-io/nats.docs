# 签名密钥

正如之前讨论的，NKEY 就是身份标识，如果有人获取了账户或运营商的 NKEY，他们就能像你一样执行所有操作。

NATS 提供了策略来帮助你处理私钥泄露的情况。

首要且最重要的防御措施是**签名密钥**。**签名密钥**允许你拥有多个相同类型（运营商或账户）的 NKEY 身份，这些身份与标准的**颁发者** NKEY 具有同等的信任度。

签名密钥背后的概念是，你可以为运营商或账户颁发一个列出多个 NKEY 的 JWT。通常，颁发者会与发布 JWT 的实体的**主题**相匹配。有了签名密钥，只要 JWT 是由**颁发者**的**主题**或其签名密钥之一签名的，该 JWT 就被认为是有效的。这使得你可以更严密地保护运营商或账户的私钥，同时允许使用替代的私钥来为**账户**、**用户**或**激活令牌**签名。

如果出现问题，例如某个签名密钥意外泄露，你可以从实体中移除被盗用的签名密钥，添加一个新的密钥，重新颁发给该实体。当验证 JWT 时，如果签名密钥缺失，操作将被拒绝。你还需要负责重新颁发所有使用被盗用签名密钥签名的 JWT（账户、用户、激活令牌）。

这实际上是一个强有力的手段。你可以通过拥有大量签名密钥，然后轮换这些密钥，以便在发生泄露时能够轻松处理分发问题，从而稍微缓解这个过程。在未来的版本中，我们将提供一个撤销流程，你可以通过唯一的 JWT ID（JTI）使单个 JWT 失效。但目前，你只能使用这个"大锤"。

安全流程越严格，复杂性就越高。因此，`nsc` 不跟踪公钥或私钥签名密钥。因为这些身份标识在使用时假定是手动操作的。这意味着用户必须更仔细地跟踪和管理自己的私钥。

让我们来熟悉一下工作流程。我们将要：

*   创建一个有签名密钥的运营商
*   创建一个有签名密钥的账户
*   使用运营商的签名密钥为该账户签名
*   使用账户的签名密钥创建一个用户

所有签名密钥操作都围绕全局的 `nsc` 标志 `-K` 或 `--private-key` 进行。每当你想要修改一个实体时，都必须提供父级密钥以便对 JWT 进行签名。通常情况下这是自动完成的，但在使用签名密钥时，你需要手动提供该标志。

创建运营商：

```shell
nsc add operator O2
```
```
[ OK ] generated and stored operator key "OABX3STBZZRBHMWMIMVHNQVNUG2O3D54BMZXX5LMBYKSAPDSHIWPMMFY"
[ OK ] added operator "O2"
```

要添加签名密钥，我们首先要用 `nsc` 生成一个：

```shell
nsc generate nkey --operator --store
```

```
SOAEW6Z4HCCGSLZJYZQMGFQY2SY6ZKOPIAKUQ5VZY6CW23WWYRNHTQWVOA
OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5
operator key stored ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk
```

> 在生产环境中，私钥应保存到一个文件中，并始终从受保护的文件中引用。

现在我们将编辑运营商，使用 `--sk` 标志添加一个签名密钥，并提供生成的运营商公钥（以 `O` 开头的那个）：

```shell
nsc edit operator --sk OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5
```

```
[ OK ] added signing key "OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5"
[ OK ] edited operator "O2"
```

检查我们的成果：

```shell
nsc describe operator
```

```
╭─────────────────────────────────────────────────────────────────────────╮
│                            Operator Details                             │
├──────────────┬──────────────────────────────────────────────────────────┤
│ Name         │ O2                                                       │
│ Operator ID  │ OABX3STBZZRBHMWMIMVHNQVNUG2O3D54BMZXX5LMBYKSAPDSHIWPMMFY │
│ Issuer ID    │ OABX3STBZZRBHMWMIMVHNQVNUG2O3D54BMZXX5LMBYKSAPDSHIWPMMFY │
│ Issued       │ 2019-12-05 14:36:16 UTC                                  │
│ Expires      │                                                          │
├──────────────┼──────────────────────────────────────────────────────────┤
│ Signing Keys │ OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5 │
╰──────────────┴──────────────────────────────────────────────────────────╯
```

现在让我们创建一个名为 `A` 的账户，并使用生成的运营商签名密钥的私钥为其签名。要使用该密钥签名，请指定 `-K` 标志以及私钥或私钥的路径：

```shell
nsc add account A -K ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk
```

```
[ OK ] generated and stored account key "ACDXQQ6KD5MVSFMK7GNF5ARK3OJC6PEICWCH5PQ7HO27VKGCXQHFE33B"
[ OK ] added account "A"
```

让我们生成一个账户签名密钥，再次使用 `nk`：

```bash
nsc generate nkey --account --store
```

```
SAAA4BVFTJMBOW3GAYB3STG3VWFSR4TP4QJKG2OCECGA26SKONPFGC4HHE
ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7
account key stored ~/.nkeys/keys/A/DU/ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7.nk
```

让我们添加签名密钥到这个账户，并记住使用运营商签名密钥为账户签名：

```shell
nsc edit account --sk ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7 -K ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk
```

```
[ OK ] added signing key "ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7"
[ OK ] edited account "A"
```
让我们查看一下账户

```shell
nsc describe account
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ACDXQQ6KD5MVSFMK7GNF5ARK3OJC6PEICWCH5PQ7HO27VKGCXQHFE33B │
│ Issuer ID                 │ OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5 │
│ Issued                    │ 2019-12-05 14:48:22 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Signing Keys              │ ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7 │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Imports                   │ None                                                     │
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯
```

我们可以看到签名密钥 `ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7` 已被添加到账户中。同时，颁发者是运营商的签名密钥（通过 `-K` 指定）。

现在让我们创建一个用户，并使用以 `ADUQTJD4TF4O` 开头的账户签名密钥为其签名。

```shell
nsc add user U -K ~/.nkeys/keys/A/DU/ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7.nk
```

```
[ OK ] generated and stored user key "UD47TOTKVDY4IQRGI6D7XMLZPHZVNV5FCD4CNQICLV3FXLQBY72A4UXL"
[ OK ] generated user creds file "~/.nkeys/creds/O2/A/U.creds"
[ OK ] added user "U" to account "A"
```
检查用户
```shell
nsc describe user
```

```
╭─────────────────────────────────────────────────────────────────────────────────╮
│                                      User                                       │
├──────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                 │ U                                                        │
│ User ID              │ UD47TOTKVDY4IQRGI6D7XMLZPHZVNV5FCD4CNQICLV3FXLQBY72A4UXL │
│ Issuer ID            │ ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7 │
│ Issuer Account       │ ACDXQQ6KD5MVSFMK7GNF5ARK3OJC6PEICWCH5PQ7HO27VKGCXQHFE33B │
│ Issued               │ 2019-12-05 14:50:07 UTC                                  │
│ Expires              │                                                          │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Response Permissions │ Not Set                                                  │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Messages         │ Unlimited                                                │
│ Max Msg Payload      │ Unlimited                                                │
│ Network Src          │ Any                                                      │
│ Time                 │ Any                                                      │
╰──────────────────────┴──────────────────────────────────────────────────────────╯
```

正如预期的那样，颁发者现在是我们之前生成的签名密钥。为了将用户映射到实际账户，JWT 中添加了一个 `Issuer Account` 字段，用于标识账户 _A_ 的公钥。

## 作用域签名密钥

作用域签名密钥简化了用户权限管理。以前，如果你想限制用户的权限，必须为每个用户指定权限。有了作用域签名密钥，你可以将一个签名密钥与一组权限关联起来。此配置存在于账户 JWT 上，并通过 `nsc edit signing-key` 命令进行管理。你可以根据需要添加任意多个作用域签名密钥。

要为用户授予一组权限，只需使用具有所需权限集的签名密钥为用户签名即可。以及**不得**在用户配置中分配任何权限。

连接后，nats-server 会将与该签名密钥关联的权限分配给用户。如果你更新了与签名密钥关联的权限，服务器将立即更新使用该密钥签名的用户的权限。

```shell
nsc add account A
```

```
[ OK ] generated and stored account key "ADLGEVANYDKDQ6WYXPNBEGVUURXZY4LLLK5BJPOUDN6NGNXLNH4ATPWR"
[ OK ] push jwt to account server:
       [ OK ] pushed account jwt to the account server
       > NGS created a new free billing account for your JWT, A [ADLGEVANYDKD].
       > Use the 'ngs' command to manage your billing plan.
       > If your account JWT is *not* in ~/.nsc, use the -d flag on ngs commands to locate it.
[ OK ] pull jwt from account server
[ OK ] added account "A"
```
生成签名密钥

```shell
nsc edit account -n A --sk generate
```

```
[ OK ] added signing key "AAZQXKDPOTGUCOCOGDW7HWWVR5WEGF3KYL7EKOEHW2XWRS2PT5AOTRH3"
[ OK ] push jwt to account server
[ OK ] pull jwt from account server
[ OK ] account server modifications:
       > allow wildcard exports changed from true to false
[ OK ] edited account "A"
```

添加一个服务到账户

```shell
nsc edit signing-key --account A --role service --sk AAZQXKDPOTGUCOCOGDW7HWWVR5WEGF3KYL7EKOEHW2XWRS2PT5AOTRH3 --allow-sub "q.>" --deny-pub ">" --allow-pub-response
```

```
[ OK ] set max responses to 1
[ OK ] added deny pub ">"
[ OK ] added sub "q.>"
[ OK ] push jwt to account server
[ OK ] pull jwt from account server
[ OK ] edited signing key "AAZQXKDPOTGUCOCOGDW7HWWVR5WEGF3KYL7EKOEHW2XWRS2PT5AOTRH3"
```

由于签名密钥在账户内具有唯一的角色名称，后续可以更容易地引用它。

```shell
nsc add user U -K service
```

```
[ OK ] generated and stored user key "UBFRJ6RNBYJWSVFBS7O4ZW5MM6J3EPE75II3ULPVUWOUH7K7A23D3RQE"
[ OK ] generated user creds file `~/test/issue-2621/keys/creds/synadia/A/U.creds`
[ OK ] added user "U" to account "A"
```

要查看用户的权限，请输入 `nsc describe user` - 你将在报告中看到该用户是作用域内的，并且拥有列出的权限。你可以使用 `nsc edit signing-key` 检查和修改作用域权限 - 将更新推送到账户将重新分配用户权限。

### 模板函数

*自 NATS 2.9.0 起可用*

尽管作用域签名密钥非常有用并能提高安全性（通过限制特定签名密钥的范围），但在多用户设置中，设置的权限可能过于僵化。例如，给定两个用户 `pam` 和 `joe`，我们可能希望允许他们订阅自己命名空间下的主题来处理请求，例如 `pam.>` 和 `joe.>`。这些用户之间的权限*结构*是相同的，但它们的具体主题不同，这些主题进一步根据该用户的某些属性进行了作用域划分。

模板函数可用于在作用域签名密钥中声明结构，但利用基本模板功能，使得使用该签名密钥创建的每个用户都具有用户特定的主题。

以下模板函数在创建用户时将展开。

- `{{name()}}` - 扩展为用户的名称，例如 `pam`
- `{{subject()}}` - 扩展为用户公钥 NKEY 值，例如 `UAC...`
- `{{account-name()}}` - 扩展为签名账户的名称，例如 `sales`
- `{{account-subject()}}` - 扩展为账户公钥 NKEY 值，例如 `AXU...`
- `{{tag(key)}}` - 扩展与签名密钥关联的 `key:value` 标签

例如，给定一个具有模板化 `--allow-sub` 主题的作用域签名密钥：

```
nsc edit signing-key \
  --account sales \
  --role team-service \
  --sk AXUQXKDPOTGUCOCOGDW7HWWVR5WEGF3KYL7EKOEHW2XWRS2PT5AOTRH3 \
  --allow-sub "{{account-name()}}.{{tag(team)}}.{{name()}}.>" \
  --allow-pub-response
```

我们可以在不同的团队中创建两个用户。

```
nsc add user pam -K team-service --tag team:support
nsc add user joe -K team-service --tag team:leads
```

每个用户最终的 `--allow-sub` 权限将扩展为：

```
sales.support.pam.>
```

和

```
sales.leads.joe.>
```