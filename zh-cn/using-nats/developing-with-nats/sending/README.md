# 发送消息

NATS 使用一种协议来发送和接收消息，该协议包含目标主题、可选的回复主题以及字节数组。一些库可能提供帮助程序，用于将其他数据格式转换为字节或从字节转换，但最终 NATS 服务器会将所有消息视为不透明的字节数组。

所有 NATS 客户端都设计得可以轻松发送消息。例如，要将字符串“All is Well”作为 UTF-8 编码的字节字符串发送到“updates”主题，您可以这样做：

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

// 默认序列化器使用 UTF-8 编码字符串
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