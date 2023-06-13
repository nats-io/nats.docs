# authorization

Static single or multi-user declaration.

*Reloadable*: Yes

*Types*

- `object`


## Properties

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [username](/ref/config/authorization/username) | Specifies a global user name that clients can use to authenticate the server (requires `password`, exclusive of `token`). | `-` | Yes |
| [password](/ref/config/authorization/password) | Specifies a global password that clients can use to authenticate the server (requires `user`, exclusive of `token`). | `-` | Yes |
| [token](/ref/config/authorization/token) | Specifies a global token that clients can use to authenticate with the server (exclusive of `user` and `password`). | `-` | Yes |
| [users](/ref/config/authorization/users) | A list of multiple users with different credentials. | `-` | Yes |
| [default_permissions](/ref/config/authorization/default_permissions) | The default permissions applied to users, if permissions are not explicitly defined for them. | `-` | Yes |
| [timeout](/ref/config/authorization/timeout) | Maximum number of seconds to wait for a client to authenticate. | ``1`` | Yes |
| [auth_callout](/ref/config/authorization/auth_callout) | Enables the auth callout functionality. All client connections requiring authentication will have their credentials pass-through to a dedicated auth service. | `-` | Yes |
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

