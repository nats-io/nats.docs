# Pausing Between Reconnect Attempts

It doesn’t make much sense to try to connect to the same server over and over. To prevent this sort of thrashing, and wasted reconnect attempts, libraries provide a wait setting. This setting will pause the reconnect logic if the same server is being tried multiple times **in a row**. In the previous example, if you have 3 servers and 6 attempts, the Java library would loop over the three servers. If none were connectable, it will then try all three again. However, the Java client doesn’t wait between each attempt, only when trying the same server again, so in that example the library may never wait. If on the other hand, you only provide a single server URL and 6 attempts, the library will wait between each attempt.

{% tabs %}
{% tab title="Go" %}
```go
// Set reconnect interval to 10 seconds
nc, err := nats.Connect("demo.nats.io", nats.ReconnectWait(10*time.Second))
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
                            reconnectWait(Duration.ofSeconds(10)).  // Set Reconnect Wait
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    reconnectTimeWait: 10 * 1000, //10s
    servers: ["nats://demo.nats.io:4222"]
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   reconnect_time_wait=10,
   )

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"], reconnect_time_wait: 10) do |nc|
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
    reconnectTimeWait: 10*1000, //10s
    servers: ["nats://demo.nats.io:4222"]
});
nc.close();
```
{% endtab %}
{% endtabs %}

