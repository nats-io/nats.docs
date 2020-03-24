# Slow Consumers

NATS is designed to move messages through the server quickly. As a result, NATS depends on the applications to consider and respond to changing message rates. The server will do a bit of impedance matching, but if a client is too slow the server will eventually cut them off by closing the connection. These cut off connections are called [_slow consumers_](../../nats-server/nats_admin/slow_consumers.md).

One way some of the libraries deal with bursty message traffic is to buffer incoming messages for a subscription. So if an application can handle 10 messages per second and sometimes receives 20 messages per second, the library may hold the extra 10 to give the application time to catch up. To the server, the application will appear to be handling the messages and consider the connection healthy. Most client libraries will notify the application that there is a SlowConsumer error and discard messages.

Receiving and dropping messages from the server keeps the connection to the server healthy, but creates an application requirement. There are several common patterns:

* Use request/reply to throttle the sender and prevent overloading the subscriber
* Use a queue with multiple subscribers splitting the work
* Persist messages with something like NATS streaming

Libraries that cache incoming messages may provide two controls on the incoming queue, or pending messages. These are useful if the problem is bursty publishers and not a continuous performance mismatch. Disabling these limits can be dangerous in production and although setting these limits to 0 may help find problems, it is also a dangerous proposition in production.

> Check your libraries documentation for the default settings, and support for disabling these limits.

The incoming cache is usually per subscriber, but again, check the specific documentation for your client library.

## Limiting Incoming/Pending Messages by Count and Bytes

The first way that the incoming queue can be limited is by message count. The second way to limit the incoming queue is by total size. For example, to limit the incoming cache to 1,000 messages or 5mb whichever comes first:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Subscribe
sub1, err := nc.Subscribe("updates", func(m *nats.Msg) {})
if err != nil {
    log.Fatal(err)
}

// Set limits of 1000 messages or 5MB, whichever comes first
sub1.SetPendingLimits(1000, 5*1024*1024)

// Subscribe
sub2, err := nc.Subscribe("updates", func(m *nats.Msg) {})
if err != nil {
    log.Fatal(err)
}

// Set no limits for this subscription
sub2.SetPendingLimits(-1, -1)

// Close the connection
nc.Close()
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

Dispatcher d = nc.createDispatcher((msg) -> {
    // do something
});

d.subscribe("updates");

d.setPendingLimits(1_000, 5 * 1024 * 1024); // Set limits on a dispatcher

// Subscribe
Subscription sub = nc.subscribe("updates");

sub.setPendingLimits(1_000, 5 * 1024 * 1024); // Set limits on a subscription

// Do something

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// slow pending limits are not configurable on node-nats
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

future = asyncio.Future()

async def cb(msg):
  nonlocal future
  future.set_result(msg)

# Set limits of 1000 messages or 5MB
await nc.subscribe("updates", cb=cb, pending_bytes_limit=5*1024*1024, pending_msgs_limit=1000)
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# The Ruby NATS client currently does not have option to specify a subscribers pending limits.
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// slow pending limits are not configurable on TypeScript NATS client.
```
{% endtab %}
{% endtabs %}

## Detect a Slow Consumer and Check for Dropped Messages

When a slow consumer is detected and messages are about to be dropped, the library may notify the application. This process may be similar to other errors or may involve a custom callback.

Some libraries, like Java, will not send this notification on every dropped message because that could be noisy. Rather the notification may be sent once per time the subscriber gets behind. Libraries may also provide a way to get a count of dropped messages so that applications can at least detect a problem is occurring.

{% tabs %}
{% tab title="Go" %}
```go
// Set the callback that will be invoked when an asynchronous error occurs.
nc, err := nats.Connect("demo.nats.io", nats.ErrorHandler(logSlowConsumer))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
class SlowConsumerReporter implements ErrorListener {
    public void errorOccurred(Connection conn, String error)
    {
    }

    public void exceptionOccurred(Connection conn, Exception exp) {
    }

    // Detect slow consumers
    public void slowConsumerDetected(Connection conn, Consumer consumer) {
        // Get the dropped count
        System.out.println("A slow consumer dropped messages: "+ consumer.getDroppedCount());
    }
}

public class SlowConsumerListener {
    public static void main(String[] args) {

        try {
            Options options = new Options.Builder().
                                        server("nats://demo.nats.io:4222").
                                        errorListener(new SlowConsumerReporter()). // Set the listener
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
// slow consumer detection is not configurable on NATS JavaScript client.
```
{% endtab %}

{% tab title="Python" %}
```python
   nc = NATS()

   async def error_cb(e):
     if type(e) is nats.aio.errors.ErrSlowConsumer:
       print("Slow consumer error, unsubscribing from handling further messages...")
       await nc.unsubscribe(e.sid)

   await nc.connect(
      servers=["nats://demo.nats.io:4222"],
      error_cb=error_cb,
      )

   msgs = []
   future = asyncio.Future()
   async def cb(msg):
       nonlocal msgs
       nonlocal future
       print(msg)
       msgs.append(msg)

       if len(msgs) == 3:
         # Head of line blocking on other messages caused
         # by single message processing taking too long...
         await asyncio.sleep(1)

   await nc.subscribe("updates", cb=cb, pending_msgs_limit=5)

   for i in range(0, 10):
     await nc.publish("updates", "msg #{}".format(i).encode())
     await asyncio.sleep(0)

   try:
     await asyncio.wait_for(future, 1)
   except asyncio.TimeoutError:
     pass

   for msg in msgs:
     print("[Received]", msg)

   await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# The Ruby NATS client currently does not have option to customize slow consumer limits per sub.
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// slow consumer detection is not configurable on NATS TypeScript client.
```
{% endtab %}
{% endtabs %}

