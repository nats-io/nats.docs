# Receiving Messages from a Channel

Clients subscribe to channels by name. Wildcards are not supported. Receiving messages is similar to core NATS. Messages in streaming use protocol buffers and will have a bit more structure than NATS opaque messages. Client messages are still presented and accepted as raw/opaque binary data. The use of protocol buffers is transparent.

Subscriptions come in several forms:

* Regular
* Durable
* Queue
* Queue/Durable

Subscriptions set their starting position on creation using position or time. For example, in Go you can start at:

* The last message received

```go
sub, err := sc.Subscribe("foo",
  func(m *stan.Msg) {...},
  stan.StartWithLastReceived())
```

* The beginning of the channel

```go
sub, err := sc.Subscribe("foo",
  func(m *stan.Msg) {...},
  stan.DeliverAllAvailable())
```

* A specific message, indexing starts at 1

```go
sub, err := sc.Subscribe("foo",
  func(m *stan.Msg) {...},
  stan.StartAtSequence(22))
```

* A specific time the message arrived in the channel

```go
var startTime time.Time
...
sub, err := sc.Subscribe("foo",
  func(m *stan.Msg) {...},
  stan.StartAtTime(startTime))
```