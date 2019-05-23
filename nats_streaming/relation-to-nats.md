# Relation to NATS

NATS Streaming Server by default embeds a [NATS](https://github.com/nats-io/nats-server) server. That is, the Streaming server is not a server per-se, but instead, a client to a NATS Server.<br>
It means that Streaming clients are not directly connected to the streaming server, but instead communicate with the streaming server *through* NATS Server.

This detail is important when it comes to Streaming clients connections to the Streaming server. Indeed, since there is no direct connection, the server knows if a client is connected based on heartbeats.

***It is therefore strongly recommended for clients to close their connection when the application exit, otherwise the server will consider these clients connected (sending data, etc...) until it detects missing heartbeats.***

The streaming server creates internal subscriptions on specific subjects to communicate with its clients and/or other servers.

Note that NATS clients and NATS Streaming clients cannot exchange data between each other. That is, if a streaming client publishes on `foo`, a NATS client subscribing on that same subject will not receive the messages. Streaming messages are NATS messages made of a protobuf. The streaming server is expected to send ACKs back to producers and receive ACKs from consumers. If messages were freely exchanged with the NATS clients, this would cause problems.
