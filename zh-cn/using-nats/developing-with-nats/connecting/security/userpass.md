# 使用用户名和密码进行身份验证

要运行本示例中的代码，先使用以下命令启动服务器：

```bash
nats-server --user myname --pass password
```

您可以使用简单的 [NATS CLI 工具](../../../nats-tools/nats_cli/) 将密码"加密"后传递给 `nats-server`：

```bash
nats server passwd
```

```
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$qbtrnb0mSG2eV55xoyPqHOZx/lLBlryHRhU3LK2oOPFRwGF/5rtGK
```

然后在服务器配置中使用哈希后的密码。客户端仍然使用明文版本。

代码使用 `localhost:4222`，以便您可以在本地机器上启动服务器并进行测试。

## 使用用户名/密码连接

当使用密码登录时，`nats-server` 将接受明文密码或加密后的密码。

{% tabs %}
{% tab title="Go" %}
```go
// 设置用户名和明文密码
nc, err := nats.Connect("127.0.0.1", nats.UserInfo("myname", "password"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder()
    .server("nats://localhost:4222")
    .userInfo("myname","password") // 设置用户名和明文密码
    .build();
Connection nc = Nats.connect(options);

// 用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
 const nc = await connect({
      port: ns.port,
      user: "byname",
      pass: "password",
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://myname:password@demo.nats.io:4222"])

# 用连接做点事情。
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    Url = "nats://localhost:4222",
    AuthOpts = new NatsAuthOpts
    {
        Username = "myname",
        Password = "password",
    }
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers:["nats://myname:password@127.0.0.1:4222"], name: "my-connection") do |nc|
   nc.on_error do |e|
    puts "Error: #{e}"
  end

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
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetUserInfo(opts, "myname", "password");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## 在 URL 中使用用户名/密码连接

大多数客户端允许通过在服务器的 URL 中传递用户名和密码来轻松连接。此标准格式为：

> nats://_用户_:_密码_@服务器:端口

使用此格式，您可以像连接到无认证的服务器一样轻松地连接到需要身份验证的服务器：

{% tabs %}
{% tab title="Go" %}
```go
// 设置用户名和明文密码
nc, err := nats.Connect("myname:password@127.0.0.1")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://myname:password@localhost:4222");

// 用连接做点事情

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// JavaScript 客户端不支持在 URL 中使用用户名/密码，应使用 `user` 和 `pass` 选项。
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://myname:password@demo.nats.io:4222"])

# 用连接做点事情。
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var nc = new NatsClient(new NatsOpts
{
    // .NET 客户端不支持在 URL 中使用用户名/密码，
    // 请使用 `Username` 和 `Password` 选项。
    Url = "nats://demo.nats.io:4222",
    AuthOpts = new NatsAuthOpts
    {
        Username = "myname",
        Password = "password",
    }
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers:["nats://myname:password@127.0.0.1:4222"], name: "my-connection") do |nc|
   nc.on_error do |e|
    puts "Error: #{e}"
  end

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
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetURL(opts, "nats://myname:password@127.0.0.1:4222");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}