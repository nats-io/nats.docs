# Connecting to the Default Server

Some libraries also provide a special way to connect to a _default_ url, which is generally `nats://localhost:4222`:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect(nats.DefaultURL)
if err != nil {
	log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect();

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect();
nc.on('connect', (c) => {
    // Do something with the connection
    doSomething();
    // When done close it
    nc.close();
});
nc.on('error', (err) => {
    failed(err);
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()
await nc.connect()

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start do |nc|
   # Do something with the connection

   # Close the connection
   nc.close
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// will throw an exception if connection fails
let nc = await connect();
// Do something with the connection

// When done close it
nc.close();


// alternatively, you can use the Promise pattern
let nc1: Client;
connect()
    .then((c) => {
        nc1 = c;
        // Do something with the connection
        nc1.close();
    });
    // add a .catch/.finally
```
{% endtab %}
{% endtabs %}

