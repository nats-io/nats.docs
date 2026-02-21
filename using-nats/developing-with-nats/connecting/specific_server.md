# Подключение к конкретному серверу

Клиентские библиотеки NATS могут принимать полный URL, например `nats://demo.nats.io:4222`, чтобы указать конкретный хост и порт сервера для подключения.

Библиотеки убирают требование явного протокола и могут позволять `demo.nats.io:4222` или просто `demo.nats.io`. В последнем случае используется порт по умолчанию 4222. Проверьте документацию вашей клиентской библиотеки, чтобы узнать, какие форматы URL поддерживаются.

Например, для подключения к демонстрационному серверу с URL можно использовать:

{% tabs %}
{% tab title="Go" %}
```java
// If connecting to the default port, the URL can be simplified
// to just the hostname/IP.
// That is, the connect below is equivalent to:
// nats.Connect("nats://demo.nats.io:4222")
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection nc = Nats.connect("nats://demo.nats.io:4222");
```
{% endtab %}

{% tab title="Java" %}
```text
// Connection is AutoCloseable
try (Connection nc = Nats.connect("nats://demo.nats.io:4222")) {
    // Do something with the connection
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({ servers: "demo.nats.io" });
// Do something with the connection
doSomething();
await nc.close();
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(servers=["nats://demo.nats.io:4222"])

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient("nats://demo.nats.io:4222");

// It's optional to call ConnectAsync()
// as it will be called when needed automatically
await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://demo.nats.io:4222"]) do |nc|
   # Do something with the connection

   # Close the connection
   nc.close
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn = NULL;
natsStatus          s;

// If connecting to the default port, the URL can be simplified
// to just the hostname/IP.
// That is, the connect below is equivalent to:
// natsConnection_ConnectTo(&conn, "nats://demo.nats.io:4222");
s = natsConnection_ConnectTo(&conn, "demo.nats.io");
if (s != NATS_OK)
  // handle error

// Destroy connection, no-op if conn is NULL.
natsConnection_Destroy(conn);
```
{% endtab %}

{% endtabs %}
