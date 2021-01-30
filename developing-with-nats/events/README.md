# Monitoring the Connection

Managing the interaction with the server is primarily the job of the client library but most of the libraries also provide some insight into what is happening under the covers.

For example, the client library may provide a mechanism to get the connection's current status:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API Example"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

getStatusTxt := func(nc *nats.Conn) string {
    switch nc.Status() {
    case nats.CONNECTED:
        return "Connected"
    case nats.CLOSED:
        return "Closed"
    default:
        return "Other"
    }
}
log.Printf("The connection is %v\n", getStatusTxt(nc))

log.Printf("The connection is %v\n", getStatusTxt(nc))
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

System.out.println("The Connection is: " + nc.getStatus());

nc.close();

System.out.println("The Connection is: " + nc.getStatus());
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect("nats://demo.nats.io:4222");

// on node you *must* register an error listener. If not registered
// the library emits an 'error' event, the node process will exit.
nc.on('error', (err) => {
    t.log('client got an error:', err);
});

if(nc.closed) {
    t.log('client is closed');
} else {
    t.log('client is not closed');
}
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   )

# Do something with the connection.

print("The connection is connected?", nc.is_connected)

while True:
  if nc.is_reconnecting:
    print("Reconnecting to NATS...")
    break
  await asyncio.sleep(1)

await nc.close()

print("The connection is closed?", nc.is_closed)
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start(max_reconnect_attempts: 2) do |nc|
  puts "Connect is connected?: #{nc.connected?}"

  timer = EM.add_periodic_timer(1) do
    if nc.closing?
      puts "Connection closed..."
      EM.cancel_timer(timer)
      NATS.stop
    end

    if nc.reconnecting?
      puts "Reconnecting to NATS..."
      next
    end
  end
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
if(nc.isClosed()) {
    t.log('the client is closed');
} else {
    t.log('the client is running');
}
```
{% endtab %}
{% endtabs %}

