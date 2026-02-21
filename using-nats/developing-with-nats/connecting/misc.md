# Разное

Этот раздел содержит разные возможности и опции для подключения.

## Получение максимального размера payload

Хотя клиент не может управлять максимальным размером payload, клиенты могут предоставлять способ получить настроенный [`max_payload`](/running-a-nats-service/configuration/README.md#limits) после установки соединения. Это позволит приложению дробить или ограничивать данные по необходимости, чтобы пройти через сервер.

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

mp := nc.MaxPayload()
log.Printf("Maximum payload is %v bytes", mp)

// Do something with the max payload
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

long mp = nc.getMaxPayload();
System.out.println("max payload for the server is " + mp + " bytes");
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
t.log(`max payload for the server is ${nc.info.max_payload} bytes`);
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

print("Maximum payload is %d bytes" % nc.max_payload)

# Do something with the max payload.
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient("nats://demo.nats.io:4222");

// Make sure we connect to a server to receive the server info,
// since connecting to servers is lazy in .NET client.
await client.ConnectAsync();

Console.WriteLine($"MaxPayload = {client.Connection.ServerInfo.MaxPayload}");
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(max_outstanding_pings: 5) do |nc|
  nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  # Do something with the max_payload
  puts "Maximum Payload is #{nc.server_info[:max_payload]} bytes"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsStatus          s        = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);
if (s == NATS_OK)
{
    int64_t mp = natsConnection_GetMaxPayload(conn);
    printf("Max payload: %d\n", (int) mp);
}

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

## Включение pedantic режима

Сервер NATS предоставляет режим _pedantic_, который выполняет дополнительные проверки протокола.

Пример такой проверки — если subject, используемый для публикации, содержит символ [wildcard](../../../nats-concepts/subjects.md#wildcards). Сервер не будет использовать его как wildcard и поэтому пропускает эту проверку.

По умолчанию режим выключен, но его можно включить для тестирования приложения:

{% tabs %}
{% tab title="Go" %}
```go
opts := nats.GetDefaultOptions()
opts.Url = "demo.nats.io"
// Turn on Pedantic
opts.Pedantic = true
nc, err := opts.Connect()
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            pedantic(). // Turn on pedantic
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// the pedantic option is useful for developing nats clients.
// the javascript clients also provide `debug` which will
// print to the console all the protocol interactions
// with the server
const nc = await connect({
    pedantic: true,
    servers: ["demo.nats.io:4222"],
    debug: true,
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], pedantic=True)

# Do something with the connection.
```
{% endtab %}

{% tab title="C#" %}
```csharp
// Not available in the NATS .NET client
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(pedantic: true) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  nc.close
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
    s = natsOptions_SetPedantic(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## Установка максимального размера контрольной строки

Протокол между клиентом и сервером довольно прост и опирается на контрольную строку и иногда тело сообщения. Контрольная строка содержит операции, такие как PING или PONG, за которыми следует CRLF ("\r\n"). На сервере есть опция [`max_control_line`](/running-a-nats-service/configuration/README.md#limits), которая ограничивает максимальный размер контрольной строки. Для PING и PONG это не важно, но для сообщений с именами subject и, возможно, именами queue group длина контрольной строки может быть критична, поскольку она фактически ограничивает их суммарную длину. Некоторые клиенты пытаются ограничивать размер контрольной строки внутри, чтобы предотвратить ошибку от сервера. Эти клиенты могут позволять или не позволять задавать используемый размер; если позволяют, размер должен соответствовать конфигурации сервера.

> Не рекомендуется задавать значение больше, чем у других клиентов или у nats-server.

Например, чтобы установить максимальный размер контрольной строки 2k:

{% tabs %}
{% tab title="Go" %}
```go
// This does not apply to the NATS Go Client
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            maxControlLine(2 * 1024). // Set the max control line to 2k
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// the max control line is determined automatically by the client
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS client does not allow custom control lines.
```
{% endtab %}

{% tab title="C#" %}
```csharp
// control line is not configurable on NATS .NET client.
// required memory is allocated dynamically from the array pool.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# There is no need to customize this in the Ruby NATS client.
```
{% endtab %}

{% tab title="C" %}
```c
// control line is not configurable on C NATS client.
```
{% endtab %}
{% endtabs %}

## Включение/выключение verbose режима

Клиенты могут запросить у сервера NATS _verbose_ режим. При запросе сервер будет отвечать на каждое сообщение клиента либо +OK, либо ошибкой -ERR. При этом клиент не блокируется и не ждёт ответа. Ошибки отправляются и без verbose режима, а клиентские библиотеки обрабатывают их согласно документации.

> Эта функциональность используется только для отладки клиентской библиотеки или самого nats-server. По умолчанию сервер включает её, но каждый клиент её выключает.

Чтобы включить verbose режим:

{% tabs %}
{% tab title="Go" %}
```go
opts := nats.GetDefaultOptions()
opts.Url = "demo.nats.io"
// Turn on Verbose
opts.Verbose = true
nc, err := opts.Connect()
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            verbose(). // Turn on verbose
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    verbose: true,
    servers: ["demo.nats.io:4222"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], verbose=True)

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(verbose: true) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  nc.close
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
    s = natsOptions_SetVerbose(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
