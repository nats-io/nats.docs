# Token Authentication

Token authentication is a string that if provided by a client, allows it to connect. It is the simplest authentication provided by the NATS server. 


To use token authentication, you can just specify an `authorization` section with the `token` property set:
```
authorization {
	token: "s3cr3t"
}
```
Token authentication can be used in the authorization section for clients and clusters.

Or start the server with the `--auth` flag:
```
> nats-server --auth s3cr3t
```

A client can easily connect by specifying the server URL:
```
> nats-sub -s nats://s3cr3t@localhost:4222 ">"
Listening on [>]
```

## Bcrypted Tokens

Tokens can be bcrypted enabling an additional layer of security, as the clear-text version of the token would not be persisted on server configuration file.

You can generate bcrypted tokens and passwords using the [`mkpasswd`](/nats_tools/mkpasswd.md) tool:

```
> mkpasswd
pass: dag0HTXl4RGg7dXdaJwbC8
bcrypt hash: $2a$11$PWIFAL8RsWyGI3jVZtO9Nu8.6jOxzxfZo7c/W0eLk017hjgUKWrhy
```


Here's a simple configuration file:
```
authorization {
	token: "$2a$11$PWIFAL8RsWyGI3jVZtO9Nu8.6jOxzxfZo7c/W0eLk017hjgUKWrhy"
}
```

The client will still require the clear-text token to connect:

```
nats-sub -s nats://dag0HTXl4RGg7dXdaJwbC8@localhost:4222 ">"
Listening on [>]
```


