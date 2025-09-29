# 请求-回复 语义

发送消息并接收响应的模式在大多数客户端库中被封装为一个请求方法。在底层，该方法会发布一条带有唯一回复主题（reply-to subject）的消息，并在返回之前等待响应。

在一些较旧版本的库中，每次都会创建一个全新的回复主题。而在较新版本中，则利用了主题层次结构：客户端库中的单个订阅者监听一个通配符主题，而请求则通过这个被监听主题的唯一子主题发送。

与 发布带有 回复到... 的主题 相比较，请求方法的主要区别在于，客户端库预期只会接受一个响应，而且在大多数库中，request 会被视为同步操作。此外，库甚至可能提供设置超时时间的方法。

例如，在前面发布的示例基础上，我们可以请求`time`，并设置一秒钟的超时：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 发送请求
msg, err := nc.Request("time", nil, time.Second)
if err != nil {
    log.Fatal(err)
}

// 使用响应
log.Printf("Reply: %s", msg.Data)

// 关闭连接
nc.Close()
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// 设置一个监听器来处理 "time" 请求
Dispatcher d = nc.createDispatcher(msg -> {
    System.out.println("Received time request");
    nc.publish(msg.getReplyTo(), ("" + System.currentTimeMillis()).getBytes());
});
d.subscribe("time");

// 向 "time" 主题发送请求，并等待 1 秒钟以获取响应
Message msg = nc.request("time", null, Duration.ofSeconds(1));

// 查看响应
long time = Long.parseLong(new String(msg.getData()));
System.out.println(new Date(time));

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// 设置一个订阅来处理请求
const sc = StringCodec();
nc.subscribe("time", {
  callback: (_err, msg) => {
    msg.respond(sc.encode(new Date().toLocaleTimeString()));
  },
});

const r = await nc.request("time");
t.log(sc.decode(r.data));
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def sub(msg):
  await nc.publish(msg.reply, b'response')

await nc.connect(servers=["nats://demo.nats.io:4222"])
await nc.subscribe("time", cb=sub)

# 发送请求
try:
  msg = await nc.request("time", b'', timeout=1)
  # 使用响应
  print("Reply:", msg)
except asyncio.TimeoutError:
  print("Timed out waiting for response")
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

using CancellationTokenSource cts = new();

// 在单独的任务中处理时间消息
Task subscription = Task.Run(async () =>
{
    await foreach (var msg in client.SubscribeAsync<string>("time", cancellationToken: cts.Token))
    {
        await msg.ReplyAsync(DateTimeOffset.Now);
    }
});

// 等待订阅任务准备就绪
await Task.Delay(1000);

var reply = await client.RequestAsync<DateTimeOffset>("time");

Console.WriteLine($"Reply: {reply.Data:O}");

await cts.CancelAsync();
await subscription;

// 输出：
// Reply: 2024-10-23T05:20:55.0000000+01:00
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.subscribe("time") do |msg, reply|
    nc.publish(reply, "response")
  end

  Fiber.new do
    # 使用响应
    msg = nc.request("time", "")
    puts "Reply: #{msg}"
  end.resume
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsMsg             *msg       = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// 发送请求并等待最多 1 秒
if (s == NATS_OK)
    s = natsConnection_RequestString(&msg, conn, "request", "this is the request", 1000);

if (s == NATS_OK)
{
    printf("Received msg: %s - %.*s\n",
           natsMsg_GetSubject(msg),
           natsMsg_GetDataLength(msg),
           natsMsg_GetData(msg));

    // 销毁接收到的消息
    natsMsg_Destroy(msg);
}

(...)

// 销毁已创建的对象
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

在库中，你可以将 请求-回复 模式视为一种“订阅-获取一条消息-取消订阅”的模式。在 Go 中，这可能看起来像这样：

```go
sub, err := nc.SubscribeSync(replyTo)
if err != nil {
    log.Fatal(err)
}

// 立即发送请求
nc.PublishRequest(subject, replyTo, []byte(input))
nc.Flush()

// 等待单个响应
for {
    msg, err := sub.NextMsg(1 * time.Second)
    if err != nil {
        log.Fatal(err)
    }

    response = string(msg.Data)
    break
}
sub.Unsubscribe()
```

## 散射-聚集

你可以将请求-回复模式扩展为一种通常称为散射-聚集（scatter-gather）的操作。为了接收多个消息，并设置超时时间，你可以执行类似以下操作：其中获取消息的循环体使用时间作为限制条件，而不是只接收单个消息：

```go
sub, err := nc.SubscribeSync(replyTo)
if err != nil {
    log.Fatal(err)
}
nc.Flush()

// Send the request
nc.PublishRequest(subject, replyTo, []byte(input))

// Wait for a single response
max := 100 * time.Millisecond
start := time.Now()
for time.Now().Sub(start) < max {
    msg, err := sub.NextMsg(1 * time.Second)
    if err != nil {
        break
    }

    responses = append(responses, string(msg.Data))
}
sub.Unsubscribe()
```

或者，你可以通过计数器和超时时间，循环尝试获取至少 _N_ 个响应：

```go
sub, err := nc.SubscribeSync(replyTo)
if err != nil {
    log.Fatal(err)
}
nc.Flush()

// Send the request
nc.PublishRequest(subject, replyTo, []byte(input))

// Wait for a single response
max := 500 * time.Millisecond
start := time.Now()
for time.Now().Sub(start) < max {
    msg, err := sub.NextMsg(1 * time.Second)
    if err != nil {
        break
    }

    responses = append(responses, string(msg.Data))

    if len(responses) >= minResponses {
        break
    }
}
sub.Unsubscribe()
```

