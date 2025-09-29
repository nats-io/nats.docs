# 流

要将你发布的消息与其他账户共享，你必须*导出*一个*流*。*导出*与执行导出的账户相关联，并在导出账户的 JWT 中进行公告。

### 添加公共流导出

要向你的账户添加一个流：

```shell
nsc add export --name abc --subject "a.b.c.>"
```

```
  [ OK ] added public stream export "abc"
```

> 注意，我们导出的流使用了一个包含通配符的主题。因此任何匹配该模式的主题都将被导出。

要查看流导出：

```shell
nsc describe account
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 13:35:42 UTC                                  │
│ Expires                   │                                                          │
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
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭───────────────────────────────────────────────────────────╮
│                          Exports                          │
├──────┬────────┬─────────┬────────┬─────────────┬──────────┤
│ Name │ Type   │ Subject │ Public │ Revocations │ Tracking │
├──────┼────────┼─────────┼────────┼─────────────┼──────────┤
│ abc  │ Stream │ a.b.c.> │ Yes    │ 0           │ N/A      │
╰──────┴────────┴─────────┴────────┴─────────────┴──────────╯
```

此账户在 `a.b.c.>` 上发布的消息将被转发给所有导入此流的账户。

### 导入流

导入流使你能接收由其他*账户*发布的消息。要导入一个流，你必须创建一个*导入*。要创建*导入*，你需要知道：

* 导出账户的公钥
* 流发布的主题
* 你可以将流的主题映射到一个不同的主题
* 自我导入无效；你只能从其他账户导入流。

有了所需信息，我们就可以向公共流添加一个导入。

```bash
nsc add account B
```

```
[ OK ] generated and stored account key "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] added account "B"
```

```shell
nsc add import --src-account ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE --remote-subject "a.b.c.>"
```

```
[ OK ] added stream import "a.b.c.>"
```

> 请注意，由远程账户发布的消息将在其原始发布的同一主题上被接收。有时你可能希望为从流接收的消息添加前缀。要添加前缀，请指定 `--local-subject`。我们账户中的订阅者可以监听 `abc.>`。例如，如果指定 `--local-subject abc`，消息将被接收为 `abc.a.b.c.>`。

并验证它：

```shell
nsc describe account
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 13:39:55 UTC                                  │
│ Expires                   │                                                          │
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
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────────────────────────╮
│                                   Imports                                   │
├─────────┬────────┬─────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name    │ Type   │ Remote  │ Local/Prefix │ Expires │ From Account │ Public │
├─────────┼────────┼─────────┼──────────────┼─────────┼──────────────┼────────┤
│ a.b.c.> │ Stream │ a.b.c.> │              │         │ A            │ Yes    │
╰─────────┴────────┴─────────┴──────────────┴─────────┴──────────────┴────────╯
```

我们再添加一个用户以便从服务发出请求：

```bash
nsc add user b
```

```
[ OK ] generated and stored user key "UDKNTNEL5YD66U2FZZ2B3WX2PLJFKEFHAPJ3NWJBFF44PT76Y2RAVFVE"
[ OK ] generated user creds file "~/.nkeys/creds/O/B/b.creds"
[ OK ] added user "b" to account "B"
```

### 将更改推送到 NATS 服务器

如果你的 NATS 服务器配置为使用内置的 NATS 解析器，请记住，你需要使用 `nsc push -i` 或 `nsc push -a B -u nats://localhost` 将本地使用 `nsc add` 所做的任何账户更改"推送"到服务器，这些更改才能生效。

### 测试一下

```bash
nsc sub --account B --user b "a.b.c.>"
```

然后

```shell
nsc pub --account A --user U a.b.c.hello world
```

## 保护流

如果你希望创建一个仅限指定账户访问的流，可以创建一个*私有*流。该导出将在你的账户中可见，但*订阅*账户需要一个授权令牌，该令牌必须由你创建并专门为订阅账户生成。

该授权令牌只是一个由你的账户签名的 JWT，你在其中授权客户端账户导入你的导出。

### 创建私有流导出

```shell
nsc add export --subject "private.abc.*" --private --account A
```

这与我们定义导出时类似，但这次我们添加了 `--private` 标志。另请注意，请求的主题包含一个通配符。这使账户能够将特定主题映射到特别授权的账户。

```shell
nsc describe account A
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 14:24:02 UTC                                  │
│ Expires                   │                                                          │
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
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────╮
│                                 Exports                                  │
├───────────────┬────────┬───────────────┬────────┬─────────────┬──────────┤
│ Name          │ Type   │ Subject       │ Public │ Revocations │ Tracking │
├───────────────┼────────┼───────────────┼────────┼─────────────┼──────────┤
│ abc           │ Stream │ a.b.c.>       │ Yes    │ 0           │ N/A      │
│ private.abc.* │ Stream │ private.abc.* │ No     │ 0           │ N/A      │
╰───────────────┴────────┴───────────────┴────────┴─────────────┴──────────╯
```

### 生成激活令牌

要让外部账户*导入*私有流，你必须生成一个激活令牌。除了授予账户权限外，激活令牌还允许你对导出的流的主题进行子集化。

要生成令牌，你需要知道导入服务的账户的公钥。我们可以通过运行以下命令轻松找到账户 B 的公钥：

```bash
nsc list keys --account B
```

```
╭──────────────────────────────────────────────────────────────────────────────────────────╮
│                                           Keys                                           │
├────────┬──────────────────────────────────────────────────────────┬─────────────┬────────┤
│ Entity │ Key                                                      │ Signing Key │ Stored │
├────────┼──────────────────────────────────────────────────────────┼─────────────┼────────┤
│ O      │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │             │ *      │
│  B     │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │             │ *      │
│   b    │ UDKNTNEL5YD66U2FZZ2B3WX2PLJFKEFHAPJ3NWJBFF44PT76Y2RAVFVE │             │ *      │
╰────────┴──────────────────────────────────────────────────────────┴─────────────┴────────╯
```

```bash
nsc generate activation --account A --target-account AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H --subject private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H -o /tmp/activation.jwt
```

```
[ OK ] generated "private.abc.*" activation for account "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] wrote account description to "/tmp/activation.jwt"
```

该命令接收拥有导出的账户（'A'）、账户 B 的公钥，以及将流发布到账户 B 的主题。

为完整起见，JWT 文件的内容如下所示：

```shell
cat /tmp/activation.jwt
```

```
-----BEGIN NATS ACTIVATION JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJIS1FPQU9aQkVKS1JYNFJRUVhXS0xYSVBVTlNOSkRRTkxXUFBTSTQ3NkhCVVNYT0paVFFRIiwiaWF0IjoxNTc1NTU1OTczLCJpc3MiOiJBREVUUFQzNldCSUJVS00zSUJDVk00QTVZVVNEWEZFSlBXNE02R0dWQllDQlc3UlJORlRWNU5HRSIsIm5hbWUiOiJwcml2YXRlLmFiYy5BQU00NkUzWUY1V09aU0U1V05ZV0hOM1lZSVNWWk9TSTZYSFRGMlE2NEVDUFhTRlFaUk9KTVAySCIsInN1YiI6IkFBTTQ2RTNZRjVXT1pTRTVXTllXSE4zWVlJU1ZaT1NJNlhIVEYyUTY0RUNQWFNGUVpST0pNUDJIIiwidHlwZSI6ImFjdGl2YXRpb24iLCJuYXRzIjp7InN1YmplY3QiOiJwcml2YXRlLmFiYy5BQU00NkUzWUY1V09aU0U1V05ZV0hOM1lZSVNWWk9TSTZYSFRGMlE2NEVDUFhTRlFaUk9KTVAySCIsInR5cGUiOiJzdHJlYW0ifX0.yD2HWhRQYUFy5aQ7zNV0YjXzLIMoTKnnsBB_NsZNXP-Qr5fz7nowyz9IhoP7UszkN58m__ovjIaDKI9ml0l9DA
------END NATS ACTIVATION JWT------
```

解码后如下所示：

```shell
nsc describe jwt -f /tmp/activation.jwt 
```

```
╭────────────────────────────────────────────────────────────────────────────────────────╮
│                                       Activation                                       │
├─────────────────┬──────────────────────────────────────────────────────────────────────┤
│ Name            │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Account ID      │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H             │
│ Issuer ID       │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE             │
│ Issued          │ 2019-12-05 14:26:13 UTC                                              │
│ Expires         │                                                                      │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Hash ID         │ GWIS5YCSET4EXEOBXVMQKXAR4CLY4IIXFV4MEMRUXPSQ7L4YTZ4Q====             │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Import Type     │ Stream                                                               │
│ Import Subject  │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Max Messages    │ Unlimited                                                            │
│ Max Msg Payload │ Unlimited                                                            │
│ Network Src     │ Any                                                                  │
│ Time            │ Any                                                                  │
╰─────────────────┴──────────────────────────────────────────────────────────────────────╯
```

该令牌可以直接与客户端账户共享。

> 如果你为许多账户管理许多令牌，你可能希望将激活令牌托管在 Web 服务器上，并将 URL 共享给账户。托管方法的好处是，只要你托管它们的 URL 是稳定的，对令牌的任何更新都会在导入账户更新时可用。

## 导入私有流

导入私有流比导入公共流更自然，因为给你的激活令牌已经包含了所有必要的细节。请注意，令牌可以是实际的文件路径或远程 URL。

```shell
nsc add import --account B --token /tmp/activation.jwt
```

```
[ OK ] added stream import "private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
```

看一下账户 B

```shell
nsc describe account B
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 14:29:16 UTC                                  │
│ Expires                   │                                                          │
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
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                Imports                                                                                                │
├──────────────────────────────────────────────────────────────────────┬────────┬──────────────────────────────────────────────────────────────────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name                                                                 │ Type   │ Remote                                                               │ Local/Prefix │ Expires │ From Account │ Public │
├──────────────────────────────────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────────────────┼──────────────┼─────────┼──────────────┼────────┤
│ a.b.c.>                                                              │ Stream │ a.b.c.>                                                              │              │         │ A            │ Yes    │
│ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │ Stream │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │              │         │ A            │ No     │
╰──────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────┴──────────────┴─────────┴──────────────┴────────╯
```

### 测试私有流

测试私有流与测试公共流没有区别：

```bash
nsc tools sub --account B --user b private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H
```

然后

```shell
nsc tools pub --account A --user U private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H hello
```