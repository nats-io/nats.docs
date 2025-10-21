# 发送结构化数据

一些客户端库提供了发送结构化数据的辅助工具，而另一些则依赖应用程序自行进行编码和解码，并仅接受字节数组进行发送。以下示例展示了如何发送 JSON 数据，但也可以轻松修改为发送协议缓冲区（protocol buffer）、YAML 或其他格式。JSON 是一种文本格式，因此在大多数语言中我们还需要将字符串编码为字节。我们使用 UTF-8，这是 JSON 的标准编码方式。

以一个简单的 _股票行情_ 为例，它会发送每只股票的代码和价格：

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

ec, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
if err != nil {
    log.Fatal(err)
}
defer ec.Close()

// 定义对象
type stock struct {
    Symbol string
    Price  int
}

// 发布消息
if err := ec.Publish("updates", &stock{Symbol: "GOOG", Price: 1200}); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
class StockForJsonPub {
    public String symbol;
    public float price;
}

public class PublishJSON {
    public static void main(String[] args) {
        try {
            Connection nc = Nats.connect("nats://demo.nats.io:4222");

            // 创建数据对象
            StockForJsonPub stk = new StockForJsonPub();
            stk.symbol="GOOG";
            stk.price=1200;

            // 使用 Gson 将对象编码为 JSON
            GsonBuilder builder = new GsonBuilder();
            Gson gson = builder.create();
            String json = gson.toJson(stk);

            // 发布消息
            nc.publish("updates", json.getBytes(StandardCharsets.UTF_8));

            // 确保消息发送完成后再关闭连接
            nc.flush(Duration.ZERO);
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
nc.publish("updates", JSON.stringify({ ticker: "GOOG", price: 2868.87 }));
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

await nc.publish("updates", json.dumps({"symbol": "GOOG", "price": 1200 }).encode())
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;

await using var client = new NatsClient();

using var cts = new CancellationTokenSource();

Task process = Task.Run(async () =>
{
    // 我们可以将消息反序列化为 UTF-8 字符串，以便在控制台中查看发布的序列化输出
    await foreach (var msg in client.SubscribeAsync<string>("updates", cancellationToken: cts.Token))
    {
        Console.WriteLine($"Received: {msg.Data}");
    }
});

// 等待订阅任务准备就绪
await Task.Delay(1000);

var stock = new Stock { Symbol = "MSFT", Price = 123.45 };

// 默认的序列化器使用 System.Text.Json 对象进行序列化
await client.PublishAsync<Stock>("updates", stock);

// 定义对象
public record Stock {
    public string Symbol { get; set; }
    public double Price { get; set; }
}

// 输出：
// Received: {"Symbol":"MSFT","Price":123.45}
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'
require 'json'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.publish("updates", {"symbol": "GOOG", "price": 1200}.to_json)
end
```
{% endtab %}

{% tab title="C" %}
```c
// C NATS 客户端中无法配置结构化数据。
```
{% endtab %}
{% endtabs %}