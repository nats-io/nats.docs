# 使用 NKey 进行身份验证

NATS 服务器的 2.0 版本引入了一种新的质询响应身份验证选项。这种质询响应基于我们称之为 [NKeys](../../../../running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth.md) 的封装器。服务器可以以多种方式使用这些密钥进行身份验证。最简单的方式是将服务器配置为包含已知公钥列表，客户端则通过使用其私钥对质询进行签名来响应。\(可打印的私有 NKey 称为种子\)。这种质询响应通过确保客户端拥有私钥来保证安全性，同时也保护了私钥不被服务器访问，因为服务器永远不会接触到它！

处理质询响应可能需要在连接选项中进行更多设置，具体取决于客户端库。

{% tabs %}
{% tab title="Go" %}
```go
opt, err := nats.NkeyOptionFromSeed("seed.txt")
if err != nil {
    log.Fatal(err)
}
nc, err := nats.Connect("127.0.0.1", opt)
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 使用连接做一些事情
```
{% endtab %}

{% tab title="Java" %}
```java
NKey theNKey = NKey.createUser(null); // 应该从某个地方加载
Options options = new Options.Builder()
    .server("nats://localhost:4222")
    .authHandler(new AuthHandler(){
        public char[] getID() {
            try {
                return theNKey.getPublicKey();
            } catch (GeneralSecurityException|IOException|NullPointerException ex) {
                return null;
            }
        }

        public byte[] sign(byte[] nonce) {
            try {
                return theNKey.sign(nonce);
            } catch (GeneralSecurityException|IOException|NullPointerException ex) {
                return null;
            }
        }

        public char[] getJWT() {
            return null;
        }
    })
    .build();
Connection nc = Nats.connect(options);

// 使用连接做一些事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// 种子应被视为密码并妥善保存
const seed = new TextEncoder().encode(
  "SUAEL6GG2L2HIF7DUGZJGMRUFKXELGGYFMHF76UO2AYBG3K4YLWR3FKC2Q",
);
const nc = await connect({
  port: ns.port,
  authenticator: nkeyAuthenticator(seed),
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def error_cb(e):
    print("Error:", e)

await nc.connect("nats://localhost:4222",
                 nkeys_seed="./path/to/nkeys/user.nk",
                 error_cb=error_cb,
                 )

# 使用连接做一些事情

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    Url = "127.0.0.1",
    Name = "API NKey Example",
    AuthOpts = new NatsAuthOpts
    {
        NKeyFile = "/path/to/nkeys/user.nk"
    }
});
```
{% endtab %}

{% tab title="C" %}
```c
static natsStatus
sigHandler(
    char            **customErrTxt,
    unsigned char   **signature,
    int             *signatureLength,
    const char      *nonce,
    void            *closure)
{
    // 对给定的 `nonce` 进行签名，并将签名作为 `signature` 返回。
    // 这需要分配内存。签名的长度通过 `signatureLength` 返回。
    // 如果发生错误，用户可以通过 `customErrTxt` 返回特定的错误信息。库会释放这个指针。

    return NATS_OK;
}

(...)

natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;
const char          *pubKey    = "my public key......";

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetNKey(opts, pubKey, sigHandler, NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}