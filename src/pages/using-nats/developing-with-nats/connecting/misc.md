# Miscellaneous functionalities

This section contains miscellaneous functionalities and options for connect.

## Get the Maximum Payload Size

While the client can't control the maximum payload size, clients may provide a way for applications to obtain the configured [`max_payload`](/running-a-nats-service/configuration/README.md#limits) after the connection is made. This will allow the application to chunk or limit data as needed to pass through the server.

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
t.log(`max payload for the server is ${nc.info.max_payload} bytes`);
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

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsStatus          s        = NATS_OK;

s = natsConnection_ConnectTo(&conn, NATS_DEFAULT_URL);
if (s == NATS_OK)
{
    int64_t mp = natsConnection_GetMaxPayload(conn);
    printf("Max payload: %d\n", (int) mp);
}

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
```
{% endtab %}
{% endtabs %}

## Turn On Pedantic Mode

The NATS server provides a _pedantic_ mode that performs extra checks on the protocol.

One example of such a check is if a subject used for publishing contains a [wildcard](../../../nats-concepts/subjects.md#wildcards) character. The server will not use it as wildcard and therefore omits this check.

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
// the pedantic option is useful for developing nats clients.
// the javascript clients also provide `debug` which will
// print to the console all the protocol interactions
// with the server
const nc = await connect({
    pedantic: true,
    servers: ["demo.nats.io:4222"],
    debug: true,
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

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsOptions         *opts    = NULL;
natsStatus          s        = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetPedantic(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## Set the Maximum Control Line Size

The protocol between the client and the server is fairly simple and relies on a control line and sometimes a body. The control line contains the operations being sent, like PING or PONG, followed by a carriage return and line feed, CRLF or "\r\n". The server has a [`max_control_line`](/running-a-nats-service/configuration/README.md#limits) option that can limit the maximum size of a control line. For PING and PONG this doesn't come into play, but for messages that contain subject names and possibly queue group names, the control line length can be important as it effectively limits the possibly combined length. Some clients will try to limit the control line size internally to prevent an error from the server. These clients may or may not allow you to set the size being used, but if they do, the size should be set to match the server configuration.

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
// the max control line is determined automatically by the client
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

{% tab title="C" %}
```c
// control line is not configurable on C NATS client.
```
{% endtab %}
{% endtabs %}

## Turn On/Off Verbose Mode

Clients can request _verbose_ mode from NATS server. When requested by a client, the server will reply to every message from that client with either a +OK or an error -ERR. However, the client will not block and wait for a response. Errors will be sent without verbose mode as well and client libraries handle them as documented.

> This functionality is only used for debugging the client library or the nats-server themselves. By default the server sets it to on, but every client turns it off.

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
const nc = await connect({
    verbose: true,
    servers: ["demo.nats.io:4222"],
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

{% tab title="C" %}
```c
natsConnection      *conn    = NULL;
natsOptions         *opts    = NULL;
natsStatus          s        = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetVerbose(opts, true);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
