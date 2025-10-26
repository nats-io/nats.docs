# Ping/Pong 协议

NATS 客户端应用使用 PING/PONG 协议来检查与 NATS 服务的连接是否正常。客户端会定期向服务器发送 PING 消息，服务器则以 PONG 响应。该周期由客户端连接设置中的 ping 间隔指定。

![](../../../.gitbook/assets/pingpong.svg)

当客户端在未收到任何 PONG 响应的情况下达到一定数量的 PING 消息时，连接将被视为失效并被关闭。这一阈值由客户端连接设置中的最大未响应 PING 数量指定。

PING 间隔和最大未响应 PING 数量共同决定了客户端连接出现问题时通知的速度。这在操作系统无法检测到套接字错误的远程网络分区情况下也会有所帮助。当连接关闭时，客户端将尝试重新连接。如果知道其他服务器，则会优先尝试这些服务器。

在存在流量（如消息或客户端侧的 PING）的情况下，服务器不会主动发起 PING/PONG 交互。

对于具有大量流量的连接，客户端通常会在两次 PING 之间发现连接问题，因此默认的 ping 间隔通常为几分钟级别。要使无响应的连接在 100 秒后关闭，可将 ping 间隔设置为 20 秒，最大未响应 PING 数量设置为 5：

{% tabs %}
{% tab title="Go" %}
```go
// 设置 Ping 间隔为 20 秒，最大未响应 PING 数量为 5
nc, err := nats.Connect("demo.nats.io", nats.Name("API Ping Example"), nats.PingInterval(20*time.Second), nats.MaxPingsOutstanding(5))
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
    .server("nats://demo.nats.io")
    .pingInterval(Duration.ofSeconds(20)) // 设置 Ping 间隔
    .maxPingsOut(5) // 设置最大未响应 PING 数量
    .build();

// 连接是 AutoCloseable 类型
try (Connection nc = Nats.connect(options)) {
    // 用连接做点事情
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// 设置 Ping 间隔为 20 秒，最大未响应 PING 数量为 5
const nc = await connect({
    pingInterval: 20 * 1000,
    maxPingOut: 5,
    servers: ["demo.nats.io:4222"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   # 设置 Ping 间隔为 20 秒，最大未响应 PING 数量为 5
   ping_interval=20,
   max_outstanding_pings=5,
   )

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
    Url = "nats://demo.nats.io:4222",
    
    // 设置 Ping 间隔为 20 秒，最大未响应 PING 数量为 5
    PingInterval = TimeSpan.FromSeconds(20),
    MaxPingOut = 5,
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
# 设置 Ping 间隔为 20 秒，最大未响应 PING 数量为 5
NATS.start(ping_interval: 20, max_outstanding_pings: 5) do |nc|
   nc.on_reconnect do
    puts "已重新连接到 #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "已断开连接！#{reason}"
  end

  # 用连接做点事情
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
    // 设置 Ping 间隔为 20 秒（20,000 毫秒）
    s = natsOptions_SetPingInterval(opts, 20000);
if (s == NATS_OK)
    // 设置最大未响应 PING 数量为 5
    s = natsOptions_SetMaxPingsOut(opts, 5);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}