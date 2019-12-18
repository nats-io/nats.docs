# Caches, Flush and Ping

For performance reasons, most if not all, of the client libraries will cache outgoing data so that bigger chunks can be written to the network at one time. This may be as simple as a byte buffer that stores up a few messages before being pushed to the network.

These buffers do not hold messages forever, generally they are designed to hold messages in high throughput scenarios, while still providing good latency in low throughput situations.

It is the libraries job to make sure messages flow in a high performance manner. But there may be times when an application needs to know that a message has "hit the wire." In this case, applications can use a flush call to tell the library to move data through the system.

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Just to not collide using the demo server with other users.
subject := nats.NewInbox()

if err := nc.Publish(subject, []byte("All is Well")); err != nil {
    log.Fatal(err)
}
// Sends a PING and wait for a PONG from the server, up to the given timeout.
// This gives guarantee that the server has processed the above message.
if err := nc.FlushTimeout(time.Second); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

nc.publish("updates", "All is Well".getBytes(StandardCharsets.UTF_8));
nc.flush(Duration.ofSeconds(1)); // Flush the message queue

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({url: "nats://demo.nats.io:4222"});
let start = Date.now();
nc.flush(() => {
    t.log('round trip completed in', Date.now() - start, 'ms');
});

nc.publish('foo');
// function in flush is optional
nc.flush();
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

await nc.publish("updates", b'All is Well')

# Sends a PING and wait for a PONG from the server, up to the given timeout.
# This gives guarantee that the server has processed above message.
await nc.flush(timeout=1)
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.subscribe("updates") do |msg|
    puts msg
  end

  nc.publish("updates", "All is Well")

  nc.flush do
    # Sends a PING and wait for a PONG from the server, up to the given timeout.
    # This gives guarantee that the server has processed above message at this point.
  end
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
let nc = await connect({
    url: "nats://demo.nats.io:4222"
});

// you can use flush to trigger a function in your
// application once the round-trip to the server finishes
let start = Date.now();
nc.flush(() => {
    t.log('round trip completed in', Date.now() - start, 'ms');
});

nc.publish('foo');

// another way, simply wait for the promise to resolve
await nc.flush();

nc.close();
```
{% endtab %}
{% endtabs %}

## Flush and Ping/Pong

Many of the client libraries use the PING/PONG interaction built into the NATS protocol to insure that flush pushed all of the cached messages to the server. When an application calls flush most libraries will put a PING on the outgoing queue of messages, and wait for the server to send PONG before saying that the flush was successful.

