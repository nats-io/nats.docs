# Протокол Ping/Pong

Клиентские приложения NATS используют протокол PING/PONG, чтобы проверять, что соединение с сервисом NATS рабочее. Периодически клиент отправляет серверу сообщения PING, на которые сервер отвечает PONG. Этот период настраивается интервалом ping в настройках подключения клиента.

![](../../../.gitbook/assets/pingpong.svg)

Соединение будет закрыто как устаревшее, когда клиент достигнет количества ping без ответа pong; это настраивается параметром максимального числа ожидающих ping (max pings outstanding) в настройках подключения клиента.

Интервал ping и максимальное число ожидающих ping работают вместе и определяют, как быстро клиентское соединение узнает о проблеме. Это также помогает при удалённой сетевой сегментации, когда ОС не обнаруживает ошибку сокета. При закрытии соединения клиент попытается переподключиться. Если ему известны другие серверы, он попробует подключиться к ним.

При наличии трафика, такого как сообщения или ping'и со стороны клиента, сервер не инициирует взаимодействие PING/PONG.

При соединениях с заметным трафиком клиент часто обнаруживает проблему между PING'ами, поэтому интервал ping по умолчанию обычно измеряется минутами. Чтобы закрывать неотвечающее соединение через 100 секунд, установите интервал ping 20 секунд и максимальное число ожидающих ping 5:

{% tabs %}
{% tab title="Go" %}
```go
// Set Ping Interval to 20 seconds and Max Pings Outstanding to 5
nc, err := nats.Connect("demo.nats.io", nats.Name("API Ping Example"), nats.PingInterval(20*time.Second), nats.MaxPingsOutstanding(5))
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
    .server("nats://demo.nats.io")
    .pingInterval(Duration.ofSeconds(20)) // Set Ping Interval
    .maxPingsOut(5) // Set max pings in flight
    .build();

// Connection is AutoCloseable
try (Connection nc = Nats.connect(options)) {
    // Do something with the connection
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// Set Ping Interval to 20 seconds and Max Pings Outstanding to 5
const nc = await connect({
    pingInterval: 20 * 1000,
    maxPingOut: 5,
    servers: ["demo.nats.io:4222"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   # Set Ping Interval to 20 seconds and Max Pings Outstanding to 5
   ping_interval=20,
   max_outstanding_pings=5,
   )

# Do something with the connection.
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
    
    // Set Ping Interval to 20 seconds and Max Pings Outstanding to 5
    PingInterval = TimeSpan.FromSeconds(20),
    MaxPingOut = 5,
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
# Set Ping Interval to 20 seconds and Max Pings Outstanding to 5
NATS.start(ping_interval: 20, max_outstanding_pings: 5) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  # Do something with the connection
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
    // Set Ping interval to 20 seconds (20,000 milliseconds)
    s = natsOptions_SetPingInterval(opts, 20000);
if (s == NATS_OK)
    // Set the limit to 5
    s = natsOptions_SetMaxPingsOut(opts, 5);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
