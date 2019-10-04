# Replying to a Message

Incoming messages have an optional reply-to field. If that field is set, it will contain a subject to which a reply is expected.

For example, the following code will listen for that request and respond with the time.

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

// Subscribe
Subscription sub = nc.subscribe("time");

// Read a message
Message msg = sub.nextMessage(Duration.ZERO);

// Get the time
Calendar cal = Calendar.getInstance();
SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss");
byte[] timeAsBytes = sdf.format(cal.getTime()).getBytes(StandardCharsets.UTF_8);

// Send the time
nc.publish(msg.getReplyTo(), timeAsBytes);

// Flush and close the connection
nc.flush(Duration.ZERO);
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222"
});

// set up a subscription to process a request
nc.subscribe('time', (msg, reply) => {
    if (msg.reply) {
        nc.publish(msg.reply, new Date().toLocaleTimeString());
    }
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

{% tab title="TypeScript" %}
```typescript
// set up a subscription to process a request
await nc.subscribe('time', (err, msg) => {
    if (msg.reply) {
        nc.publish(msg.reply, new Date().toLocaleTimeString());
    } else {
        t.log('got a request for the time, but no reply subject was set.');
    }
});
```
{% endtab %}
{% endtabs %}

