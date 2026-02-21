# Дренирование сообщений перед отключением

Эта функция позволяет дренировать соединения или подписки и затем закрывать соединение. Закрытие соединения (через `close()`), или отписка от подписки обычно считаются немедленными операциями. При закрытии или отписке библиотека остановит сообщения в любой очереди ожидания или кэше для подписчиков. При дренировании подписки или соединения библиотека обработает все сообщения в полёте и в кэше/ожидании перед закрытием.

Drain предоставляет клиентам с queue‑подписками способ выключать приложения без потери сообщений. Клиент может поднять нового участника очереди, дренировать и выключить старого участника очереди — и при этом не потерять сообщения, отправленные старому клиенту. Без drain возможна потеря сообщений из‑за тайминга доставки.

Библиотеки могут предоставлять drain на уровне соединения, подписчика или обоих.

Для соединения процесс по сути такой:

1. Drain всех подписок
2. Остановить публикацию новых сообщений
3. Flush оставшихся опубликованных сообщений
4. Закрыть

API drain обычно можно использовать вместо close:

Пример дренирования соединения:

{% tabs %}
{% tab title="Go" %}
```go
wg := sync.WaitGroup{}
wg.Add(1)

errCh := make(chan error, 1)

// To simulate a timeout, you would set the DrainTimeout()
// to a value less than the time spent in the message callback,
// so say: nats.DrainTimeout(10*time.Millisecond).

nc, err := nats.Connect("demo.nats.io",
    nats.DrainTimeout(10*time.Second),
    nats.ErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) {
        errCh <- err
    }),
    nats.ClosedHandler(func(_ *nats.Conn) {
        wg.Done()
    }))
if err != nil {
    log.Fatal(err)
}

// Just to not collide using the demo server with other users.
subject := nats.NewInbox()

// Subscribe, but add some delay while processing.
if _, err := nc.Subscribe(subject, func(_ *nats.Msg) {
    time.Sleep(200 * time.Millisecond)
}); err != nil {
    log.Fatal(err)
}

// Publish a message
if err := nc.Publish(subject, []byte("hello")); err != nil {
    log.Fatal(err)
}

// Drain the connection, which will close it when done.
if err := nc.Drain(); err != nil {
    log.Fatal(err)
}

// Wait for the connection to be closed.
wg.Wait()

// Check if there was an error
select {
case e := <-errCh:
    log.Fatal(e)
default:
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// Use a latch to wait for a message to arrive
CountDownLatch latch = new CountDownLatch(1);

// Create a dispatcher and inline message handler
Dispatcher d = nc.createDispatcher((msg) -> {
    String str = new String(msg.getData(), StandardCharsets.UTF_8);
    System.out.println(str);
    latch.countDown();
});

// Subscribe
d.subscribe("updates");

// Wait for a message to come in
latch.await();

// Drain the connection, which will close it
CompletableFuture<Boolean> drained = nc.drain(Duration.ofSeconds(10));

// Wait for the drain to complete
drained.get();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({ servers: "demo.nats.io" });
const sub = nc.subscribe(createInbox(), () => {});
nc.publish(sub.getSubject());
await nc.drain();
```
{% endtab %}

{% tab title="Python" %}
```python
import asyncio
from nats.aio.client import Client as NATS

async def example(loop):
    nc = NATS()

    await nc.connect("nats://127.0.0.1:4222", loop=loop)

    async def handler(msg):
        print("[Received] ", msg)
        await nc.publish(msg.reply, b'I can help')

        # Can check whether client is in draining state
        if nc.is_draining:
            print("Connection is draining")

    await nc.subscribe("help", "workers", cb=handler)
    await nc.flush()

    requests = []
    for i in range(0, 10):
        request = nc.request("help", b'help!', timeout=1)
        requests.append(request)

    # Wait for all the responses
    responses = []
    responses = await asyncio.gather(*requests)

    # Gracefully close the connection.
    await nc.drain()

    print("Received {} responses".format(len(responses)))
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

var client = new NatsClient();

var subject = client.Connection.NewInbox();

// Make sure to use a cancellation token to end all subscriptions
using var cts = new CancellationTokenSource();

var sync = false;
var process = Task.Run(async () =>
{
    await foreach (var msg in client.SubscribeAsync<int>(subject, cancellationToken: cts.Token))
    {
        if (msg.Data == -1)
        {
            sync = true;
            continue;
        }
        Console.WriteLine($"Received: {msg.Data}");
        await Task.Delay(TimeSpan.FromMilliseconds(300));
    }

    Console.WriteLine("Subscription completed");
});

// Make sure the subscription is ready
while (sync == false)
{
    await Task.Delay(TimeSpan.FromMilliseconds(100));
    await client.PublishAsync(subject, -1);
}

for (var i = 0; i < 5; i++)
{
    await client.PublishAsync(subject, i);
}
Console.WriteLine("Published 5 messages");

// Cancelling the subscription will unsubscribe from the subject
// and messages that are already in the buffer will be processed
await cts.CancelAsync();
Console.WriteLine("Cancelled subscription");

// Ping the server to make sure all in-flight messages are processed
// as a side effect of the ping, the server will respond with a pong
// making sure the connection all previous messages are sent on the wire.
await client.PingAsync();

// Disposing the NATS client will close the connection
await client.DisposeAsync();
Console.WriteLine("Disposed NATS client");

Console.WriteLine("Waiting for all messages to be processed");
await process;

Console.WriteLine("Done");
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start(drain_timeout: 1) do |nc|
  NATS.subscribe('foo', queue: "workers") do |msg, reply, sub|
    nc.publish(reply, "ACK:#{msg}")
  end

  NATS.subscribe('bar', queue: "workers") do |msg, reply, sub|
    nc.publish(reply, "ACK:#{msg}")
  end

  NATS.subscribe('quux', queue: "workers") do |msg, reply, sub|
    nc.publish(reply, "ACK:#{msg}")
  end

  EM.add_timer(2) do
    next if NATS.draining?

    # Drain gracefully closes the connection.
    NATS.drain do
      puts "Done draining. Connection is closed."
    end
  end
end
```
{% endtab %}

{% tab title="C" %}
```c
static void
onMsg(natsConnection *conn, natsSubscription *sub, natsMsg *msg, void *closure)
{
    printf("Received msg: %s - %.*s\n",
           natsMsg_GetSubject(msg),
           natsMsg_GetDataLength(msg),
           natsMsg_GetData(msg));

    // Add some delay while processing
    nats_Sleep(200);

    // Need to destroy the message!
    natsMsg_Destroy(msg);
}

static void
closeHandler(natsConnection *conn, void *closure)
{
    cond_variable cv = (cond_variable) closure;

    notify_cond_variable(cv);
}

(...)


natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsSubscription    *sub       = NULL;
natsStatus          s          = NATS_OK;
cond_variable       cv         = new_cond_variable(); // some fictuous way to notify between threads.

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    // Setup a close handler and pass a reference to our condition variable.
    s = natsOptions_SetClosedCB(opts, closeHandler, (void*) cv);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

// Subscribe
if (s == NATS_OK)
    s = natsConnection_Subscribe(&sub, conn, "foo", onMsg, NULL);

// Publish a message
if (s == NATS_OK)
    s = natsConnection_PublishString(conn, "foo", "hello");

// Drain the connection, which will close it when done.
if (s == NATS_OK)
    s = natsConnection_Drain(conn);

// Wait for the connection to be closed
if (s == NATS_OK)
    cond_variable_wait(cv);

(...)

// Destroy objects that were created
natsSubscription_Destroy(sub);
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

Механика drain для подписки проще:

1. Unsubscribe
2. Обработать все кэшированные или «в полёте» сообщения
3. Очистить ресурсы

API drain обычно можно использовать вместо unsubscribe:

{% tabs %}
{% tab title="Go" %}
```go
    nc, err := nats.Connect("demo.nats.io")
    if err != nil {
        log.Fatal(err)
    }
    defer nc.Close()

    done := sync.WaitGroup{}
    done.Add(1)

    count := 0
    errCh := make(chan error, 1)

    msgAfterDrain := "not this one"

    // Just to not collide using the demo server with other users.
    subject := nats.NewInbox()

    // This callback will process each message slowly
    sub, err := nc.Subscribe(subject, func(m *nats.Msg) {
        if string(m.Data) == msgAfterDrain {
            errCh <- fmt.Errorf("Should not have received this message")
            return
        }
        time.Sleep(100 * time.Millisecond)
        count++
        if count == 2 {
            done.Done()
        }
    })

    // Send 2 messages
    for i := 0; i < 2; i++ {
        nc.Publish(subject, []byte("hello"))
    }

    // Call Drain on the subscription. It unsubscribes but
    // wait for all pending messages to be processed.
    if err := sub.Drain(); err != nil {
        log.Fatal(err)
    }

    // Send one more message, this message should not be received
    nc.Publish(subject, []byte(msgAfterDrain))

    // Wait for the subscription to have processed the 2 messages.
    done.Wait()

    // Now check that the 3rd message was not received
    select {
    case e := <-errCh:
        log.Fatal(e)
    case <-time.After(200 * time.Millisecond):
        // OK!
    }
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// Use a latch to wait for a message to arrive
CountDownLatch latch = new CountDownLatch(1);

// Create a dispatcher and inline message handler
Dispatcher d = nc.createDispatcher((msg) -> {
    String str = new String(msg.getData(), StandardCharsets.UTF_8);
    System.out.println(str);
    latch.countDown();
});

// Subscribe
d.subscribe("updates");

// Wait for a message to come in
latch.await();

// Messages that have arrived will be processed
CompletableFuture<Boolean> drained = d.drain(Duration.ofSeconds(10));

// Wait for the drain to complete
drained.get();

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sub = nc.subscribe(subj, { callback: (_err, _msg) => {} });
nc.publish(subj);
nc.publish(subj);
nc.publish(subj);
await sub.drain();
```
{% endtab %}

{% tab title="Python" %}
```python
import asyncio
from nats.aio.client import Client as NATS

async def example(loop):
    nc = NATS()

    await nc.connect("nats://127.0.0.1:4222", loop=loop)

    async def handler(msg):
        print("[Received] ", msg)
        await nc.publish(msg.reply, b'I can help')

        # Can check whether client is in draining state
        if nc.is_draining:
            print("Connection is draining")

    sid = await nc.subscribe("help", "workers", cb=handler)
    await nc.flush()

    # Gracefully unsubscribe the subscription
    await nc.drain(sid)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

var subject = client.Connection.NewInbox();

// Make sure to use a cancellation token to end the subscription
using var cts = new CancellationTokenSource();

var sync = false;
var process = Task.Run(async () =>
{
    await foreach (var msg in client.SubscribeAsync<int>(subject, cancellationToken: cts.Token))
    {
        if (msg.Data == -1)
        {
            sync = true;
            continue;
        }
        Console.WriteLine($"Received: {msg.Data}");
        await Task.Delay(TimeSpan.FromMilliseconds(300));
    }

    Console.WriteLine("Subscription completed");
});

// Make sure the subscription is ready
while (sync == false)
{
    await Task.Delay(TimeSpan.FromMilliseconds(100));
    await client.PublishAsync(subject, -1);
}

for (var i = 0; i < 5; i++)
{
    await client.PublishAsync(subject, i);
}
Console.WriteLine("Published 5 messages");

// Cancelling the subscription will unsubscribe from the subject
// and messages that are already in the buffer will be processed
await cts.CancelAsync();
Console.WriteLine("Cancelled subscription");

Console.WriteLine("Waiting for subscription to complete");
await process;

Console.WriteLine("Done");
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# There is currently no API to drain a single subscription, the whole connection can be drained though via NATS.drain
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsSubscription    *sub       = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// Subscribe
if (s == NATS_OK)
    s = natsConnection_Subscribe(&sub, conn, "foo", onMsg, NULL);

// Publish 2 messages
if (s == NATS_OK)
{
    int i;
    for (i=0; (s == NATS_OK) && (i<2); i++)
    {
        s = natsConnection_PublishString(conn, "foo", "hello");
    }
}

// Call Drain on the subscription. It unsubscribes but
// wait for all pending messages to be processed.
if (s == NATS_OK)
    s = natsSubscription_Drain(sub);

(...)

// Destroy objects that were created
natsSubscription_Destroy(sub);
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

Поскольку drain может включать поток сообщений к серверу, для flush и асинхронной обработки сообщений, таймаут drain обычно должен быть больше, чем таймаут для простого request-reply или подобного.
