# Connecting to NATS

Most client libraries provide several ways to connect to the NATS server, gnatsd recently updated to nats-server. The server itself is identified by a standard URL with the `nats` protocol. Throughout these examples we will rely on a test server, provided by [nats.io](https://nats.io), at `nats://demo.nats.io:4222`, where `4222` is the default port for NATS.

There are numerous options for a NATS connections.