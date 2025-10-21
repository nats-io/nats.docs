# 基础知识

NSC 允许您管理身份。身份采用 _nkeys_ 的形式。Nkeys 是 NATS 生态系统中基于 Ed25519 的公钥签名系统。

nkey 身份以 JSON Web Token (JWT) 的形式与 NATS 配置相关联。JWT 由发行者的私钥进行数字签名，形成一个信任链。`nsc` 工具就是用来创建并管理这些身份的，并允许您将它们部署到 JWT 账户服务器，进而使配置可供 nats-server 使用。

身份实体之间存在逻辑层次结构：

*   `Operators` - 运营商 负责运行 nats-server 并发行账户 JWT。运营商设定账户的操作限制，例如连接数、数据限制等。
*   `Accounts` - 账户 负责发行用户 JWT。可以为一个账户设定可以导出到其他账户那些流和服务。同样，它们也从其他账户导入流和服务。
*   `Users` - 用户 由账户发行，并对账户主题空间的使用和授权进行限制编码。

NSC 允许您创建、编辑和删除这些实体，并且未来将成为所有基于账户的配置的中心。

在本指南中，您将完整地体验一些配置场景：

*   生成 NKey 身份及其关联的 JWT
*   使 nats-server 能够访问 JWT
*   配置 nats-server 以使用 JWT

我们一起看看创建 身份 和 JWT 的过程，并亲自动手实践吧！

## 创建 Operator、Account 和 User

我们先创建一个名为 `MyOperator` 的 operator。

_还有一个附加选项 `--sys`，用于设置系统账户，这是与 NATS 服务器交互必需的。您可以稍后创建并设置系统账户。_

```bash
nsc add operator MyOperator
```
```text
[ OK ] generated and stored operator key "ODSWWTKZLRDFBPXNMNAY7XB2BIJ45SV756BHUT7GX6JQH6W7AHVAFX6C"
[ OK ] added operator "MyOperator"
[ OK ] When running your own nats-server, make sure they run at least version 2.2.0
```

通过上述命令，工具为 operator 生成了一个 NKEY，并将其私钥安全地存储在其密钥库中。

让我们为 operator 添加一个服务 URL。服务 URL 指定 nats-server 的监听地址。诸如 `nsc` 之类的工具可以利用该配置：

```bash
nsc edit operator --service-url nats://localhost:4222
```
```text
[ OK ] added service url "nats://localhost:4222"
[ OK ] edited operator "MyOperator"
```

创建一个账户同样简单：

```bash
nsc add account MyAccount
```
```text
[ OK ] generated and stored account key "AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY"
[ OK ] added account "MyAccount"
```

正如预期的那样，工具生成了一个代表账户的 NKEY，并将私钥安全地存储在密钥库中。

最后，让我们创建一个用户：

```bash
nsc add user MyUser
```
```text
[ OK ] generated and stored user key "UAWBXLSZVZHNDIURY52F6WETFCFZLXYUEFJAHRXDW7D2K4445IY4BVXP"
[ OK ] generated user creds file `~/.nkeys/creds/MyOperator/MyAccount/MyUser.creds`
[ OK ] added user "MyUser" to account "MyAccount"
```

正如预期的那样，工具生成了一个代表用户的 NKEY，并将私钥安全地存储在密钥库中。此外，工具还生成了一个*凭证*文件。凭证文件包含用户的 JWT 和用户的私钥。NATS 客户端使用凭证文件向系统标识自己。客户端将提取其中的 JWT 并将其出示给 nats-server，并通过私钥验证自己的身份。

### NSC 资源

NSC 管理三个不同的目录：

*   nsc 主目录，存储 nsc 相关数据。默认情况下，nsc 主目录位于 `~/.nsc`，可以通过 `$NSC_HOME` 环境变量更改。
*   一个 *_nkeys_* 目录，存储所有私钥。此目录默认位于 `~/.nkeys`，可以通过 `$NKEYS_PATH` 环境变量更改。nkeys 目录的内容应视为机密。
*   一个 *_stores_* 目录，包含代表各种实体的 JWT。此目录位于 `$NSC_HOME/nats`，可以使用命令 `nsc env -s <dir>` 更改。stores 目录可以置于版本控制之下。JWT 本身不包含任何机密。

#### NSC Stores 目录

stores 目录包含许多目录。每个目录以相应的 operator 命名，其中又包含所有账户和用户：

```bash
tree ~/.nsc/nats
```
```text
/Users/myusername/.nsc/nats
└── MyOperator
    ├── MyOperator.jwt
    └── accounts
        └── MyAccount
            ├── MyAccount.jwt
            └── users
                └── MyUser.jwt
```

这些 JWT 与 NATS 服务器用来检查账户有效性及其限制的工件相同，也是客户端连接到 nats-server 时出示的 JWT。

#### NKEYS 目录

nkeys 目录包含所有私钥和凭证文件。如前所述，必须注意保护这些文件的安全。

keys 目录的结构是机器友好的。所有密钥都按其种类进行分片：`O` 代表 operators，`A` 代表 accounts，`U` 代表 users。这些前缀也是公钥的一部分。公钥中的第二个和第三个字母用于创建存储其他类似名称密钥的目录。

```shell
tree ~/.nkeys
```
```text
/Users/myusername/.nkeys
├── creds
│   └── MyOperator
│       └── MyAccount
│           └── MyUser.creds
└── keys
    ├── A
    │   └── DE
    │       └── ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE.nk
    ├── O
    │   └── AF
    │       └── OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG.nk
    └── U
        └── DB
            └── UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7.nk
```

`nk` 文件本身以完整的公钥命名，并存储为一个字符串——即相关的私钥：

```bash
cat ~/.nkeys/keys/U/DB/UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7.nk 
```
```text
SUAG35IAY2EF5DOZRV6MUSOFDGJ6O2BQCZHSRPLIK6J3GVCX366BFAYSNA
```

私钥被编码成一个字符串，并且总是以 `S`（代表*seed*，即*种子*）开头。第二个字母表示密钥的类型：`O` 代表 operators，`A` 代表 accounts，`U` 代表 users。

除了包含密钥之外，nkeys 目录还包含一个 `creds` 目录。该目录的组织方式对人类友好。它存储用户凭证文件（简称 `creds` 文件）。凭证文件包含用户 JWT 的副本和用户的私钥。这些文件被 NATS 客户端用来连接到 NATS 服务器：

```bash
cat ~/.nkeys/creds/MyOperator/MyAccount/MyUser.creds
```
```text
-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI0NUc3MkhIQUVCRFBQV05ZWktMTUhQNUFYWFRSSUVDQlNVQUI2VDZRUjdVM1JZUFZaM05BIiwiaWF0IjoxNjM1Mzc1NTYxLCJpc3MiOiJBRDJNMzRXQk5HUUZZSzM3SURYNTNEUFJHNzRSTExUN0ZGV0JPQk1CVVhNQVZCQ1ZBVTVWS1dJWSIsIm5hbWUiOiJNeVVzZXIiLCJzdWIiOiJVQVdCWExTWlZaSE5ESVVSWTUyRjZXRVRGQ0ZaTFhZVUVGSkFIUlhEVzdEMks0NDQ1SVk0QlZYUCIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.CGymhGYHfdZyhUeucxNs9TthSjy_27LVZikqxvm-pPLili8KNe1xyOVnk_w-xPWdrCx_t3Se2lgXmoy3wBcVCw
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAP2AY6UAWHOXJBWDNRNKJ2DHNC5VA2DFJZTF6C6PMLKUCOS2H2E2BA2E
------END USER NKEY SEED------

*************************************************************
```

### 列出密钥

您可以通过以下命令列出当前正在处理的实体：

```bash
nsc list keys
```
```text
+----------------------------------------------------------------------------------------------+
|                                             Keys                                             |
+------------+----------------------------------------------------------+-------------+--------+
| Entity     | Key                                                      | Signing Key | Stored |
+------------+----------------------------------------------------------+-------------+--------+
| MyOperator | ODSWWTKZLRDFBPXNMNAY7XB2BIJ45SV756BHUT7GX6JQH6W7AHVAFX6C |             | *      |
|  MyAccount | AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY |             | *      |
|   MyUser   | UAWBXLSZVZHNDIURY52F6WETFCFZLXYUEFJAHRXDW7D2K4445IY4BVXP |             | *      |
+------------+----------------------------------------------------------+-------------+--------+
```

列出了不同的实体名称及其公钥，以及密钥是否已存储。已存储的密钥是指在 nkeys 目录中找到的密钥。

在某些情况下，您可能希望查看私钥：

```shell
nsc list keys --show-seeds
```
```text
+---------------------------------------------------------------------------------------+
|                                      Seeds Keys                                       |
+------------+------------------------------------------------------------+-------------+
| Entity     | Private Key                                                | Signing Key |
+------------+------------------------------------------------------------+-------------+
| MyOperator | SOAJ3JDZBE6JKJO277CQP5RIAA7I7HBI44RDCMTIV3TQRYQX35OTXSMHAE |             |
|  MyAccount | SAAACXWSQIKJ4L2SEAUZJR3BCNSRCN32V5UJSABCSEP35Q7LQRPV6F4JPI |             |
|   MyUser   | SUAP2AY6UAWHOXJBWDNRNKJ2DHNC5VA2DFJZTF6C6PMLKUCOS2H2E2BA2E |             |
+------------+------------------------------------------------------------+-------------+
[ ! ] seed is not stored
[ERR] error reading seed
```

如果您没有 seed（也许您不控制该 operator），nsc 将在该行旁标记 `!`。如果您有多个账户，可以通过指定 `--all` 标志来显示所有账户。

## Operator JWT

您可以使用 `nsc` 查看 JWT 的人类可读版本：

```bash
nsc describe operator
```
```text
+----------------------------------------------------------------------------------+
|                                 Operator Details                                 |
+-----------------------+----------------------------------------------------------+
| Name                  | MyOperator                                               |
| Operator ID           | ODSWWTKZLRDFBPXNMNAY7XB2BIJ45SV756BHUT7GX6JQH6W7AHVAFX6C |
| Issuer ID             | ODSWWTKZLRDFBPXNMNAY7XB2BIJ45SV756BHUT7GX6JQH6W7AHVAFX6C |
| Issued                | 2021-10-27 22:58:28 UTC                                  |
| Expires               |                                                          |
| Operator Service URLs | nats://localhost:4222                                    |
| Require Signing Keys  | false                                                    |
+-----------------------+----------------------------------------------------------+
```

由于 operator JWT 只是一个 JWT，您可以使用其他工具（例如 https://jwt.io）来解码 JWT 并检查其内容。所有 JWT 都包含头信息、有效载荷和签名：

```text
{
  "typ": "jwt",
  "alg": "ed25519"
}
{
  "jti": "ZP2X3T2R57SLXD2U5J3OLLYIVW2LFBMTXRPMMGISQ5OF7LANUQPQ",
  "iat": 1575468772,
  "iss": "OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG",
  "name": "O",
  "sub": "OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG",
  "type": "operator",
  "nats": {
    "operator_service_urls": [
      "nats://localhost:4222"
    ]
  }
}
```

所有 NATS JWT 都将使用 `algorithm` ed25519 进行签名。有效载荷将列出不同的内容。在我们基本为空的 operator 上，我们只有标准的 JWT `claim` 字段：

`jti` - 一个 jwt id `iat` - JWT 发行时间的时间戳（UNIX 时间） `iss` - JWT 的发行者，本例中是 operator 的公钥 `sub` - JWT 所代表的主体或身份，本例中是同一个 operator `type` - 由于这是一个 operator JWT，类型为 `operator`

NATS 专属的是 `nats` 对象，这是我们将 NATS 特定的 JWT 配置添加到 JWT 声明中的地方。

因为发行者和主体是同一个，所以这个 JWT 是自签名的。

### Account JWT

同样，我们可以看看账户：

```bash
nsc describe account
```
```text
+--------------------------------------------------------------------------------------+
|                                   Account Details                                    |
+---------------------------+----------------------------------------------------------+
| Name                      | MyAccount                                                |
| Account ID                | AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY |
| Issuer ID                 | ODSWWTKZLRDFBPXNMNAY7XB2BIJ45SV756BHUT7GX6JQH6W7AHVAFX6C |
| Issued                    | 2021-10-27 22:59:01 UTC                                  |
| Expires                   |                                                          |
+---------------------------+----------------------------------------------------------+
| Max Connections           | Unlimited                                                |
| Max Leaf Node Connections | Unlimited                                                |
| Max Data                  | Unlimited                                                |
| Max Exports               | Unlimited                                                |
| Max Imports               | Unlimited                                                |
| Max Msg Payload           | Unlimited                                                |
| Max Subscriptions         | Unlimited                                                |
| Exports Allows Wildcards  | True                                                     |
| Response Permissions      | Not Set                                                  |
+---------------------------+----------------------------------------------------------+
| Jetstream                 | Disabled                                                 |
+---------------------------+----------------------------------------------------------+
| Imports                   | None                                                     |
| Exports                   | None                                                     |
+---------------------------+----------------------------------------------------------+
```

### User JWT

最后是用户 JWT：

```bash
nsc describe user
```
```text
+---------------------------------------------------------------------------------+
|                                      User                                       |
+----------------------+----------------------------------------------------------+
| Name                 | MyUser                                                   |
| User ID              | UAWBXLSZVZHNDIURY52F6WETFCFZLXYUEFJAHRXDW7D2K4445IY4BVXP |
| Issuer ID            | AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY |
| Issued               | 2021-10-27 22:59:21 UTC                                  |
| Expires              |                                                          |
| Bearer Token         | No                                                       |
| Response Permissions | Not Set                                                  |
+----------------------+----------------------------------------------------------+
| Max Msg Payload      | Unlimited                                                |
| Max Data             | Unlimited                                                |
| Max Subs             | Unlimited                                                |
| Network Src          | Any                                                      |
| Time                 | Any                                                      |
+----------------------+----------------------------------------------------------+
```

用户 ID 是用户的公钥，由账户发行。这个用户可以发布和订阅任何内容，因为没有设置任何限制。

当用户连接到 nats-server 时，它会出示其用户 JWT，并使用其私钥对随机数进行签名。服务器通过验证随机数是否使用了与代表用户身份的公钥相关联的私钥签名，来验证用户是否是其声称的身份。接下来，服务器获取该用户的发行者——账户，并验证该账户是否由受信任的运营商发行，从而完成信任链验证。

让我们将所有这些结合起来，创建一个简单的服务器配置，接受来自 `U` 的会话。

## 账户服务器配置

要将一个服务器配置为使用账户，您需要配置 它要选用的*账户解析器*类型。首选选项是将服务器配置为使用内置的 [基于 NATS 的解析器](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#nats-based-resolver)。

## NATS 服务器配置

如果您尚未安装 nats-server，现在安装：

```shell
go get github.com/nats-io/nats-server
```

让我们创建一个使用我们的 运营商 JWT 和 nats-account-server 作为解析器的配置。您可以使用 `nsc` 本身来生成服务器配置的安全部分，然后只需将其添加到您的 `nats-server` 配置文件中。

例如，要使用 NATS 解析器（这是推荐的解析器配置），请使用 `nsc generate config --nats-resolver`。

根据需要编辑此生成的配置（例如，调整服务器将在 `resolver.dir` 中存储 JWT 的位置），并将其粘贴到您的 nats-server 配置中（或将其保存到文件中，并从您的服务器配置文件中导入该文件）。

至少，服务器需要 `operator` JWT（我们已直接指向它）和一个解析器。

例如：
```shell
nsc generate config --nats-resolver > resolver.conf
```

以及一个示例服务器配置 `myconfig.cfg`

```
server_name: servertest
listen: 127.0.0.1:4222
http: 8222

jetstream: enabled

include resolver.conf
```

现在使用 `nats-server -c myconfig.cfg` 启动此本地测试服务器。

nats-server 需要一个指定账户用于服务器、集群或超级集群的管理和监控。如果您看到此错误消息：

`nats-server: using nats based account resolver - the system account needs to be specified in configuration or the operator jwt`&#x20;

这意味着没有系统账户与服务器交互，您需要在配置或 operator JWT 中添加一个。让我们使用 `nsc` 将一个系统账户添加到 operator JWT：

```shell
nsc add account -n SYS`
nsc edit operator --system-account SYS
```
（并重新生成 `resolver.conf`）

现在使用以下命令启动本地测试服务器：`nats-server -c myconfig.cfg`

## 推送本地 nsc 更改到 nats server

为了使 nats server 了解您创建的账户或对这些账户属性的任何更改，您需要将使用 `nsc` 在本地完成的任何新账户或对账户属性的任何更改*推送*到 nats-server 的内置账户解析器中。您可以使用 `nsc push` 来执行此操作：

例如，要将您刚刚创建的名为 'MyAccount' 的账户推送到在您本地机器上运行的 nats server，请使用：
```shell
nsc push -a MyAccount -u nats://localhost
```

您也可以使用 `nsc pull -u nats://localhost` 将本地 NATS server 的账户视图拉取到您的本地 nsc 副本中（即拉取到 `~/.nsc` 中）。

一旦您将账户 JWT "推送"到服务器（该服务器的内置 NATS 账户解析器将负责将该新（或新版本的）账户 JWT 分发到集群中的其他 nats server），更改就会生效。例如，您使用该账户创建的任何用户将能够使用用户的 JWT 连接到集群中的任何 nats server。
## 客户端测试

如果尚未安装，请先安装 `nats` CLI 工具。

创建一个订阅者：

```shell
nats sub --creds ~/.nkeys/creds/MyOperator/MyAccount/MyUser.creds ">"
```

发布一条消息：

```shell
nats pub --creds ~/.nkeys/creds/MyOperator/MyAccount/MyUser.creds hello NATS 
```

订阅者那边会显示：

```text
Received on [hello]: ’NATS’
```

### 创建一个 `nats` 上下文

如果您要将这些凭证与 `nats` CLI 一起使用，您应该创建一个上下文，这样就不必每次都传递连接、身份验证参数：

```shell
nats context add myuser --creds ~/.nkeys/creds/MyOperator/MyAccount/MyUser.creds
```

### NSC 内嵌 NATS 工具

为了更方便，您可以使用内置于 NSC 中的 NATS 客户端。这些工具知道如何在密钥环中找到凭证文件。为方便起见，这些工具别名为 `sub`, `pub`, `req`, `reply`：

```bash
nsc sub --user MyUser ">"
...

nsc pub --user MyUser hello NATS
...
```

有关更详细的信息，请参阅 `nsc tool -h`。

## 用户授权

正如预期的那样，用户授权也可以与 JWT 身份验证一起使用。使用 `nsc`，您可以指定用户 允许/禁止 发布/订阅 特定主题的授权。默认情况下，对用户可以发布或订阅的主题没有任何限制。账户中的任何消息流或发布的消息都可以被用户订阅。用户也可以向任何主题或导入的服务发布消息。请注意，如果配置了授权，则必须基于每个用户进行指定。

在指定限制时，重要的是要记住客户端默认使用生成的 "inboxes" 来允许发布请求。在指定订阅和发布权限时，您需要允许客户端们订阅和发布到 `_INBOX.>`。您可以进一步限制它，但您将负责分割主题空间，以免破坏客户端之间的请求-回复通信。

假设您有一项服务，您账户下的客户端们可以通过向 `q` 发出请求来调用这个服务。要使这个服务能够接收和响应请求，它需要有权订阅 `q` 并具有发布到 `_INBOX.>` 的权限：

```bash
nsc add user s --allow-pub "_INBOX.>" --allow-sub q
```
```text
[ OK ] added pub pub "_INBOX.>"
[ OK ] added sub "q"
[ OK ] generated and stored user key "UDYQFIF75SQU2NU3TG4JXJ7C5LFCWAPXX5SSRB276YQOOFXHFIGHXMEL"
[ OK ] generated user creds file `~/.nkeys/creds/MyOperator/MyAccount/s.creds`
[ OK ] added user "s" to account "MyAccount"
```

```shell
nsc describe user s
```
```text
+---------------------------------------------------------------------------------+
|                                      User                                       |
+----------------------+----------------------------------------------------------+
| Name                 | s                                                        |
| User ID              | UDYQFIF75SQU2NU3TG4JXJ7C5LFCWAPXX5SSRB276YQOOFXHFIGHXMEL |
| Issuer ID            | AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY |
| Issued               | 2021-10-27 23:23:16 UTC                                  |
| Expires              |                                                          |
| Bearer Token         | No                                                       |
+----------------------+----------------------------------------------------------+
| Pub Allow            | _INBOX.>                                                 |
| Sub Allow            | q                                                        |
| Response Permissions | Not Set                                                  |
+----------------------+----------------------------------------------------------+
| Max Msg Payload      | Unlimited                                                |
| Max Data             | Unlimited                                                |
| Max Subs             | Unlimited                                                |
| Network Src          | Any                                                      |
| Time                 | Any                                                      |
+----------------------+----------------------------------------------------------+
```

如您所见，此客户端现在被限制为只能向 `_INBOX.>` 地址发布回复、订阅服务的请求主题（service's request subject）。

类似地，我们可以限制一个客户端：

```bash
nsc add user c --allow-pub q --allow-sub "_INBOX.>"
```
```text
[ OK ] added pub pub "q"
[ OK ] added sub "_INBOX.>"
[ OK ] generated and stored user key "UDIRTIVVHCW2FLLDHTS27ENXLVNP4EO4Z5MR7FZUNXFXWREPGQJ4BRRE"
[ OK ] generated user creds file `~/.nkeys/creds/MyOperator/MyAccount/c.creds`
[ OK ] added user "c" to account "MyAccount"
```

让我们看看这个新用户
```shell
nsc describe user c
```
```text
+---------------------------------------------------------------------------------+
|                                      User                                       |
+----------------------+----------------------------------------------------------+
| Name                 | c                                                        |
| User ID              | UDIRTIVVHCW2FLLDHTS27ENXLVNP4EO4Z5MR7FZUNXFXWREPGQJ4BRRE |
| Issuer ID            | AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY |
| Issued               | 2021-10-27 23:26:09 UTC                                  |
| Expires              |                                                          |
| Bearer Token         | No                                                       |
+----------------------+----------------------------------------------------------+
| Pub Allow            | q                                                        |
| Sub Allow            | _INBOX.>                                                 |
| Response Permissions | Not Set                                                  |
+----------------------+----------------------------------------------------------+
| Max Msg Payload      | Unlimited                                                |
| Max Data             | Unlimited                                                |
| Max Subs             | Unlimited                                                |
| Network Src          | Any                                                      |
| Time                 | Any                                                      |
+----------------------+----------------------------------------------------------+
```

该客户端具有与服务相反的权限。它可以在发布到请求主题 `q` ，并在收件箱中接收回复。

## NSC 环境

随着您的项目变得更加复杂，您可能会处理一个或多个账户。NSC 会跟踪您当前的 operator 和 account。如果您不在包含 operator、account 或 user 的目录中，它将使用最后一个 operator/account 上下文。

要查看您当前的环境：

```shell
nsc env
```
```text
+------------------------------------------------------------------------------------------------------+
|                                           NSC Environment                                            |
+--------------------+-----+---------------------------------------------------------------------------+
| Setting            | Set | Effective Value                                                           |
+--------------------+-----+---------------------------------------------------------------------------+
| $NSC_CWD_ONLY      | No  | If set, default operator/account from cwd only                            |
| $NSC_NO_GIT_IGNORE | No  | If set, no .gitignore files written                                       |
| $NKEYS_PATH        | No  | ~/.nkeys                                                                  |
| $NSC_HOME          | No  | ~/.nsc                                                                    |
| Config             |     | ~/.nsc/nsc.json                                                           |
| $NATS_CA           | No  | If set, root CAs in the referenced file will be used for nats connections |
|                    |     | If not set, will default to the system trust store                        |
+--------------------+-----+---------------------------------------------------------------------------+
| From CWD           |     | No                                                                        |
| Stores Dir         |     | ~/.nsc/nats                                                               |
| Default Operator   |     | MyOperator                                                                |
| Default Account    |     | MyAccount                                                                 |
| Root CAs to trust  |     | Default: System Trust Store                                               |
+--------------------+-----+---------------------------------------------------------------------------+
```

如果您有多个账户，可以使用 `nsc env --account <account name>` 将该账户设置为当前默认账户。如果您在环境中定义了 `NKEYS_PATH` 或 `NSC_HOME`，您还将看到它们当前的有效值。最后，如果您想将 stores 目录设置为默认值以外的任何值，可以使用 `nsc env --store <包含 operator 的目录>`。如果您有多个账户，可以尝试使用多个终端，每个终端位于不同账户的目录中。