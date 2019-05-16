# Connecting to NATS

Most client libraries provide several ways to connect to the NATS server. The server itself is identified by a standard URL with the `nats` protocol. Throughout these examples we will rely on a test server, provided by [nats.io](https://nats.io), at `nats://demo.nats.io:4222`, where `4222` is the default port for NATS.

NATS clients also support the `tls` protocol to indicate that the client wants to use TLS. So in the previous example we can replace `nats` with `tls` to get `tls://demo.nats.io:4222`.

The protocol requirement is being removed from many libraries, so that you can use `demo.nats.io:4222` as the URL and let the client and server resolve whether or not TLS is required.

There are numerous options for a NATS connections ranging from timeouts to reconnect settings.