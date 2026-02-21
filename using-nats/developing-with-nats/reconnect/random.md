# Избегание «thundering herd»

Когда сервер падает, возможен анти‑паттерн _Thundering Herd_, при котором все клиенты пытаются переподключиться немедленно, создавая отказ в обслуживании. Чтобы этого избежать, большинство клиентских библиотек NATS рандомизируют серверы, к которым они пытаются подключиться. Эта настройка не влияет на случай одного сервера, но при кластере рандомизация или перемешивание гарантирует, что ни один сервер не будет принимать на себя основную нагрузку попыток переподключения.

Однако если вы хотите отключить рандомизацию при подключении и переподключении, чтобы серверы всегда проверялись в одном порядке, вы можете сделать это в большинстве библиотек через опцию соединения:

{% tabs %}
{% tab title="Go" %}
```go
servers := []string{"nats://127.0.0.1:1222",
    "nats://127.0.0.1:1223",
    "nats://127.0.0.1:1224",
}

nc, err := nats.Connect(strings.Join(servers, ","), nats.DontRandomize())
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
    .server("nats://127.0.0.1:1222,nats://127.0.0.1:1223,nats://127.0.0.1:1224")
    .noRandomize() // Disable randomizing servers in the bootstrap and later discovered 
    .build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    noRandomize: false,
    servers: ["127.0.0.1:4443", "demo.nats.io"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
   servers=[
      "nats://demo.nats.io:1222",
      "nats://demo.nats.io:1223",
      "nats://demo.nats.io:1224"
      ],
   dont_randomize=True,
   )

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    Url = "nats://127.0.0.1:1222,nats://127.0.0.1:1223,nats://127.0.0.1:1224",
    NoRandomize = true,
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"], dont_randomize_servers: true) do |nc|
   # Do something with the connection

   # Close the connection
   nc.close
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;
const char          *servers[] = {"nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"};

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetServers(opts, servers, 3);
if (s == NATS_OK)
    s = natsOptions_SetNoRandomize(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
