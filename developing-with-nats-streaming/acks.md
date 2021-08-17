# Acknowledgements

## Acknowledgements

Subscribers can use auto-ack or manual-ack. Auto-ack is the default for most clients and is sent by the library when the message callback returns. Manual ack provides more control. The subscription options provide flags to:

* Set manual acks to true
* Set the ack wait used by the server for messages to this subscription

The ack wait is the time the server will wait before resending a message.

```go
sub, err := sc.Subscribe("foo",
  func(m *stan.Msg) {
    m.Ack()
  }, stan.SetManualAckMode(), stan.AckWait(aw))
```

> Note that if processing a particular message exceeds ack wait, the following behavior can be observed with [queue subscriptions](queues.md): 1. Subscriber A receives the message. 2. Subscriber A exceeds ack wait time and Subscriber B receives the message. 3. Subscriber B exceeds ack wait time and Subscriber C receives the message. 6. Subscriber A finishes processing and acknowledges the message. 7. Re-delivery of the message ceases.
>
> How often the message is re-delivered depends on processing time for the message and available subscriber.

## Max In Flight

Subscribers can set max in flight to rate limit incoming messages. The server will send at most “max in flight” messages before receiving an acknowledgement. Setting max in flight to 1 insures every message is processed in order.

```go
sc.Subscribe("foo", func(m *stan.Msg) {...},
   stan.SetManualAckMode(),
   stan.MaxInflight(25))
```

## Redelivery of Acknowledged Messages

See the explanation in [nats-streaming-concepts/channels/subscriptions/redelivery](../nats-streaming-concepts/channels/subscriptions/redelivery.md#redelivery-of-acknowledged-messages).

