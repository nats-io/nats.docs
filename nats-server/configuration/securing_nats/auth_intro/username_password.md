# Username/Password

You can authenticate one or more clients using username and passwords; this enables you to have greater control over the management and issuance of credential secrets.

For a single user:

```text
authorization: {
    user: a,
    password: b
}
```

You can also specify a single username/password by:

```text
> nats-server --user a --pass b
```

For multiple users:

```text
authorization: {
    users: [
        {user: a, password: b},
        {user: b, password: a}
    ]
}
```

## Bcrypted Passwords

Username/password also supports bcrypted passwords using the [`mkpasswd`](../../../../nats-tools/mkpasswd.md) tool. Simply replace the clear text password with the bcrypted entries:

```text
> mkpasswd
pass: (Uffs#rG42PAu#Oxi^BNng
bcrypt hash: $2a$11$V1qrpBt8/SLfEBr4NJq4T.2mg8chx8.MTblUiTBOLV3MKDeAy.f7u
```

And on the configuration file:

```text
authorization: {
    users: [
        {user: a, password: "$2a$11$V1qrpBt8/SLfEBr4NJq4T.2mg8chx8.MTblUiTBOLV3MKDeAy.f7u"},
        ...    
    ]
}
```

## Reloading a Configuration

As you add/remove passwords from the server configuration file, you'll want your changes to take effect. To reload without restarting the server and disconnecting clients, do:

```text
> nats-server --signal reload
```

