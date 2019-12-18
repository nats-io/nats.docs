# Unsubscribing After N Messages

NATS provides a special form of unsubscribe that is configured with a message count and takes effect when that many messages are sent to a subscriber. This mechanism is very useful if only a single message is expected.

The message count you provide is the total message count for a subscriber. So if you unsubscribe with a count of 1, the server will stop sending messages to that subscription after it has received one message. If the subscriber has already received one or more messages, the unsubscribe will be immediate. This action based on history can be confusing if you try to auto unsubscribe on a long running subscription, but is logical for a new one.

> Auto unsubscribe is based on the total messages sent to a subscriber, not just the new ones.

Auto unsubscribe can also result in some tricky edge cases if a server cluster is used. The client will tell the server of the unsubscribe count when the application requests it. But if the client disconnects before the count is reached, it may have to tell another server of the remaining count. This dance between previous server notifications and new notifications on reconnect can result in unplanned behavior.

Finally, most of the client libraries also track the max message count after an auto unsubscribe request. Which means that the client will stop allowing messages to flow even if the server has miscounted due to reconnects or some other failure in the client library.

The following example shows unsubscribe after a single message:

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

// Sync Subscription
Subscription sub = nc.subscribe("updates");
sub.unsubscribe(1);

// Async Subscription
d.subscribe("updates");
d.unsubscribe("updates", 1);

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222"
});
// `max` specifies the number of messages that the server will forward.
// The server will auto-cancel.
let opts = {max: 10};
let sub = nc.subscribe(NATS.createInbox(), opts, (msg) => {
    t.log(msg);
});

// another way after 10 messages
let sub2 = nc.subscribe(NATS.createInbox(), (err, msg) => {
    t.log(msg.data);
});
// if the subscription already received 10 messages, the handler
// won't get any more messages
nc.unsubscribe(sub2, 10);
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

{% tab title="TypeScript" %}
```typescript
// `max` specifies the number of messages that the server will forward.
// The server will auto-cancel.
let opts = {max: 10};
let sub = await nc.subscribe(createInbox(), (err, msg) => {
    t.log(msg.data);
}, opts);

// another way after 10 messages
let sub2 = await nc.subscribe(createInbox(), (err, msg) => {
    t.log(msg.data);
});
// if the subscription already received 10 messages, the handler
// won't get any more messages
sub2.unsubscribe(10);
```
{% endtab %}
{% endtabs %}

