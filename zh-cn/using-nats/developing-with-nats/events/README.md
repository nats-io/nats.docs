# 监控连接

与服务器的交互管理主要由客户端库负责，但大多数库也提供了一些关于底层运行情况的洞察。

例如，客户端库可能提供一种机制来获取连接的当前状态：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API Example"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

getStatusTxt := func(nc *nats.Conn) string {
    switch nc.Status() {
    case nats.CONNECTED:
        return "Connected"
    case nats.CLOSED:
        return "Closed"
    default:
        return "Other"
    }
}
log.Printf("The connection is %v\n", getStatusTxt(nc))

nc.Close()

log.Printf("The connection is %v\n", getStatusTxt(nc))
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

System.out.println("The Connection is: " + nc.getStatus()); // CONNECTED

nc.close();

System.out.println("The Connection is: " + nc.getStatus()); // CLOSED
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
  // 您可以了解连接到的 NATS 服务器版本：
t.log(`connected to a nats server version ${nc.info.version}`);

// 或者获取有关客户端发送和接收数据的信息：
const stats = nc.stats();
t.log(`client sent ${stats.outMsgs} messages and received ${stats.inMsgs}`);
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   )

# 用连接做点事情。

print("The connection is connected?", nc.is_connected)

while True:
  if nc.is_reconnecting:
    print("Reconnecting to NATS...")
    break
  await asyncio.sleep(1)

await nc.close()

print("The connection is closed?", nc.is_closed)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

Console.WriteLine($"{client.Connection.ConnectionState}"); // Closed

await client.ConnectAsync();

Console.WriteLine($"{client.Connection.ConnectionState}"); // Open
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start(max_reconnect_attempts: 2) do |nc|
  puts "Connect is connected?: #{nc.connected?}"

  timer = EM.add_periodic_timer(1) do
    if nc.closing?
      puts "Connection closed..."
      EM.cancel_timer(timer)
      NATS.stop
    end

    if nc.reconnecting?
      puts "Reconnecting to NATS..."
      next
    end
  end
end
```
{% endtab %}
{% endtabs %}

