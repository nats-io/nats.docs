# Listening for Reconnect Events

Because reconnect is primarily under the covers many libraries provide an event listener you can use to be notified of reconnect events. This event can be especially important for applications sending a lot of messages.

{% tabs %}
{% tab title="Go" %}
```go
// Connection event handlers are invoked asynchronously
// and the state of the connection may have changed when
// the callback is invoked.
nc, err := nats.Connect("demo.nats.io",
    nats.DisconnectHandler(func(nc *nats.Conn) {
        // handle disconnect event
    }),
    nats.ReconnectHandler(func(nc *nats.Conn) {
        // handle reconnect event
    }))
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
                            connectionListener((conn, type) -> {
                                if (type == Events.RECONNECTED) {
                                    // handle reconnected
                                } else if (type == Events.DISCONNECTED) {
                                    // handle disconnected, wait for reconnect
                                }
                            }).
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

nc.on('reconnect', (c) => {
    console.log('reconnected');
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def disconnected_cb():
   print("Got disconnected!")

async def reconnected_cb():
   # See who we are connected to on reconnect.
   print("Got reconnected to {url}".format(url=nc.connected_url.netloc))

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   reconnect_time_wait=10,
   reconnected_cb=reconnected_cb,
   disconnected_cb=disconnected_cb,
   )

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"]) do |nc|
   # Do something with the connection
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end
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
// first argument is the connection (same as nc in this case)
// second argument is the url of the server where the client
// connected
nc.on('reconnect', (conn, server) => {
    console.log('reconnected to', server);
});
nc.close();
```
{% endtab %}
{% endtabs %}

