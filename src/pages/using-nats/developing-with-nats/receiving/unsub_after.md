# Unsubscribing After N Messages

NATS provides a special form of unsubscribe that is configured with a message count and takes effect when that many messages are sent to a subscriber. This mechanism is very useful if only a single message is expected.

The message count you provide is the total message count for a subscriber. So if you unsubscribe with a count of 1, the server will stop sending messages to that subscription after it has received one message. If the subscriber has already received one or more messages, the unsubscribe will be immediate. This action based on history can be confusing if you try to auto-unsubscribe on a long running subscription, but is logical for a new one.

Auto-unsubscribe is based on the total messages sent to a subscriber, not just the new ones. Most of the client libraries also track the max message count after an auto-unsubscribe request. On reconnect, this enables clients to resend the unsubscribe with an updated total.

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

