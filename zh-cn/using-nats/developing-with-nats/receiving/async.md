# 异步订阅

异步订阅使用某种形式的回调来在消息到达时通知应用程序。这些订阅通常更容易使用，但确实会占用库内部的一些工作和资源（例如线程）。请查阅您所使用的库的文档，了解与异步订阅相关的任何资源使用情况。

_**注意：对于给定的订阅，消息是串行分发的，每次只分发一条消息。如果您的应用程序不关心处理顺序，并希望能够并行处理消息，则应由应用程序自己负责将收到的消息移至某个内部队列，以便由线程或协程进行处理。**_

以下示例订阅主题 `updates` 并处理传入的消息：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Use a WaitGroup to wait for a message to arrive
wg := sync.WaitGroup{}
wg.Add(1)

// Subscribe
if _, err := nc.Subscribe("updates", func(m *nats.Msg) {
    wg.Done()
}); err != nil {
    log.Fatal(err)
}

// Wait for a message to come in
wg.Wait()
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// Use a latch to wait for a message to arrive
CountDownLatch latch = new CountDownLatch(1);

// Create a dispatcher and inline message handler
Dispatcher d = nc.createDispatcher((msg) -> {
    String str = new String(msg.getData(), StandardCharsets.UTF_8);
    System.out.println(str);
    latch.countDown();
});

// Subscribe
d.subscribe("updates");

// Wait for a message to come in
latch.await(); 

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sc = StringCodec();
// this is an example of a callback subscription
// https://github.com/nats-io/nats.js/blob/master/README.md#async-vs-callbacks
nc.subscribe("updates", {
  callback: (err, msg) => {
    if (err) {
      t.error(err.message);
    } else {
      t.log(sc.decode(msg.data));
    }
  },
  max: 1,
});

// here's an iterator subscription - note the code in the
// for loop will block until the iterator completes
// either from a break/return from the iterator, an
// unsubscribe after the message arrives, or in this case
// an auto-unsubscribe after the first message is received
const sub = nc.subscribe("updates", { max: 1 });
for await (const m of sub) {
  t.log(sc.decode(m.data));
}

// subscriptions have notifications, simply wait
// the closed promise
sub.closed
  .then(() => {
    t.log("subscription closed");
  })
  .catch((err) => {
    t.err(`subscription closed with an error ${err.message}`);
  });
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

await nc.subscribe("updates", cb=cb)
await nc.publish("updates", b'All is Well')
await nc.flush()

# Wait for message to come in
msg = await asyncio.wait_for(future, 1)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

// Subscribe to the "updates" subject and receive messages as <string> type.
// The default serializer understands all primitive types, strings,
// byte arrays, and uses JSON for complex types.
await foreach (var msg in client.SubscribeAsync<string>("updates"))
{
    Console.WriteLine($"Received: {msg.Data}");
    
    if (msg.Data == "exit")
    {
        // When we exit the loop, we unsubscribe from the subject
        // as a result of enumeration completion.
        break;
    }
}
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.subscribe("updates") do |msg|
    puts msg
    nc.close
  end

  nc.publish("updates", "All is Well")
end
```
{% endtab %}

{% tab title="C" %}
```c
static void
onMsg(natsConnection *conn, natsSubscription *sub, natsMsg *msg, void *closure)
{
    printf("Received msg: %s - %.*s\n",
           natsMsg_GetSubject(msg),
           natsMsg_GetDataLength(msg),
           natsMsg_GetData(msg));

    // Need to destroy the message!
    natsMsg_Destroy(msg);
}

(...)

natsConnection      *conn = NULL;
natsSubscription    *sub  = NULL;
natsStatus          s;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);
if (s == NATS_OK)
{
    // Creates an asynchronous subscription on subject "foo".
    // When a message is sent on subject "foo", the callback
    // onMsg() will be invoked by the client library.
    // You can pass a closure as the last argument.
    s = natsConnection_Subscribe(&sub, conn, "foo", onMsg, NULL);
}

(...)


// Destroy objects that were created
natsSubscription_Destroy(sub);
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}