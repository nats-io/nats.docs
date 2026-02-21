# Автоотписка после N сообщений

NATS предоставляет специальную форму отписки, которая настраивается количеством сообщений и срабатывает, когда подписчику отправлено указанное число сообщений. Этот механизм очень полезен, если ожидается только одно сообщение.

Количество сообщений, которое вы задаёте, — это общее число сообщений для подписчика. Поэтому если вы настроили автоотписку с числом 1, сервер прекратит отправку сообщений этой подписке после получения одного сообщения. Если подписчик уже получил одно или больше сообщений, отписка произойдёт немедленно. Это поведение, основанное на истории, может сбивать с толку, если вы пытаетесь автоотписаться на долгоживущей подписке, но оно логично для новой.

Автоотписка основана на общем числе сообщений, отправленных подписчику, а не только новых. Большинство клиентских библиотек также отслеживает максимальное число сообщений после запроса автоотписки. При переподключении это позволяет клиентам повторно отправить отписку с обновлённым общим числом.

Следующий пример показывает автоотписку после одного сообщения:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Sync Subscription
sub, err := nc.SubscribeSync("updates")
if err != nil {
    log.Fatal(err)
}
if err := sub.AutoUnsubscribe(1); err != nil {
    log.Fatal(err)
}

// Async Subscription
sub, err = nc.Subscribe("updates", func(_ *nats.Msg) {})
if err != nil {
    log.Fatal(err)
}
if err := sub.AutoUnsubscribe(1); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");
Dispatcher d = nc.createDispatcher((msg) -> {
    String str = new String(msg.getData(), StandardCharsets.UTF_8);
    System.out.println(str);
});

/ subscribe then unsubscribe after 10 "more" messages
// It's technically possible to get more than 10 total if messages are already in
// flight by the time the server receives the unsubscribe message

// Sync Subscription, 
Subscription sub = nc.subscribe("updates");
sub.unsubscribe(10);

// Async Subscription directly in the dispatcher
d.subscribe("updates");
d.unsubscribe("updates", 10);

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sc = StringCodec();
// `max` specifies the number of messages that the server will forward.
// The server will auto-cancel.
const subj = createInbox();
const sub1 = nc.subscribe(subj, {
  callback: (_err, msg) => {
    t.log(`sub1 ${sc.decode(msg.data)}`);
  },
  max: 10,
});

// another way after 10 messages
const sub2 = nc.subscribe(subj, {
  callback: (_err, msg) => {
    t.log(`sub2 ${sc.decode(msg.data)}`);
  },
});
// if the subscription already received 10 messages, the handler
// won't get any more messages
sub2.unsubscribe(10);
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

async def cb(msg):
  print(msg)

sid = await nc.subscribe("updates", cb=cb)
await nc.auto_unsubscribe(sid, 1)
await nc.publish("updates", b'All is Well')

# Won't be received...
await nc.publish("updates", b'...')
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient();

// Unsubscribe after 10 messages
var opts = new NatsSubOpts { MaxMsgs = 10 };

var count = 0;

// Subscribe to updates with options
await foreach (var msg in client.SubscribeAsync<string>("updates", opts: opts))
{
    Console.WriteLine($"Received[{++count}]: {msg.Data}");
}

Console.WriteLine("Unsubscribed from updates");
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  Fiber.new do
    f = Fiber.current

    nc.subscribe("time", max: 1) do |msg, reply|
      f.resume Time.now
    end

    nc.publish("time", 'What is the time?', NATS.create_inbox)

    # Use the response
    msg = Fiber.yield
    puts "Reply: #{msg}"

    # Won't be received
    nc.publish("time", 'What is the time?', NATS.create_inbox)

  end.resume
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsSubscription    *sub       = NULL;
natsMsg             *msg       = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// Subscribe
if (s == NATS_OK)
    s = natsConnection_SubscribeSync(&sub, conn, "updates");

// Unsubscribe after 1 message is received
if (s == NATS_OK)
    s = natsSubscription_AutoUnsubscribe(sub, 1);

// Wait for messages
if (s == NATS_OK)
    s = natsSubscription_NextMsg(&msg, sub, 10000);

if (s == NATS_OK)
{
    printf("Received msg: %s - %.*s\n",
            natsMsg_GetSubject(msg),
            natsMsg_GetDataLength(msg),
            natsMsg_GetData(msg));

    // Destroy message that was received
    natsMsg_Destroy(msg);
}

(...)

// Destroy objects that were created
natsSubscription_Destroy(sub);
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}
