# Asynchronous Subscriptions

Asynchronous subscriptions use callbacks of some form to notify an application when a message arrives. These subscriptions are usually easier to work with, but do represent some form of internal work and resource usage, i.e. threads, by the library. Check your library's documentation for any resource usage associated with asynchronous subscriptions.

The following example subscribes to the subject `updates` and handles the incoming messages:

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
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222"
});
nc.subscribe("updates", (msg) => {
    t.log(msg);
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

{% tab title="TypeScript" %}
```typescript
nc.subscribe("updates", (err, msg) => {
    if(err) {
        console.log('error', err);
    } else {
        t.log(msg.data);
    }
});
```
{% endtab %}
{% endtabs %}

