# Queue Subscriptions

Queue subscriptions are created like other subscriptions with the addition of a queue name.

```go
qsub1, _ := sc.QueueSubscribe(channelName,
    queueName, func(m *stan.Msg) {...})

qsub2, _ := sc.QueueSubscribe(channelName,
    queueName, func(m *stan.Msg) {...})
```

Multiple subscriptions using the same channel and queue name are members of the same queue group. That means that if a message is published on that channel, only one member of the group receives the message. Other subscriptions receive messages independently of the queue groups, that is, a message is delivered to all subscriptions and one member of each queue group.

To create a durable queue subscription, simply add a durable name:
```go
qsub, err := sc.QueueSubscribe(channelName,
    queueName, func(m *stan.Msg) {...},
    stan.DurableName("durable-name"))
```

Subscriptions options apply to each member independently, notably, the `AckWait` and `MaxInflight`. Those two members of the same queue group use different options for redelivery and max inflight.
```go
qsub1, _ := sc.QueueSubscribe(channelName,
    queueName, func(m *stan.Msg) {...},
    stan.AckWait(5*time.Second),
    stan.MaxInflight(5))

qsub2, _ := sc.QueueSubscribe(channelName,
    queueName, func(m *stan.Msg) {...},
    stan.AckWait(20*time.Second),
    stan.MaxInflight(10))
```

If the queue subscription is durable, only the last member calling `Unsubscribe()` will cause the durable queue group to be removed from the server.

Check the [concepts](/nats_streaming/channels/subscriptions/queue-group.md) section for more information.