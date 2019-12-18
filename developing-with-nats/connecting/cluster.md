# Connecting to a Cluster

When connecting to a cluster, there are a few things to think about.

* Passing a URL for each cluster member \(semi-optional\)
* The connection algorithm
* The reconnect algorithm \(discussed later\)
* Server provided URLs

When a client library first tries to connect it will use the list of URLs provided to the connection options or function. These URLs are checked, usually in order, and the first successful connection is used.

After a client connects to the server, the server may provide a list of URLs for additional known servers. This allows a client to connect to one server and still have other servers available during reconnect.

To insure the initial connection, your code should include a list of reasonable _front line_ servers. Those servers may know about other members of the cluster, and may tell the client about those members. But you don't have to configure the client to pass every valid member of the cluster in the connect method.

By providing the ability to pass multiple connect options NATS can handle the possibility of a machine going down or being unavailable to a client. By adding the ability of the server to feed clients a list of known servers as part of the client-server protocol the mesh created by a cluster can grow and change organically while the clients are running.

_Note, failure behavior is library dependent, please check the documentation for your client library on information about what happens if the connect fails._

{% tabs %}
{% tab title="Go" %}
```go
servers := []string{"nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"}

nc, err := nats.Connect(strings.Join(servers, ","))
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
                            server("nats://localhost:1222").
                            server("nats://localhost:1223").
                            server("nats://localhost:1224").
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    servers: [
        "nats://demo.nats.io:4222",
        "nats://localhost:4222"
    ]}
);
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
await nc.connect(servers=[
   "nats://127.0.0.1:1222",
   "nats://127.0.0.1:1223",
   "nats://127.0.0.1:1224"
   ])

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"]) do |nc|
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
        servers: [
            "nats://demo.nats.io:4222",
            "nats://localhost:4222"
        ]
});
// Do something with the connection

// When done close it
nc.close();
```
{% endtab %}
{% endtabs %}

