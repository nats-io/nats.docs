# Tokens

Token authentication is a string that if provided by a client, allows it to connect. It is the most straightforward authentication provided by the NATS server.

To use token authentication, you can specify an `authorization` section with the `token` property set:

```text
authorization {
    token: "s3cr3t"
}
```

Token authentication can be used in the authorization section for clients and clusters.

Or start the server with the `--auth` flag:

```shell
nats-server --auth s3cr3t
```

A client can easily connect by specifying the server URL:

```shell
nats sub -s nats://s3cr3t@localhost:4222 ">"
```

## Bcrypted Tokens

Tokens can be bcrypted enabling an additional layer of security, as the clear-text version of the token would not be persisted on the server configuration file.

You can generate bcrypted tokens and passwords using the [`nats`](../../../../using-nats/nats-tools/nats%20CLI/readme.md) tool:

```shell
nats server passwd
```
Output
```text
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$PWIFAL8RsWyGI3jVZtO9Nu8.6jOxzxfZo7c/W0eLk017hjgUKWrhy
```

Here's a simple configuration file:

```text
authorization {
    token: "$2a$11$PWIFAL8RsWyGI3jVZtO9Nu8.6jOxzxfZo7c/W0eLk017hjgUKWrhy"
}
```

The client will still require the clear-text token to connect:

```shell
nats sub -s nats://dag0HTXl4RGg7dXdaJwbC8@localhost:4222 ">"
```

