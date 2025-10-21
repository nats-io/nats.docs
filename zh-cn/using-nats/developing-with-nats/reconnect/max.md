# 设置重连尝试次数

客户端应用可以设置每台服务器的最大重连尝试次数。这包括提供给客户端连接调用的服务器，以及客户端通过其他服务器发现的服务器。一旦连续重连某台服务器失败的次数达到指定值，该服务器将被从连接列表中移除。在成功重连到某台服务器后，客户端会重置该服务器的失败重连尝试计数。如果某台服务器已从连接列表中移除，它可以在连接时被重新发现。这也会有效地重置其连接尝试计数。如果客户端耗尽所有可重连的服务器，它将关闭连接并[引发一个错误](events.md)。

{% tabs %}
{% tab title="Go" %}
```go
// Set max reconnects attempts
nc, err := nats.Connect("demo.nats.io", nats.MaxReconnects(10))
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
    .maxReconnects(10) // Set max reconnect attempts
    .build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    maxReconnectAttempts: 10,
    servers: ["demo.nats.io"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   max_reconnect_attempts=10,
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
    Url = "nats://demo.nats.io:4222",
    
    // Set the maximum number of reconnect attempts
    MaxReconnectRetry = 10,
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"], max_reconnect_attempts: 10) do |nc|
   # Do something with the connection

   # Close the connection
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
    s = natsOptions_SetMaxReconnect(opts, 10);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}