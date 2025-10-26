# 关闭消息回显

默认情况下，如果 NATS 连接对发布的主题也有兴趣，则服务器会向该连接回显消息。这意味着，如果连接上的一个发布者向某个主题发送消息，那么同一连接上的任何订阅者都会收到该消息。客户端可以选择关闭此行为，这样无论是否有兴趣，消息都不会被发送到同一连接上的订阅者。

NoEcho 选项在 BUS （消息总线）模式中非常有用，在这种模式下，所有应用程序都订阅并发布到同一个主题。通常，一个应用程序的发布行为代表它自己已经知道的状态变化（甚至可能就是它触发的变更），因此当应用程序发布更新时，它不需要处理自身的更新。

![](../../../.gitbook/assets/noecho.svg)

请注意，每个连接都需要关闭回显，并且这是针对单个连接的设置，而不是针对整个应用程序。此外，开启或关闭回显可能会导致应用程序通信协议的重大变化，因为消息是否会流动取决于此设置，而订阅代码不会有任何指示说明原因。

{% tabs %}
{% tab title="Go" %}
```go
// 关闭回显
nc, err := nats.Connect("demo.nats.io", nats.Name("API NoEcho Example"), nats.NoEcho())
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
    .noEcho() // 关闭回显
    .build();
Connection nc = Nats.connect(options);

// 使用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    servers: ["demo.nats.io"],
    noEcho: true,
});

const sub = nc.subscribe(subj, { callback: (_err, _msg) => {} });
nc.publish(subj);
await sub.drain();
// 我们不会收到自己的消息
t.is(sub.getProcessed(), 0);
```
{% endtab %}

{% tab title="Python" %}
```python
ncA = NATS()
ncB = NATS()

await ncA.connect(no_echo=True)
await ncB.connect()

async def handler(msg):
   # `ncA` 发送的消息将不会被接收。
   print("[Received] ", msg)

await ncA.subscribe("greetings", cb=handler)
await ncA.flush()
await ncA.publish("greetings", b'Hello World!')
await ncB.publish("greetings", b'Hello World!')

# 使用连接做点事情

await asyncio.sleep(1)
await ncA.drain()
await ncB.drain()
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
    
    // 关闭回显
    Echo = false
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start("nats://demo.nats.io:4222", no_echo: true) do |nc|
  # ...
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
    s = natsOptions_SetNoEcho(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}