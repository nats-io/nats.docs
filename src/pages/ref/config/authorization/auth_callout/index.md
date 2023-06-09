# auth_callout

/ [Server Config](/ref/config/index.md) / [authorization](/ref/config/authorization/index.md) 

Enables the auth callout functionality.
All client connections requiring authentication will have
their credentials pass-through to a dedicated auth service.

*Reloadable*: `true`

*Types*

- `object`


## Properties

#### [`issuer`](/ref/config/authorization/auth_callout/issuer/index.md)

An account public NKey.

#### [`account`](/ref/config/authorization/auth_callout/account/index.md)

The name or public NKey of an account of the users which will
be used by the authorization service to connect to the server.

Default value: `$G`

#### [`users`](/ref/config/authorization/auth_callout/users/index.md)

The names or public NKeys of users within the defined account
that will be used by the the auth service itself and thus bypass
auth callout.

#### [`key`](/ref/config/authorization/auth_callout/key/index.md)

A public XKey that will encrypt server requests to the auth
service.

