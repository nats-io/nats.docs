# Ping/Pong Protocol

The client and server use a simple PING/PONG protocol to check that either of them are still connected to the other. On a regular interval the client will ping the server, which responds with a pong.

![](../../../.gitbook/assets/pingpong.svg)

Once a configurable maximum of outstanding pings without a single pong reply is hit, the connection is closed as stale. Together these two values define a timeout for the connection which specifies how quickly the client will be notified of a problem. This will also help when there is a remote network partition where the operating system does not detect a socket error. Upon connection close, the client will attempt to reconnect. When it knows about other servers, these will be tried next.

In the presence of traffic, such as messages or client side pings, the server will not initiate the PING/PONG interaction.

On connections with a lot of traffic, the client will often figure out there is a problem between PINGS, and as a result the default PING interval is often on the order of minutes. To set the interval to 20s and limit outstanding pings to 5, thus forcing a closed connection after 100s of inactivity:

{% tabs %}
{% tab title="Go" %}
```go
// Set Ping Interval to 20 seconds
nc, err := nats.Connect("demo.nats.io", nats.Name("API Ping Example"), nats.PingInterval(20*time.Second), nats.MaxPingsOutstanding(5))
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
                            pingInterval(Duration.ofSeconds(20)). // Set Ping Interval
                            maxPingsOut(5). // Set max pings in flight
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    pingInterval: 20 * 1000,
    servers: ["demo.nats.io:4222"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   # Set Ping Interval to 20 seconds
   ping_interval=20,
   max_outstanding_pings=5,
   )

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(ping_interval: 20, max_outstanding_pings: 5) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  # Do something with the connection
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsOptions         *opts    = NULL;
natsStatus          s        = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    // Set Ping interval to 20 seconds (20,000 milliseconds)
    s = natsOptions_SetPingInterval(opts, 20000);
if (s == NATS_OK)
    // Set the limit to 5
    s = natsOptions_SetMaxPingsOut(opts, 5);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

