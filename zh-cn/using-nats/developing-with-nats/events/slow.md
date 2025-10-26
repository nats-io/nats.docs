# 慢速消费者

NATS 旨在快速地在服务器间递送消息。因此，NATS 依赖应用程序来考虑并应对不断变化的消息速率。服务器会进行一定程度的阻抗匹配，但如果客户端处理速度过慢，服务器最终将通过关闭连接来切断该客户端。这些被切断的连接被称为 [_慢速消费者_](../../../running-a-nats-service/nats_admin/slow_consumers.md)。

一些库通过为订阅缓冲传入消息的方式来处理突发性消息流量。例如，如果应用程序每秒可以处理 10 条消息，但有时每秒收到 20 条消息，那么库可能会保留额外的 10 条消息，以给应用程序时间追上。从服务器的角度来看，应用程序似乎正在处理消息，并且连接被认为是健康的。大多数客户端库会对应用程序通知 SlowConsumer 错误，并丢弃消息。

从服务器接收并丢弃消息可以保持与服务器的连接健康，但也会对应用程序提出要求。以下是几种常见的模式：

* 使用请求-回复（request-reply）机制限制发送方，防止订阅者过载。
* 使用队列（queue），让多个订阅者分担工作。
* 使用类似 NATS 流式传输（Streaming）的功能持久化消息。

缓存传入消息的库可能提供两种控制方式，用于管理传入队列或待处理消息。这些功能在发布者突然发送了很多消息，而非持续地性能不匹配的情况下非常有用。在生产环境中禁用这些限制可能是危险的，尽管将这些限制设置为 0 可能有助于发现潜在问题，但在生产环境中这样做也是有风险的。

> 请查阅您所使用的库的文档，了解默认设置以及是否支持禁用这些限制。

传入缓存通常是每个订阅者的独立设定，但请再次检查您所使用客户端库的具体文档。

## 按消息数量和字节数限制传入/待处理消息

传入队列的第一个限制方式是按消息数量限制。第二个限制方式是按总大小限制。例如，要将传入缓存限制为最多 1,000 条消息或 5MB（以先达到为准）：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Subscribe
sub1, err := nc.Subscribe("updates", func(m *nats.Msg) {})
if err != nil {
    log.Fatal(err)
}

// 设置限制：1000 条消息或 5MB，以先达到为准
sub1.SetPendingLimits(1000, 5*1024*1024)

// Subscribe
sub2, err := nc.Subscribe("updates", func(m *nats.Msg) {})
if err != nil {
    log.Fatal(err)
}

// 为该订阅取消限制
sub2.SetPendingLimits(-1, -1)

// 关闭连接
nc.Close()
```
{% endtab %}

{% tab title="Java" %}
```java
// Consumer (Dispatcher, Subscription) API
// void setPendingLimits(long maxMessages, long maxBytes)

Connection nc = Nats.connect("nats://demo.nats.io:4222");

Dispatcher d = nc.createDispatcher((msg) -> {
    // 处理消息
});

d.subscribe("updates");

d.setPendingLimits(1_000, 5 * 1024 * 1024); // 为调度器设置限制

// 订阅
Subscription sub = nc.subscribe("updates");

sub.setPendingLimits(1_000, 5 * 1024 * 1024); // 为订阅设置限制

// 做一些事情

// 关闭连接
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// 无法在 node-nats 中配置限制
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

future = asyncio.Future()

async def cb(msg):
  nonlocal future
  future.set_result(msg)

# 设置限制：1000 条消息或 5MB
await nc.subscribe("updates", cb=cb, pending_bytes_limit=5*1024*1024, pending_msgs_limit=1000)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using System.Threading.Channels;
using NATS.Client.Core;

await using var client = new NatsClient();

// 设置限制：1000 条消息。
// 注意：将通道容量设置为超过 1024 是不推荐的，
// 因为通道的后备数组将在 LOH（大对象堆）上分配。
// NATS .NET 客户端不支持设置字节限制
var subOpts = new NatsSubOpts
{
    ChannelOpts = new NatsSubChannelOpts
    {
        Capacity = 1000,
        FullMode = BoundedChannelFullMode.DropOldest
    }
};
await foreach (var msg in client.SubscribeAsync<string>(subject: "updates", opts: subOpts))
{
    Console.WriteLine($"Received: {msg.Subject}: {msg.Data}");    
}
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# 当前 Ruby NATS 客户端没有选项来指定订阅者的待处理限制。
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsSubscription    *sub1      = NULL;
natsSubscription    *sub2      = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// 订阅
if (s == NATS_OK)
    s = natsConnection_Subscribe(&sub1, conn, "updates", onMsg, NULL);

// 设置限制：1000 条消息或 5MB，以先达到为准
if (s == NATS_OK)
    s = natsSubscription_SetPendingLimits(sub1, 1000, 5*1024*1024);

// 订阅
if (s == NATS_OK)
    s = natsConnection_Subscribe(&sub2, conn, "updates", onMsg, NULL);

// 为该订阅取消限制
if (s == NATS_OK)
    s = natsSubscription_SetPendingLimits(sub2, -1, -1);

(...)

// 销毁创建的对象
natsSubscription_Destroy(sub1);
natsSubscription_Destroy(sub2);
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

## 检测慢速消费者并检查丢弃的消息

当检测到慢速消费者且消息即将被丢弃时，库可能会通知应用程序。此过程可能类似于其他错误，也可能涉及自定义回调。

某些库，如 Java，不会在每次丢弃消息时都发送此通知，因为这可能会产生大量噪音。相反，通知可能会在订阅者落后时发送一次。库也可能提供一种获取已丢弃消息数的方法，以便应用程序能够至少检测到问题的发生。

{% tabs %}
{% tab title="Go" %}
```go
// 设置异步错误发生时要调用的回调函数。
nc, err := nats.Connect("demo.nats.io", nats.ErrorHandler(logSlowConsumer))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
class SlowConsumerReporter implements ErrorListener {
    public void errorOccurred(Connection conn, String error)
    {
    }

    public void exceptionOccurred(Connection conn, Exception exp) {
    }

    // 检测慢速消费者
    public void slowConsumerDetected(Connection conn, Consumer consumer) {
        // 获取丢弃的消息数量
        System.out.println("慢速消费者丢弃了消息: "+ consumer.getDroppedCount());
    }
}

public class SlowConsumerListener {
    public static void main(String[] args) {

        try {
            Options options = new Options.Builder().
                                        server("nats://demo.nats.io:4222").
                                        errorListener(new SlowConsumerReporter()). // 设置监听器
                                        build();
            Connection nc = Nats.connect(options);

            // 用连接做点事情

            nc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// NATS JavaScript 客户端无法配置慢速消费者检测。
```
{% endtab %}

{% tab title="Python" %}
```python
   nc = NATS()

   async def error_cb(e):
     if type(e) is nats.aio.errors.ErrSlowConsumer:
       print("慢速消费者错误，取消订阅以停止处理更多消息...")
       await nc.unsubscribe(e.sid)

   await nc.connect(
      servers=["nats://demo.nats.io:4222"],
      error_cb=error_cb,
      )

   msgs = []
   future = asyncio.Future()
   async def cb(msg):
       nonlocal msgs
       nonlocal future
       print(msg)
       msgs.append(msg)

       if len(msgs) == 3:
         # 由于单条消息处理时间过长导致的队头阻塞
         # 影响了其他消息的处理...
         await asyncio.sleep(1)

   await nc.subscribe("updates", cb=cb, pending_msgs_limit=5)

   for i in range(0, 10):
     await nc.publish("updates", "msg #{}".format(i).encode())
     await asyncio.sleep(0)

   try:
     await asyncio.wait_for(future, 1)
   except asyncio.TimeoutError:
     pass

   for msg in msgs:
     print("[Received]", msg)

   await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using System.Threading.Channels;
using NATS.Client.Core;

await using var client = new NatsClient();

// 为慢速消费者设置事件处理器
client.Connection.MessageDropped += async (sender, eventArgs) =>
{
    Console.WriteLine($"Dropped message: {eventArgs.Subject}: {eventArgs.Data}");
    Console.WriteLine($"Current channel size: {eventArgs.Pending}");
};

var subOpts = new NatsSubOpts
{
    ChannelOpts = new NatsSubChannelOpts
    {
        Capacity = 10,
        FullMode = BoundedChannelFullMode.DropOldest

        // 如果设置为等待（默认），您将无法检测到慢速消费者
        // FullMode = BoundedChannelFullMode.Wait,
    }
};

using var cts = new CancellationTokenSource();

var subscription = Task.Run(async () =>
{
    await foreach (var msg in client.SubscribeAsync<string>(subject: "updates", opts: subOpts, cancellationToken: cts.Token))
    {
        Console.WriteLine($"Received: {msg.Subject}: {msg.Data}");    
    }
});

for (int i = 0; i < 1_000; i++)
{
    await client.PublishAsync(subject: "updates", data: $"message payload {i}");
}

await cts.CancelAsync();

await subscription;
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# 当前 Ruby NATS 客户端没有为每个订阅自定义慢速消费者限制的选项。
```
{% endtab %}

{% tab title="C" %}
```c
static void
errorCB(natsConnection *conn, natsSubscription *sub, natsStatus s, void *closure)
{

    // Do something
    printf("Error: %d - %s", s, natsStatus_GetText(s));
}

(...)

natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetErrorHandler(opts, errorCB, NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
