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
const nc = await connect();
// Do something with the connection
doSomething();
// When done close it
await nc.close();
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

{% tab title="C" %}
```c
natsConnection      *conn = NULL;
natsStatus          s;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);
if (s != NATS_OK)
  // handle error

// Destroy connection, no-op if conn is NULL.
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}
