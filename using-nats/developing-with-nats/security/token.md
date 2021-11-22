# Authenticating with a Token

Tokens are basically random strings, much like a password, and can provide a simple authentication mechanism in some situations. However, tokens are only as safe as they are secret so other authentication schemes can provide more security in large installations. It is highly recommended to use one of the other NATS authentication mechanisms.

For this example, start the server using:

```bash
nats-server --auth mytoken
```

The code uses localhost:4222 so that you can start the server on your machine to try them out.

## Connecting with a Token

{% tabs %}
{% tab title="Go" %}
```go
// Set a token
nc, err := nats.Connect("127.0.0.1", nats.Name("API Token Example"), nats.Token("mytoken"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://localhost:4222").
                            token("mytoken"). // Set a token
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
  port: ns.port,
  token: "aToK3n",
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], token="mytoken")

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start(token: "mytoken") do |nc|
  puts "Connected using token"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetToken(opts, "mytoken");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## Connecting with a Token in the URL

Some client libraries will allow you to pass the token as part of the server URL using the form:

> nats://_token_@server:port

Again, once you construct this URL you can connect as if this was a normal URL.

{% tabs %}
{% tab title="Go" %}
```go
// Token in URL
nc, err := nats.Connect("mytoken@localhost")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://mytoken@localhost:4222");//Token in URL

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
  // JavaScript doesn't support tokens in urls use the `token` option
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://mytoken@demo.nats.io:4222"])

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start("mytoken@127.0.0.1:4222") do |nc|
  puts "Connected using token!"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetURL(opts, "nats://mytoken@127.0.0.1:4222");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

