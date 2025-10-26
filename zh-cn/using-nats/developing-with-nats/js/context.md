# JetStream 上下文
您需要 *JetStream 上下文*（`JetStreamContext`） 来执行任何启用 JetStream 的操作。一些客户端库（例如 Java）还额外有一个 *JetStream 管理上下文*（`JetStreamManagement`）（仅当您的应用程序需要创建/清理/删除/管理流和消费者时才需要），而另一些客户端库（例如 Golang）则仅提供用于所有操作（包括流管理）的 JetStream 上下文。

您只需从连接对象获取 JetStream 上下文（并且可以可选地指定一些 JetStream 选项，尤其是 JetStream 操作超时值）。您也可以从连接中获取 JetStream 管理上下文。

{% tabs %}
{% tab title="Go" %}
```go
// JetStreamContext 是 JetStream 和 JetStreamManagement 接口的组合。
// 如果仅需要发布/消费消息，可以创建仅使用 JetStream 接口的上下文。
func ExampleJetStreamContext() {
nc, _ := nats.Connect("localhost")

var js nats.JetStream
var jsm nats.JetStreamManager
var jsctx nats.JetStreamContext

// 可以发布/订阅但无法管理流的 JetStream。
js, _ = nc.JetStream()
js.Publish("foo", []byte("hello"))

// 可以管理流/消费者但无法生成消息的 JetStream 管理上下文。
jsm, _ = nc.JetStream()
jsm.AddStream(&nats.StreamConfig{Name: "FOO"})

// 可以同时管理流/消费者以及发布/订阅的 JetStream 上下文。
jsctx, _ = nc.JetStream()
jsctx.AddStream(&nats.StreamConfig{Name: "BAR"})
jsctx.Publish("bar", []byte("hello world"))
}
```
{% endtab %}

{% tab title="Java" %}
```java
// 获取 JetStream 上下文
JetStream js = nc.jetStream();
// 获取 JetStream 管理上下文
JetStreamManagement jsm = nc.jetStreamManagement();
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
const nc = await connect();
// 获取 JetStream 上下文
const js = nc.jetstream();
// 获取 JetStream 管理上下文
const jsm = await nc.jetstreamManager();
```
{% endtab %}
{% tab title="Python" %}
```Python
async def main():
    nc = await nats.connect("localhost")

    # 创建 JetStream 上下文。
    js = nc.jetstream()
    
if __name__ == '__main__':
asyncio.run(main())
```
{% endtab %}
{% tab title="C" %}
```C
int main(int argc, char **argv)
{
    natsConnection      *conn  = NULL;
    natsOptions         *opts  = NULL;
    jsCtx               *js    = NULL;
    jsOptions           jsOpts;
    jsErrCode           jerr   = 0;
    volatile int        errors = 0;

    opts = parseArgs(argc, argv, usage);
    dataLen = (int) strlen(payload);

    s = natsConnection_Connect(&conn, opts);

    if (s == NATS_OK)
        s = jsOptions_Init(&jsOpts);

    if (s == NATS_OK)
    {
        if (async)
        {
            jsOpts.PublishAsync.ErrHandler           = _jsPubErr;
            jsOpts.PublishAsync.ErrHandlerClosure    = (void*) &errors;
        }
        s = natsConnection_JetStream(&js, conn, &jsOpts);
    }
    
    // 销毁所有对象以避免内存泄漏报告
    jsCtx_Destroy(js);
    natsConnection_Destroy(conn);
    natsOptions_Destroy(opts);

    // To silence reports of memory still in used with valgrind
    nats_Close();

    return 0;
}
```
{% endtab %}
{% endtabs %}