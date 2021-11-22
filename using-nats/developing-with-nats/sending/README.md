# Sending Messages

NATS sends and receives messages using a protocol that includes a target subject, an optional reply subject and an array of bytes. Some libraries may provide helpers to convert other data formats to and from bytes, but the NATS server will treat all messages as opaque byte arrays.

All of the NATS clients are designed to make sending a message simple. For example, to send the string “All is Well” to the “updates” subject as a UTF-8 string of bytes you would do:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io", nats.Name("API PublishBytes Example"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

if err := nc.Publish("updates", []byte("All is Well")); err != nil {
    log.Fatal(err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

nc.publish("updates", "All is Well".getBytes(StandardCharsets.UTF_8));

// Make sure the message goes through before we close
nc.flush(Duration.ZERO);
nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const sc = StringCodec();
nc.publish("updates", sc.encode("All is Well"));
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

await nc.publish("updates", b'All is Well')
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(servers:["nats://127.0.0.1:4222"]) do |nc|
  nc.publish("updates", "All is Well")
end
```
{% endtab %}
{% endtabs %}

