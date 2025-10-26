# 监听连接事件

虽然呢连接状态本身很有趣，但在连接状态发生变化时及时得知可能更有意义。大多数（如果不是全部的话）NATS客户端库都提供了监听与连接及其状态相关的事件的方法。

这些监听器的实际API取决于语言，以下示例展示了几个更常见的用例。有关更具体的说明，请参阅您正在使用的客户端库的API文档。

连接事件可能包括连接被关闭、断开或重新连接。重新连接涉及断开、连接，但根据库的实现方式，也可能包括服务器尝试找到服务器时的多次断开，或者服务器重启时的多次断开。

{% tabs %}
{% tab title="Go" %}
```go
// 在NATS Go客户端中没有单一的连接事件监听器。
// 相反，您可以使用以下方法给每个事件单独设置处理程序：
nc, err := nats.Connect("demo.nats.io",
    nats.DisconnectErrHandler(func(_ *nats.Conn, err error) {
        log.Printf("client disconnected: %v", err)
    }),
    nats.ReconnectHandler(func(_ *nats.Conn) {
        log.Printf("client reconnected")
    }),
    nats.ClosedHandler(func(_ *nats.Conn) {
        log.Printf("client closed")
    }))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

DisconnectHandler(cb ConnHandler)
ReconnectHandler(cb ConnHandler)
ClosedHandler(cb ConnHandler)
DiscoveredServersHandler(cb ConnHandler)
ErrorHandler(cb ErrHandler)
```
{% endtab %}

{% tab title="Java" %}
```java
class MyConnectionListener implements ConnectionListener {
    public void connectionEvent(Connection natsConnection, Events event) {
        System.out.println("Connection event - " + event);
    }
}

public class SetConnectionListener {
    public static void main(String[] args) {
        try {
            Options options = new Options.Builder()
                .server("nats://demo.nats.io:4222")
                .connectionListener(new MyConnectionListener()) // 设置监听器
                .build();
            Connection nc = Nats.connect(options);

            // 用连接做点事情

            nc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({ servers: ["demo.nats.io"] });
nc.closed().then(() => {
  t.log("the connection closed!");
});

(async () => {
    for await (const s of nc.status()) {
      switch (s.type) {
        case Events.Disconnect:
          t.log(`客户端断开了连接 - ${s.data}`);
          break;
        case Events.LDM:
          t.log("客户端被要求重连");
          break;
        case Events.Update:
          t.log(`客户端收到了集群更新 - ${s.data}`);
          break;
        case Events.Reconnect:
          t.log(`客户端重新连接成功 - ${s.data}`);
          break;
        case Events.Error:
          t.log("客户端遇到了权限错误");
          break;
        case DebugEvents.Reconnecting:
          t.log("客户端正在尝试重新连接");
          break;
        case DebugEvents.StaleConnection:
          t.log("客户端有一个过时的连接");
          break;
        default:
          t.log(`遇到了未知状态 ${s.type}`);
      }
    }
})().then();
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS客户端可以定义多个事件回调
async def disconnected_cb():
    print("Got disconnected!")

async def reconnected_cb():
    # 查看重新连接后连接到哪个服务器
    print("已重连到 {url}".format(url=nc.connected_url.netloc))

async def error_cb(e):
    print("发生了一个错误：{}".format(e))

async def closed_cb():
    print("连接已关闭")

# 设置断开连接和重新连接时的回调
options["disconnected_cb"] = disconnected_cb
options["reconnected_cb"] = reconnected_cb

# 设置发生错误或连接关闭时的回调
options["error_cb"] = error_cb
options["closed_cb"] = closed_cb

await nc.connect(**options)
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

client.Connection.ConnectionDisconnected += async (sender, args) =>
{
    Console.WriteLine($"Disconnected: {args.Message}");
};

client.Connection.ConnectionOpened += async (sender, args) =>
{
    Console.WriteLine($"Connected: {args.Message}");
};

client.Connection.ReconnectFailed += async (sender, args) =>
{
    Console.WriteLine($"Reconnect Failed: {args.Message}");
};

await client.ConnectAsync();
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# 在Ruby NATS客户端中没有单一的连接事件监听器。
# 相比之下，您可以使用以下方法设置单独的事件处理程序：

NATS.on_disconnect do
end

NATS.on_reconnect do
end

NATS.on_close do
end

NATS.on_error do
end
```
{% endtab %}

{% tab title="C" %}
```c
static void
disconnectedCB(natsConnection *conn, void *closure)
{
    // Do something
    printf("Connection disconnected\n");
}

static void
reconnectedCB(natsConnection *conn, void *closure)
{
    // Do something
    printf("Connection reconnected\n");
}

static void
closedCB(natsConnection *conn, void *closure)
{
    // Do something
    printf("Connection closed\n");
}

(...)

natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetDisconnectedCB(opts, disconnectedCB, NULL);
if (s == NATS_OK)
    s = natsOptions_SetReconnectedCB(opts, reconnectedCB, NULL);
if (s == NATS_OK)
    s = natsOptions_SetClosedCB(opts, closedCB, NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁已创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## 监听集群中的新服务器加入

当使用集群时，可能有服务器添加或更改。某些客户端允许您监听此变化。
{% tabs %}
{% tab title="Go" %}
```go
// 当有新服务器加入集群时收到通知。
// 打印所有已知服务器、仅发现的服务器。
nc, err := nats.Connect("demo.nats.io",
    nats.DiscoveredServersHandler(func(nc *nats.Conn) {
        log.Printf("Known servers: %v\n", nc.Servers())
        log.Printf("Discovered servers: %v\n", nc.DiscoveredServers())
    }))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
class ServersAddedListener implements ConnectionListener {
    public void connectionEvent(Connection nc, Events event) {
        if (event == Events.DISCOVERED_SERVERS) {
            for (String server : nc.getServers()) {
                System.out.println("Known server: "+server);
            }
        }
    }
}

public class ListenForNewServers {
    public static void main(String[] args) {

        try {
            Options options = new Options.Builder().
                                        server("nats://demo.nats.io:4222").
                                        connectionListener(new ServersAddedListener()). // 设置监听器
                                        build();
            Connection nc = Nats.connect(options);

            // 用连接做点事情

            nc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({ servers: ["demo.nats.io:4222"] });
(async () => {
  for await (const s of nc.status()) {
    switch (s.type) {
      case Status.Update:
        t.log(`servers added - ${s.data.added}`);
        t.log(`servers deleted - ${s.data.deleted}`);
        break;
      default:
    }
  }
})().then();
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS 客户端尚未支持监听新服务器事件
```
{% endtab %}

{% tab title="C#" %}
```csharp
// NATS .NET 客户端尚未支持监听新服务器事件
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# Ruby NATS 客户端尚未支持监听新服务器事件
```
{% endtab %}

{% tab title="C" %}
```c
static void
discoveredServersCB(natsConnection *conn, void *closure)
{
    natsStatus  s         = NATS_OK;
    char        **servers = NULL;
    int         count     = 0;

    s = natsConnection_GetDiscoveredServers(conn, &servers, &count);
    if (s == NATS_OK)
    {
        int i;

        // 做一些操作...
        for (i=0; i<count; i++)
            printf("Discovered server: %s\n", servers[i]);

        // 释放已分配的内存
        for (i=0; i<count; i++)
            free(servers[i]);
        free(servers);
    }
}

(...)

natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetDiscoveredServersCB(opts, discoveredServersCB, NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)


// 销毁已创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## 监听错误

客户端库可能会将 从服务器发到客户端的错误 与事件分离。许多服务器事件不会被应用程序代码处理，从而导致连接关闭。监听错误对于调试问题非常有用。

{% tabs %}
{% tab title="Go" %}
```go
// 设置当异步错误发生时将被调用的回调函数。
nc, err := nats.Connect("demo.nats.io",
    nats.ErrorHandler(func(_ *nats.Conn, _ *nats.Subscription, err error) {
        log.Printf("Error: %v", err)
    }))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
class MyErrorListener implements ErrorListener {
    public void errorOccurred(Connection conn, String error)
    {
        System.out.println("The server notificed the client with: "+error);
    }

    public void exceptionOccurred(Connection conn, Exception exp) {
        System.out.println("The connection handled an exception: "+exp.getLocalizedMessage());
    }

    public void slowConsumerDetected(Connection conn, Consumer consumer) {
        System.out.println("A slow consumer was detected.");
    }
}

public class SetErrorListener {
    public static void main(String[] args) {

        try {
            Options options = new Options.Builder().
                                        server("nats://demo.nats.io:4222").
                                        errorListener(new MyErrorListener()). // 设置监听器
                                        build();
            Connection nc = Nats.connect(options);

            // 用连接做点事情

            nc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({ servers: ["demo.nats.io"] });

// 如果客户端因错误而关闭，您可以在关闭处理程序中捕获这种情况：
nc.closed().then((err) => {
  if (err) {
    t.log(`the connection closed with an error ${err.message}`);
  } else {
    t.log(`the connection closed.`);
  }
});

// 如果您有状态监听器，它也会收到通知
(async () => {
  for await (const s of nc.status()) {
    switch (s.type) {
      case Status.Error:
        // 通常如果收到这个，NATS连接将会关闭
        t.log("客户端从服务器收到了异步错误");
        break;
      default:
        t.log(`遇到了未知状态 ${s.type}`);
    }
  }
})().then();
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def error_cb(e):
   print("Error: ", e)

await nc.connect(
   servers=["nats://demo.nats.io:4222"],
   reconnect_time_wait=10,
   error_cb=error_cb,
   )

# 用连接做点事情.
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using Microsoft.Extensions.Logging;
using NATS.Client.Core;
using NATS.Net;

// NATS .NET客户端目前不支持错误处理程序
// 相反，您可以使用日志记录器，因为服务器错误会以错误级别和事件ID 1005（协议日志事件）记录。
await using var client = new NatsClient(new NatsOpts
{
    LoggerFactory = LoggerFactory.Create(builder => builder.AddConsole()),
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers:["nats://demo.nats.io:4222"]) do |nc|
   nc.on_error do |e|
    puts "Error: #{e}"
  end

  nc.close
end
```
{% endtab %}

{% tab title="C" %}
```c
static void
errorCB(natsConnection *conn, natsSubscription *sub, natsStatus s, void *closure)
{
    // Do something
    printf("Error: %d - %s\n", s, natsStatus_GetText(s));
}

(...)

natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetErrorHandler(opts, errorCB, NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁已创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
