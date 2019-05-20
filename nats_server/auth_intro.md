# Authentication

The NATS server provides various ways of authenticating clients:

- Token Authentication
- Username/Password credentials
- TLS Certificate
- NKEY with Challenge
- JWTs with Challenge

Authentication deals with allowing a NATS client to connect to the server.
With the exception of JWT authentication, authentication and authorization configuration is in the `authorization` block of the configuration.

## Authorization Map

The `authorization` block provides _authentication_ configuration as well as _authorization_:

| Property | Description |
| :------  | :---- |
| [`token`](tokens.md) | Specifies a token that can be used to authenticate to the server |
| [`user`](username_password.md) | Specifies a single user name for clients to the server |
| [`password`](username_password.md) | Specifies a single password for clients to the server |
| `users` | A list of `user` configuration maps |
| `timeout` | Maximum number of seconds to wait for client authentication |



### User Configuration Map

A `user` configuration map specifies credentials and permissions options for a single user:

| Property | Description |
| :------  | :---- |
| [`user`](username_password.md) | username for client authentication |
| [`password`](username_password.md) | password for the user entry |
| [`nkey`](nkey_auth.md) | public nkey identifying an user |
| `permissions` | permissions map configuring subjects accessible to the user |


### Permissions Configuration Map

The `permissions` map specify subjects that can be subscribed to or published by the specified client.

| Property | Description |
| :------  | :---- |
| `publish` | subject or list of subjects or permission map the client can publish |
| `subscribe` | subject or list of subjects or permission map the client can publish |

### Permission Map

The `permission` map provides additional properties for configuring subject permissions:

| Property | Description |
| :------  | :---- |
| `allow` | List of subject names that are allowed to the client |
| `deny` | List of subjects that are denied to the client |








