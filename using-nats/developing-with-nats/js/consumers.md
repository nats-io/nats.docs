# JetStream Consumers

Consumers are how client applications get the messages stored in the streams. You can have many consumers on a single stream. Consumers are like a view on a stream, can filter messages and have some state (maintained by the servers) associated with them.

Consumers can be 'durable' or 'ephemeral'.

## Ephemeral consumers
Ephemeral consumers are meant to be used by a single instance of an application (e.g. to get its own replay of the messages in the stream).

Ephemeral consumers are not meant to last 'forever', they are defined automatically at subscription time by the client library and disappear after the application disconnect.

You (automatically) create an ephemeral consumer when you call the js.Subscribe function without specifying the Durable or Bind subscription options. Calling Drain on that subscription automatically deletes the underlying ephemeral consumer.
You can also explicitly create an ephemeral consumer by not passing a durable name option to the jsm.AddConsumer call.

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
{$ endtabs %}

## Durable consumers 
Durable consumers are meant to be used by multiple instances of an application, either to distribute and scale out the 
processing, or to persist the position of the consumer over the stream between runs of an application.

Durable consumers as the name implies are meant to last 'forever' and are typically created and deleted administratively rather than by the application code which only needs to specify the durable's well known name to use it.

You create a durable consumer using the `nats consumer add` CLI tool command, or programmatically by passing a durable name option to the stream creation call.

### Push and Pull consumers

Technically, there are two implementations of consumers identified as 'push' or 'pull' (which refer to the way subscription interest is being done) depending on whether they have a delivery subject set or not.

A pull consumer is functionally equivalent to a push consumer using a queue group and explicit acknowledgement: the messages from the stream are distributed automatically between the subscribers to the push consumer or the 'fetchers' to the pull consumer. However, the recommendation is to use the pull consumer as they create less CPU load on the nats-servers and therefore scale further (note that the push consumers are still quite fast and scalable, you may only notice the difference between the two if you have sustained high message rates).

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
	sub, _ = js.PullSubscribe("foo", "wq", nats.PullMaxWaiting(128))

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
package io.nats.examples.jetstream;

import io.nats.client.*;
import io.nats.examples.ExampleArgs;
import io.nats.examples.ExampleUtils;

import java.time.Duration;

import static io.nats.examples.jetstream.NatsJsUtils.createStreamExitWhenExists;
import static io.nats.examples.jetstream.NatsJsUtils.publishInBackground;

/**
 * This example will demonstrate basic use of a pull subscription of:
 * batch size only pull: <code>pull(int batchSize)</code>
 */
public class NatsJsPullSubBatchSize {
    static final String usageString =
        "\nUsage: java -cp <classpath> NatsJsPullSubBatchSize [-s server] [-strm stream] [-sub subject] [-dur durable] [-mcnt msgCount]"
            + "\n\nDefault Values:"
            + "\n   [-strm] pull-stream"
            + "\n   [-sub]  pull-subject"
            + "\n   [-dur]  pull-durable"
            + "\n   [-mcnt] 20"
            + "\n\nUse tls:// or opentls:// to require tls, via the Default SSLContext\n"
            + "\nSet the environment variable NATS_NKEY to use challenge response authentication by setting a file containing your private key.\n"
            + "\nSet the environment variable NATS_CREDS to use JWT/NKey authentication by setting a file containing your user creds.\n"
            + "\nUse the URL in the -s server parameter for user/pass/token authentication.\n";

    public static void main(String[] args) {
        ExampleArgs exArgs = ExampleArgs.builder("Pull Subscription using primitive Batch Size", args, usageString)
                .defaultStream("pull-stream")
                .defaultSubject("pull-subject")
                .defaultDurable("pull-durable")
                .defaultMsgCount(15)
                .build();

        try (Connection nc = Nats.connect(ExampleUtils.createExampleOptions(exArgs.server))) {
            // Create a JetStreamManagement context.
            JetStreamManagement jsm = nc.jetStreamManagement();

            // Use the utility to create a stream stored in memory.
            createStreamExitWhenExists(jsm, exArgs.stream, exArgs.subject);

            // Create our JetStream context.
            JetStream js = nc.jetStream();

            // start publishing the messages, don't wait for them to finish, simulating an outside producer
            publishInBackground(js, exArgs.subject, "pull-message", exArgs.msgCount);

            // Build our subscription options. Durable is REQUIRED for pull based subscriptions
            PullSubscribeOptions pullOptions = PullSubscribeOptions.builder()
                .durable(exArgs.durable) // required
                .build();

            // subscribe
            JetStreamSubscription sub = js.subscribe(exArgs.subject, pullOptions);
            nc.flush(Duration.ofSeconds(1));

            int red = 0;
            while (red < exArgs.msgCount) {
                sub.pull(10);
                Message m = sub.nextMessage(Duration.ofSeconds(1)); // first message
                while (m != null) {
                    if (m.isJetStream()) {
                        red++; // process message
                        System.out.println("" + red + ". " + m);
                        m.ack();
                    }
                    m = sub.nextMessage(Duration.ofMillis(100)); // other messages should already be on the client
                }
            }

            // delete the stream since we are done with it.
            jsm.deleteStream(exArgs.stream);
        }
        catch (Exception e) {
            e.printStackTrace();
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
await jsm.streams.add(
  { name: stream, subjects: [subj] },
);

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
      }`,
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
{$ endtabs %}


A push consumer can also be used in some other use cases such as without a queue group, or with no acknowledgement or cumulative acknowledgements. 

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
{$ endtabs %}