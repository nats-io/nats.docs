# Буферизация сообщений во время переподключения

Клиентские библиотеки Core NATS стараются быть «fire and forget», а для более высокого качества обслуживания, которое может справляться с потерей сообщений Core NATS при разрыве соединения с сервером, следует использовать возможности JetStream. Тем не менее одна из функций, которая может быть в используемой библиотеке, — буферизация исходящих сообщений, когда соединение разорвано.

Во время короткого переподключения клиент может позволять приложениям публиковать сообщения, которые из‑за недоступности сервера будут закэшированы в клиенте. Затем библиотека отправит эти сообщения после переподключения. Когда максимальный буфер переподключения заполнен, клиент больше не сможет публиковать сообщения, и будет возвращена ошибка.

Имейте в виду: хотя сообщение кажется отправленным из приложения, возможно, что оно никогда не будет отправлено, потому что соединение не восстановится. Ваши приложения должны использовать паттерны подтверждений или JetStream publish, чтобы обеспечить доставку.

Для клиентов, которые поддерживают эту функцию, вы можете настроить размер буфера в байтах, сообщениях или обоих.

{% tabs %}
{% tab title="Go" %}
```go
// Set reconnect buffer size in bytes (5 MB)
nc, err := nats.Connect("demo.nats.io", nats.ReconnectBufSize(5*1024*1024))
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
    .reconnectBufferSize(5 * 1024 * 1024)  // Set buffer in bytes
    .build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// Reconnect buffer size is not configurable on NATS JavaScript client
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS client currently does not implement a reconnect buffer
```
{% endtab %}

{% tab title="C#" %}
```csharp
// Reconnect buffer size is not configurable on NATS .NET client
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# There is currently no reconnect pending buffer as part of the Ruby NATS client
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    // Set reconnect buffer size in bytes (5 MB)
    s = natsOptions_SetReconnectBufSize(opts, 5*1024*1024);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

> _Как упоминалось в этом документе, каждая клиентская библиотека может вести себя немного по‑разному. Пожалуйста, смотрите документацию для используемой библиотеки._
