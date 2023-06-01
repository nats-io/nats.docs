# authorization

/ [Config](../..) / [leafnodes](..) 

Authorization scoped to accepting leaf node connections.

## Properties

### [`username`](username)

Specifies a global user name that clients can use to authenticate
the server (requires `password`, exclusive of `token`).

### [`password`](password)

Specifies a global password that clients can use to authenticate
the server (requires `user`, exclusive of `token`).

### [`token`](token)

Specifies a global token that clients can use to authenticate with
the server (exclusive of `user` and `password`).

### [`users`](users)

A list of multiple users with different credentials.

### [`default_permissions`](default_permissions)

The default permissions applied to users, if permissions are
not explicitly defined for them.

### [`timeout`](timeout)

Maximum number of seconds to wait for a client to authenticate.

Default value: `1`

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

