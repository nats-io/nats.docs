# Synchronous Subscriptions

Synchronous subscriptions require the application to wait for messages. This type of subscription is easy to set-up and use, but requires the application to deal with looping if multiple messages are expected. For situations where a single message is expected, synchronous subscriptions are sometimes easier to manage, depending on the language.

For example, to subscribe to the subject `updates` and receive a single message you could do:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Subscribe
sub, err := nc.SubscribeSync("updates")
if err != nil {
    log.Fatal(err)
}

// Wait for a message
msg, err := sub.NextMsg(10 * time.Second)
if err != nil {
    log.Fatal(err)
}

// Use the response
log.Printf("Reply: %s", msg.Data)
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

// Subscribe
Subscription sub = nc.subscribe("updates");

// Read a message
Message msg = sub.nextMessage(Duration.ZERO);

String str = new String(msg.getData(), StandardCharsets.UTF_8);
System.out.println(str);

// Close the connection
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// node-nats subscriptions are always async.
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS client currently does not have a sync subscribe API
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# The Ruby NATS client subscriptions are all async.
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
/ Typescript NATS subscriptions are always async.
```
{% endtab %}
{% endtabs %}

