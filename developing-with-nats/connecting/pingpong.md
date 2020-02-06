# Ping/Pong Protocol

The client and server use a simple PING/PONG protocol to check that either of them are still connected to the other. On a regular interval he client will ping the server, which responds with a pong. Once a configurable maximum of outstanding pings without a single pong reply is hit, the connection is closed as stale. Together these two values define a timeout for the connection. In the presence of traffic, such as messages or client side pings, the server will not initiate the PING/PONG interaction. 

![](../../.gitbook/assets/pingpong.svg)

If you have a connection that is going to be open a long time with few messages traveling on it, setting the PING interval and/or limit how many are outstanding, can control how quickly the client will be notified of a problem. However on connections with a lot of traffic, the client will often figure out there is a problem between PINGS, and as a result the default PING interval is often on the order of minutes. To set the interval to 20s and limit outstanding pings to 5, thus force a closed connection after 100s of inactivity:

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
let nc = NATS.connect({
    pingInterval: 20*1000, //20s
    maxPingOut: 5,
    url: "nats://demo.nats.io:4222"
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

{% tab title="TypeScript" %}
```typescript
// will throw an exception if connection fails
let nc = await connect({
    pingInterval: 20*1000, //20s
    maxPingOut: 5,
    url: "nats://demo.nats.io:4222"
});
nc.close();
```
{% endtab %}
{% endtabs %}
