# authorization

/ [config](/reference/server-config/index.md) / [leafnodes](/reference/server-config/config/leafnodes/index.md) 

Authorization scoped to accepting leaf node connections.

## Properties

### [`username`](/reference/server-config/leafnodes/authorization/username/index.md)

Specifies a global user name that clients can use to authenticate
the server (requires `password`, exclusive of `token`).

### [`password`](/reference/server-config/leafnodes/authorization/password/index.md)

Specifies a global password that clients can use to authenticate
the server (requires `user`, exclusive of `token`).

### [`token`](/reference/server-config/leafnodes/authorization/token/index.md)

Specifies a global token that clients can use to authenticate with
the server (exclusive of `user` and `password`).

### [`users`](/reference/server-config/leafnodes/authorization/users/index.md)

A list of multiple users with different credentials.

### [`default_permissions`](/reference/server-config/leafnodes/authorization/default_permissions/index.md)

The default permissions applied to users, if permissions are
not explicitly defined for them.

### [`timeout`](/reference/server-config/leafnodes/authorization/timeout/index.md)

Maximum number of seconds to wait for a client to authenticate.

Default value: `1`

### [`auth_callout`](/reference/server-config/leafnodes/authorization/auth_callout/index.md)

Enables the auth callout functionality.
All client connections requiring authentication will have
their credentials pass-through to a dedicated auth service.

## Examples

Username/password
```
authorization {
  username: app
  password: s3cret!
}

```
Token
```
authorization {
  token: 6d37bfcc-3eba-4f1f-a6e9-88a3c6ddbf9c
}

```
Users and default permissions
```
authorization {
  default_permissions: {
    publish: "app.services.*"
    subscribe: {
      deny: "_INBOX.>"
    }
  }
  users: [
    {
      username: pam,
      password: pam,
      permissions: {
        subscribe: "_pam.>"
      }
    },
    {
      username: joe,
      password: joe,
      permissions: {
        subscribe: "_joe.>"
      }
    }
  ]
}

```

