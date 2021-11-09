# Security

NATS has a lot of security features:

* Connections can be [_encrypted_ with TLS](broken-reference)
* Client connections can be [_authenticated_](../nats-server/configuration/securing\_nats/auth\_intro/) in many ways:
  * [Token Authentication](../nats-server/configuration/securing\_nats/auth\_intro/tokens.md)
  * [Username/Password credentials](../nats-server/configuration/securing\_nats/auth\_intro/username\_password.md)
  * [TLS Certificate](../nats-server/configuration/securing\_nats/auth\_intro/tls\_mutual\_auth.md)
  * [NKEY with Challenge](../nats-server/configuration/securing\_nats/auth\_intro/nkey\_auth.md)
  * [Decentralized JWT Authentication/Authorization](../nats-server/configuration/securing\_nats/jwt/)
* Authenticated clients are identified as users and have a set of [_authorizations_](../nats-server/configuration/securing\_nats/authorization.md)

You can use [accounts](../nats-server/configuration/securing\_nats/accounts.md) for multi-tenancy: each account has its own independent 'subject namespace' and you control the import/export of both streams of messages and services between accounts, and any number of users that client applications can be authenticated as. The subjects or subject wildcards that a user is allowed to publish and/or subscribe to can be controlled either through server configuration or as part of signed JWTs.

JWT authentication/authorization administration is decentralized because each account private key holder can manage their users and their authorizations on their own, without the need for any configuration change on the nats servers by minting their own JWTs and distributing them to the users. There is no need for the nats server to ever store any user private keys as they only need to validate the signature chain of trust contained in the user JWT presented by the client application to validate that they have the proper public key for that user.

The JetStream persistence layer of NATS also provides [encryption at rest](../jetstream/encryption\_at\_rest.md)
