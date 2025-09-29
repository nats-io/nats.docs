# 缓存、刷新与Ping

出于性能考虑，大多数（如果不是全部的话）客户端库都会缓冲传出的数据，以便一次性将较大的数据块写入网络。这可能只是一个简单的字节缓冲区，用于存储几条消息，然后再一次性推送到网络。

这些缓冲区不会永久保存消息，通常它们被设计为在高吞吐量场景下保存消息，同时在低吞吐量情况下仍能提供良好的延迟。

确保消息以高性能方式流动是客户端库的责任。但在某些情况下，应用程序可能需要知道某条消息是否已经“到达网络”。在这种情况下，应用程序可以使用刷新（flush）调用来通知库将数据通过系统传输。

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 仅为了避免与其他用户使用演示服务器时发生冲突。
subject := nats.NewInbox()

if err := nc.Publish(subject, []byte("All is Well")); err != nil {
    log.Fatal(err)
}
// 发送一个 PING 并等待服务器的 PONG 响应，最长等待时间为给定的超时时间。
// 这样可以确保服务器已处理上述消息。
if err := nc.FlushTimeout(time.Second); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

nc.publish("updates", "All is Well".getBytes(StandardCharsets.UTF_8));
nc.flush(Duration.ofSeconds(1)); // 刷新消息队列

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const start = Date.now();
nc.flush().then(() => {
  t.log("round trip completed in", Date.now() - start, "ms");
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

await nc.publish("updates", b'All is Well')

# 发送一个 PING 并等待服务器的 PONG 响应，最长等待时间为给定的超时时间。
# 这样可以确保服务器已处理上述消息。
await nc.flush(timeout=1)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

await client.PublishAsync("updates", "All is well");

// 发送一个 PING 并等待服务器的 PONG 响应。
// 这样可以确保服务器已处理上述消息，
// 因为底层 TCP 连接会按顺序发送和接收消息。
await client.PingAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.subscribe("updates") do |msg|
    puts msg
  end

  nc.publish("updates", "All is Well")

  nc.flush do
    # 发送一个 PING 并等待服务器的 PONG 响应，最长等待时间为给定的超时时间。
    # 这样可以确保服务器已处理上述消息。
  end
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// 发送请求并等待最多 1 秒
if (s == NATS_OK)
    s = natsConnection_PublishString(conn, "foo", "All is Well");

// 发送一个 PING 并等待服务器的 PONG 响应，最长等待时间为给定的超时时间。
// 这样可以确保服务器已处理上述消息。
if (s == NATS_OK)
    s = natsConnection_FlushTimeout(conn, 1000);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

## 刷新与Ping/Pong

许多客户端库使用 NATS 协议内置的 [PING/PONG 交互](../connecting/pingpong.md) 来确保 flush 能够将所有缓冲的消息推送到服务器。当应用程序调用 flush 时，大多数库会在传出的消息队列中放置一个 PING，并等待服务器以 PONG 响应，然后才表示 flush 成功。

尽管客户端可能会使用 PING/PONG 来实现 flush，但这种方式发送的 ping 不计入 [最大出站 ping 数](../connecting/pingpong.md)。

