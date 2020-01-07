# Queue Subscriptions

Subscribing to a queue group is only slightly different than subscribing to a subject alone. The application simply includes a queue name with the subscription. The effect of including the group is fairly major, since the server will now load balance messages between the members of the queue group, but the code differences are minimal.

Keep in mind that the queue groups in NATS are dynamic and do not require any server configuration. You can almost think of a regular subscription as a queue group of 1, but it is probably not worth thinking too much about that.

![](../../.gitbook/assets/queues.svg)

As an example, to subscribe to the queue `workers` with the subject `updates`:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Use a WaitGroup to wait for 10 messages to arrive
wg := sync.WaitGroup{}
wg.Add(10)

// Create a queue subscription on "updates" with queue name "workers"
if _, err := nc.QueueSubscribe("updates", "workers", func(m *nats.Msg) {
    wg.Done()
}); err != nil {
    log.Fatal(err)
}

// Wait for messages to come in
wg.Wait()
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// Use a latch to wait for 10 messages to arrive
CountDownLatch latch = new CountDownLatch(10);

// Create a dispatcher and inline message handler
Dispatcher d = nc.createDispatcher((msg) -> {
    String str = new String(msg.getData(), StandardCharsets.UTF_8);
    System.out.println(str);
    latch.countDown();
});

// Subscribe
d.subscribe("updates", "workers");

// Wait for a message to come in
latch.await(); 

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222"});

nc.subscribe('updates', {queue: "workers"}, (msg) => {
    t.log('worker got message', msg);
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

await nc.subscribe("updates", queue="workers", cb=cb)
await nc.publish("updates", b'All is Well')

msg = await asyncio.wait_for(future, 1)
print("Msg", msg)
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  Fiber.new do
    f = Fiber.current

    nc.subscribe("updates", queue: "worker") do |msg, reply|
      f.resume Time.now
    end

    nc.publish("updates", "A")

    # Use the response
    msg = Fiber.yield
    puts "Msg: #{msg}"
  end.resume
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
await nc.subscribe('updates', (err, msg) => {
    t.log('worker got message', msg.data);
}, {queue: "workers"});
```
{% endtab %}
{% endtabs %}

If you run this example with the publish examples that send to `updates`, you will see that one of the instances gets a message while the others you run won't. But the instance that receives the message will change.

## Queue Permissions

Added in NATS Server v2.1.2, Queue Permissions allow you to express authorization for queue groups. As queue groups are integral to implementing horizontally scalable microservices, control of who is allowed to join a specific queue group is important to the overall security model.

A Queue Permission can be defined with the syntax `<subject> <queue>`, where the name of the queue can also use wildcards, for example the following would allow clients to join queue groups v1 and v2.\*, but won't allow plain subscriptions:

```text
allow = ["foo v1", "foo v2.*"]
```

The full wildcard can also be used, for example the following would prevent plain subscriptions on `bar` but allow the client to join any queue:

```text
allow = ["bar >"]
```

Permissions for Queue Subscriptions can be combined with plain subscriptions as well though, for example you could allow plain subscriptions on `foo` but constrain the queues to which a client can join, as well as preventing any service from using a queue subscription with the name `*.prod`:

```text
users = [
  {
    user: "foo", permissions: {
      sub: {
        # Allow plain subscription foo, but only v1 groups or *.dev queue groups
        allow: ["foo", "foo v1", "foo v1.>", "foo *.dev"]

        # Prevent queue subscriptions on prod groups
        deny: ["> *.prod"]
     }
  }
]
```

