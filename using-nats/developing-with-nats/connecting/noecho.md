# Отключение эхо‑сообщений

По умолчанию соединение NATS «эхо‑возвращает» сообщения, если в этом же соединении есть интерес к опубликованному subject. Это означает, что если издатель в соединении отправляет сообщение в subject, любые подписчики в этом же соединении получат сообщение. Клиенты могут отключить это поведение, чтобы независимо от интереса сообщение не доставлялось подписчикам в том же соединении.

Опция NoEcho может быть полезна в шаблонах BUS, где все приложения подписываются и публикуют в один и тот же subject. Обычно публикация отражает изменение состояния, о котором приложение уже знает, поэтому если приложение публикует обновление, ему не нужно обрабатывать его само.

![](../../../.gitbook/assets/noecho.svg)

Помните, что отключение эхо настраивается для каждого соединения, а не для приложения. Кроме того, включение и выключение эхо может существенно изменить протокол взаимодействия вашего приложения, поскольку потоки сообщений будут идти или прекращаться в зависимости от этой настройки, а код подписки не будет иметь индикатора, почему это происходит.

{% tabs %}
{% tab title="Go" %}
```go
// Turn off echo
nc, err := nats.Connect("demo.nats.io", nats.Name("API NoEcho Example"), nats.NoEcho())
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder()
    .server("nats://demo.nats.io:4222")
    .noEcho() // Turn off echo
    .build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    servers: ["demo.nats.io"],
    noEcho: true,
});

const sub = nc.subscribe(subj, { callback: (_err, _msg) => {} });
nc.publish(subj);
await sub.drain();
// we won't get our own messages
t.is(sub.getProcessed(), 0);
```
{% endtab %}

{% tab title="Python" %}
```python
ncA = NATS()
ncB = NATS()

await ncA.connect(no_echo=True)
await ncB.connect()

async def handler(msg):
   # Messages sent by `ncA' will not be received.
   print("[Received] ", msg)

await ncA.subscribe("greetings", cb=handler)
await ncA.flush()
await ncA.publish("greetings", b'Hello World!')
await ncB.publish("greetings", b'Hello World!')

# Do something with the connection

await asyncio.sleep(1)
await ncA.drain()
await ncB.drain()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    Url = "nats://demo.nats.io:4222",
    
    // Turn off echo
    Echo = false
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start("nats://demo.nats.io:4222", no_echo: true) do |nc|
  # ...
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsOptions         *opts    = NULL;
natsStatus          s        = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetNoEcho(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
