# auth_callout

/ [Config](../../README.md) / [authorization](../README.md) 

Enables the auth callout functionality.
All client connections requiring authentication will have
their credentials pass-through to a dedicated auth service.

## Properties

### [`issuer`](issuer/README.md)

An account public NKey.

### [`account`](account/README.md)

The name or public NKey of an account of the users which will
be used by the authorization service to connect to the server.

Default value: `$G`

### [`users`](users/README.md)

The names or public NKeys of users within the defined account
that will be used by the the auth service itself and thus bypass
auth callout.

### [`key`](key/README.md)

A public XKey that will encrypt server requests to the auth
service.

