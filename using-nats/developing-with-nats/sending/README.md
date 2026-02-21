# Отправка сообщений

NATS отправляет и получает сообщения с использованием протокола, который включает целевой subject, необязательный reply subject и массив байт. Некоторые библиотеки могут предоставлять вспомогательные функции для преобразования других форматов данных в байты и обратно, но сервер NATS рассматривает все сообщения как непрозрачные массивы байт.

Все клиенты NATS спроектированы так, чтобы отправка сообщения была простой. Например, чтобы отправить строку «All is Well» в subject «updates» как строку байт UTF‑8, можно сделать так:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API PublishBytes Example"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

if err := nc.Publish("updates", []byte("All is Well")); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

nc.publish("updates", "All is Well".getBytes(StandardCharsets.UTF_8));
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sc = StringCodec();
nc.publish("updates", sc.encode("All is Well"));
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

await nc.publish("updates", b'All is Well')
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient(url: "demo.nats.io", name: "API Publish String Example");

// The default serializer uses UTF-8 encoding for strings
await client.PublishAsync<string>(subject: "updates", data: "All is Well");
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.publish("updates", "All is Well")
end
```
{% endtab %}
{% endtabs %}
