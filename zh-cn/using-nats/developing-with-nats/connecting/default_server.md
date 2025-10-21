# 连接到默认服务器

一些库还提供了一个特殊方法，连接到 _默认_ URL，通常是 `nats://localhost:4222`：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect(nats.DefaultURL)
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 使用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect();

// 使用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect();
// 使用连接做点事情
doSomething();
// 完成后关闭连接
await nc.close();
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect()

# 使用连接做点事情

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

// 调用 ConnectAsync() 是可选的，
// 因为它会在需要时自动调用
await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start do |nc|
   # 使用连接做点事情

   # 关闭连接
   nc.close
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn = NULL;
natsStatus          s;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);
if (s != NATS_OK)
  // 处理错误

// 销毁连接，如果 conn 为 NULL 则忽略。
natsConnection_Destroy(conn);
```
{% endtab %}

{% endtabs %}