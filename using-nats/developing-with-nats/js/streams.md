# Streams management

Streams and durable consumers can be defined administratively outside the application (typically using the NATS CLI Tool) in which case the application only needs to know about the well-known names of the durable consumers it wants to use. But you can also manage streams and consumers programmatically.

Common stream management operations are:

- 'add' (or delete) a stream. This is an idempotent function, meaning that it will create the stream if it doesn't exist already, and if it does already exist on succeed if the already defined stream matches exactly the attributes specified in the 'add' call.
- 'purge' a stream (delete all the messages stored in the stream)
- 'add or update' (or delete) a consumer
- 'get' info and statistics on streams/consumers/account. Get/remove/get information on individual messages stored in a stream.

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatalf("Unexpected error: %v", err)
}
defer nc.Close()

js, err := nc.JetStream()
if err != nil {
    log.Fatalf("Got error during initialization %v", err)
}

// Add a stream with default attributes
si, err := js.AddStream(&nats.StreamConfig{
    Name:     "TEST",
    Subjects: []string{"test", "foo", "bar"},
})
if err != nil {
    log.Fatalf("Unexpected error: %v", err)
}

// Lookup the stream for testing.
_, err = js.StreamInfo("TEST")
if err != nil {
    log.Fatalf("stream lookup failed: %v", err)
}

// Purge the stream
if err = js.PurgeStream("TEST"); err != nil {
    log.Fatalf("Unexpected error: %v", err)
}

// Create a durable (pull) consumer
ci, err := js.AddConsumer("TEST", &nats.ConsumerConfig{Durable: "my_durable_consumer", AckPolicy: nats.AckExplicitPolicy})
if err != nil {
    log.Fatalf("Unexpected error: %v", err)
}

// Delete a consumer
if err = js.DeleteConsumer("TEST", "my_durable_consumer"); err != nil {
    log.Fatalf("Error deleting consumer: %v", err)
}

// Delete the stream
if err = js.DeleteStream("TEST"); err != nil {
    log.Fatalf("Unexpected error: %v", err)
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