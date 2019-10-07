# Listen for Connection Events

While the connection status is interesting, it is perhaps more interesting to know when the status changes. Most, if not all, of the NATS client libraries provide a way to listen for events related to the connection and its status.

The actual API for these listeners is language dependent, but the following examples show a few of the more common use cases. See the API documentation for the client library you are using for more specific instructions.

Connection events may include the connection being closed, disconnected or reconnected. Reconnecting involves a disconnect and connect, but depending on the library implementation may also include multiple disconnects as the client tries to find a server, or the server is rebooted.

{% tabs %}
{% tab title="Go" %}
```go
// There is not a single listener for connection events in the NATS Go Client.
// Instead, you can set individual event handlers using:

DisconnectHandler(cb ConnHandler)
ReconnectHandler(cb ConnHandler)
ClosedHandler(cb ConnHandler)
DiscoveredServersHandler(cb ConnHandler)
ErrorHandler(cb ErrHandler)
```
{% endtab %}

{% tab title="Java" %}
```java
class MyConnectionListener implements ConnectionListener {
    public void connectionEvent(Connection natsConnection, Events event) {
        System.out.println("Connection event - "+event);
    }
}

public class SetConnectionListener {
    public static void main(String[] args) {

        try {
            Options options = new Options.Builder().
                                        server("nats://demo.nats.io:4222").
                                        connectionListener(new MyConnectionListener()). // Set the listener
                                        build();
            Connection nc = Nats.connect(options);

            // Do something with the connection

            nc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect("nats://demo.nats.io:4222");

nc.on('error', (err) => {
    t.log('error', err);
});

nc.on('connect', () => {
    t.log('client connected');
});

nc.on('disconnect', () => {
    t.log('client disconnected');
});

nc.on('reconnecting', () => {
    t.log('client reconnecting');
});

nc.on('reconnect', () => {
    t.log('client reconnected');
});

nc.on('close', () => {
    t.log('client closed');
});

nc.on('permission_error', (err) => {
    t.log('permission_error', err);
});
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS client can be defined a number of event callbacks
async def disconnected_cb():
    print("Got disconnected!")

async def reconnected_cb():
    # See who we are connected to on reconnect.
    print("Got reconnected to {url}".format(url=nc.connected_url.netloc))

async def error_cb(e):
    print("There was an error: {}".format(e))

async def closed_cb():
    print("Connection is closed")

# Setup callbacks to be notified on disconnects and reconnects
options["disconnected_cb"] = disconnected_cb
options["reconnected_cb"] = reconnected_cb

# Setup callbacks to be notified when there is an error
# or connection is closed.
options["error_cb"] = error_cb
options["closed_cb"] = closed_cb

await nc.connect(**options)
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
r# There is not a single listener for connection events in the Ruby NATS Client.
# Instead, you can set individual event handlers using:

NATS.on_disconnect do
end

NATS.on_reconnect do
end

NATS.on_close do
end

NATS.on_error do
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// connect will happen once - the first connect
nc.on('connect', (nc) => {
    // nc is the connection that connected
    t.log('client connected');
});

nc.on('disconnect', (url) => {
    // nc is the connection that reconnected
    t.log('disconnected from', url);
});

nc.on('reconnecting', (url) => {
    t.log('reconnecting to', url);
});

nc.on('reconnect', (nc, url) => {
    // nc is the connection that reconnected
    t.log('reconnected to', url);
});
```
{% endtab %}
{% endtabs %}

## Listen for New Servers

When working with a cluster, servers may be added or changed. Some of the clients allow you to listen for this notification:

!INCLUDE "../../\_examples/servers\_added.html"

## Listen for Errors

The client library may separate server-to-client errors from events. Many server events are not handled by application code and result in the connection being closed. Listening for the errors can be very useful for debugging problems.

!INCLUDE "../../\_examples/error\_listener.html"

