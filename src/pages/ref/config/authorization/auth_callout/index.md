# auth_callout

Enables the auth callout functionality.
All client connections requiring authentication will have
their credentials pass-through to a dedicated auth service.

*Reloadable*: Yes

*Types*

- `object`


## Properties

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [issuer](/ref/config/authorization/auth_callout/issuer) | An account public NKey. | `-` | Yes |
| [account](/ref/config/authorization/auth_callout/account) | The name or public NKey of an account of the users which will be used by the authorization service to connect to the server. | ``$G`` | Yes |
| [users](/ref/config/authorization/auth_callout/users) | The names or public NKeys of users within the defined account that will be used by the the auth service itself and thus bypass auth callout. | `-` | Yes |
| [key](/ref/config/authorization/auth_callout/key) | A public XKey that will encrypt server requests to the auth service. | `-` | Yes |
