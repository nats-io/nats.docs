# Security

NATS has a lot of security features:

* Connections can be [_encrypted_ with TLS](/running-a-nats-service/configuration/securing_nats/tls.md)
* Client connections can be [_authenticated_](../running-a-nats-service/configuration/securing_nats/auth_intro/) in many ways:
  * [Token Authentication](../running-a-nats-service/configuration/securing_nats/auth_intro/tokens.md)
  * [Username/Password credentials](../running-a-nats-service/configuration/securing_nats/auth_intro/username_password.md)
  * [TLS Certificate](../running-a-nats-service/configuration/securing_nats/auth_intro/tls_mutual_auth.md)
  * [NKEY with Challenge](../running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth.md)
  * [Decentralized JWT Authentication/Authorization](../running-a-nats-service/configuration/securing_nats/jwt/)
* Authenticated clients are identified as users and have a set of [_authorizations_](../running-a-nats-service/configuration/securing_nats/authorization.md)

You can use [accounts](../running-a-nats-service/configuration/securing_nats/accounts.md) for multi-tenancy: each account has its own independent 'subject namespace' and you control the import/export of both streams of messages and services between accounts, and any number of users that client applications can be authenticated as. The subjects or subject wildcards that a user is allowed to publish and/or subscribe to can be controlled either through server configuration or as part of signed JWTs.

JWT authentication/authorization administration is decentralized because each account private key holder can manage their users and their authorizations on their own, without the need for any configuration change on the NATS servers by minting their own JWTs and distributing them to the users. There is no need for the NATS server to ever store any user private keys as they only need to validate the signature chain of trust contained in the user JWT presented by the client application to validate that they have the proper public key for that user.

The JetStream persistence layer of NATS also provides [encryption at rest](../running-a-nats-service/nats_admin/jetstream_admin/encryption_at_rest.md).
