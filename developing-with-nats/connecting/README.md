# Connecting

A NATS system is usually identified by a standard URL with the `nats` or `tls` protocol, e.g. nats://demo.nats.io. A NATS system can be a single server, a small cluster or a global super cluster. Throughout these examples we will rely on a single test server, provided by [nats.io](https://nats.io), at `nats://demo.nats.io`, where `4222` is the default port for NATS.

NATS also supports secure connectivity using TLS via the `tls` protocol. Most clients support auto-detection of a secure connection using the URL protocol `tls`. There is also a demo server running TLS at `tls://demo.nats.io:4443`. The protocol requirement is being made optional for many client libraries, so that you can use `demo.nats.io:4222` as the URL and let the client and server resolve whether or not TLS is required.

When connecting to a cluster it is best to provide the complete set of 'seed' URLs for the cluster. 

There are numerous options for a NATS connection ranging from timeouts to reconnect settings.

