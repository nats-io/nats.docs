# Streams management

Streams and durable consumers can be defined administratively outside the application (typically using the NATS CLI Tool) in which case the application only needs to know about the well-known names of the durable consumers it wants to use. But you can also manage streams and consumers programmatically.

Common stream management operations are:

- Add (or delete) a stream. This is an idempotent function, meaning that it will create the stream if it doesn't exist already, and if it does already exist on succeed if the already defined stream matches exactly the attributes specified in the 'add' call.
- Purge a stream (delete all the messages stored in the stream)
- Get or remove a specific message from a stream by sequence number
- Add or update (or delete) a consumer
- Get info and statistics on streams/consumers/account. Get/remove/get information on individual messages stored in a stream.

{% tabs %}
{% tab title="Go" %}
```go
func ExampleJetStreamManager() {
	nc, _ := nats.Connect("localhost")

	js, _ := nc.JetStream()

	// Create a stream
	js.AddStream(&nats.StreamConfig{
		Name:     "FOO",
		Subjects: []string{"foo"},
		MaxBytes: 1024,
	})

	// Update a stream
	js.UpdateStream(&nats.StreamConfig{
		Name:     "FOO",
		MaxBytes: 2048,
	})

	// Create a durable consumer
	js.AddConsumer("FOO", &nats.ConsumerConfig{
		Durable: "BAR",
	})

	// Get information about all streams (with Context JSOpt)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	for info := range js.StreamsInfo(nats.Context(ctx)) {
		fmt.Println("stream name:", info.Config.Name)
	}

	// Get information about all consumers (with MaxWait JSOpt)
	for info := range js.ConsumersInfo("FOO", nats.MaxWait(10*time.Second)) {
		fmt.Println("consumer name:", info.Name)
	}

	// Delete a consumer
	js.DeleteConsumer("FOO", "BAR")

	// Delete a stream
	js.DeleteStream("FOO")
}
```
{% endtab %}
{% tab title="Java" %}
```java
package io.nats.examples.jetstream;

import io.nats.client.Connection;
import io.nats.client.JetStreamApiException;
import io.nats.client.JetStreamManagement;
import io.nats.client.Nats;
import io.nats.client.api.PurgeResponse;
import io.nats.client.api.StorageType;
import io.nats.client.api.StreamConfiguration;
import io.nats.client.api.StreamInfo;
import io.nats.examples.ExampleArgs;
import io.nats.examples.ExampleUtils;

import java.util.List;

import static io.nats.examples.jetstream.NatsJsUtils.*;

/**
 * This example will demonstrate JetStream management (admin) api.
 */
public class NatsJsManageStreams {
    static final String usageString =
        "\nUsage: java -cp <classpath> NatsJsManageStreams [-s server] [-strm stream-prefix] [-sub subject-prefix]"
            + "\n\nDefault Values:"
            + "\n   [-strm] manage-stream-"
            + "\n   [-sub] manage-subject-"
            + "\n\nUse tls:// or opentls:// to require tls, via the Default SSLContext\n"
            + "\nSet the environment variable NATS_NKEY to use challenge response authentication by setting a file containing your private key.\n"
            + "\nSet the environment variable NATS_CREDS to use JWT/NKey authentication by setting a file containing your user creds.\n"
            + "\nUse the URL in the -s server parameter for user/pass/token authentication.\n";

    public static void main(String[] args) {
        ExampleArgs exArgs = ExampleArgs.builder("Manage Streams", args, usageString)
            .defaultStream("manage-stream-")
            .defaultSubject("manage-subject-")
            .build();

        String stream1 = exArgs.stream + "1";
        String stream2 = exArgs.stream + "2";
        String subject1 = exArgs.subject + "1";
        String subject2 = exArgs.subject + "2";
        String subject3 = exArgs.subject + "3";
        String subject4 = exArgs.subject + "4";

        try (Connection nc = Nats.connect(ExampleUtils.createExampleOptions(exArgs.server))) {

            // Create a JetStreamManagement context.
            JetStreamManagement jsm = nc.jetStreamManagement();

            // we want to be able to completely create and delete the streams
            // so don't want to work with existing streams
            exitIfStreamExists(jsm, stream1);
            exitIfStreamExists(jsm, stream2);

            // 1. Create (add) a stream with a subject
            System.out.println("\n----------\n1. Configure And Add Stream 1");
            StreamConfiguration streamConfig = StreamConfiguration.builder()
                .name(stream1)
                .subjects(subject1)
                // .retentionPolicy(...)
                // .maxConsumers(...)
                // .maxBytes(...)
                // .maxAge(...)
                // .maxMsgSize(...)
                .storageType(StorageType.Memory)
                // .replicas(...)
                // .noAck(...)
                // .template(...)
                // .discardPolicy(...)
                .build();
            StreamInfo streamInfo = jsm.addStream(streamConfig);
            NatsJsUtils.printStreamInfo(streamInfo);

            // 2. Update stream, in this case add a subject
            //    Thre are very few properties that can actually
            // -  StreamConfiguration is immutable once created
            // -  but the builder can help with that.
            System.out.println("----------\n2. Update Stream 1");
            streamConfig = StreamConfiguration.builder(streamInfo.getConfiguration())
                    .addSubjects(subject2).build();
            streamInfo = jsm.updateStream(streamConfig);
            NatsJsUtils.printStreamInfo(streamInfo);

            // 3. Create (add) another stream with 2 subjects
            System.out.println("----------\n3. Configure And Add Stream 2");
            streamConfig = StreamConfiguration.builder()
                .name(stream2)
                .subjects(subject3, subject4)
                .storageType(StorageType.Memory)
                .build();
            streamInfo = jsm.addStream(streamConfig);
            NatsJsUtils.printStreamInfo(streamInfo);

            // 4. Get information on streams
            // 4.0 publish some message for more interesting stream state information
            // -   SUBJECT1 is associated with STREAM1
            // 4.1 getStreamInfo on a specific stream
            // 4.2 get a list of all streams
            // 4.3 get a list of StreamInfo's for all streams
            System.out.println("----------\n4.1 getStreamInfo");
            publish(nc, subject1, 5);
            streamInfo = jsm.getStreamInfo(stream1);
            NatsJsUtils.printStreamInfo(streamInfo);

            System.out.println("----------\n4.2 getStreamNames");
            List<String> streamNames = jsm.getStreamNames();
            printObject(streamNames);

            System.out.println("----------\n4.3 getStreams");
            List<StreamInfo> streamInfos = jsm.getStreams();
            NatsJsUtils.printStreamInfoList(streamInfos);

            // 5. Purge a stream of it's messages
            System.out.println("----------\n5. Purge stream");
            PurgeResponse purgeResponse = jsm.purgeStream(stream1);
            printObject(purgeResponse);

            // 6. Delete the streams
            // Subsequent calls to getStreamInfo, deleteStream or purgeStream
            // will throw a JetStreamApiException "stream not found [10059]"
            System.out.println("----------\n6. Delete streams");
            jsm.deleteStream(stream1);
            jsm.deleteStream(stream2);

            // 7. Try to delete the consumer again and get the exception
            System.out.println("----------\n7. Delete stream again");
            try
            {
                jsm.deleteStream(stream1);
            }
            catch (JetStreamApiException e)
            {
                System.out.println("Exception was: '" + e.getMessage() + "'");
            }

            System.out.println("----------\n");
        }
        catch (Exception exp) {
            exp.printStackTrace();
        }
    }
}
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
import { AckPolicy, connect, Empty } from "../../src/mod.ts";

const nc = await connect();
const jsm = await nc.jetstreamManager();

// list all the streams, the `next()` function
// retrieves a paged result.
const streams = await jsm.streams.list().next();
streams.forEach((si) => {
    console.log(si);
});

// add a stream
const stream = "mystream";
const subj = `mystream.*`;
await jsm.streams.add({ name: stream, subjects: [subj] });

// publish a reg nats message directly to the stream
for (let i = 0; i < 10; i++) {
    nc.publish(`${subj}.a`, Empty);
}

// find a stream that stores a specific subject:
const name = await jsm.streams.find("mystream.A");

// retrieve info about the stream by its name
const si = await jsm.streams.info(name);

// update a stream configuration
si.config.subjects?.push("a.b");
await jsm.streams.update(name, si.config);

// get a particular stored message in the stream by sequence
// this is not associated with a consumer
const sm = await jsm.streams.getMessage(stream, { seq: 1 });
console.log(sm.seq);

// delete the 5th message in the stream, securely erasing it
await jsm.streams.deleteMessage(stream, 5);

// purge all messages in the stream, the stream itself
// remains.
await jsm.streams.purge(stream);

// purge all messages with a specific subject (filter can be a wildcard)
await jsm.streams.purge(stream, { filter: "a.b" });

// purge messages with a specific subject keeping some messages
await jsm.streams.purge(stream, { filter: "a.c", keep: 5 });

// purge all messages with upto (not including seq)
await jsm.streams.purge(stream, { seq: 100 });

// purge all messages with upto sequence that have a matching subject
await jsm.streams.purge(stream, { filter: "a.d", seq: 100 });

// list all consumers for a stream:
const consumers = await jsm.consumers.list(stream).next();
consumers.forEach((ci) => {
    console.log(ci);
});

// add a new durable pull consumer
await jsm.consumers.add(stream, {
    durable_name: "me",
    ack_policy: AckPolicy.Explicit,
});

// retrieve a consumer's configuration
const ci = await jsm.consumers.info(stream, "me");
console.log(ci);

// delete a particular consumer
await jsm.consumers.delete(stream, "me");
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

    await nc.close()

if __name__ == '__main__':
    asyncio.run(main())    
```
{% endtab %}
{% tab title="C" %}
```c
```
{% endtab %}
{% endtabs %}