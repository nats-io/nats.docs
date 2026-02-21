# Семантика Request-Reply

Шаблон отправки сообщения и получения ответа в большинстве клиентских библиотек инкапсулирован в метод request. Под капотом этот метод публикует сообщение с уникальным reply-to subject и ждёт ответ перед возвратом.

В более старых версиях некоторых библиотек каждый раз создавался полностью новый reply-to subject. В новых версиях используется иерархия subject, чтобы один подписчик в клиентской библиотеке слушал wildcard, а запросы отправлялись с уникальным дочерним subject одного subject.

Основное отличие между методом request и публикацией с reply-to в том, что библиотека принимает только один ответ, и в большинстве библиотек request рассматривается как синхронное действие. Библиотека может также предоставлять способ задать таймаут.

Например, обновляя предыдущий пример публикации, можно запросить `time` с таймаутом в одну секунду:

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

// set up a listener for "time" requests
Dispatcher d = nc.createDispatcher(msg -> {
    System.out.println("Received time request");
    nc.publish(msg.getReplyTo(), ("" + System.currentTimeMillis()).getBytes());
});
d.subscribe("time");

// make a request to the "time" subject and wait 1 second for a response
Message msg = nc.request("time", null, Duration.ofSeconds(1));

// look at the response
long time = Long.parseLong(new String(msg.getData()));
System.out.println(new Date(time));

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

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

using CancellationTokenSource cts = new();

// Process the time messages in a separate task
Task subscription = Task.Run(async () =>
{
    await foreach (var msg in client.SubscribeAsync<string>("time", cancellationToken: cts.Token))
    {
        await msg.ReplyAsync(DateTimeOffset.Now);
    }
});

// Wait for the subscription task to be ready
await Task.Delay(1000);

var reply = await client.RequestAsync<DateTimeOffset>("time");

Console.WriteLine($"Reply: {reply.Data:O}");

await cts.CancelAsync();
await subscription;

// Output:
// Reply: 2024-10-23T05:20:55.0000000+01:00
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

Request-reply в библиотеке можно представить как паттерн subscribe, получить одно сообщение, unsubscribe. В Go это может выглядеть примерно так:

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

Можно расширить паттерн request-reply до того, что часто называют scatter-gather. Чтобы получить несколько сообщений с таймаутом, можно сделать что‑то подобное, где цикл получения сообщений ограничивается временем, а не получением одного сообщения:

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

Или можно использовать цикл по счётчику и таймауту, чтобы попытаться получить _как минимум N_ ответов:

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
