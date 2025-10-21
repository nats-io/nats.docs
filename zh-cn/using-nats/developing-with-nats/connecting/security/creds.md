# 使用凭据文件进行身份验证

NATS 服务器 2.0 版本引入了基于 [JSON Web Tokens (JWT)](https://jwt.io/) 的去中心化身份验证概念。客户端通过使用 [用户 JWT](/running-a-nats-service/nats_admin/security.md) 和相应的 [NKey](/running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth.md) 私钥来与这一新机制交互。为简化使用 JWT 进行连接的过程，客户端库支持凭据文件的概念。该文件包含私钥和 JWT，可通过 `nsc` [工具](../../../nats-tools/nsc/) 生成。文件内容如下所示，并应受到保护，因为它包含私钥。此凭证文件未被使用，仅用于示例目的。

```text
-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJUVlNNTEtTWkJBN01VWDNYQUxNUVQzTjRISUw1UkZGQU9YNUtaUFhEU0oyWlAzNkVMNVJBIiwiaWF0IjoxNTU4MDQ1NTYyLCJpc3MiOiJBQlZTQk0zVTQ1REdZRVVFQ0tYUVM3QkVOSFdHN0tGUVVEUlRFSEFKQVNPUlBWV0JaNEhPSUtDSCIsIm5hbWUiOiJvbWVnYSIsInN1YiI6IlVEWEIyVk1MWFBBU0FKN1pEVEtZTlE3UU9DRldTR0I0Rk9NWVFRMjVIUVdTQUY3WlFKRUJTUVNXIiwidHlwZSI6InVzZXIiLCJuYXRzIjp7InB1YiI6e30sInN1YiI6e319fQ.6TQ2ilCDb6m2ZDiJuj_D_OePGXFyN3Ap2DEm3ipcU5AhrWrNvneJryWrpgi_yuVWKo1UoD5s8bxlmwypWVGFAA
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAOY5JZ2WJKVR4UO2KJ2P3SW6FZFNWEOIMAXF4WZEUNVQXXUOKGM55CYE
------END USER NKEY SEED------

*************************************************************
```

有了凭据文件后，客户端可以作为属于特定账户的特定用户进行身份验证：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("127.0.0.1", nats.UserCredentials("path_to_creds_file"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder()
    .server("nats://localhost:4222")
    .authHandler(Nats.credentials("path_to_creds_file"))
    .build();
Connection nc = Nats.connect(options);

// 用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// 凭据文件包含 JWT 和秘密签名密钥
  const authenticator = credsAuthenticator(creds);
  const nc = await connect({
    port: ns.port,
    authenticator: authenticator,
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def error_cb(e):
    print("Error:", e)

await nc.connect("nats://localhost:4222",
                 user_credentials="path_to_creds_file",
                 error_cb=error_cb,
                 )

# 用连接做点事情

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient("127.0.0.1", credsFile: "/path/to/file.creds");
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    // 如果文件同时包含用户 JWT 和种子，则以如下方式传入凭据文件。
    // 否则，如果内容已分离，第一个文件是用户 JWT，第二个文件包含种子。
    s = natsOptions_SetUserCredentialsFromFiles(opts, "path_to_creds_file", NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁已创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}