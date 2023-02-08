# Messages

A message is the unit of communication exchange in NATS. Every message originates from a publishing client and may be received by zero or more subscribing clients.

Messages have an intentionally simple data model. The minimum requirement is a `subject` and `payload`, but a message also supports an optional `header` as well as a `reply` subject if the publisher is expecting a [reply message](/concepts/request-reply/).

In practice, a [client](/clients/) will be used to build or parse a message for use over [the wire](/reference/protocol/client/). Below is a Go example, showcasing the two most common forms of publishing.

```go
// Establish a connection.
nc, _ := nats.Connect("nats://demo.nats.io")

// Publish a message with only a subject and payload.
nc.Publish("house.flower.moisture", []byte("500"))

// Build a message to set an explicit header about the content-type.
m := nats.NewMsg("house.flower.moisture")
m.Header.Set("Content-Type", "text/plain; charset=utf-8")
m.Data = []byte("500")

// Now publish the constructed message.
nc.PublishMsg(m)
```

## Subject

The subject is the address of the message. Read more about subjects [here](/concepts/subjects).

## Payload

A payload is an array of bytes provided by the application. NATS is unopionated about the encoding and/or serialization of the payload itself. One could use JSON, Protocol Buffers, Avro, UTF-8 strings, or a custom encoding.

The only constraint is that the message payload must be less than the [message payload](/reference/config/max_payload/) limit configured on the server.

{% callout type="note" %}
Although a payload is required, it can a zero-length value. It varies by the client, but all clients support a nil, null, or empty array value.

```

```
{% /callout %}

## Headers

An optional set of headers may be set on a message. They are analogous to [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers), where each key can have one or more values associated. However, one key difference is that the character-casing of keys is preserved.

## Reply

The reply subject is used when a publisher expects a client subscribing to the message's subject to _reply_ with a message. This could be a simple acknowledgement with an empty payload or a message that contains results from, for example, a query.

