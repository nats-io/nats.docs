# Ping/Pong Protocol

The client and server use a simple PING/PONG protocol to check that they are both still connected. The client will ping the server on a regular, configured interval so that the server usually doesn't have to initiate the PING/PONG interaction.

![](../../.gitbook/assets/pingpong.svg)

## Set the Ping Interval

If you have a connection that is going to be open a long time with few messages traveling on it, setting this PING interval can control how quickly the client will be notified of a problem. However on connections with a lot of traffic, the client will often figure out there is a problem between PINGS, and as a result the default PING interval is often on the order of minutes. To set the interval to 20s:

{% tabs %}
{% tab title="Go" %}
```go
// Set Ping Interval to 20 seconds
nc, err := nats.Connect("demo.nats.io", nats.Name("API Ping Example"), nats.PingInterval(20*time.Second))
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
   )

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(ping_interval: 20) do |nc|
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
    url: "nats://demo.nats.io:4222"
});
nc.close();
```
{% endtab %}
{% endtabs %}

## Limit Outgoing Pings

The PING/PONG interaction is also used by most of the clients as a way to flush the connection to the server. Clients that cache outgoing messages provide a flush call that will run a PING/PONG. The flush will wait for the PONG to return, telling it that all cached messages have been processed, including the PING. The number of cached PING requests can be limited in most clients to insure that traffic problems are identified early. This configuration for _max outgoing pings_ or similar will usually default to a small number and should only be increased if you are worried about fast flush traffic, perhaps in multiple threads.

For example, to set the maximum number of outgoing pings to 5:

{% tabs %}
{% tab title="Go" %}
```go
// Set maximum number of PINGs out without getting a PONG back
	// before the connection will be disconnected as a stale connection.
	nc, err := nats.Connect("demo.nats.io", nats.Name("API MaxPing Example"), nats.MaxPingsOutstanding(5))
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
   # Set maximum number of PINGs out without getting a PONG back
   # before the connection will be disconnected as a stale connection.
   max_outstanding_pings=5,
   ping_interval=1,
   )

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(max_outstanding_pings: 5) do |nc|
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
    maxPingOut: 5,
    url: "nats://demo.nats.io:4222"
});
nc.close();
```
{% endtab %}
{% endtabs %}

