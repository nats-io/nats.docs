# Request-Reply Semantics

The pattern of sending a message and receiving a response is encapsulated in most client libraries into a request method. Under the covers this method will publish a message with a unique reply-to subject and wait for the response before returning.

In the older versions of some libraries a completely new reply-to subject is created each time. In newer versions, a subject hierarchy is used so that a single subscriber in the client library listens for a wildcard, and requests are sent with a unique child subject of a single subject.

The primary difference between the request method and publishing with a reply-to is that the library is only going to accept one response, and in most libraries the request will be treated as a synchronous action. The library may even provide a way to set the timeout.

For example, updating the previous publish example we may request `time` with a one second timeout:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Send the request
msg, err := nc.Request("time", nil, time.Second)
if err != nil {
    log.Fatal(err)
}

// Use the response
log.Printf("Reply: %s", msg.Data)

// Close the connection
nc.Close()
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// Send the request
Message msg = nc.request("time", null, Duration.ofSeconds(1));

// Use the response
System.out.println(new String(msg.getData(), StandardCharsets.UTF_8));

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// set up a subscription to process the request
const sc = StringCodec();
nc.subscribe("time", {
  callback: (_err, msg) => {
    msg.respond(sc.encode(new Date().toLocaleTimeString()));
  },
});

const r = await nc.request("time");
t.log(sc.decode(r.data));
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def sub(msg):
  await nc.publish(msg.reply, b'response')

await nc.connect(servers=["nats://demo.nats.io:4222"])
await nc.subscribe("time", cb=sub)

# Send the request
try:
  msg = await nc.request("time", b'', timeout=1)
  # Use the response
  print("Reply:", msg)
except asyncio.TimeoutError:
  print("Timed out waiting for response")
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.subscribe("time") do |msg, reply|
    nc.publish(reply, "response")
  end

  Fiber.new do
    # Use the response
    msg = nc.request("time", "")
    puts "Reply: #{msg}"
  end.resume
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsMsg             *msg       = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// Send a request and wait for up to 1 second
if (s == NATS_OK)
    s = natsConnection_RequestString(&msg, conn, "request", "this is the request", 1000);

if (s == NATS_OK)
{
    printf("Received msg: %s - %.*s\n",
           natsMsg_GetSubject(msg),
           natsMsg_GetDataLength(msg),
           natsMsg_GetData(msg));

    // Destroy the message that was received
    natsMsg_Destroy(msg);
}

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

You can think of request-reply in the library as a subscribe, get one message, unsubscribe pattern. In Go this might look something like:

```go
sub, err := nc.SubscribeSync(replyTo)
if err != nil {
    log.Fatal(err)
}

// Send the request immediately
nc.PublishRequest(subject, replyTo, []byte(input))
nc.Flush()

// Wait for a single response
for {
    msg, err := sub.NextMsg(1 * time.Second)
    if err != nil {
        log.Fatal(err)
    }

    response = string(msg.Data)
    break
}
sub.Unsubscribe()
```

## Scatter-Gather

You can expand the request-reply pattern into something often called scatter-gather. To receive multiple messages, with a timeout, you could do something like the following, where the loop getting messages is using time as the limitation, not the receipt of a single message:

```go
sub, err := nc.SubscribeSync(replyTo)
if err != nil {
    log.Fatal(err)
}
nc.Flush()

// Send the request
nc.PublishRequest(subject, replyTo, []byte(input))

// Wait for a single response
max := 100 * time.Millisecond
start := time.Now()
for time.Now().Sub(start) < max {
    msg, err := sub.NextMsg(1 * time.Second)
    if err != nil {
        break
    }

    responses = append(responses, string(msg.Data))
}
sub.Unsubscribe()
```

Or, you can loop on a counter and a timeout to try to get _at least N_ responses:

```go
sub, err := nc.SubscribeSync(replyTo)
if err != nil {
    log.Fatal(err)
}
nc.Flush()

// Send the request
nc.PublishRequest(subject, replyTo, []byte(input))

// Wait for a single response
max := 500 * time.Millisecond
start := time.Now()
for time.Now().Sub(start) < max {
    msg, err := sub.NextMsg(1 * time.Second)
    if err != nil {
        break
    }

    responses = append(responses, string(msg.Data))

    if len(responses) >= minResponses {
        break
    }
}
sub.Unsubscribe()
```

