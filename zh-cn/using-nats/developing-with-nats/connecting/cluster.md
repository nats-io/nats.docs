# 连接到集群

在连接到集群时，有几点需要注意。

* 为每个集群成员传递一个 URL（半可选）
* 连接算法
* 重连算法（稍后讨论）
* 服务器提供的 URL 列表

当客户端库首次尝试连接时，它会使用提供给连接选项或函数的 URL 列表。列表里的 URL 们通常被以随机顺序选择，以避免所有客户端都连接到同一个服务器。第一个成功的连接会被使用。可以[显式禁用](../reconnect/random.md)随机选择特性。

在客户端连接到服务器之后，服务器可能会提供它知道的其他服务器的 URL 列表。这允许客户端连接到一个服务器，并在重新连接时仍然能够访问其他服务器。

为了确保初始连接，您的代码应包含一组合理的 _前线_ 或 _种子_ 服务器列表。这些服务器可能知道集群中的其他成员，并可能将这些成员的信息告知客户端。但您不必配置客户端在连接方法中传入集群中的每个有效成员。

通过提供传递多个连接选项的能力，NATS 可以处理机器宕机或对客户端不可用的可能性。通过让服务器能够在客户端-服务器协议中向客户端提供一组已知服务器的列表，集群创建的网络可以在客户端运行时有机地扩展和变化。

_请注意，失败行为取决于客户端库，请查阅您的客户端库文档，了解连接失败时的具体情况。_

{% tabs %}
{% tab title="Go" %}
```go
servers := []string{"nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"}

nc, err := nats.Connect(strings.Join(servers, ","))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 使用连接做一些事情
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder()
    .server("nats://127.0.0.1:1222,nats://127.0.0.1:1223,nats://127.0.0.1:1224")
    .build();
Connection nc = Nats.connect(options);

// 使用连接做一些事情

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
// 使用连接做一些事情
doSomething();
// 完成后关闭连接
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

# 使用连接做一些事情

await nc.close()
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient("nats://127.0.0.1:1222,nats://127.0.0.1:1223,nats://127.0.0.1:1224");

// 调用 ConnectAsync() 是可选的
// 因为它会在需要时自动调用
await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers: ["nats://127.0.0.1:1222", "nats://127.0.0.1:1223", "nats://127.0.0.1:1224"]) do |nc|
   # 使用连接做一些事情

   # 关闭连接
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

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}