# Setting a Connect Timeout

Each library has its own, language preferred way, to pass connection options. One of the most common options is a connect timeout. It limits how long it can take to establish a connection to a server. Should multiple URLs be provided, this timeout applies to each cluster member individually. To set the maximum time to connect to a server to 10 seconds:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API Options Example"), nats.Timeout(10*time.Second))
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
                            connectionTimeout(Duration.ofSeconds(10)). // Set timeout
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222",
    timeout: 10*1000 //10s
});
nc.on('connect', (c) => {
    // Do something with the connection
    doSomething();
    // When done close it
    nc.close();
});
nc.on('error', (err) => {
    failed(err);
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
  servers=["nats://demo.nats.io:4222"],
  connect_timeout=10)

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# There is currently no connect timeout as part of the Ruby NATS client API, but you can use a timer to mimic it.
require 'nats/client'

timer = EM.add_timer(10) do
  NATS.connect do |nc|
    # Do something with the connection

    # Close the connection
    nc.close
  end
end
EM.cancel_timer(timer)
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
let nc = await connect({
    url: "nats://demo.nats.io:4222",
    timeout: 10*1000 //10s
});
```
{% endtab %}
{% endtabs %}

