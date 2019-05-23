# Connecting to NATS Streaming

First, it is recommended to understand the relation between Streaming and core NATS. You should familiarize yourself with the [concept](/nats_streaming/relation-to-nats.md).

NATS Streaming is a service on top of NATS. To connect to the service you first connect to NATS and then use the client library to communicate with the server over your NATS connection. Most of the libraries provide a convenience mechanism for connecting in a single step. These convenience methods will take some NATS options, like the cluster ID, and perform the NATS connection first, then run the protocol to connect to the streaming server.

Connecting to a streaming server requires a cluster id, defined by the server configuration, and a client ID defined by the client.

_Client ID should contain only alphanumeric characters, `-` or `_`_

Connecting to a server running locally on the default port is as simple as this:

```go
sc, err := stan.Connect(clusterID, clientID)
```

If the server runs on port `1234`:
```go
sc, err := stan.Connect(clusterID, clientID, stan.NatsURL(“nats://localhost:1234))
```

Sometimes you may want to provide NATS settings that aren't available in the streaming libraries connect method. Or, you may want to reuse a NATS connection instead of creating a new one. In this case the libraries generally provide a way to connect to streaming with an existing NATS connection:

```go
sc, err := stan.Connect(clusterID, clientID, stan.NatsConn(nc))
```