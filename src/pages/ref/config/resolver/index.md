# resolver

Takes takes precedence over the value obtained from
the `operator` if defined.

If a string value is used, it must be `MEMORY` or `URL(<url>)`
where where `url` is an HTTP endpoint pointing to the [NATS account
resolver](https://docs.nats.io/legacy/nas).

Note: the NATS account resolver is deprecated and the built-in
NATS-based resolver should be used.

*Aliases*

- `account_resolver`
- `account_resolvers`


*Reloadable*: Yes. Note, enabling or disabling a resolver requires full server restart.

*Types*

- `string`
- `resolver`


