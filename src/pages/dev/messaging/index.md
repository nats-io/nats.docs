# Messaging

Messaging is the foundational communication mechanism in NATS. Clients connect to the NATS server and exchange *messages* by publishing and subscribing to *subjects*.

{% figure
  src="/assets/messaging-1.svg"
  alt="Messaging"
  className="h-40"
  caption="A client publishing a message and two clients subscribing." /%}

Messaging is used as the basis for all other capabilities in NATS, including additional client APIs such as streaming and key-value, but also for internal communication and clustering between servers.

## Messages

A message is the unit of communication *exchange* in NATS. Every message originates from a publishing client and may be received by zero or more subscribing clients.

Messages have an intentionally simple data model.

```go
msg := nats.Msg{
  Subject: "sensor.temp",
  Data: []byte(`{"value": 68, "unit": "F"}`),
}
```

The required fields are `Subject` and `Data`, however the data payload can be empty.

An optional `Header` can be supplied which holds a set of key-value pairs, where each key could have one or more associated values.

```go
header := make(nats.Header)
header.Add("Content-Type", "application/json")
msg.Header = header
```

A header can be useful for setting metadata about the message itself. The subscriber can then inspect metadata and decide how to handle the payload, for example.

NATS supports a handful of headers used in various contexts. By convention, every header key NATS defines has a `Nats-` prefix. Other than these headers, application-defined headers are ignored by the server.

The final supported field is `Reply` which is a subject set and subscribed to by the publishing client with the expectation that one or more subscribers will _reply_ with a message. This is discussed in the [Request-Reply](dev/messaging/request-reply) section.

{% callout type="note" %}
If you are curious about the NATS client protocol, refer to the [reference documentation](ref/protocols/client).
{% /callout %}

### Payload agnostic



## Subjects

Subjects are the unit of *addressability* for messages. When a client publishes a message, it must specify the subject it will be published to. Likewise, if a client wants to subscribe to messages, it specifies a subject.

For example a client might publish a moisture reading.

```
$ nats pub 'sensors.tulip.moisture' '500'
```

Another client could then subscribe to the subject and receive these readings whenever one is published.

```
$ nats sub 'senors.tulip.moisture'
Subscribing on sensors.tulip.moisture
```

### Hierarchies

The `.` character is used to create a subject hierarchy. For example, a world clock application might define the following to logically group related subjects:

```markup
time.us
time.us.east
time.us.east.atlanta
time.eu.east
time.eu.warsaw
```

### Wildcards

NATS provides two _wildcards_ that can take the place of one or more elements in a dot-separated subject. Subscribers can use these wildcards to listen to multiple subjects with a single subscription but Publishers will always use a fully specified subject, without the wildcard.


The first wildcard is `*` which will match a single token. For example, if an application wanted to listen for eastern time zones, they could subscribe to `time.*.east`, which would match `time.us.east` and `time.eu.east`.

The second wildcard is `>` which will match one or more tokens, and can only appear at the end of the subject. For example, `time.us.>` will match `time.us.east` and `time.us.east.atlanta`, while `time.us.*` would only match `time.us.east` since it can't match more than one token.

Subject to your security configuration, wildcards can be used for monitoring by creating something sometimes called a _wire tap_. In the simplest case you can create a subscriber for `>`. This application will receive all messages -- again, subject to security settings -- sent on your NATS cluster.

The wildcard `*` can appear multiple times in the same subject. Both types can be used as well. For example, `*.*.east.>` will receive `time.us.east.atlanta`.

{% callout type="note" %}
It is recommended to keep the maximum number of tokens in your subjects to a reasonable value of 16 tokens max.
{% /callout %}
