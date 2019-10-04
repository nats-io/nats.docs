# Receiving Messages

In general, applications can receive messages asynchronously or synchronously. Receiving messages with NATS can be library dependent.

Some languages, like Go or Java, provide synchronous and asynchronous APIs, while others may only support one type of subscription.

In all cases, the process of subscribing involves having the client library tell the NATS system that an application is interested in a particular subject.

Under the covers, the client library will assign a unique id to each subscription. This id is used as a closure when the server sends messages to a specific subscription. Each subscription gets a unique id, so if the same connection is used multiple times for the same subject, the server will send multiple copies of the same message. When an application is done with a subscription it unsubscribes which tells the server to stop sending messages.

