# Miscellaneous Functionalities 

This section contains miscellaneous functionalities and options for connect.

## Get the Maximum Payload Size

While the client can't control the maximum payload size, clients may provide a way for applications to obtain the configured [`max_payload`](../../nats-server/configuration/README.md#limits) after the connection is made. This will allow the application to chunk or limit data as needed to pass through the server.

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

mp := nc.MaxPayload()
log.Printf("Maximum payload is %v bytes", mp)

// Do something with the max payload
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");

long max = nc.getMaxPayload();
// Do something with the max payload

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect("nats://demo.nats.io:4222");

// on node you *must* register an error listener. If not registered
// the library emits an 'error' event, the node process will exit.
nc.on('error', (err) => {
    t.log('client got an error:', err);
});
nc.on('connect', () => {
   t.log(nc.info.max_payload);
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"])

print("Maximum payload is %d bytes" % nc.max_payload)

# Do something with the max payload.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(max_outstanding_pings: 5) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  # Do something with the max_payload
  puts "Maximum Payload is #{nc.server_info[:max_payload]} bytes"
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// connect will happen once - the first connect
nc.on('connect', (nc: Client, url: string, options: ServerInfo) => {
    // nc is the connection that connected
    t.log('client connected to', url);
    t.log('max_payload', options.max_payload);
});
```
{% endtab %}
{% endtabs %}

## Turn On Pedantic Mode

The NATS server provides a _pedantic_ mode that performs extra checks on the protocol.

One example of such a check is if a subject used for publishing contains a [wildcard](../../nats-concepts/subjects.md#wildcards) character. The server will not use it as wildcard and therefore omits this check.

By default, this setting is off but you can turn it on to test your application:

{% tabs %}
{% tab title="Go" %}
```go
opts := nats.GetDefaultOptions()
opts.Url = "demo.nats.io"
// Turn on Pedantic
opts.Pedantic = true
nc, err := opts.Connect()
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
                            server("nats://demo.nats.io:4222").
                            pedantic(). // Turn on pedantic
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222",
    pedantic: true
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], pedantic=True)

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(pedantic: true) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  nc.close
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// will throw an exception if connection fails
let nc = await connect({
    url: "nats://demo.nats.io:4222",
    pedantic: true
});

nc.close();
```
{% endtab %}
{% endtabs %}

## Set the Maximum Control Line Size

The protocol between the client and the server is fairly simple and relies on a control line and sometimes a body. The control line contains the operations being sent, like PING or PONG, followed by a carriage return and line feed, CRLF or "\r\n". 
The server has a [`max_control_line`](../../nats-server/configuration/README.md#limits) option that can limit the maximum size of a control line. For PING and PONG this doesn't come into play, but for messages that contain subject names and possibly queue group names, the control line length can be important as it effectively limits the possibly combined length. 
Some clients will try to limit the control line size internally to prevent an error from the server. These clients may or may not allow you to set the size being used, but if they do, the size should be set to match the server configuration.

> It is not recommended to set this to a value that is higher than the one of other clients or the nats-server.

For example, to set the maximum control line size to 2k:

{% tabs %}
{% tab title="Go" %}
```go
// This does not apply to the NATS Go Client
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
                            server("nats://demo.nats.io:4222").
                            maxControlLine(2 * 1024). // Set the max control line to 2k
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// set this option before creating a connection
NATS.MAX_CONTROL_LINE_SIZE = 1024*2;
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222"
});
```
{% endtab %}

{% tab title="Python" %}
```python
# Asyncio NATS client does not allow custom control lines.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
# There is no need to customize this in the Ruby NATS client.
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// control line size is not configurable on TypeScript NATS client.
```
{% endtab %}
{% endtabs %}

## Turn On/Off Verbose Mode

Clients can request _verbose_ mode from NATS server. When requested by a client, the server will reply to every message from that client with either a +OK or an error -ERR. However, the client will not block and wait for a response. Errors will be sent without verbose mode as well and client libraries handle them as documented. 

> This functionality is only used for debugging the client library or the nats-server themselves. 
> By default the server sets it to on, but every client turns it off.

To turn on verbose mode:

{% tabs %}
{% tab title="Go" %}
```go
opts := nats.GetDefaultOptions()
opts.Url = "demo.nats.io"
// Turn on Verbose
opts.Verbose = true
nc, err := opts.Connect()
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
                            server("nats://demo.nats.io:4222").
                            verbose(). // Turn on verbose
                            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
let nc = NATS.connect({
    url: "nats://demo.nats.io:4222",
    verbose: true
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], verbose=True)

# Do something with the connection.
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
require 'nats/client'

NATS.start(verbose: true) do |nc|
   nc.on_reconnect do
    puts "Got reconnected to #{nc.connected_server}"
  end

  nc.on_disconnect do |reason|
    puts "Got disconnected! #{reason}"
  end

  nc.close
end
```
{% endtab %}

{% tab title="TypeScript" %}
```typescript
// will throw an exception if connection fails
let nc = await connect({
    url: "nats://demo.nats.io:4222",
    verbose: true
});

nc.close();
```
{% endtab %}
{% endtabs %}

