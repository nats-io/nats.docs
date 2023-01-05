# Receiving Messages

In general, applications can receive messages asynchronously or synchronously. Receiving messages with NATS can be library dependent.

Some languages, like Go or Java, provide synchronous and asynchronous APIs, while others may only support one type of subscription.

In all cases, the process of subscribing involves having the client library tell the NATS system that an application is interested in a particular subject. When an application is done with a subscription it unsubscribes telling the server to stop sending messages.

A client will receive a message for each matching subscription, so if a connection has multiple subscriptions using identical or overlapping subjects \(say `foo` and `>`\) the same message will be sent to the client multiple times.

Note: The client API (asynchronous) subscribe call can return before the subscription is actually fully established at the nats-server. Call `Flush()` on the connection right after you call subscribe if you need to synchronize with the subscription being ready at the server level.