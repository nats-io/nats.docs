# Setting the Connection Name

Connections can be assigned a name which will appear in some of the server monitoring data. This name is not required, but is **highly recommended** as a friendly connection name will help in monitoring, error reporting, debugging, and testing.

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API Name Option Example"))
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
                            connectionName("API Name Option Example"). // Set Name
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
    name: "API Name Option Example"
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
    name="API Name Option Example")

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://demo.nats.io:4222"], name: "API Name Option Example") do |nc|
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
    url:"nats://demo.nats.io:4222", 
    name: "API Name Option Example"
})
// Do something with the connection

// Close the connection
nc.close();
```
{% endtab %}
{% endtabs %}