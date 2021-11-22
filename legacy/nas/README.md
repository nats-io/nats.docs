# nats-account-server

If you are creating a new NATS deployment we highly recommend using the internal [NATS Resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#nats-based-resolver) for a much simpler and easy to manage account resolution system.

This account server, while being considered legacy, is still functional and still serves as a good reference to build upon for custom account resolution

## nats-account-server

The standalone [NATS Account Server](https://github.com/nats-io/nats-account-server) is an HTTP server that hosts and vends [JWTs](../../nats-server/configuration/securing_nats/jwt/) for nats-server 2.0 account authentication. The server supports an number of stores which enable it to serve account [JWTs](../../nats-server/configuration/securing_nats/jwt/) from a [directory](nas_conf.md#directory-configuration)

> While the nats servers can be still configured to use a standalone NATS Account Server, this functionality is now deprecated and it is recommended that the servers should now be configured to use the built-in [full NATS based resolver](../../running-a-nats-service/configuration/securing_nats/jwt/resolver.md#nats-based-resolver) instead.
>
> The standalone NATS Account Server also speaks the [full nats based resolver](../../running-a-nats-service/configuration/securing_nats/jwt/resolver.md#nats-based-resolver) protocol and can be used as such.

The server can operate in a _READ ONLY_ mode where it serves content from a directory, or in [notification mode](notifications.md), where it can notify a NATS server that a JWT in the store has been modified, updating the NATS server with the updated JWT.

The server supports replica mode, which allows load balancing, fault tolerance and geographic distribution of servers. Replicas are read-only and copy JWTs from the primary based on cache invalidation or NATS notifications.

The account server can host activation tokens as well as account JWTs. These tokens are used when one account needs to give permission to another account to access a private export. Tokens can be configured as full tokens, or URLs. By hosting them in the account server you can avoid the copy/paste process of embedding tokens. They can also be updated more easily on expiration. The account serer furthermore allows for jwt inspection.

All account server configuration options can be found [here](nas_conf.md#configuration-file). It futhermore allows [inspection](inspecting_jwts.md) of JWT.
