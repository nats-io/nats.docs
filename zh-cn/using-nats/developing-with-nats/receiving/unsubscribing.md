# 取消订阅

客户端库提供了取消先前的订阅请求的方法。

此过程需要与服务器进行交互，因此对于异步订阅，在取消订阅由库处理时可能会有一小段时间窗口，期间可能已经有消息到达。开发者们可以忽略这种边缘情况，因为客户端库将清理任何未处理的消息，并通知服务器该订阅已不再使用。

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
if err := sub.Unsubscribe(); err != nil {
    log.Fatal(err)
}

// Async Subscription
sub, err = nc.Subscribe("updates", func(_ *nats.Msg) {})
if err != nil {
    log.Fatal(err)
}
if err := sub.Unsubscribe(); err != nil {
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

// Sync Subscription have an unsubscribe API
Subscription sub = nc.subscribe("updates");
sub.unsubscribe();

// Async Subscriptions on the dispatcher must unsubscribe via the dispatcher,
// not the subscription
d.subscribe("updates");
d.unsubscribe("updates");

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sc = StringCodec();
// set up a subscription to process a request
const sub = nc.subscribe(createInbox(), (_err, m) => {
  m.respond(sc.encode(new Date().toLocaleTimeString()));
});
// without arguments the subscription will cancel when the server receives it
// you can also specify how many messages are expected by the subscription
sub.unsubscribe();
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

sub = await nc.subscribe("updates", cb=cb)
await nc.publish("updates", b'All is Well')

# Remove interest in subject
await sub.unsubscribe()

# Won't be received...
await nc.publish("updates", b'...')
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

// Cancel the subscription after 10 seconds
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));

// Subscribe to the "updates" subject
// We unsubscribe when we receive the message "exit"
// or when the cancellation token is triggered.
await foreach (var msg in client.SubscribeAsync<string>("updates").WithCancellation(cts.Token))
{
    Console.WriteLine($"Received: {msg.Data}");
    
    if (msg.Data == "exit")
    {
        // When we exit the loop, we unsubscribe from the subject
        break;
    }
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

    sid = nc.subscribe("time") do |msg, reply|
      f.resume Time.now
    end

    nc.publish("time", 'What is the time?', NATS.create_inbox)

    # Use the response
    msg = Fiber.yield
    puts "Reply: #{msg}"

    nc.unsubscribe(sid)

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
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// Subscribe
if (s == NATS_OK)
    s = natsConnection_SubscribeSync(&sub, conn, "updates");

// Unsubscribe
if (s == NATS_OK)
    s = natsSubscription_Unsubscribe(sub);

(...)

// Destroy objects that were created
natsSubscription_Destroy(sub);
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}