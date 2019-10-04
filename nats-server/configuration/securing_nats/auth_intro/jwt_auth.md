# JWTs

_Accounts_ expand on [Accounts](accounts.md) and [NKeys](nkey_auth.md) authentication foundation to create a decentralized authentication and authorization model.

With other authentication mechanisms, configuration for identifying a user or an account is in the server configuration file. JWT authentication leverages [JSON Web Tokens \(JWT\)](https://jwt.io/) to describe the various entities supported. When a client connects, servers query for account JWTs and validate a trust chain. Users are not directly tracked by the server, but rather verified as belonging to an account. This enables the management of users without requiring server configuration updates.

Effectively, accounts provide for a distributed configuration paradigm. Previously each user \(or client\) needed to be known and authorized a priori in the server’s configuration requiring an administrator to modify and update server configurations. Accounts eliminate these chores.

## JSON Web Tokens

[JSON Web Tokens \(JWT\)](https://jwt.io/) are an open and industry standard [RFC7519](https://tools.ietf.org/html/rfc7519) method for representing claims securely between two parties.

Claims are a fancy way of asserting information on a _subject_. In this context, a _subject_ is the entity being described \(not a messaging subject\). Standard JWT claims are typically digitally signed and verified.

NATS further restricts JWTs by requiring that JWTs be:

* Digitally signed _always_ and only using [Ed25519](https://ed25519.cr.yp.to/). 
* NATS adopts the convention that all _Issuer_ and _Subject_ fields in a JWT claim must be a public [NKEY](nkey_auth.md). 
* _Issuer_ and _Subject_ must match specific roles depending on the claim [NKeys](https://github.com/nats-io/nkeys).

### NKey Roles

NKey Roles are:

* Operators
* Accounts
* Users

Roles are hierarchical and form a chain of trust. Operators issue Accounts which in turn issue Users. Servers trust specific Operators. If an account is issued by an operator that is trusted, account users are trusted.

## The Authentication Process

When a _User_ connects to a server, it presents a JWT issued by its _Account_. The user proves its identity by signing a server-issued cryptographic challenge with its private key. The signature verification validates that the signature is attributable to the user's public key. Next, the server retrieves the associated account JWT that issued the user. It verifies the _User_ issuer matches the referenced account. Finally, the server checks that a trusted _Operator_ issued the _Account_, completing the trust chain verification.

## The Authorization Process

From an authorization point of view, the account provides information on messaging subjects that are imported from other accounts \(including any ancillary related authorization\) as well as messaging subjects exported to other accounts. Accounts can also bear limits, such as the maximum number of connections they may have. A user JWT can express restrictions on the messaging subjects to which it can publish or subscribe.

When a new user is added to an account, the account configuration need not change, as each user can and should have its own user JWT that can be verified by simply resolving its parent account.

## JWTs and Privacy

One crucial detail to keep in mind is that while in other systems JWTs are used as sessions or proof of authentication, NATS JWTs are only used as configuration describing:

* the public ID of the entity
* the public ID of the entity that issued it
* capabilities of the entity

Authentication is a public key cryptographic process — a client signs a nonce proving identity while the trust chain and configuration provides the authorization.

The server is never aware of private keys but can verify that a signer or issuer indeed matches a specified or known public key.

Lastly, all NATS JWTs \(Operators, Accounts, Users and others\) are expected to be signed using the [Ed25519](https://ed25519.cr.yp.to/) algorithm. If they are not, they are rejected by the system.

## Sharing Between Accounts

While accounts provide isolation, there are many cases where you want to be able to consume messages produced by one account in another. There are two kinds of shares an account can _export_:

* Streams
* Services

Streams are messages published by a foreign account; Subscribers in an _importing_ account can receive messages from a stream _exported_ by another.

Services are endpoints exported by a foreign account; Requesters _importing_ the service can publish requests to the _exported_ endpoint.

Streams and Services can be public; Public exports can be imported by any account. Or they can be private. Private streams and services require an authorization token from the exporting account that authorizes the foreign account to import the stream or service.

An importing account can remap the subject where a stream subscriber will receive messages or where a service requestor can make requests. This enables the importing account to simplify their subject space.

Exports and imports from an account are explicit, and they are visible in the account's JWT. For private exports, the import will embed an authorization token or a URL storing the token. Imports and exports make it easy to audit where data is coming from or going to.

## Configuration

Entity JWT configuration is done using the [`nsc` tool](../../../../nats-tools/nsc/). The basic steps include:

* [Creation of an operator JWT](../../../../nats-tools/nsc/nsc.md#creating-an-operator)
* [Configuring an Account Server](../../../../nats-tools/nsc/nsc.md#account-server-configuration)
* [Setting up the NATS server to resolve Accounts](../../../../nats-tools/nsc/nsc.md#nats-server-configuration)

After that, `nsc` is used to create and edit accounts and users.

