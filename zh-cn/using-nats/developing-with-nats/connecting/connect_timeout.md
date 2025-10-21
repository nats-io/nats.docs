# 设置连接超时时间

每个库都有其特定的语言方式来传入连接选项。其中最常见的选项之一是连接超时时间，它限制了与服务器建立连接所需的最大时间。如果提供了多个URL，此超时时间将分别应用于每个集群成员。要将连接到服务器的最长时间设置为10秒：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API Options Example"), nats.Timeout(10*time.Second))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 使用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder()
    .server("nats://demo.nats.io:4222")
    .connectionTimeout(Duration.ofSeconds(10)) // 设置超时时间
    .build();
Connection nc = Nats.connect(options);

// 使用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    reconnectTimeWait: 10 * 1000, // 10秒
    servers: ["demo.nats.io"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
  servers=["nats://demo.nats.io:4222"],
  connect_timeout=10)

# 使用连接做点事情

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
    Url = "nats://demo.nats.io:4222",
    ConnectTimeout = TimeSpan.FromSeconds(10)
});

// 不需要显式调用 ConnectAsync()，首次操作会自动建立连接。
await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# 当前 Ruby NATS 客户端 API 中没有连接超时功能，但可以使用计时器来模拟。
require 'nats/client'

timer = EM.add_timer(10) do
  NATS.connect do |nc|
    # 使用连接做点事情

    # 关闭连接
    nc.close
  end
end
EM.cancel_timer(timer)
```
{% endtab %}

{% tab title="C" %}
```c
nnatsConnection      *conn    = NULL;
 natsOptions         *opts    = NULL;
 natsStatus          s        = NATS_OK;

 s = natsOptions_Create(&opts);
 if (s == NATS_OK)
     // 将超时时间设置为10秒（10,000毫秒）
     s = natsOptions_SetTimeout(opts, 10000);
 if (s == NATS_OK)
     s = natsConnection_Connect(&conn, opts);

 (...)

 // 销毁创建的对象
 natsConnection_Destroy(conn);
 natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}