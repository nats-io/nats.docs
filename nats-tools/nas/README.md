# nats-account-server

The [NATS Account Server](https://github.com/nats-io/nats-account-server) is an HTTP server that hosts and vends [JWTs](../../nats-server/configuration/securing_nats/jwt/) for nats-server 2.0 account authentication. The server supports an number of stores which enable it to serve account [JWTs](../../nats-server/configuration/securing_nats/jwt/) from:

* a [directory](nas_conf.md#directory-configuration)
* an [NSC](../nsc/nsc.md) [directory](nas_conf.md#nsc-configuration)

> The nats server can be configured with a [memory resolver](../../nats-server/configuration/securing_nats/jwt/resolver.md#memory) as well. This avoids usage of the account server.

The server can operate in a _READ ONLY_ mode where it serves content from a directory, or in [notification mode](notifications.md), where it can notify a NATS server that a JWT in the store has been modified, updating the NATS server with the updated JWT.

The server supports replica mode, which allows load balancing, fault tolerance and geographic distribution of servers. Replicas are read-only and copy JWTs from the primary based on cache invalidation or NATS notifications.

The account server can host activation tokens as well as account JWTs. These tokens are used when one account needs to give permission to another account to access a private export. Tokens can be configured as full tokens, or URLs. By hosting them in the account server you can avoid the copy/paste process of embedding tokens. They can also be updated more easily on expiration. The account serer furthermore allows for jwt inspection.

All account server configuration options can be found [here](nas_conf.md#Configuration-File). It futhermore allows [inspection](inspecting_jwts.md) of JWT.

