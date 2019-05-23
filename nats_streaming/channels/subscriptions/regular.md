# Regular

The state of these subscriptions is removed when they are unsubscribed or closed (which is equivalent for this type of subscription) or the client connection is closed (explicitly by the client, or closed by the server due to timeout). They do, however, survive a *server* failure (if running with a persistent store).
