# Authentication

NATS authentication is multi-level. All of the security modes have an [_accounts_](../../../../running-a-nats-service/configuration/securing_nats/auth_intro) level with [_users_](./#user-configuration-map) belonging to those accounts. The decentralized JWT Authentication also has an _operator_ to which the accounts belong.

Each account has its own independent subject namespace: a message published on subject 'foo' in one account will not be seen by subscribers to 'foo' in other accounts. Accounts can however define exports and imports of subject(s) streams as well as expose request-reply services between accounts. Users within an account will share the same subject namespace but can be restricted to only be able to publish-subscribe to specific subjects.

## Authentication Methods

The NATS server provides various ways of authenticating clients:

- [Token Authentication](tokens.md)
- [Plain Text Username/Password credentials](username_password.md#plain-text-passwords)
- [Bcrypted Username/Password credentials](username_password.md#bcrypted-passwords)
- [TLS Certificate](tls_mutual_auth.md)
- [NKEY with Challenge](nkey_auth.md)
- [Decentralized JWT Authentication/Authorization](../jwt/)

Authentication deals with allowing a NATS client to connect to the server. Except for JWT authentication, authentication and authorization are configured in the `authorization` section of the configuration. With JWT authentication the account and user information are stored in the [resolver](../jwt/resolver.md) rather than in the server configuration file.

## Authorization Map

The `authorization` block provides _authentication_ configuration as well as [_authorization_](../authorization.md):

| Property                                       | Description                                                                                                                           |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| [`token`](tokens.md)                           | Specifies a global token that can be used to authenticate to the server \(exclusive of user and password\)                            |
| [`user`](username_password.md#single-user)     | Specifies a single _global_ user name for clients to the server \(exclusive of token\)                                                |
| [`password`](username_password.md)             | Specifies a single _global_ password for clients to the server \(exclusive of `token`\)                                               |
| [`users`](username_password.md#multiple-users) | A list of [user configuration](#user-configuration-map) maps. For multiple username and password credentials, specify a `users` list. |
| [`timeout`](auth_timeout.md)                   | Maximum number of seconds to wait for client authentication                                                                           |
| [`auth_callout`](../auth_callout.md)           | Enables the auth callout extension                                                                                                    |

## User Configuration Map

A `user` configuration map specifies credentials and permissions options for a single user:

| Property                             | Description                                                                                                                                   |
| :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| [`user`](username_password.md)       | username for client authentication. \(Can also be a user for [tls authentication](tls_mutual_auth.md#mapping-client-certificates-to-a-user)\) |
| [`password`](username_password.md)   | password for the user entry                                                                                                                   |
| [`nkey`](nkey_auth.md)               | public nkey identifying an user                                                                                                               |
| [`permissions`](../authorization.md) | permissions map configuring subjects accessible to the user                                                                                   |
