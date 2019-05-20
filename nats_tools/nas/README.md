## NATS Account Server

The [NATS Account Server](https://github.com/nats-io/nats-account-server) is an HTTP server that hosts and vends JWTs for nats-server 2.0 account authentication. The server supports an number of stores which enable it to serve JWTs from:

- a directory
- an [NSC](../nsc/nsc.md) directory
- memory (for testing purposes)

The server can operate in a _READ ONLY_ mode where it serves content from a directory, or in notification mode, where it can notify a NATS server that JWT in the store have been modified, updating the NATS server with the updated JWT.


### Memory Resolver

For very simple installations, where JWTs are mostly static, the NATS server also supports a _Memory Resolver_ that can be configured statically in the server's configuration file.

You can learn more about how to configure the [memory resolver here](mem_resolver.md).