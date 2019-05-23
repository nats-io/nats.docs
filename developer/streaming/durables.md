# Durable Subscriptions

Regular subscriptions remember their position while the client is connected. If the client disconnects the position is lost. Durable subscriptions remember their position even if the client is disconnected.

Durable subscriptions identify themselves with a name. Connect and disconnect won’t affect the durable subscriptions position in the channel.

```go
sc.Subscribe("foo", func(m *stan.Msg) {...}, stan.DurableName("my-durable"))
```

Unsubscribe will cause the server to completely remove the durable subscription.

Check the [concepts](/nats_streaming/channels/subscriptions/durable.md) section for more information.