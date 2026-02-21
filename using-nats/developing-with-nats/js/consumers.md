# Consumers JetStream

Consumers — это способ, которым клиентские приложения получают сообщения, сохранённые в streams. На одном stream может быть много consumers. Consumers похожи на представления (views) над stream, могут фильтровать сообщения и имеют некоторое состояние (поддерживается серверами).

Consumers могут быть «durable» или «ephemeral».

## Durable и ephemeral consumers

Durable consumer сохраняет прогресс доставки сообщений на стороне сервера. Durable consumer можно получить по имени и разделять между экземплярами клиента для балансировки нагрузки. Его можно сделать высокодоступным через реплики.

Ephemeral consumer не сохраняет прогресс доставки и автоматически удаляется, когда больше нет подключённых экземпляров клиента.

### Durable consumers

Durable consumers предназначены для использования несколькими экземплярами приложения: для распределения и масштабирования обработки или для сохранения позиции consumer по stream между запусками приложения.

Durable consumers, как следует из названия, рассчитаны «на долго» и обычно создаются и удаляются административно, а не кодом приложения, которому достаточно указать известное имя durable consumer.

Создать durable consumer можно командой CLI `nats consumer add` или программно, передав опцию имени durable при создании подписки.

### Ephemeral consumers

Ephemeral consumers предназначены для использования одним экземпляром приложения (например, чтобы получать собственный replay сообщений из stream).

Ephemeral consumers не предназначены «навсегда» — они автоматически создаются при подписке клиентской библиотекой и исчезают после отключения приложения.

Вы (автоматически) создаёте ephemeral consumer, когда вызываете `js.Subscribe` без указания опций Durable или Bind. Вызов Drain для этой подписки автоматически удаляет базовый ephemeral consumer.
Также можно явно создать ephemeral consumer, не передавая опцию имени durable при вызове `jsm.AddConsumer`.

В остальном ephemeral consumers имеют такой же контроль над подтверждениями (ack) и повторной доставкой, как и durable consumers.

## Push и Pull consumers

Клиенты реализуют два варианта consumers: «push» и «pull».

### Push consumers

Push consumers получают сообщения на конкретный subject, при этом поток сообщений контролируется сервером. Балансировка нагрузки поддерживается через queue groups Core NATS. Сообщения из stream автоматически распределяются между клиентами, подписанными на push consumer.

### Pull consumers

Pull consumers явно запрашивают сообщения у сервера пачками, что даёт клиенту полный контроль над диспетчеризацией, управлением потоком, ожидающими (неподтверждёнными) сообщениями и балансировкой нагрузки. Клиент, потребляющий pull, делает вызовы `fetch()` в цикле диспетчеризации.

{% hint style="info" %}Мы рекомендуем использовать pull consumers для новых проектов, особенно когда в фокусе масштабируемость, детальный контроль потока или обработка ошибок.
Большинство клиентских API обновлены и предоставляют удобные интерфейсы для потребления сообщений через callback‑обработчики или итераторы без необходимости управлять получением сообщений вручную.
{% endhint %}

Вызовы `fetch()` могут быть немедленными или с заданным таймаутом, позволяя либо контролируемое (по одному) потребление, либо `realtime`‑доставку с минимальными накладными расходами на опрос.  

Pull consumers создают меньшую нагрузку на CPU серверов NATS и поэтому масштабируются лучше (при этом push consumers тоже достаточно быстрые и масштабируемые; разницу обычно заметно лишь при устойчиво высоких скоростях сообщений).

#### Pull

{% tabs %}
{% tab title="Go" %}

```go
func ExampleJetStream() {
    nc, err := nats.Connect("localhost")
    if err != nil {
        log.Fatal(err)
    }

	// Use the JetStream context to produce and consumer messages
	// that have been persisted.
	js, err := nc.JetStream(nats.PublishAsyncMaxPending(256))
	if err != nil {
		log.Fatal(err)
	}

	js.AddStream(&nats.StreamConfig{
		Name:     "FOO",
		Subjects: []string{"foo"},
	})

	js.Publish("foo", []byte("Hello JS!"))

	// Publish messages asynchronously.
	for i := 0; i < 500; i++ {
		js.PublishAsync("foo", []byte("Hello JS Async!"))
	}
	select {
	case <-js.PublishAsyncComplete():
	case <-time.After(5 * time.Second):
		fmt.Println("Did not resolve in time")
	}

	// Create Pull based consumer with maximum 128 inflight.
	sub, _ := js.PullSubscribe("foo", "wq", nats.PullMaxWaiting(128))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

        // Fetch will return as soon as any message is available rather than wait until the full batch size is available, using a batch size of more than 1 allows for higher throughput when needed.
		msgs, _ := sub.Fetch(10, nats.Context(ctx))
		for _, msg := range msgs {
			msg.Ack()
		}
	}
}
```

{% endtab %}
{% tab title="Java" %}

```java
package io.nats.examples.jetstream.simple;

import io.nats.client.*;
import io.nats.client.api.ConsumerConfiguration;
import io.nats.examples.jetstream.ResilientPublisher;
import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import static io.nats.examples.jetstream.NatsJsUtils.createOrReplaceStream;

/**
* This example will demonstrate simplified consume with a handler
*/
public class MessageConsumerExample {
 private static final String STREAM = "consume-stream";
 private static final String SUBJECT = "consume-subject";
 private static final String CONSUMER_NAME = "consume-consumer";
 private static final String MESSAGE_PREFIX = "consume";
 private static final int STOP_COUNT = 500;
 private static final int REPORT_EVERY = 100;
 private static final String SERVER = "nats://localhost:4222";

 public static void main(String[] args) {
     Options options = Options.builder().server(SERVER).build();
     try (Connection nc = Nats.connect(options)) {
         JetStreamManagement jsm = nc.jetStreamManagement();
         createOrReplaceStream(jsm, STREAM, SUBJECT);

         //Utility for filling the stream with some messages
         System.out.println("Starting publish...");
         ResilientPublisher publisher = new ResilientPublisher(nc, jsm, STREAM, SUBJECT).basicDataPrefix(MESSAGE_PREFIX).jitter(10);
         Thread pubThread = new Thread(publisher);
         pubThread.start();

         // get stream context, create consumer and get the consumer context
         StreamContext streamContext;
         ConsumerContext consumerContext;
         CountDownLatch latch = new CountDownLatch(1);
         AtomicInteger atomicCount = new AtomicInteger();
         long start = System.nanoTime();

         streamContext = nc.getStreamContext(STREAM);
         streamContext.createOrUpdateConsumer(ConsumerConfiguration.builder().durable(CONSUMER_NAME).build());
         consumerContext = streamContext.getConsumerContext(CONSUMER_NAME);

         MessageHandler handler = msg -> {
             msg.ack();
             int count = atomicCount.incrementAndGet();
             if (count % REPORT_EVERY == 0) {
            	 System.out.println("Handler" + ": Received " + count + " messages in " + (System.nanoTime() - start) / 1_000_000 + "ms.");
             }
             if (count == STOP_COUNT) {
                 latch.countDown();
             }
         };

     	 // create the consumer and install handler
     	 MessageConsumer consumer = consumerContext.consume(handler);
     	 //Waiting for the handler signalling us to stop
         latch.await();
         // When stop is called, no more pull requests will be made, but messages already requested
         // will still come across the wire to the client.
         System.out.println("Stopping the consumer...");
         consumer.stop();
         // wait until the consumer is finished processing backlog
         while (!consumer.isFinished()) {
             Thread.sleep(10);
         }
         System.out.println("Final" + ": Received " + atomicCount.get() + " messages in " + (System.nanoTime() - start) / 1_000_000 + "ms.");

         publisher.stop(); // otherwise the ConsumerContext background thread will complain when the connection goes away
         pubThread.join();
     }
     catch (JetStreamApiException | IOException e) {
         // JetStreamApiException:
         //      1. the stream or consumer did not exist
         //      2. api calls under the covers theoretically this could fail, but practically it won't.
         // IOException:
         //      likely a connection problem
         System.err.println("Exception should not handled, exiting.");
         System.exit(-1);
     }
     catch (Exception e) {
         System.err.println("Exception should not handled, exiting.");
         System.exit(-1);
     }
 }
}
```

{% endtab %}
{% tab title="JavaScript" %}

```javascript
import { AckPolicy, connect, nanos } from "../../src/mod.ts";
import { nuid } from "../../nats-base-client/nuid.ts";

const nc = await connect();

const stream = nuid.next();
const subj = nuid.next();
const durable = nuid.next();

const jsm = await nc.jetstreamManager();
await jsm.streams.add({ name: stream, subjects: [subj] });

const js = nc.jetstream();
await js.publish(subj);
await js.publish(subj);
await js.publish(subj);
await js.publish(subj);

const psub = await js.pullSubscribe(subj, {
  mack: true,
  // artificially low ack_wait, to show some messages
  // not getting acked being redelivered
  config: {
    durable_name: durable,
    ack_policy: AckPolicy.Explicit,
    ack_wait: nanos(4000),
  },
});

(async () => {
  for await (const m of psub) {
    console.log(
      `[${m.seq}] ${
        m.redelivered ? `- redelivery ${m.info.redeliveryCount}` : ""
      }`
    );
    if (m.seq % 2 === 0) {
      m.ack();
    }
  }
})();

const fn = () => {
  console.log("[PULL]");
  psub.pull({ batch: 1000, expires: 10000 });
};

// do the initial pull
fn();
// and now schedule a pull every so often
const interval = setInterval(fn, 10000); // and repeat every 2s

setTimeout(() => {
  clearInterval(interval);
  nc.drain();
}, 20000);
```

{% endtab %}
{% tab title= "Python" %}

```python
import asyncio

import nats
from nats.errors import TimeoutError

async def main():
    nc = await nats.connect("localhost")

    # Create JetStream context.
    js = nc.jetstream()

    # Persist messages on 'foo's subject.
    await js.add_stream(name="sample-stream", subjects=["foo"])

    for i in range(0, 10):
        ack = await js.publish("foo", f"hello world: {i}".encode())
        print(ack)

    # Create pull based consumer on 'foo'.
    psub = await js.pull_subscribe("foo", "psub")

    # Fetch and ack messagess from consumer.
    for i in range(0, 10):
        msgs = await psub.fetch(1)
        for msg in msgs:
            print(msg)

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

// Create a stream
var streamConfig = new StreamConfig(name: "FOO", subjects: ["foo"]);
await js.CreateStreamAsync(streamConfig);

// Publish a message
{
    PubAckResponse ack = await js.PublishAsync("foo", "Hello, JetStream!");
    ack.EnsureSuccess();
}

// Publish messages concurrently
List<NatsJSPublishConcurrentFuture> futures = new();
for (var i = 0; i < 500; i++)
{
    NatsJSPublishConcurrentFuture future
        = await js.PublishConcurrentAsync("foo", "Hello, JetStream 1!");
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


// Create a consumer with a maximum 128 inflight messages
INatsJSConsumer consumer = await js.CreateConsumerAsync("FOO", new ConsumerConfig(name: "foo")
{
    MaxWaiting = 128,
});

using CancellationTokenSource cts = new(TimeSpan.FromSeconds(10));

while (cts.IsCancellationRequested == false)
{
    var opts = new NatsJSFetchOpts { MaxMsgs = 10 };
    await foreach (NatsJSMsg<string> msg in consumer.FetchAsync<string>(opts, cancellationToken: cts.Token))
    {
        await msg.AckAsync(cancellationToken: cts.Token);
    }
}
```
{% endtab %}


{% tab title="C" %}

```c
#include "examples.h"

static const char *usage = ""\
"-gd            use global message delivery thread pool\n" \
"-sync          receive synchronously (default is asynchronous)\n" \
"-pull          use pull subscription\n" \
"-fc            enable flow control\n" \
"-count         number of expected messages\n";

static void
onMsg(natsConnection *nc, natsSubscription *sub, natsMsg *msg, void *closure)
{
    if (print)
        printf("Received msg: %s - %.*s\n",
               natsMsg_GetSubject(msg),
               natsMsg_GetDataLength(msg),
               natsMsg_GetData(msg));

    if (start == 0)
        start = nats_Now();

    // We should be using a mutex to protect those variables since
    // they are used from the subscription's delivery and the main
    // threads. For demo purposes, this is fine.
    if (++count == total)
        elapsed = nats_Now() - start;

    // Since this is auto-ack callback, we don't need to ack here.
    natsMsg_Destroy(msg);
}

static void
asyncCb(natsConnection *nc, natsSubscription *sub, natsStatus err, void *closure)
{
    printf("Async error: %u - %s\n", err, natsStatus_GetText(err));

    natsSubscription_GetDropped(sub, (int64_t*) &dropped);
}

int main(int argc, char **argv)
{
    natsConnection      *conn  = NULL;
    natsStatistics      *stats = NULL;
    natsOptions         *opts  = NULL;
    natsSubscription    *sub   = NULL;
    natsMsg             *msg   = NULL;
    jsCtx               *js    = NULL;
    jsErrCode           jerr   = 0;
    jsOptions           jsOpts;
    jsSubOptions        so;
    natsStatus          s;
    bool                delStream = false;

    opts = parseArgs(argc, argv, usage);

    printf("Created %s subscription on '%s'.\n",
        (pull ? "pull" : (async ? "asynchronous" : "synchronous")), subj);

    s = natsOptions_SetErrorHandler(opts, asyncCb, NULL);

    if (s == NATS_OK)
        s = natsConnection_Connect(&conn, opts);

    if (s == NATS_OK)
        s = jsOptions_Init(&jsOpts);

    if (s == NATS_OK)
        s = jsSubOptions_Init(&so);
    if (s == NATS_OK)
    {
        so.Stream = stream;
        so.Consumer = durable;
        if (flowctrl)
        {
            so.Config.FlowControl = true;
            so.Config.Heartbeat = (int64_t)1E9;
        }
    }

    if (s == NATS_OK)
        s = natsConnection_JetStream(&js, conn, &jsOpts);

    if (s == NATS_OK)
    {
        jsStreamInfo    *si = NULL;

        // First check if the stream already exists.
        s = js_GetStreamInfo(&si, js, stream, NULL, &jerr);
        if (s == NATS_NOT_FOUND)
        {
            jsStreamConfig  cfg;

            // Since we are the one creating this stream, we can delete at the end.
            delStream = true;

            // Initialize the configuration structure.
            jsStreamConfig_Init(&cfg);
            cfg.Name = stream;
            // Set the subject
            cfg.Subjects = (const char*[1]){subj};
            cfg.SubjectsLen = 1;
            // Make it a memory stream.
            cfg.Storage = js_MemoryStorage;
            // Add the stream,
            s = js_AddStream(&si, js, &cfg, NULL, &jerr);
        }
        if (s == NATS_OK)
        {
            printf("Stream %s has %" PRIu64 " messages (%" PRIu64 " bytes)\n",
                si->Config->Name, si->State.Msgs, si->State.Bytes);

            // Need to destroy the returned stream object.
            jsStreamInfo_Destroy(si);
        }
    }

    if (s == NATS_OK)
    {
        if (pull)
            s = js_PullSubscribe(&sub, js, subj, durable, &jsOpts, &so, &jerr);
        else if (async)
            s = js_Subscribe(&sub, js, subj, onMsg, NULL, &jsOpts, &so, &jerr);
        else
            s = js_SubscribeSync(&sub, js, subj, &jsOpts, &so, &jerr);
    }
    if (s == NATS_OK)
        s = natsSubscription_SetPendingLimits(sub, -1, -1);

    if (s == NATS_OK)
        s = natsStatistics_Create(&stats);

    if ((s == NATS_OK) && pull)
    {
        natsMsgList list;
        int         i;

        for (count = 0; (s == NATS_OK) && (count < total); )
        {
            s = natsSubscription_Fetch(&list, sub, 1024, 5000, &jerr);
            if (s != NATS_OK)
                break;

            if (start == 0)
                start = nats_Now();

            count += (int64_t) list.Count;
            for (i=0; (s == NATS_OK) && (i<list.Count); i++)
                s = natsMsg_Ack(list.Msgs[i], &jsOpts);

            natsMsgList_Destroy(&list);
        }
    }
    else if ((s == NATS_OK) && async)
    {
        while (s == NATS_OK)
        {
            if (count + dropped == total)
                break;

            nats_Sleep(1000);
        }
    }
    else if (s == NATS_OK)
    {
        for (count = 0; (s == NATS_OK) && (count < total); count++)
        {
            s = natsSubscription_NextMsg(&msg, sub, 5000);
            if (s != NATS_OK)
                break;

            if (start == 0)
                start = nats_Now();

            s = natsMsg_Ack(msg, &jsOpts);
            natsMsg_Destroy(msg);
        }
    }

    if (s == NATS_OK)
    {
        printStats(STATS_IN|STATS_COUNT, conn, sub, stats);
        printPerf("Received");
    }
    if (s == NATS_OK)
    {
        jsStreamInfo *si = NULL;

        // Let's report some stats after the run
        s = js_GetStreamInfo(&si, js, stream, NULL, &jerr);
        if (s == NATS_OK)
        {
            printf("\nStream %s has %" PRIu64 " messages (%" PRIu64 " bytes)\n",
                si->Config->Name, si->State.Msgs, si->State.Bytes);

            jsStreamInfo_Destroy(si);
        }
        if (delStream)
        {
            printf("\nDeleting stream %s: ", stream);
            s = js_DeleteStream(js, stream, NULL, &jerr);
            if (s == NATS_OK)
                printf("OK!");
            printf("\n");
        }
    }
    else
    {
        printf("Error: %u - %s - jerr=%u\n", s, natsStatus_GetText(s), jerr);
        nats_PrintLastErrorStack(stderr);
    }

    // Destroy all our objects to avoid report of memory leak
    jsCtx_Destroy(js);
    natsStatistics_Destroy(stats);
    natsSubscription_Destroy(sub);
    natsConnection_Destroy(conn);
    natsOptions_Destroy(opts);

    // To silence reports of memory still in used with valgrind
    nats_Close();

    return 0;
}
```

{% endtab %}
{% endtabs %}

Push consumer также может использоваться в других сценариях, например без queue group, без подтверждений или с кумулятивными подтверждениями.

#### Push

{% tabs %}
{% tab title="Go" %}

```go
func ExampleJetStream() {
	nc, err := nats.Connect("localhost")
	if err != nil {
		log.Fatal(err)
	}

	// Use the JetStream context to produce and consumer messages
	// that have been persisted.
	js, err := nc.JetStream(nats.PublishAsyncMaxPending(256))
	if err != nil {
		log.Fatal(err)
	}

	js.AddStream(&nats.StreamConfig{
		Name:     "FOO",
		Subjects: []string{"foo"},
	})

	js.Publish("foo", []byte("Hello JS!"))

	// Publish messages asynchronously.
	for i := 0; i < 500; i++ {
		js.PublishAsync("foo", []byte("Hello JS Async!"))
	}
	select {
	case <-js.PublishAsyncComplete():
	case <-time.After(5 * time.Second):
		fmt.Println("Did not resolve in time")
	}

	// Create async consumer on subject 'foo'. Async subscribers
	// ack a message once exiting the callback.
	js.Subscribe("foo", func(msg *nats.Msg) {
		meta, _ := msg.Metadata()
		fmt.Printf("Stream Sequence  : %v\n", meta.Sequence.Stream)
		fmt.Printf("Consumer Sequence: %v\n", meta.Sequence.Consumer)
	})

	// Async subscriber with manual acks.
	js.Subscribe("foo", func(msg *nats.Msg) {
		msg.Ack()
	}, nats.ManualAck())

	// Async queue subscription where members load balance the
	// received messages together.
	// If no consumer name is specified, either with nats.Bind()
	// or nats.Durable() options, the queue name is used as the
	// durable name (that is, as if you were passing the
	// nats.Durable(<queue group name>) option.
	// It is recommended to use nats.Bind() or nats.Durable()
	// and preferably create the JetStream consumer beforehand
	// (using js.AddConsumer) so that the JS consumer is not
	// deleted on an Unsubscribe() or Drain() when the member
	// that created the consumer goes away first.
	// Check Godoc for the QueueSubscribe() API for more details.
	js.QueueSubscribe("foo", "group", func(msg *nats.Msg) {
		msg.Ack()
	}, nats.ManualAck())

	// Subscriber to consume messages synchronously.
	sub, _ := js.SubscribeSync("foo")
	msg, _ := sub.NextMsg(2 * time.Second)
	msg.Ack()

	// We can add a member to the group, with this member using
	// the synchronous version of the QueueSubscribe.
	sub, _ = js.QueueSubscribeSync("foo", "group")
	msg, _ = sub.NextMsg(2 * time.Second)
	msg.Ack()

	// ChanSubscribe
	msgCh := make(chan *nats.Msg, 8192)
	sub, _ = js.ChanSubscribe("foo", msgCh)

	select {
	case msg := <-msgCh:
		fmt.Println("[Received]", msg)
	case <-time.After(1 * time.Second):
	}
}
```

{% endtab %}
{% tab title="Java" %}

```java
package io.nats.examples.jetstream;

import io.nats.client.*;
import io.nats.client.api.PublishAck;
import io.nats.examples.ExampleArgs;
import io.nats.examples.ExampleUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static io.nats.examples.jetstream.NatsJsUtils.createStreamExitWhenExists;

/**
 * This example will demonstrate JetStream push subscribing using a durable consumer and a queue
 */
public class NatsJsPushSubQueueDurable {
    static final String usageString =
        "\nUsage: java -cp <classpath> NatsJsPushSubQueueDurable [-s server] [-strm stream] [-sub subject] [-q queue] [-dur durable] [-mcnt msgCount] [-scnt subCount]"
            + "\n\nDefault Values:"
            + "\n   [-strm stream]   qdur-stream"
            + "\n   [-sub subject]   qdur-subject"
            + "\n   [-q queue]       qdur-queue"
            + "\n   [-dur durable]   qdur-durable"
            + "\n   [-mcnt msgCount] 100"
            + "\n   [-scnt subCount] 5"
            + "\n\nUse tls:// or opentls:// to require tls, via the Default SSLContext\n"
            + "\nSet the environment variable NATS_NKEY to use challenge response authentication by setting a file containing your private key.\n"
            + "\nSet the environment variable NATS_CREDS to use JWT/NKey authentication by setting a file containing your user creds.\n"
            + "\nUse the URL in the -s server parameter for user/pass/token authentication.\n";

    public static void main(String[] args) {
        ExampleArgs exArgs = ExampleArgs.builder("Push Subscribe, Durable Consumer, Queue", args, usageString)
                .defaultStream("qdur-stream")
                .defaultSubject("qdur-subject")
                .defaultQueue("qdur-queue")
                .defaultDurable("qdur-durable")
                .defaultMsgCount(100)
                .defaultSubCount(5)
                .build();

        try (Connection nc = Nats.connect(ExampleUtils.createExampleOptions(exArgs.server, true))) {

            // Create a JetStreamManagement context.
            JetStreamManagement jsm = nc.jetStreamManagement();

            // Use the utility to create a stream stored in memory.
            createStreamExitWhenExists(jsm, exArgs.stream, exArgs.subject);

            // Create our JetStream context
            JetStream js = nc.jetStream();

            System.out.println();

            // Setup the subscribers
            // - the PushSubscribeOptions can be re-used since all the subscribers are the same
            // - use a concurrent integer to track all the messages received
            // - have a list of subscribers and threads so I can track them
            PushSubscribeOptions pso = PushSubscribeOptions.builder().durable(exArgs.durable).build();
            AtomicInteger allReceived = new AtomicInteger();
            List<JsQueueSubscriber> subscribers = new ArrayList<>();
            List<Thread> subThreads = new ArrayList<>();
            for (int id = 1; id <= exArgs.subCount; id++) {
                // setup the subscription
                JetStreamSubscription sub = js.subscribe(exArgs.subject, exArgs.queue, pso);
                // create and track the runnable
                JsQueueSubscriber qs = new JsQueueSubscriber(id, exArgs, js, sub, allReceived);
                subscribers.add(qs);
                // create, track and start the thread
                Thread t = new Thread(qs);
                subThreads.add(t);
                t.start();
            }
            nc.flush(Duration.ofSeconds(1)); // flush outgoing communication with/to the server

            // create and start the publishing
            Thread pubThread = new Thread(new JsPublisher(js, exArgs));
            pubThread.start();

            // wait for all threads to finish
            pubThread.join();
            for (Thread t : subThreads) {
                t.join();
            }

            // report
            for (JsQueueSubscriber qs : subscribers) {
                qs.report();
            }

            System.out.println();

            // delete the stream since we are done with it.
            jsm.deleteStream(exArgs.stream);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    static class JsPublisher implements Runnable {
        JetStream js;
        ExampleArgs exArgs;

        public JsPublisher(JetStream js, ExampleArgs exArgs) {
            this.js = js;
            this.exArgs = exArgs;
        }

        @Override
        public void run() {
            for (int x = 1; x <= exArgs.msgCount; x++) {
                try {
                    PublishAck pa = js.publish(exArgs.subject, ("Data # " + x).getBytes(StandardCharsets.US_ASCII));
                } catch (IOException | JetStreamApiException e) {
                    // something pretty wrong here
                    e.printStackTrace();
                    System.exit(-1);
                }
            }
        }
    }

    static class JsQueueSubscriber implements Runnable {
        int id;
        int thisReceived;
        List<String> datas;

        ExampleArgs exArgs;
        JetStream js;
        JetStreamSubscription sub;
        AtomicInteger allReceived;

        public JsQueueSubscriber(int id, ExampleArgs exArgs, JetStream js, JetStreamSubscription sub, AtomicInteger allReceived) {
            this.id = id;
            thisReceived = 0;
            datas = new ArrayList<>();
            this.exArgs = exArgs;
            this.js = js;
            this.sub = sub;
            this.allReceived = allReceived;
        }

        public void report() {
            System.out.printf("Sub # %d handled %d messages.\n", id, thisReceived);
        }

        @Override
        public void run() {
            while (allReceived.get() < exArgs.msgCount) {
                try {
                    Message msg = sub.nextMessage(Duration.ofMillis(500));
                    while (msg != null) {
                        thisReceived++;
                        allReceived.incrementAndGet();
                        String data = new String(msg.getData(), StandardCharsets.US_ASCII);
                        datas.add(data);
                        System.out.printf("QS # %d message # %d %s\n", id, thisReceived, data);
                        msg.ack();

                        msg = sub.nextMessage(Duration.ofMillis(500));
                    }
                } catch (InterruptedException e) {
                    // just try again
                }
            }
            System.out.printf("QS # %d completed.\n", id);
        }
    }
}
```

{% endtab %}
{% tab title="JavaScript" %}

```javascript
import { AckPolicy, connect } from "../../src/mod.ts";
import { nuid } from "../../nats-base-client/nuid.ts";

const nc = await connect();

// create a regular subscription - this is plain nats
const sub = nc.subscribe("my.messages", { max: 5 });
const done = (async () => {
  for await (const m of sub) {
    console.log(m.subject);
    m.respond();
  }
})();

const jsm = await nc.jetstreamManager();
const stream = nuid.next();
const subj = nuid.next();
await jsm.streams.add({ name: stream, subjects: [`${subj}.>`] });

// create a consumer that delivers to the subscription
await jsm.consumers.add(stream, {
  ack_policy: AckPolicy.Explicit,
  deliver_subject: "my.messages",
});

// publish some old nats messages
nc.publish(`${subj}.A`);
nc.publish(`${subj}.B`);
nc.publish(`${subj}.C`);
nc.publish(`${subj}.D.A`);
nc.publish(`${subj}.F.A.B`);

await done;
await nc.close();
```

{% endtab %}
{% tab title="Python" %}

```python
import asyncio

import nats
from nats.errors import TimeoutError


async def main():
    nc = await nats.connect("localhost")

    # Create JetStream context.
    js = nc.jetstream()

    # Persist messages on 'foo's subject.
    await js.add_stream(name="sample-stream", subjects=["foo"])

    for i in range(0, 10):
        ack = await js.publish("foo", f"hello world: {i}".encode())
        print(ack)

    # Create pull based consumer on 'foo'.
    psub = await js.pull_subscribe("foo", "psub")

    # Fetch and ack messagess from consumer.
    for i in range(0, 10):
        msgs = await psub.fetch(1)
        for msg in msgs:
            print(msg)

    # Create single push based subscriber that is durable across restarts.
    sub = await js.subscribe("foo", durable="myapp")
    msg = await sub.next_msg()
    await msg.ack()

    # Create deliver group that will be have load balanced messages.
    async def qsub_a(msg):
        print("QSUB A:", msg)
        await msg.ack()

    async def qsub_b(msg):
        print("QSUB B:", msg)
        await msg.ack()
    await js.subscribe("foo", "workers", cb=qsub_a)
    await js.subscribe("foo", "workers", cb=qsub_b)

    for i in range(0, 10):
        ack = await js.publish("foo", f"hello world: {i}".encode())
        print("\t", ack)

    await nc.close()

if __name__ == '__main__':
    asyncio.run(main())
```

{% endtab %}

{% tab title="C#" %}
```csharp
// NATS .NET doesn't publicly support push consumers and treats all consumers
// as just consumers. The mecahnics of the consuming messages are abstracted
// away from the applications and are handled by the library.
```
{% endtab %}

{% tab title="C" %}

```c
#include "examples.h"

static const char *usage = ""\
"-gd            use global message delivery thread pool\n" \
"-sync          receive synchronously (default is asynchronous)\n" \
"-pull          use pull subscription\n" \
"-fc            enable flow control\n" \
"-count         number of expected messages\n";

static void
onMsg(natsConnection *nc, natsSubscription *sub, natsMsg *msg, void *closure)
{
    if (print)
        printf("Received msg: %s - %.*s\n",
               natsMsg_GetSubject(msg),
               natsMsg_GetDataLength(msg),
               natsMsg_GetData(msg));

    if (start == 0)
        start = nats_Now();

    // We should be using a mutex to protect those variables since
    // they are used from the subscription's delivery and the main
    // threads. For demo purposes, this is fine.
    if (++count == total)
        elapsed = nats_Now() - start;

    // Since this is auto-ack callback, we don't need to ack here.
    natsMsg_Destroy(msg);
}

static void
asyncCb(natsConnection *nc, natsSubscription *sub, natsStatus err, void *closure)
{
    printf("Async error: %u - %s\n", err, natsStatus_GetText(err));

    natsSubscription_GetDropped(sub, (int64_t*) &dropped);
}

int main(int argc, char **argv)
{
    natsConnection      *conn  = NULL;
    natsStatistics      *stats = NULL;
    natsOptions         *opts  = NULL;
    natsSubscription    *sub   = NULL;
    natsMsg             *msg   = NULL;
    jsCtx               *js    = NULL;
    jsErrCode           jerr   = 0;
    jsOptions           jsOpts;
    jsSubOptions        so;
    natsStatus          s;
    bool                delStream = false;

    opts = parseArgs(argc, argv, usage);

    printf("Created %s subscription on '%s'.\n",
        (pull ? "pull" : (async ? "asynchronous" : "synchronous")), subj);

    s = natsOptions_SetErrorHandler(opts, asyncCb, NULL);

    if (s == NATS_OK)
        s = natsConnection_Connect(&conn, opts);

    if (s == NATS_OK)
        s = jsOptions_Init(&jsOpts);

    if (s == NATS_OK)
        s = jsSubOptions_Init(&so);
    if (s == NATS_OK)
    {
        so.Stream = stream;
        so.Consumer = durable;
        if (flowctrl)
        {
            so.Config.FlowControl = true;
            so.Config.Heartbeat = (int64_t)1E9;
        }
    }

    if (s == NATS_OK)
        s = natsConnection_JetStream(&js, conn, &jsOpts);

    if (s == NATS_OK)
    {
        jsStreamInfo    *si = NULL;

        // First check if the stream already exists.
        s = js_GetStreamInfo(&si, js, stream, NULL, &jerr);
        if (s == NATS_NOT_FOUND)
        {
            jsStreamConfig  cfg;

            // Since we are the one creating this stream, we can delete at the end.
            delStream = true;

            // Initialize the configuration structure.
            jsStreamConfig_Init(&cfg);
            cfg.Name = stream;
            // Set the subject
            cfg.Subjects = (const char*[1]){subj};
            cfg.SubjectsLen = 1;
            // Make it a memory stream.
            cfg.Storage = js_MemoryStorage;
            // Add the stream,
            s = js_AddStream(&si, js, &cfg, NULL, &jerr);
        }
        if (s == NATS_OK)
        {
            printf("Stream %s has %" PRIu64 " messages (%" PRIu64 " bytes)\n",
                si->Config->Name, si->State.Msgs, si->State.Bytes);

            // Need to destroy the returned stream object.
            jsStreamInfo_Destroy(si);
        }
    }

    if (s == NATS_OK)
    {
        if (pull)
            s = js_PullSubscribe(&sub, js, subj, durable, &jsOpts, &so, &jerr);
        else if (async)
            s = js_Subscribe(&sub, js, subj, onMsg, NULL, &jsOpts, &so, &jerr);
        else
            s = js_SubscribeSync(&sub, js, subj, &jsOpts, &so, &jerr);
    }
    if (s == NATS_OK)
        s = natsSubscription_SetPendingLimits(sub, -1, -1);

    if (s == NATS_OK)
        s = natsStatistics_Create(&stats);

    if ((s == NATS_OK) && pull)
    {
        natsMsgList list;
        int         i;

        for (count = 0; (s == NATS_OK) && (count < total); )
        {
            s = natsSubscription_Fetch(&list, sub, 1024, 5000, &jerr);
            if (s != NATS_OK)
                break;

            if (start == 0)
                start = nats_Now();

            count += (int64_t) list.Count;
            for (i=0; (s == NATS_OK) && (i<list.Count); i++)
                s = natsMsg_Ack(list.Msgs[i], &jsOpts);

            natsMsgList_Destroy(&list);
        }
    }
    else if ((s == NATS_OK) && async)
    {
        while (s == NATS_OK)
        {
            if (count + dropped == total)
                break;

            nats_Sleep(1000);
        }
    }
    else if (s == NATS_OK)
    {
        for (count = 0; (s == NATS_OK) && (count < total); count++)
        {
            s = natsSubscription_NextMsg(&msg, sub, 5000);
            if (s != NATS_OK)
                break;

            if (start == 0)
                start = nats_Now();

            s = natsMsg_Ack(msg, &jsOpts);
            natsMsg_Destroy(msg);
        }
    }

    if (s == NATS_OK)
    {
        printStats(STATS_IN|STATS_COUNT, conn, sub, stats);
        printPerf("Received");
    }
    if (s == NATS_OK)
    {
        jsStreamInfo *si = NULL;

        // Let's report some stats after the run
        s = js_GetStreamInfo(&si, js, stream, NULL, &jerr);
        if (s == NATS_OK)
        {
            printf("\nStream %s has %" PRIu64 " messages (%" PRIu64 " bytes)\n",
                si->Config->Name, si->State.Msgs, si->State.Bytes);

            jsStreamInfo_Destroy(si);
        }
        if (delStream)
        {
            printf("\nDeleting stream %s: ", stream);
            s = js_DeleteStream(js, stream, NULL, &jerr);
            if (s == NATS_OK)
                printf("OK!");
            printf("\n");
        }
    }
    else
    {
        printf("Error: %u - %s - jerr=%u\n", s, natsStatus_GetText(s), jerr);
        nats_PrintLastErrorStack(stderr);
    }

    // Destroy all our objects to avoid report of memory leak
    jsCtx_Destroy(js);
    natsStatistics_Destroy(stats);
    natsSubscription_Destroy(sub);
    natsConnection_Destroy(conn);
    natsOptions_Destroy(opts);

    // To silence reports of memory still in used with valgrind
    nats_Close();.

    return 0;
}
```

{% endtab %}
{% endtabs %}



## Упорядоченные consumers
Ordered consumers — удобная форма ephemeral push consumer для приложений, которым нужно эффективно потреблять stream для инспекции или анализа данных.

API consumer гарантирует доставку сообщений по порядку и без пропусков.
* Всегда ephemeral — минимальная нагрузка на сервер
* Однопоточная доставка в порядке
* Клиент проверяет последовательность сообщений и предотвращает разрывы в доставке
* Может восстанавливаться после падения узла сервера и переподключаться
* Не восстанавливается после сбоя клиента, так как является ephemeral

{% tabs %}
{% tab title="Go" %}

```go
func ExampleJetStream() {
	nc, err := nats.Connect("localhost")
	if err != nil {
		log.Fatal(err)
	}

	// Use the JetStream context to produce and consumer messages
	// that have been persisted.
	js, err := nc.JetStream(nats.PublishAsyncMaxPending(256))
	if err != nil {
		log.Fatal(err)
	}

	js.AddStream(&nats.StreamConfig{
		Name:     "FOO",
		Subjects: []string{"foo"},
	})

	js.Publish("foo", []byte("Hello JS!"))

	// ordered push consumer
	js.Subscribe("foo", func(msg *nats.Msg) {
		meta, _ := msg.Metadata()
		fmt.Printf("Stream Sequence  : %v\n", meta.Sequence.Stream)
		fmt.Printf("Consumer Sequence: %v\n", meta.Sequence.Consumer)
	}, nats.OrderedConsumer())
}
```

{% endtab %}
{% tab title="Java" %}

```java
package io.nats.examples.jetstream;

import io.nats.client.*;
import io.nats.client.api.PublishAck;
import io.nats.client.impl.NatsMessage;
import io.nats.examples.ExampleArgs;
import io.nats.examples.ExampleUtils;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.temporal.TemporalUnit;

public class myExample {
 public static void main(String[] args) {
  final String subject = "foo";

  try (Connection nc = Nats.connect(ExampleUtils.createExampleOptions("localhost"))) {

   // Create a JetStream context.  This hangs off the original connection
   // allowing us to produce data to streams and consume data from
   // JetStream consumers.
   JetStream js = nc.jetStream();

   // This example assumes there is a stream already created on subject "foo" and some messages already stored in that stream

   // create our message handler.
   MessageHandler handler = msg -> {

    System.out.println("\nMessage Received:");

    if (msg.hasHeaders()) {
     System.out.println("  Headers:");
     for (String key : msg.getHeaders().keySet()) {
      for (String value : msg.getHeaders().get(key)) {
       System.out.printf("    %s: %s\n", key, value);
      }
     }
    }

    System.out.printf("  Subject: %s\n  Data: %s\n",
            msg.getSubject(), new String(msg.getData(), StandardCharsets.UTF_8));
    System.out.println("  " + msg.metaData());
   };

   Dispatcher dispatcher = nc.createDispatcher();
   PushSubscribeOptions pso = PushSubscribeOptions.builder().ordered(true).build();
   JetStreamSubscription sub = js.subscribe(subject, dispatcher, handler, false, pso);

   Thread.sleep(100);

   sub.drain(Duration.ofMillis(100));

   nc.drain(Duration.ofMillis(100));
  }
  catch(Exception e)
  {
   e.printStackTrace();
  }
 }
}
```

{% endtab %}
{% tab title="JavaScript" %}

```js
import { connect, consumerOpts } from "../../src/mod.ts";

const nc = await connect();
const js = nc.jetstream();

// note the consumer is not a durable - so when after the
// subscription ends, the server will auto destroy the
// consumer
const opts = consumerOpts();
opts.manualAck();
opts.maxMessages(2);
opts.deliverTo("xxx");
const sub = await js.subscribe("a.>", opts);
await (async () => {
  for await (const m of sub) {
    console.log(m.seq, m.subject);
    m.ack();
  }
})();

await nc.close();
```

{% endtab %}
{% tab title= "Python" %}

```python
import asyncio

import nats
from nats.errors import TimeoutError


async def main():
    nc = await nats.connect("localhost")

    # Create JetStream context.
    js = nc.jetstream()

    # Create ordered consumer with flow control and heartbeats
    # that auto resumes on failures.
    osub = await js.subscribe("foo", ordered_consumer=True)
    data = bytearray()

    while True:
        try:
            msg = await osub.next_msg()
            data.extend(msg.data)
        except TimeoutError:
            break
    print("All data in stream:", len(data))

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

var streamConfig = new StreamConfig(name: "FOO", subjects: ["foo"]);
await js.CreateStreamAsync(streamConfig);

PubAckResponse ack = await js.PublishAsync("foo", "Hello, JetStream!");
ack.EnsureSuccess();

INatsJSConsumer orderedConsumer = await js.CreateOrderedConsumerAsync("FOO");

using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));

await foreach (NatsJSMsg<string> msg in orderedConsumer.ConsumeAsync<string>(cancellationToken: cts.Token))
{
    NatsJSMsgMetadata? meta = msg.Metadata;
    Console.WriteLine($"Stream Sequence  : {meta?.Sequence.Stream}");
    Console.WriteLine($"Consumer Sequence: {meta?.Sequence.Consumer}");
}
```
{% endtab %}

{% endtabs %}




## Надёжность доставки

JetStream consumers обеспечивают не только надёжную доставку сообщений, но и надёжность обработки сообщений, даже при сбоях клиентского приложения или downstream‑систем. Это достигается за счёт подтверждений на уровне сообщений и повторной доставки.

Consumers имеют [Acknowledgement Policy](/nats-concepts/jetstream/consumers.md#ackpolicy), определяющую требуемый уровень надёжности. По возрастанию надёжности доступны политики: `none` (нет подтверждений на уровне приложения), `all` (подтверждение конкретного сообщения также неявно подтверждает все предыдущие сообщения в stream) и `explicit` (каждое сообщение подтверждается отдельно).

Когда consumer настроен на явные подтверждения, клиентские приложения могут использовать более одного типа [acknowledgement](/using-nats/developing-with-nats/anatomy.md#consumer-acknowledgements), чтобы указать успешное (или нет) получение и обработку сообщений от consumer.

Приложения могут:

- Подтвердить успешную обработку сообщения (`Ack()`).
- Подтвердить успешную обработку и запросить подтверждение получения подтверждения consumer'ом (`AckSync()`).
- Указать, что обработка ещё идёт и нужно больше времени (`inProgress()`).
- Негативно подтвердить сообщение, указав, что приложение сейчас (временно) не может обработать сообщение и consumer должен попытаться доставить его повторно (`Nak()`).
- Завершить сообщение (обычно потому, что в данных есть проблема и приложение никогда не сможет его обработать), указав, что consumer не должен пытаться доставить его повторно (`Term()`).

После того как сервер отправляет сообщение от consumer подписанному клиентскому приложению, запускается таймер `AckWait`. Этот таймер удаляется при получении либо положительного подтверждения (`Ack()`), либо подтверждения завершения (`Term()`) от клиента. Таймер сбрасывается при получении подтверждения «в процессе» (`inProgress()`).

Если по истечении времени подтверждение от клиента не получено, сервер попытается повторно доставить сообщение. Если на consumer подписано более одного экземпляра приложения, нет гарантии, что повторная доставка придёт в конкретный экземпляр.

Вы можете управлять временем повторной доставки, используя либо единичный атрибут длительности `AckWait` consumer'а, либо последовательность длительностей в атрибуте `BackOff` (который переопределяет `AckWait`).

Также можно управлять временем повторной доставки, когда сообщение получило `Nak()`, передавая опцию `nakDelay()` (или используя `NakWithDelay()`), иначе попытка повторной доставки произойдёт сразу после получения `Nak` сервером.

### Функциональность «Dead Letter Queues»

Вы можете задать максимальное число попыток доставки с помощью настройки `MaxDeliver` consumer'а.

Когда сообщение достигает максимального числа попыток доставки, публикуется advisory‑сообщение на subject `$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.<STREAM>.<CONSUMER>`. В payload advisory‑сообщения (используйте `nats schema info io.nats.jetstream.advisory.v1.max_deliver` для деталей) есть поле `stream_seq`, содержащее номер последовательности сообщения в stream.

Аналогично, когда клиентское приложение прекращает попытки доставки сообщения с помощью `AckTerm`, публикуется advisory‑сообщение на subject `$JS.EVENT.ADVISORY.CONSUMER.MSG_TERMINATED.<STREAM>.<CONSUMER>`, и его payload (см. `nats schema info io.nats.jetstream.advisory.v1.terminated`) содержит поле `stream_seq`.

Эти advisory‑сообщения можно использовать для реализации функциональности типа «Dead Letter Queue» (DLQ). Например:

- Если вам нужно знать только о каждом «мёртвом» сообщении (когда consumer считает его недоставляемым), достаточно слушать advisories.
- Если нужен доступ к самому сообщению, можно использовать номер последовательности из advisory, чтобы получить конкретное сообщение по sequence из stream. Если сообщение достигло максимального числа попыток доставки, оно остаётся в stream до ручного удаления или ручного подтверждения.
