# Unsubscribing

The client libraries provide a means to unsubscribe a previous subscription request.

This process requires an interaction with the server, so for an asynchronous subscription there may be a small window of time where a message comes through as the unsubscribe is processed by the library. Ignoring that slight edge case, the client library will clean up any outstanding messages and tell the server that the subscription is no longer used.

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

// Sync Subscription
Subscription sub = nc.subscribe("updates");
sub.unsubscribe();

// Async Subscription
d.subscribe("updates");
d.unsubscribe("updates");

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222"
});
// set up a subscription to process a request
let sub = nc.subscribe(NATS.createInbox(), (msg, reply) => {
    if (msg.reply) {
        nc.publish(reply, new Date().toLocaleTimeString());
    }
});

// without arguments the subscription will cancel when the server receives it
// you can also specify how many messages are expected by the subscription
nc.unsubscribe(sub);
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

sid = await nc.subscribe("updates", cb=cb)
await nc.publish("updates", b'All is Well')

# Remove interest in subject
await nc.unsubscribe(sid)

# Won't be received...
await nc.publish("updates", b'...')

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

{% tab title="TypeScript" %}
```typescript
// set up a subscription to process a request
let sub = await nc.subscribe(createInbox(), (err, msg) => {
    if (msg.reply) {
        nc.publish(msg.reply, new Date().toLocaleTimeString());
    } else {
        t.log('got a request for the time, but no reply subject was set.');
    }
});

// without arguments the subscription will cancel when the server receives it
// you can also specify how many messages are expected by the subscription
sub.unsubscribe();
```
{% endtab %}
{% endtabs %}

