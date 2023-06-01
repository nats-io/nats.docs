# authorization

Static single or multi-user declaration.

## Properties

#### [`username`](username/README.md)

Specifies a global user name that clients can use to authenticate
the server (requires `password`, exclusive of `token`).

#### [`password`](password/README.md)

Specifies a global password that clients can use to authenticate
the server (requires `user`, exclusive of `token`).

#### [`token`](token/README.md)

Specifies a global token that clients can use to authenticate with
the server (exclusive of `user` and `password`).

#### [`users`](users/README.md)

A list of multiple users with different credentials.

#### [`default_permissions`](default_permissions/README.md)

The default permissions applied to users, if permissions are
not explicitly defined for them.

#### [`timeout`](timeout/README.md)

Maximum number of seconds to wait for a client to authenticate.

Default value: `1`

#### [`auth_callout`](auth_callout/README.md)

Enables the auth callout functionality.
All client connections requiring authentication will have
their credentials pass-through to a dedicated auth service.

## Examples

### Username/password
```
authorization {
  username: app
  password: s3cret!
}

```
### Token
```
authorization {
  token: 6d37bfcc-3eba-4f1f-a6e9-88a3c6ddbf9c
}

```
### Users and default permissions
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

