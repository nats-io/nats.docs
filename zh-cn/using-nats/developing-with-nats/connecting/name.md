# 连接名称

连接可以被赋予一个名称，该名称将显示在部分服务器监控数据中。此名称并非必需，但强烈建议您设置一个友好的连接名称，以便于监控、错误报告、调试和测试。

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API Name Option Example"))
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
    .connectionName("API Name Option Example") // 设置名称
    .build();
Connection nc = Nats.connect(options);

// 用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
 const nc = await connect({
    name: "my-connection",
    servers: ["demo.nats.io:4222"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
    servers=["nats://demo.nats.io:4222"], 
    name="API Name Option Example")

# 用连接做点事情

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient(name: "API Name Option Example", url: "nats://demo.nats.io:4222");

// 调用 ConnectAsync() 是可选的，
// 因为它会在需要时自动调用
await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://demo.nats.io:4222"], name: "API Name Option Example") do |nc|
   # 用连接做点事情

   # 关闭连接
   nc.close
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsOptions         *opts    = NULL;
natsStatus          s        = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetName(opts, "API Name Option Example");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

