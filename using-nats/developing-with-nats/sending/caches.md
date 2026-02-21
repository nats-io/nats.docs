# Кэши, Flush и Ping

По соображениям производительности большинство (если не все) клиентских библиотек буферизуют исходящие данные, чтобы большие порции можно было записывать в сеть за один раз. Это может быть простым буфером байтов, который хранит несколько сообщений до отправки в сеть.

Эти буферы не хранят сообщения вечно; обычно они рассчитаны на высокую пропускную способность при сохранении хорошей задержки в ситуациях с низкой нагрузкой.

Задача библиотеки — обеспечивать высокопроизводительный поток сообщений. Но иногда приложению нужно знать, что сообщение «вышло в сеть». В этом случае приложения могут использовать вызов flush, чтобы заставить библиотеку протолкнуть данные через систему.

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Just to not collide using the demo server with other users.
subject := nats.NewInbox()

if err := nc.Publish(subject, []byte("All is Well")); err != nil {
    log.Fatal(err)
}
// Sends a PING and wait for a PONG from the server, up to the given timeout.
// This gives guarantee that the server has processed the above message.
if err := nc.FlushTimeout(time.Second); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

nc.publish("updates", "All is Well".getBytes(StandardCharsets.UTF_8));
nc.flush(Duration.ofSeconds(1)); // Flush the message queue

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const start = Date.now();
nc.flush().then(() => {
  t.log("round trip completed in", Date.now() - start, "ms");
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

await nc.publish("updates", b'All is Well')

# Sends a PING and wait for a PONG from the server, up to the given timeout.
# This gives guarantee that the server has processed above message.
await nc.flush(timeout=1)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

await client.PublishAsync("updates", "All is well");

// Sends a PING and wait for a PONG from the server.
// This gives a guarantee that the server has processed the above message
// since the underlining TCP connection sends and receives messages in order.
await client.PingAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'fiber'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.subscribe("updates") do |msg|
    puts msg
  end

  nc.publish("updates", "All is Well")

  nc.flush do
    # Sends a PING and wait for a PONG from the server, up to the given timeout.
    # This gives guarantee that the server has processed above message at this point.
  end
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsStatus          s          = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);

// Send a request and wait for up to 1 second
if (s == NATS_OK)
    s = natsConnection_PublishString(conn, "foo", "All is Well");

// Sends a PING and wait for a PONG from the server, up to the given timeout.
// This gives guarantee that the server has processed the above message.
if (s == NATS_OK)
    s = natsConnection_FlushTimeout(conn, 1000);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

## Flush и Ping/Pong

Многие клиентские библиотеки используют взаимодействие [PING/PONG](../connecting/pingpong.md), встроенное в протокол NATS, чтобы убедиться, что flush отправил все буферизованные сообщения на сервер. Когда приложение вызывает flush, большинство библиотек помещает PING в исходящую очередь сообщений и ждёт ответа PONG от сервера, прежде чем считать flush успешным.

Хотя клиент может использовать PING/PONG для flush, такие ping'и не учитываются в лимите [max outgoing pings](../connecting/pingpong.md).
