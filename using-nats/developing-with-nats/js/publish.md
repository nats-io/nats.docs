# Publishing to streams

{% tabs %}
{% tab title="Go" %}
```go
// Synchronously publish a message to the stream 
js.Publish("foo", []byte("hello"))

// Asynchronously publish 10 messages
futures := make([]nats.PubAckFuture, 10)
for j := 0; j < 10; j++ {
    futures[j], err = js.PublishAsync("foo",[]byte("hello"))
    if err != nil {
        log.FatalF("PublishAsync error: %v", err)
    }
}

// Wait for the acks or timeout
select {
    case <-js.PublishAsyncComplete():
        for future := range futures {
            select {
                case <-futures[future].Ok():
                case e := <-futures[future].Err():
                log.FatalF("PublishAsync %v not OK, err=%v", future, e)
            }
        }
    case <-time.After(30 * time.Second):
        log.FatalF("JS PublishAsync did not receive an ack/error")
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