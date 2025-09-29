# 重连尝试期间的消息缓冲

Core NATS 客户端库会尽可能实现即发即弃的语义。你应该使用 JetStream 功能来获得更高级的服务质量，从而处理因服务器连接中断而导致的 Core NATS 消息被丢弃的情况。话虽如此，你正在使用的客户端库可能包含的一项功能是：在连接断开时能够缓冲外发的消息。

在短暂的重连期间，客户端可以允许应用程序发布消息。但由于服务器离线，这些消息会被缓存在客户端中。一旦重新连接，客户端库就会发送这些消息。当达到最大重连缓冲区容量时，客户端将无法再发布消息，并会返回错误。

请注意，虽然从应用程序的角度看消息似乎已经发送，但由于连接可能始终无法重新建立，这些消息有可能永远无法真正发出。你的应用程序应该使用 ACK 等模式，或者使用 JetStream publish 调用来确保消息投递。

对于支持此功能的客户端，你可以通过字节数、消息数或两者结合的方式来设定此缓冲区的大小。

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

> _如本文档所述，每个客户端库的行为可能略有不同。请查阅您正在使用的库的文档。_
