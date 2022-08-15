# JetStream contexts
You will need the *JetStream context* to make any JetStream enabled operation. Some client libraries (e.g. Java) also have a *JetStream Management context* (which you will only need if your application needs to create/purge/delete/manage streams and consumers), while some client libraries (e.g. Golang) only have the JetStream context that you use for all operations (including stream management).

You obtain a JetStream context simply from your connection object (and you can optionally specify some JetStream options, most notably the JetStream operation timeout value). You also obtain the JetStream Management context from the connection.

{% tabs %}
{% tab title="Go" %}
```go
// A JetStreamContext is the composition of a JetStream and JetStreamManagement interfaces.
// In case of only requiring publishing/consuming messages, can create a context that
// only uses the JetStream interface.
func ExampleJetStreamContext() {
nc, _ := nats.Connect("localhost")

var js nats.JetStream
var jsm nats.JetStreamManager
var jsctx nats.JetStreamContext

// JetStream that can publish/subscribe but cannot manage streams.
js, _ = nc.JetStream()
js.Publish("foo", []byte("hello"))

// JetStream context that can manage streams/consumers but cannot produce messages.
jsm, _ = nc.JetStream()
jsm.AddStream(&nats.StreamConfig{Name: "FOO"})

// JetStream context that can both manage streams/consumers
// as well as publish/subscribe.
jsctx, _ = nc.JetStream()
jsctx.AddStream(&nats.StreamConfig{Name: "BAR"})
jsctx.Publish("bar", []byte("hello world"))
}
```
{% /tab %}

{% tab title="Java" %}
```java
// Getting the JetStream context
JetStream js = nc.jetStream();
// Getting the JetStream management context
JetStreamManagement jsm = nc.jetStreamManagement();
```
{% /tab %}
{% tab title="JavaScript" %}
```javascript
const nc = await connect();
// Getting the JetStream context
const js = nc.jetstream();
// Getting the JetStream management context
const jsm = await nc.jetstreamManager();
```
{% /tab %}
{% tab title="Python" %}
```Python
async def main():
    nc = await nats.connect("localhost")

    # Create JetStream context.
    js = nc.jetstream()
    
if __name__ == '__main__':
asyncio.run(main())
```
{% /tab %}
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
    
    // Destroy all our objects to avoid report of memory leak
    jsCtx_Destroy(js);
    natsConnection_Destroy(conn);
    natsOptions_Destroy(opts);

    // To silence reports of memory still in used with valgrind
    nats_Close();

    return 0;
}
```
{% /tab %}
{% /tabs %}
