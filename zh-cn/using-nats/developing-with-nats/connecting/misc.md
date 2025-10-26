# 其他功能

本节包含 connect 的其他功能和选项。

## 获取最大有效负载大小

虽然客户端无法控制服务端的最大有效负载大小，但客户端可以在连接建立后提供一种方式，让应用程序获取服务器上已配置的 [`max_payload`](/running-a-nats-service/configuration/README.md#limits)。这将允许应用程序根据需要对数据进行分块或限制，以被服务器接受。

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

mp := nc.MaxPayload()
log.Printf("最大有效负载为 %v 字节", mp)

// 根据最大有效负载进行操作
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

long mp = nc.getMaxPayload();
System.out.println("服务器的最大有效负载为 " + mp + " 字节");
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
t.log(`服务器的最大有效负载为 ${nc.info.max_payload} 字节`);
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

print("最大有效负载为 %d 字节" % nc.max_payload)

# 根据最大有效负载进行操作。
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient("nats://demo.nats.io:4222");

// 确保连接到服务器以接收服务器信息，
// 因为在 .NET 客户端中，连接是懒加载的。
await client.ConnectAsync();

Console.WriteLine($"MaxPayload = {client.Connection.ServerInfo.MaxPayload}");
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(max_outstanding_pings: 5) do |nc|
  nc.on_reconnect do
    puts "已重新连接到 #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "已断开连接！#{reason}"
  end

  # 根据最大有效负载进行操作
  puts "最大有效负载为 #{nc.server_info[:max_payload]} 字节"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsStatus          s        = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);
if (s == NATS_OK)
{
    int64_t mp = natsConnection_GetMaxPayload(conn);
    printf("最大有效负载: %d\n", (int) mp);
}

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

## 启用严格模式

NATS 服务器提供了一个 _pedantic_（严格）模式，可以对协议执行额外的检查。

例如，如果用于发布消息的主题中包含 [通配符](../../../nats-concepts/subjects.md#wildcards)，服务器不会将其作为通配符使用，因此会省略此检查。

默认情况下，此设置处于关闭状态，但您可以启用它来测试您的应用程序：

{% tabs %}
{% tab title="Go" %}
```go
opts := nats.GetDefaultOptions()
opts.Url = "demo.nats.io"
// 启用严格模式
opts.Pedantic = true
nc, err := opts.Connect()
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 使用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            pedantic(). // 启用严格模式
                            build();
Connection nc = Nats.connect(options);

// 使用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// pedantic 选项对于开发 NATS 客户端非常有用。
// JavaScript 客户端还提供 `debug` 选项，该选项会将所有与服务器的协议交互打印到控制台
const nc = await connect({
    pedantic: true,
    servers: ["demo.nats.io:4222"],
    debug: true,
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], pedantic=True)

# 使用连接做点事情。
```
{% endtab %}

{% tab title="C#" %}
```csharp
// NATS .NET 客户端不支持此功能
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(pedantic: true) do |nc|
   nc.on_reconnect do
    puts "已重新连接到 #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "已断开连接！#{reason}"
  end

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
    s = natsOptions_SetPedantic(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## 设置最大控制行大小

客户端与服务器之间的协议相当简单，依赖于一条控制行，有时还有一条消息体。控制行包含发送的操作，如 PING 或 PONG，后面跟着回车换行符（CRLF 或 "\r\n"）。服务器有一个 [`max_control_line`](/running-a-nats-service/configuration/README.md#limits) 选项，可以限制控制行的最大大小。对于 PING 和 PONG 操作，这没啥用，但对于包含主题名称和可能队列组名称的消息，控制行长度可能很重要，因为它实际上限制了可能组合的长度。一些客户端会在内部尝试限制控制行大小，以防止服务器返回错误。这些客户端可能会允许您设置使用的大小，也可能不允许，但如果允许，大小应与服务器配置匹配。

> 不建议将此值设置为高于其他客户端或 nats-server 的值。

例如，将最大控制行大小设置为 2k：

{% tabs %}
{% tab title="Go" %}
```go
// 该功能不适用于 NATS Go 客户端
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            maxControlLine(2 * 1024). // 设置最大控制行为为 2k
                            build();
Connection nc = Nats.connect(options);

// 使用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// 控制行的最大大小由客户端自动确定
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS 客户端不允许自定义控制行。
```
{% endtab %}

{% tab title="C#" %}
```csharp
// NATS .NET 客户端不支持配置控制行。
// 所需内存从数组池动态分配。
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# 在 Ruby NATS 客户端中无需自定义此选项。
```
{% endtab %}

{% tab title="C" %}
```c
// C NATS 客户端不支持配置控制行。
```
{% endtab %}
{% endtabs %}

## 开启/关闭详细模式

客户端可以从 NATS 服务器请求 _verbose_ 模式。当客户端发出请求时，服务器将以 +OK 或 -ERR 错误回复该客户端的每条消息。然而，客户端不会阻塞并等待响应。即使不使用详细模式，错误也会被发送，客户端库也会按照文档中说明的方式处理它们。

> 此功能仅用于调试客户端库或 nats-server 自身。默认情况下，服务器会将其设置为开启，但每个客户端都会将其关闭。

要开启详细模式：

{% tabs %}
{% tab title="Go" %}
```go
opts := nats.GetDefaultOptions()
opts.Url = "demo.nats.io"
// 启用详细模式
opts.Verbose = true
nc, err := opts.Connect()
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 使用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            verbose(). // 启用详细模式
                            build();
Connection nc = Nats.connect(options);

// 使用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
    verbose: true,
    servers: ["demo.nats.io:4222"],
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], verbose=True)

# 使用连接做点事情
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(verbose: true) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

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
    s = natsOptions_SetVerbose(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
