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

{% tabs %}
{% tab title="Go" %}
```go
// Be notified if a new server joins the cluster.
// Print all the known servers and the only the ones that were discovered.
nc, err := nats.Connect("demo.nats.io",
    nats.DiscoveredServersHandler(func(nc *nats.Conn) {
        log.Printf("Known servers: %v\n", nc.Servers())
        log.Printf("Discovered servers: %v\n", nc.DiscoveredServers())
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
class ServersAddedListener implements ConnectionListener {
    public void connectionEvent(Connection nc, Events event) {
        if (event == Events.DISCOVERED_SERVERS) {
            for (String server : nc.getServers()) {
                System.out.println("Known server: "+server);
            }
        }
    }
}

public class ListenForNewServers {
    public static void main(String[] args) {

        try {
            Options options = new Options.Builder().
                                        server("nats://demo.nats.io:4222").
                                        connectionListener(new ServersAddedListener()). // Set the listener
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
nc.on('serversDiscovered', (urls) => {
    t.log('serversDiscovered', urls);
});
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS client does not support discovered servers handler right now
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
r# The Ruby NATS client does not support discovered servers handler right now
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
nc.on('serversChanged', (ce) => {
    t.log('servers changed\n', 'added: ',ce.added, 'removed:', ce.removed);
});
```
{% endtab %}
{% endtabs %}

## Listen for Errors

The client library may separate server-to-client errors from events. Many server events are not handled by application code and result in the connection being closed. Listening for the errors can be very useful for debugging problems.

{% tabs %}
{% tab title="Go" %}
```go
// Set the callback that will be invoked when an asynchronous error occurs.
nc, err := nats.Connect("demo.nats.io",
    nats.ErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) {
        log.Printf("Error: %v", err)
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
class MyErrorListener implements ErrorListener {
    public void errorOccurred(Connection conn, String error)
    {
        System.out.println("The server notificed the client with: "+error);
    }

    public void exceptionOccurred(Connection conn, Exception exp) {
        System.out.println("The connection handled an exception: "+exp.getLocalizedMessage());
    }

    public void slowConsumerDetected(Connection conn, Consumer consumer) {
        System.out.println("A slow consumer was detected.");
    }
}

public class SetErrorListener {
    public static void main(String[] args) {

        try {
            Options options = new Options.Builder().
                                        server("nats://demo.nats.io:4222").
                                        errorListener(new MyErrorListener()). // Set the listener
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

// on node you *must* register an error listener. If not registered
// the library emits an 'error' event, the node process will exit.
nc.on('error', (err) => {
    t.log('client got an error:', err);
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def error_cb(e):
   print("Error: ", e)

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   reconnect_time_wait=10,
   error_cb=error_cb,
   )

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers:["nats://demo.nats.io:4222"]) do |nc|
   nc.on_error do |e|
    puts "Error: #{e}"
  end

  nc.close
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// on node you *must* register an error listener. If not registered
// the library emits an 'error' event, the node process will exit.
nc.on('error', (err) => {
    t.log('client got an out of band error:', err);
});
```
{% endtab %}
{% endtabs %}

