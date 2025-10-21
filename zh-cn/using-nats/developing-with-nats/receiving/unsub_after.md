# 在接收到 N 条消息后取消订阅

NATS 提供了一种特殊形式的取消订阅功能，可通过设置消息数量来配置，并在向订阅发送指定数量的消息后生效。如果预期只接收单条消息，此机制非常有用。

您提供的消息计数是针对一个订阅的总消息计数。因此，如果您对一个订阅设置 计数为 1 的取消订阅，服务器将在 该订阅接收到第一条消息后停止向其发送消息。如果订阅者已经收到了一条或多条消息，取消订阅将立即生效。如果您尝试在长期运行的订阅上使用自动取消订阅，那么这种基于历史消息数量的行为可能会令人困惑，但对于新订阅来说是符合逻辑的。


自动取消订阅是基于发送给一个订阅的总消息数运作的，而不仅仅是设定自动取消订阅后新增的消息数。大多数客户端库也会在发送自动取消订阅请求后跟踪最大消息计数。在重连时，这使得客户端能够使用更新后的总数重新发送取消订阅请求。

以下示例展示了在接收到单条消息后取消订阅：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Sync Subscription
sub, err := nc.SubscribeSync("updates")
if err != nil {
    log.Fatal(err)
}
if err := sub.AutoUnsubscribe(1); err != nil {
    log.Fatal(err)
}

// Async Subscription
sub, err = nc.Subscribe("updates", func(_ *nats.Msg) {})
if err != nil {
    log.Fatal(err)
}
if err := sub.AutoUnsubscribe(1); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");
Dispatcher d = nc.createDispatcher((msg) -> {
    String str = new String(msg.getData(), StandardCharsets.UTF_8);
    System.out.println(str);
});

/ subscribe then unsubscribe after 10 "more" messages
// It's technically possible to get more than 10 total if messages are already in
// flight by the time the server receives the unsubscribe message

// Sync Subscription, 
Subscription sub = nc.subscribe("updates");
sub.unsubscribe(10);

// Async Subscription directly in the dispatcher
d.subscribe("updates");
d.unsubscribe("updates", 10);

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sc = StringCodec();
// `max` specifies the number of messages that the server will forward.
// The server will auto-cancel.
const subj = createInbox();
const sub1 = nc.subscribe(subj, {
  callback: (_err, msg) => {
    t.log(`sub1 ${sc.decode(msg.data)}`);
  },
  max: 10,
});

// another way after 10 messages
const sub2 = nc.subscribe(subj, {
  callback: (_err, msg) => {
    t.log(`sub2 ${sc.decode(msg.data)}`);
  },
});
// if the subscription already received 10 messages, the handler
// won't get any more messages
sub2.unsubscribe(10);
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

async def cb(msg):
  print(msg)

sid = await nc.subscribe("updates", cb=cb)
await nc.auto_unsubscribe(sid, 1)
await nc.publish("updates", b'All is Well')

# Won't be received...
await nc.publish("updates", b'...')
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient();

// Unsubscribe after 10 messages
var opts = new NatsSubOpts { MaxMsgs = 10 };

var count = 0;

// Subscribe to updates with options
await foreach (var msg in client.SubscribeAsync<string>("updates", opts: opts))
{
    Console.WriteLine($"Received[{++count}]: {msg.Data}");
}

Console.WriteLine("Unsubscribed from updates");
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  Fiber.new do
    f = Fiber.current

    nc.subscribe("time", max: 1) do |msg, reply|
      f.resume Time.now
    end

    nc.publish("time", 'What is the time?', NATS.create_inbox)

    # Use the response
    msg = Fiber.yield
    puts "Reply: #{msg}"

    # Won't be received
    nc.publish("time", 'What is the time?', NATS.create_inbox)

  end.resume
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsSubscription    *sub       = NULL;
natsMsg             *msg       = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// Subscribe
if (s == NATS_OK)
    s = natsConnection_SubscribeSync(&sub, conn, "updates");

// Unsubscribe after 1 message is received
if (s == NATS_OK)
    s = natsSubscription_AutoUnsubscribe(sub, 1);

// Wait for messages
if (s == NATS_OK)
    s = natsSubscription_NextMsg(&msg, sub, 10000);

if (s == NATS_OK)
{
    printf("Received msg: %s - %.*s\n",
            natsMsg_GetSubject(msg),
            natsMsg_GetDataLength(msg),
            natsMsg_GetData(msg));

    // Destroy message that was received
    natsMsg_Destroy(msg);
}

(...)

// Destroy objects that were created
natsSubscription_Destroy(sub);
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}