# nats-account-server

The [NATS Account Server](https://github.com/nats-io/nats-account-server) is an HTTP server that hosts and vends JWTs for nats-server 2.0 account authentication. The server supports an number of stores which enable it to serve JWTs from:

* a directory
* an [NSC](../nsc/nsc.md) directory
* memory \(for testing purposes\)

The server can operate in a _READ ONLY_ mode where it serves content from a directory, or in notification mode, where it can notify a NATS server that a JWT in the store has been modified, updating the NATS server with the updated JWT.

The server supports replica mode, which allows load balancing, fault tolerance and geographic distribution of servers. Replicas are read-only and copy JWTs from the primary based on cache invalidation or NATS notifications.

The account server can host activation tokens as well as account JWTs. These tokens are used when one account needs to give permission to another account to access a private export. Tokens can be configured as full tokens, or URLs. By hosting them in the account server you can avoid the copy/paste process of embedding tokens. They can also be updated more easily on expiration.

## Memory Resolver

For very simple installations, where JWTs are mostly static, the NATS server also supports a _Memory Resolver_ that can be configured statically in the server's configuration file.

You can learn more about how to configure the [memory resolver here](mem_resolver.md).

