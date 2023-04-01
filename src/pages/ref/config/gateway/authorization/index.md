# authorization

/ [config](/ref/config/index.md) / [gateway](/ref/config/config/gateway/index.md)

Authorization map for gateways. When a single username/password is
used, it defines the authentication mechanism this server expects,
and how this server will authenticate itself when establishing
a connection to a discovered gateway. This will not be used for
gateways explicitly listed in gateways and therefore have to be
provided as part of the URL. With this authentication mode, either
use the same credentials throughout the system or list every gateway
explicitly on every server. If the tls configuration map specifies
verify_and_map only provide the expected username. Here different
certificates can be used, but they do have to map to the same username.
The authorization map also allows for timeout which is honored but
users and token configuration are not supported and will prevent the
server from starting. The permissions block is ignored.

## Properties

### [`username`](/ref/config/gateway/authorization/username/index.md)

Specifies a global user name that clients can use to authenticate
the server (requires `password`, exclusive of `token`).

### [`password`](/ref/config/gateway/authorization/password/index.md)

Specifies a global password that clients can use to authenticate
the server (requires `user`, exclusive of `token`).

### [`token`](/ref/config/gateway/authorization/token/index.md)

Specifies a global token that clients can use to authenticate with
the server (exclusive of `user` and `password`).

### [`users`](/ref/config/gateway/authorization/users/index.md)

A list of multiple users with different credentials.

### [`default_permissions`](/ref/config/gateway/authorization/default_permissions/index.md)

The default permissions applied to users, if permissions are
not explicitly defined for them.

### [`timeout`](/ref/config/gateway/authorization/timeout/index.md)

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
