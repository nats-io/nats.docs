# Authentication

The NATS server provides various ways of authenticating clients:

- Token Authentication
- Username/Password credentials
- TLS Certificate
- NKEY with Challenge
- JWTs with Challenge

Authentication deals with allowing a NATS client to connect to the server.
With the exception of JWT authentication, authentication and authorization configuration is in the `authorization` block of the configuration.

