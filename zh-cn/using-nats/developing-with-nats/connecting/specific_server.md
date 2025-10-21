# 连接到特定服务器

NATS 客户端库可以接受完整的 URL，例如 `nats://demo.nats.io:4222`，以指定要连接的特定服务器主机和端口。

一些客户端库已不再需要显式指定协议，并可能允许使用 `demo.nats.io:4222` 或仅 `demo.nats.io`。在后一种情况下，默认端口 4222 将被使用。请查阅您所使用的特定客户端库的文档，了解支持哪些 URL 格式。

例如，要通过 URL 连接到演示服务器，您可以使用以下代码：

{% tabs %}
{% tab title="Go" %}
```go
// 如果连接到默认端口，URL 可以简化为仅主机名/IP。
// 即，下面的连接等同于：
// nats.Connect("nats://demo.nats.io:4222")
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情 nc = Nats.connect("nats://demo.nats.io:4222");
```
{% endtab %}

{% tab title="Java" %}
```java
// 连接会自动关闭
try (Connection nc = Nats.connect("nats://demo.nats.io:4222")) {
    // 用连接做点事情
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({ servers: "demo.nats.io" });
// 用连接做点事情
doSomething();
await nc.close();
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(servers=["nats://demo.nats.io:4222"])

# 用连接做点事情

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient("nats://demo.nats.io:4222");

// 调用 ConnectAsync() 是可选的，
// 因为它会在需要时自动调用
await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://demo.nats.io:4222"]) do |nc|
   # 用连接做点事情

   # 关闭连接
   nc.close
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn = NULL;
natsStatus          s;

// 如果连接到默认端口，URL 可以简化为仅主机名/IP。
// 即，下面的连接等同于：
// natsConnection_ConnectTo(&conn, "nats://demo.nats.io:4222");
s = natsConnection_ConnectTo(&conn, "demo.nats.io");
if (s != NATS_OK)
  // 处理错误

// 销毁连接，如果 conn 为 NULL 则忽略。
natsConnection_Destroy(conn);
```
{% endtab %}

{% endtabs %}