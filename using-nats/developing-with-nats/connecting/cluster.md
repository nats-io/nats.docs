# Подключение к кластеру

При подключении к кластеру есть несколько моментов, о которых стоит подумать:

* Передача URL для каждого узла кластера (полу‑опционально)
* Алгоритм подключения
* Алгоритм переподключения (обсуждается позже)
* URL, предоставляемые сервером

Когда клиентская библиотека впервые пытается подключиться, она использует список URL, переданный в опциях подключения или функции. Эти URL обычно проверяются в случайном порядке, чтобы не было так, что каждый клиент подключается к одному и тому же серверу. Используется первое успешное соединение. Рандомизацию можно [явно отключить](../reconnect/random.md).

После подключения клиента сервер может предоставить список URL дополнительных известных серверов. Это позволяет клиенту подключиться к одному серверу и всё равно иметь доступ к другим серверам при переподключении.

Чтобы обеспечить начальное подключение, ваш код должен включать список разумных _front line_ или _seed_ серверов. Эти серверы могут знать о других членах кластера и могут сообщить клиенту об этих членах. Но нет необходимости настраивать клиента так, чтобы он передавал каждый действительный узел кластера в методе подключения.

Предоставляя возможность передавать несколько опций подключения, NATS может учитывать возможность падения машины или недоступности для клиента. Добавляя возможность серверу сообщать клиентам список известных серверов в рамках клиент‑серверного протокола, сеть, создаваемая кластером, может органично расти и изменяться во время работы клиентов.

_Примечание: поведение при сбоях зависит от библиотеки, пожалуйста, смотрите документацию вашей клиентской библиотеки о том, что происходит при неудачном подключении._

{% tabs %}
{% tab title="Go" %}
```go
servers := []string{"nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"}

nc, err := nats.Connect(strings.Join(servers, ","))
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
    .build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    servers: [
      "nats://demo.nats.io:4222",
      "nats://localhost:4222",
    ],
});
// Do something with the connection
doSomething();
// When done close it
await nc.close();
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(servers=[
   "nats://127.0.0.1:1222",
   "nats://127.0.0.1:1223",
   "nats://127.0.0.1:1224"
   ])

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient("nats://127.0.0.1:1222,nats://127.0.0.1:1223,nats://127.0.0.1:1224");

// It's optional to call ConnectAsync()
// as it will be called when needed automatically
await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"]) do |nc|
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
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
