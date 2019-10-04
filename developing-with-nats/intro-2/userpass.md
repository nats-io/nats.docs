# Authenticating with a User and Password

For this example, start the server using:

```bash
> nats-server --user myname --pass password
```

You can encrypt passwords to pass to `nats-server` using a simple tool provided by the server:

```bash
> go run mkpasswd.go -p
> password: password
> bcrypt hash: $2a$11$1oJy/wZYNTxr9jNwMNwS3eUGhBpHT3On8CL9o7ey89mpgo88VG6ba
```

and use the hashed password in the server config. The client still uses the plain text version.

The code uses localhost:4222 so that you can start the server on your machine to try them out.

## Connecting with a User/Password

When logging in with a password `nats-server` will take either a plain text password or an encrypted password.

!INCLUDE "../../\_examples/connect\_userpass.html"

## Connecting with a User/Password in the URL

Most clients make it easy to pass the user name and password by accepting them in the URL for the server. This standard format is:

> nats://_user_:_password_@server:port

Using this format, you can connect to a server using authentication as easily as you connected with a URL:

!INCLUDE "../../\_examples/connect\_userpass\_url.html"

