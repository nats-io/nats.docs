# Publishing to streams

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
}

```
{% endtab %}

{% tab title="Java" %}
```java
try (Connection nc = Nats.connect("demo.nats.io"){
        // Create a JetStream context.  This hangs off the original connection
        // allowing us to produce data to streams and consume data from
        // JetStream consumers.
        JetStream js=nc.jetStream();
        // Create a JetStreamManagement context.
        JetStreamManagement jsm = nc.jetStreamManagement();
        
        
        }
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
import { connect, Empty } from "../../src/mod.ts";

const nc = await connect();

const jsm = await nc.jetstreamManager();
await jsm.streams.add({ name: "B", subjects: ["b.a"] });

const js = await nc.jetstream();
// the jetstream client provides a publish that returns
// a confirmation that the message was received and stored
// by the server. You can associate various expectations
// when publishing a message to prevent duplicates.
// If the expectations are not met, the message is rejected.
let pa = await js.publish("b.a", Empty, {
  msgID: "a",
  expect: { streamName: "B" },
});
console.log(`${pa.stream}[${pa.seq}]: duplicate? ${pa.duplicate}`);

pa = await js.publish("b.a", Empty, {
  msgID: "a",
  expect: { lastSequence: 1 },
});
console.log(`${pa.stream}[${pa.seq}]: duplicate? ${pa.duplicate}`);

await jsm.streams.delete("B");
await nc.drain();
```
{% endtab %}

{% tab title="Python" %}
```python
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
```
{% endtab %}

{% tab title="C" %}
```c
```
{% endtab %}
{% endtabs %}