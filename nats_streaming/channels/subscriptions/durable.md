# Durable

If an application wishes to resume message consumption from where it previously stopped, it needs to create a durable subscription. It does so by providing a durable name, which is combined with the client ID provided when the client created its connection. The server then maintain the state for this subscription even after the client connection is closed.

***Note: The starting position given by the client when restarting a durable subscription is ignored.***

When the application wants to stop receiving messages on a durable subscription, it should close - but *not unsubscribe*- this subscription. If a given client library does not have the option to close a subscription, the application should close the connection instead.

When the application wants to delete the subscription, it must unsubscribe it. Once unsubscribed, the state is removed and it is then possible to re-use the durable name, but it will be considered a brand new durable subscription, with the start position being the one given by the client when creating the durable subscription.