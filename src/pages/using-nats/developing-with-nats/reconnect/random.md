# Avoiding the Thundering Herd

When a server goes down, there is a possible anti-pattern called the _Thundering Herd_ where all of the clients try to reconnect immediately, thus creating a denial of service attack. In order to prevent this, most NATS client libraries randomize the servers they attempt to connect to. This setting has no effect if only a single server is used, but in the case of a cluster, randomization, or shuffling, will ensure that no one server bears the brunt of the client reconnect attempts.

However, if you want to disable the randomization process for connect and reconnect, so that servers are always checked in the same order, you can do that in most libraries with a connection option:

{% tabs %}
{% tab title="Go" %}
```go
servers := []string{"nats://127.0.0.1:1222",
    "nats://127.0.0.1:1223",
    "nats://127.0.0.1:1224",
}

nc, err := nats.Connect(strings.Join(servers, ","), nats.DontRandomize())
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
                            noRandomize(). // Disable reconnect shuffle
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    noRandomize: false,
    servers: ["127.0.0.1:4443", "demo.nats.io"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
   servers=[
      "nats://demo.nats.io:1222",
      "nats://demo.nats.io:1223",
      "nats://demo.nats.io:1224"
      ],
   dont_randomize=True,
   )

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"], dont_randomize_servers: true) do |nc|
   # Do something with the connection

   # Close the connection
   nc.close
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;
const char          *servers[] = {"nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"};

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetServers(opts, servers, 3);
if (s == NATS_OK)
    s = natsOptions_SetNoRandomize(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

