# Managing operators, accounts and users JWTs and Nkeys

If you are using the [JWT](/running-a-nats-service/configuration/securing_nats/jwt/README.md) model of authentication to secure your NATS infrastructure you can administer authentication and authorization without having to change the servers' configuration files.

You can use the [`nsc`](/using-nats/nats-tools/nsc/README.md) CLI tool to manage identities. Identities take the form of nkeys. Nkeys are a public-key signature system based on Ed25519 for the NATS ecosystem.
The nkey identities are associated with NATS configuration in the form of a JSON Web Token (JWT). The JWT is digitally signed by the private key of an issuer forming a chain of trust. The nsc tool creates and manages these identities and allows you to deploy them to a JWT account server, which in turn makes the configurations available to nats-servers.

You can also use [`nk`](https://github.com/nats-io/nkeys#readme) CLI tool and library to manage keys.