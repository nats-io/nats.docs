# Username/Password

You can authenticate one or more clients using username and passwords; this enables you to have greater control over the management and issuance of credential secrets.

For a single user:

```
authorization: {
    user: a,
    password: b
}
```

You can also specify a single username/password by:

```
> nats-server --user a --pass b
```

For multiple users:

```
authorization: {
    users: [
        {user: a, password: b},
        {user: b, password: a}
    ]
}
```

## Bcrypted Passwords

Username/password also supports bcrypted passwords using the [`nats`](/using-nats/nats-tools/nats_cli/readme.md) tool. Simply replace the clear text password with the bcrypted entries:

```
> nats server passwd
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$V1qrpBt8/SLfEBr4NJq4T.2mg8chx8.MTblUiTBOLV3MKDeAy.f7u
```

And on the configuration file:

```
authorization: {
    users: [
        {user: a, password: "$2a$11$V1qrpBt8/SLfEBr4NJq4T.2mg8chx8.MTblUiTBOLV3MKDeAy.f7u"},
        ...
    ]
}
```

## Reloading a Configuration

As you add/remove passwords from the server configuration file, you'll want your changes to take effect. To reload without restarting the server and disconnecting clients, do:

```
> nats-server --signal reload
```
