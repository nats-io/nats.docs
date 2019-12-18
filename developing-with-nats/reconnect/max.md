# Set the Number of Reconnect Attempts

Applications can set the maximum reconnect attempts. Generally, this will limit the actual number of attempts total, but check your library documentation. For example, in Java, if the client knows about 3 servers and the maximum reconnects is set to 2, it will not try all of the servers. On the other hand, if the maximum is set to 6 it will try all of the servers twice before considering the reconnect a failure and closing.

{% tabs %}
{% tab title="Go" %}
```go
// Set max reconnects attempts
nc, err := nats.Connect("demo.nats.io", nats.MaxReconnects(10))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            maxReconnects(10). // Set max reconnect attempts
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    maxReconnectAttempts: 10,
    servers: ["nats://demo.nats.io:4222"]
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   max_reconnect_attempts=10,
   )

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"], max_reconnect_attempts: 10) do |nc|
   # Do something with the connection

   # Close the connection
   nc.close
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// will throw an exception if connection fails
let nc = await connect({
    maxReconnectAttempts: 10,
    servers: ["nats://demo.nats.io:4222"]
});
nc.close();
```
{% endtab %}
{% endtabs %}

