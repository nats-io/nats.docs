# Client Connections

As described, clients are not directly connected to the streaming server. Instead, they send connection requests. The request includes a `client ID` which is used by the server to uniquely identify, and restrict, a given client. That is, no two connections with the same client ID will be able to run concurrently.

This client ID links a given connection to its published messages, subscriptions, especially durable subscriptions. Indeed, durable subscriptions are stored as a combination of the client ID and durable name. More on durable subscriptions later.

It is also used to resolve the issue of not having direct client connections to the server. For instance, say that a client crashes without closing the connection. It later restarts with the same client ID. The server will detect that this client ID is already in-use. It will try to contact that known client to its original private inbox. If the server does not receive a response - which would be the case if the client crashed - it will replace the old client with this new one.<br>

Otherwise, the server would reject the connection request since the client ID is already in-use.