# 重连尝试之间的暂停

不断地尝试连接到同一台服务器是没有太大意义的。为了防止这种频繁的重试和浪费的重连尝试，特别是在使用TLS时，库通常会提供一个等待时间设置。一般来说，客户端会在两次尝试连接到**同一**服务器之间确保至少经过了一定的时间间隔。具体的实现方式取决于所使用的库。

这个设置不仅能够避免浪费客户端资源，还能缓解在没有其他可用服务器时可能出现的 [_thundering herd_](random.md)（惊群效应）问题。

{% tabs %}
{% tab title="Go" %}
```go
// Set reconnect interval to 10 seconds
nc, err := nats.Connect("demo.nats.io", nats.ReconnectWait(10*time.Second))
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
    .reconnectWait(Duration.ofSeconds(10))  // Set Reconnect Wait
    .build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    reconnectTimeWait: 10 * 1000, // 10s
    servers: ["demo.nats.io"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   reconnect_time_wait=10,
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
    
    // Set reconnect interval to between 5-10 seconds
    ReconnectWaitMin = TimeSpan.FromSeconds(5),
    ReconnectWaitMax = TimeSpan.FromSeconds(10),
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"], reconnect_time_wait: 10) do |nc|
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

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    // Set reconnect interval to 10 seconds (10,000 milliseconds)
    s = natsOptions_SetReconnectWait(opts, 10000);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}