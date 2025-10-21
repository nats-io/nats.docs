# 使用令牌进行身份验证

令牌（Tokens）本质上是一串随机字符串，与密码类似，在某些情况下可以提供一种简单的身份验证机制。然而，令牌的安全性取决于其保密程度，因此在大型部署中，其他身份验证方案可能提供更高的安全性。因此强烈建议改用其他的 NATS 身份验证机制之一。

要运行本示例中的代码，先使用以下命令启动服务器：

```bash
nats-server --auth mytoken
```

示例代码使用 `localhost:4222`，以便您可以在本地机器上启动服务器并进行测试。

## 使用 Token 建立连接

{% tabs %}
{% tab title="Go" %}
```go
// 设置令牌
nc, err := nats.Connect("127.0.0.1", nats.Name("API Token Example"), nats.Token("mytoken"))
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
    .server("nats://demo.nats.io:4222")
    .token("mytoken") // 设置令牌
    .build();
Connection nc = Nats.connect(options);

// 用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
  port: ns.port,
  token: "aToK3n",
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], token="mytoken")

# 用连接做点事情。
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
    Name = "API Token Example",
    AuthOpts = new NatsAuthOpts
    {
        Token = "mytoken"
    }
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start(token: "mytoken") do |nc|
  puts "Connected using token"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetToken(opts, "mytoken");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁已创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## 写入 Token 到 URL 中

一些客户端库允许您通过以下格式将令牌作为服务器URL的一部分：

> nats://_token_@server:port

你可以像普通 URL 那样进行连接。

{% tabs %}
{% tab title="Go" %}
```go
// URL中包含令牌
nc, err := nats.Connect("mytoken@localhost")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://mytoken@localhost:4222");//URL中包含令牌

// 用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
  // JavaScript不支持在URL中使用令牌，请使用`token`选项
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://mytoken@demo.nats.io:4222"])

# 用连接做点事情。
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    // .NET客户端不支持在URL中使用令牌
    // 请改用Token选项。
    AuthOpts = new NatsAuthOpts
    {
        Token = "mytoken"
    }
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start("mytoken@127.0.0.1:4222") do |nc|
  puts "Connected using token!"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetURL(opts, "nats://mytoken@127.0.0.1:4222");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁已创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}