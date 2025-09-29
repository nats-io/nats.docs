# 回复消息

传入的消息可能包含一个可选的回复到字段（reply-to field）。如果设置了该字段，它将包含一个预期回复到的主题。

例如，以下代码将监听该请求，并以当前时间作为响应。

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Subscribe
sub, err := nc.SubscribeSync("time")
if err != nil {
    log.Fatal(err)
}

// Read a message
msg, err := sub.NextMsg(10 * time.Second)
if err != nil {
    log.Fatal(err)
}

// Get the time
timeAsBytes := []byte(time.Now().String())

// Send the time as the response.
msg.Respond(timeAsBytes)
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// Subscribe to the "time" subject and reply with the current time
Subscription sub = nc.subscribe("time");

// Read a message
Message msg = sub.nextMessage(Duration.ZERO);

// Get the time
Calendar cal = Calendar.getInstance();
SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
byte[] timeAsBytes = sdf.format(cal.getTime()).getBytes(StandardCharsets.UTF_8);

// Send the time to the reply to subject
nc.publish(msg.getReplyTo(), timeAsBytes);

// Flush and close the connection
nc.flush(Duration.ZERO);
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sc = StringCodec();
// set up a subscription to process a request
const sub = nc.subscribe("time");
for await (const m of sub) {
  m.respond(sc.encode(new Date().toLocaleDateString()));
}
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

await nc.subscribe("time", cb=cb)

await nc.publish_request("time", new_inbox(), b'What is the time?')
await nc.flush()

# Read the message
msg = await asyncio.wait_for(future, 1)

# Send the time
time_as_bytes = "{}".format(datetime.now()).encode()
await nc.publish(msg.reply, time_as_bytes)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

// Subscribe to the "time" subject and reply with the current time
await foreach (var msg in client.SubscribeAsync<string>("time"))
{
    await msg.ReplyAsync(DateTime.Now);
}
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  Fiber.new do
    f = Fiber.current

    nc.subscribe("time") do |msg, reply|
      f.resume Time.now
    end

    nc.publish("time", 'What is the time?', NATS.create_inbox)

    # Use the response
    msg = Fiber.yield
    puts "Reply: #{msg}"

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
    s = natsConnection_SubscribeSync(&sub, conn, "time");

// Wait for messages
if (s == NATS_OK)
    s = natsSubscription_NextMsg(&msg, sub, 10000);

if (s == NATS_OK)
{
    char buf[64];

    snprintf(buf, sizeof(buf), "%lld", nats_Now());

    // Send the time as a response
    s = natsConnection_Publish(conn, natsMsg_GetReply(msg), buf, (int) strlen(buf));

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