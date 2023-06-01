# auth_callout

/ [Config](../../index.md) / [authorization](../index.md) 

Enables the auth callout functionality.
All client connections requiring authentication will have
their credentials pass-through to a dedicated auth service.

## Properties

### [`issuer`](issuer/index.md)

An account public NKey.

### [`account`](account/index.md)

The name or public NKey of an account of the users which will
be used by the authorization service to connect to the server.

Default value: `$G`

### [`users`](users/index.md)

The names or public NKeys of users within the defined account
that will be used by the the auth service itself and thus bypass
auth callout.

### [`key`](key/index.md)

A public XKey that will encrypt server requests to the auth
service.

