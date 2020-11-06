# Authentication

The NATS server provides various ways of authenticating clients:

* [Token Authentication](tokens.md)
* [Username/Password credentials](username_password.md)
* [TLS Certificate](tls_mutual_auth.md)
* [NKEY with Challenge](nkey_auth.md)
* [Decentralized JWT Authentication/Authorization](../jwt/)

Authentication deals with allowing a NATS client to connect to the server. Except for JWT authentication, authentication and authorization are configured in the `authorization` section of the configuration.

## Authorization Map

The `authorization` block provides _authentication_ configuration as well as _authorization_:

| Property | Description |
| :--- | :--- |
| [`token`](tokens.md) | Specifies a global token that can be used to authenticate to the server \(exclusive of user and password\) |
| [`user`](username_password.md) | Specifies a single _global_ user name for clients to the server \(exclusive of token\) |
| [`password`](username_password.md) | Specifies a single _global_ password for clients to the server \(exclusive of `token`\) |
| `users` | A list of [user configuration](./#user-configuration-map) maps |
| [`timeout`](auth_timeout.md) | Maximum number of seconds to wait for client authentication |

For multiple username and password credentials, specify a `users` list.

## User Configuration Map

A `user` configuration map specifies credentials and permissions options for a single user:

| Property | Description |
| :--- | :--- |
| [`user`](username_password.md) | username for client authentication. \(Can also be a user for [tls authentication](tls_mutual_auth.md#mapping-client-certificates-to-a-user)\) |
| [`password`](username_password.md) | password for the user entry |
| [`nkey`](nkey_auth.md) | public nkey identifying an user |
| [`permissions`](../authorization.md) | permissions map configuring subjects accessible to the user |

