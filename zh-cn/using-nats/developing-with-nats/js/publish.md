# 发布到流

{% tabs %}
{% tab title="Go" %}
```go
func ExampleJetStream() {
	nc, err := nats.Connect("localhost")
	if err != nil {
		log.Fatal(err)
	}

	// 使用 JetStream 上下文来生产和消费已经持久化的消息。
	js, err := nc.JetStream(nats.PublishAsyncMaxPending(256))
	if err != nil {
		log.Fatal(err)
	}

	js.AddStream(&nats.StreamConfig{
		Name:     "example-stream",
		Subjects: []string{"example-subject"},
	})

	js.Publish("example-subject", []byte("Hello JS!"))

	// 异步发布消息。
	for i := 0; i < 500; i++ {
		js.PublishAsync("example-subject", []byte("Hello JS Async!"))
	}
	select {
	case <-js.PublishAsyncComplete():
	case <-time.After(5 * time.Second):
		fmt.Println("未在规定时间内完成")
	}
}
```
{% endtab %}

{% tab title="Java" %}
```java
try (Connection nc = Nats.connect("localhost")) {
    JetStreamManagement jsm = nc.jetStreamManagement();
    jsm.addStream(StreamConfiguration.builder()
        .name("example-stream")
        .subjects("example-subject")
        .build());

    JetStream js = jsm.jetStream();

    // 同步发布
    PublishAck pa = js.publish("example-subject", "Hello JS Sync!".getBytes());
    System.out.println("Publish Sequence: " + pa.getSeqno());

    // 异步发布
    CompletableFuture<PublishAck> future =
        js.publishAsync("example-subject", "Hello JS Async!".getBytes());

    try {
        pa = future.get(1, TimeUnit.SECONDS);
        System.out.println("Publish Sequence: " + pa.getSeqno());
    }
    catch (ExecutionException e) {
        // 可能是由于发布时的某些期望未能满足（高级功能）
        // 也可能是由于内部请求超时，导致发布确认未及时返回
    }
    catch (TimeoutException e) {
        // 超时异常，表示异步发布请求的超时时间比发布确认的超时时间短
    }
    catch (InterruptedException e) {
        // 异步发布线程被中断
    }
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
import { connect, Empty } from "../../src/mod.ts";

const nc = await connect();

const jsm = await nc.jetstreamManager();
await jsm.streams.add({ name: "example-stream", subjects: ["example-subject"] });

const js = await nc.jetstream();
// jetstream 客户端提供了一个 publish 方法，该方法会返回一个确认，
// 表示消息已被服务器接收并存储。你可以为发布消息设置各种期望条件，
// 以防止重复消息。如果这些期望条件未满足，则消息会被拒绝。
let pa = await js.publish("example-subject", Empty, {
  msgID: "a",
  expect: { streamName: "example-stream" },
});
console.log(`${pa.stream}[${pa.seq}]: duplicate? ${pa.duplicate}`);

pa = await js.publish("example-subject", Empty, {
  msgID: "a",
  expect: { lastSequence: 1 },
});
console.log(`${pa.stream}[${pa.seq}]: duplicate? ${pa.duplicate}`);

await jsm.streams.delete("example-stream");
await nc.drain();
```
{% endtab %}

{% tab title="Python" %}
```python
import asyncio

import nats
from nats.errors import TimeoutError


async def main():
    nc = await nats.connect("localhost")

    # 创建 JetStream 上下文。
    js = nc.jetstream()

    # 在 'example-subject' 上持久化消息。
    await js.add_stream(name="example-stream", subjects=["example-subject"])

    for i in range(0, 10):
        ack = await js.publish("example-subject", f"hello world: {i}".encode())
        print(ack)

    await nc.close()

if __name__ == '__main__':
    asyncio.run(main())
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.JetStream;
using NATS.Client.JetStream.Models;

await using var client = new NatsClient();

INatsJSContext js = client.CreateJetStreamContext();

// 创建一个流
var streamConfig = new StreamConfig(name: "example-stream", subjects: ["example-subject"]);
await js.CreateStreamAsync(streamConfig);

// 发布一条消息
{
    PubAckResponse ack = await js.PublishAsync("example-subject", "Hello, JetStream!");
    ack.EnsureSuccess();
}

// 并发发布消息
List<NatsJSPublishConcurrentFuture> futures = new();
for (var i = 0; i < 500; i++)
{
    NatsJSPublishConcurrentFuture future
        = await js.PublishConcurrentAsync("example-subject", "Hello, JetStream 1!");
    futures.Add(future);
}

foreach (var future in futures)
{
    await using (future)
    {
        PubAckResponse ack = await future.GetResponseAsync();
        ack.EnsureSuccess();
    }
}
```
{% endtab %}

{% tab title="C" %}
```c
#include "examples.h"

static const char *usage = ""\
"-stream        stream name (default is 'foo')\n" \
"-txt           text to send (default is 'hello')\n" \
"-count         number of messages to send\n" \
"-sync          publish synchronously (default is async)\n";

static void
_jsPubErr(jsCtx *js, jsPubAckErr *pae, void *closure)
{
    int *errors = (int*) closure;

    printf("Error: %u - Code: %u - Text: %s\n", pae->Err, pae->ErrCode, pae->ErrText);
    printf("Original message: %.*s\n", natsMsg_GetDataLength(pae->Msg), natsMsg_GetData(pae->Msg));

    *errors = (*errors + 1);

    // 如果我们想要重新发送原始消息，我们可以这样做：
    //
    // js_PublishMsgAsync(js, &(pae->Msg), NULL);
    //
    // 注意我们使用 `&(pae->Msg)`，这样如果库获取了所有权，它会将其设置为 NULL，
    // 并且库不会在此回调返回时销毁消息。

    // 不需要销毁任何东西，所有内容都由库处理。
}

int main(int argc, char **argv)
{
    natsConnection      *conn  = NULL;
    natsStatistics      *stats = NULL;
    natsOptions         *opts  = NULL;
    jsCtx               *js    = NULL;
    jsOptions           jsOpts;
    jsErrCode           jerr   = 0;
    natsStatus          s;
    int                 dataLen=0;
    volatile int        errors = 0;
    bool                delStream = false;

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

    if (s == NATS_OK)
    {
        jsStreamInfo    *si = NULL;

        // 首先检查流是否已存在。
        s = js_GetStreamInfo(&si, js, stream, NULL, &jerr);
        if (s == NATS_NOT_FOUND)
        {
            jsStreamConfig  cfg;

            // 由于我们是创建此流的人，我们可以在最后删除它。
            delStream = true;

            // 初始化配置结构。
            jsStreamConfig_Init(&cfg);
            cfg.Name = stream;
            // 设置主题
            cfg.Subjects = (const char*[1]){subj};
            cfg.SubjectsLen = 1;
            // 设置存储到内存。
            cfg.Storage = js_MemoryStorage;
            // 添加流，
            s = js_AddStream(&si, js, &cfg, NULL, &jerr);
        }
        if (s == NATS_OK)
        {
            printf("Stream %s has %" PRIu64 " messages (%" PRIu64 " bytes)\n",
                si->Config->Name, si->State.Msgs, si->State.Bytes);

            // 需要销毁返回的流对象。
            jsStreamInfo_Destroy(si);
        }
    }

    if (s == NATS_OK)
        s = natsStatistics_Create(&stats);

    if (s == NATS_OK)
    {
        printf("\nSending %" PRId64 " messages to subject '%s'\n", total, stream);
        start = nats_Now();
    }

    for (count = 0; (s == NATS_OK) && (count < total); count++)
    {
        if (async)
            s = js_PublishAsync(js, subj, (const void*) payload, dataLen, NULL);
        else
        {
            jsPubAck *pa = NULL;

            s = js_Publish(&pa, js, subj, (const void*) payload, dataLen, NULL, &jerr);
            if (s == NATS_OK)
            {
                if (pa->Duplicate)
                    printf("Got a duplicate message! Sequence=%" PRIu64 "\n", pa->Sequence);

                jsPubAck_Destroy(pa);
            }
        }
    }

    if ((s == NATS_OK) && async)
    {
        jsPubOptions    jsPubOpts;

        jsPubOptions_Init(&jsPubOpts);
        // 设置为 30 秒，如果收到"超时"错误，
        // 可能需要根据发送的消息数量增加此值。
        jsPubOpts.MaxWait = 30000;
        s = js_PublishAsyncComplete(js, &jsPubOpts);
        if (s == NATS_TIMEOUT)
        {
            // 获取待处理消息列表。我们可以重新发送，
            // 等等，但现在只是销毁它们。
            natsMsgList list;

            js_PublishAsyncGetPendingList(&list, js);
            natsMsgList_Destroy(&list);
        }
    }

    if (s == NATS_OK)
    {
        jsStreamInfo *si = NULL;

        elapsed = nats_Now() - start;
        printStats(STATS_OUT, conn, NULL, stats);
        printPerf("Sent");

        if (errors != 0)
            printf("There were %d asynchronous errors\n", errors);

        // 运行后报告一些统计信息
        s = js_GetStreamInfo(&si, js, stream, NULL, &jerr);
        if (s == NATS_OK)
        {
            printf("\nStream %s has %" PRIu64 " messages (%" PRIu64 " bytes)\n",
                si->Config->Name, si->State.Msgs, si->State.Bytes);

            jsStreamInfo_Destroy(si);
        }
    }
    if (delStream && (js != NULL))
    {
        printf("\nDeleting stream %s: ", stream);
        s = js_DeleteStream(js, stream, NULL, &jerr);
        if (s == NATS_OK)
            printf("OK!");
        printf("\n");
    }
    if (s != NATS_OK)
    {
        printf("Error: %u - %s - jerr=%u\n", s, natsStatus_GetText(s), jerr);
        nats_PrintLastErrorStack(stderr);
    }

    // 销毁所有对象以避免内存泄漏警告
    jsCtx_Destroy(js);
    natsStatistics_Destroy(stats);
    natsConnection_Destroy(conn);
    natsOptions_Destroy(opts);

    // 为了在使用 valgrind 时避免报告内存仍在使用中
    nats_Close();

    return 0;
}
```
{% endtab %}
{% endtabs %}
