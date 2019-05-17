# Queue Subscriptions

Queue subscriptions are created like other subscriptions with the addition of a queue name. All subscriptions, across clients, share the queue based on this unique name. Other subscriptions can receive messages independently of the queue groups. Unsubscribe removes a client from a group, the last unsubscribe kills the group. Max in flight is per subscription.

```go
qsub1, _ := sc.QueueSubscribe(channelID,
    queueName, func(m *stan.Msg) {...})

qsub2, _ := sc.QueueSubscribe(channelID,
    queueName, func(m *stan.Msg) {...})
```