# Медленные потребители

NATS разработан, чтобы быстро перемещать сообщения через сервер. В результате NATS рассчитывает на то, что приложения учитывают и реагируют на изменения скорости сообщений. Сервер делает небольшое «согласование», но если клиент слишком медленный, сервер в итоге отключит его, закрыв соединение. Такие отключённые соединения называются [_slow consumers_](../../../running-a-nats-service/nats_admin/slow_consumers.md).

Один из способов, которым некоторые библиотеки справляются с «всплесками» трафика сообщений, — буферизация входящих сообщений для подписки. Например, если приложение может обрабатывать 10 сообщений в секунду, а иногда получает 20 сообщений в секунду, библиотека может удержать лишние 10, давая приложению время догнать. Для сервера будет казаться, что приложение обрабатывает сообщения, и соединение считается здоровым. Большинство клиентских библиотек уведомит приложение об ошибке SlowConsumer и отбросит сообщения.

Получение и отбрасывание сообщений от сервера сохраняет соединение здоровым, но создаёт требования к приложению. Есть несколько распространённых подходов:

* Использовать request-reply, чтобы ограничить отправителя и не перегружать подписчика
* Использовать очередь с несколькими подписчиками, разделяющими работу
* Сохранять сообщения с помощью чего‑то вроде NATS streaming

Библиотеки, которые кэшируют входящие сообщения, могут предоставлять два ограничения на входящую очередь или ожидающие сообщения. Это полезно, если проблема связана со всплесками публикаций, а не с постоянным несоответствием производительности. Отключение этих лимитов может быть опасным в продакшене, и хотя установка в 0 может помочь найти проблемы, это также рискованно в продакшене.

> Проверьте документацию вашей библиотеки на значения по умолчанию и поддержку отключения этих лимитов.

Входной кэш обычно отдельный для каждого подписчика, но снова проверьте документацию вашей клиентской библиотеки.

## Ограничение входящих/ожидающих сообщений по количеству и байтам

Первый способ ограничить входящую очередь — по количеству сообщений. Второй способ — по общему размеру. Например, чтобы ограничить входной кэш 1 000 сообщений или 5 МБ (что наступит первым):

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
// Consumer (Dispatcher, Subscription) API
// void setPendingLimits(long maxMessages, long maxBytes)

Connection nc = Nats.connect("nats://demo.nats.io:4222");

Dispatcher d = nc.createDispatcher((msg) -> {
    // handle message
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

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using System.Threading.Channels;
using NATS.Client.Core;

await using var client = new NatsClient();

// Set limits of 1000 messages.
// Note: setting the channel capacity over 1024 is not recommended
// as the channel's backing array will be allocated on the LOH (large object heap).
// NATS .NET client does not support setting a limit on the number of bytes
var subOpts = new NatsSubOpts
{
    ChannelOpts = new NatsSubChannelOpts
    {
        Capacity = 1000,
        FullMode = BoundedChannelFullMode.DropOldest
    }
};
await foreach (var msg in client.SubscribeAsync<string>(subject: "updates", opts: subOpts))
{
    Console.WriteLine($"Received: {msg.Subject}: {msg.Data}");    
}
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# The Ruby NATS client currently does not have option to specify a subscribers pending limits.
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsSubscription    *sub1      = NULL;
natsSubscription    *sub2      = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// Subscribe
if (s == NATS_OK)
    s = natsConnection_Subscribe(&sub1, conn, "updates", onMsg, NULL);

// Set limits of 1000 messages or 5MB, whichever comes first
if (s == NATS_OK)
    s = natsSubscription_SetPendingLimits(sub1, 1000, 5*1024*1024);

// Subscribe
if (s == NATS_OK)
    s = natsConnection_Subscribe(&sub2, conn, "updates", onMsg, NULL);

// Set no limits for this subscription
if (s == NATS_OK)
    s = natsSubscription_SetPendingLimits(sub2, -1, -1);

(...)

// Destroy objects that were created
natsSubscription_Destroy(sub1);
natsSubscription_Destroy(sub2);
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

## Обнаружение медленного потребителя и проверка потерь сообщений

Когда обнаруживается медленный потребитель и сообщения вот‑вот начнут отбрасываться, библиотека может уведомить приложение. Этот процесс может быть похож на другие ошибки или включать отдельный callback.

Некоторые библиотеки, например Java, не будут отправлять такое уведомление на каждое отброшенное сообщение, потому что это будет шумно. Вместо этого уведомление может приходить один раз за период, когда подписчик отстаёт. Библиотеки также могут предоставлять способ получить количество отброшенных сообщений, чтобы приложения могли хотя бы определить, что проблема возникает.

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

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using System.Threading.Channels;
using NATS.Client.Core;

await using var client = new NatsClient();

// Set the event handler for slow consumers
client.Connection.MessageDropped += async (sender, eventArgs) =>
{
    Console.WriteLine($"Dropped message: {eventArgs.Subject}: {eventArgs.Data}");
    Console.WriteLine($"Current channel size: {eventArgs.Pending}");
};

var subOpts = new NatsSubOpts
{
    ChannelOpts = new NatsSubChannelOpts
    {
        Capacity = 10,
        FullMode = BoundedChannelFullMode.DropOldest

        // If set to wait (default), you won't be able to detect slow consumers
        // FullMode = BoundedChannelFullMode.Wait,
    }
};

using var cts = new CancellationTokenSource();

var subscription = Task.Run(async () =>
{
    await foreach (var msg in client.SubscribeAsync<string>(subject: "updates", opts: subOpts, cancellationToken: cts.Token))
    {
        Console.WriteLine($"Received: {msg.Subject}: {msg.Data}");    
    }
});

for (int i = 0; i < 1_000; i++)
{
    await client.PublishAsync(subject: "updates", data: $"message payload {i}");
}

await cts.CancelAsync();

await subscription;
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# The Ruby NATS client currently does not have option to customize slow consumer limits per sub.
```
{% endtab %}

{% tab title="C" %}
```c
static void
errorCB(natsConnection *conn, natsSubscription *sub, natsStatus s, void *closure)
{

    // Do something
    printf("Error: %d - %s", s, natsStatus_GetText(s));
}

(...)

natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetErrorHandler(opts, errorCB, NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
