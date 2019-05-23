# Receiving Messages from a Channel

Clients subscribe to channels by name. Wildcards are not supported. Receiving messages is similar to core NATS. Messages in streaming use protocol buffers and will have a bit more structure than NATS opaque messages. Client messages are still presented and accepted as raw/opaque binary data. The use of protocol buffers is transparent.

Subscriptions come in several forms:

* Regular
* Durable
* Queue
* Queue/Durable

For more details on the various types, check the [concept](/nats_streaming/channels/subscriptions/subscriptions.md) section.

***Note: message callbacks are invoked serially, one message at a time. If your application does not care about processing ordering and would prefer the messages to be dispatched concurrently, it is the application responsibility to move them to some internal queue to be picked up by threads/go routines.***

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

To set the delay after which the server should attempt to redeliver a message for which it has not receive an acknowledgment:

```go
sub, err := sc.Subscribe("foo",
  func(m *stan.Msg) {...},
  stan.AckWait(20*time.Second))
```

When an application wishes to stop receiving, but want to maintain the connection opened, the subscription should be closed. There are two ways to stop a subscription, either "close" it, or "unsubscribe" it. For non durable subscriptions, this is equivalent since the subscription will be completely removed. For durable subscriptions, close means that the server will stop delivering, but remember the durable subscription. Unsubscribe, however, means that the server will remove the state of this subscription.

To simply close:
```go
err := sub.Close()
```

To unsubscribe:
```go
err := sub.Unsubscribe()
```

_Note: If a connection is closed without explicitly closing the subscriptions, the subscriptions are implicitly closed, not unsubscribed._
