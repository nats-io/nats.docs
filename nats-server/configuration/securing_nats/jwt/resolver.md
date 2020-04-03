# resolver

The `resolver` configuration option is used in conjunction with [NATS JWT Authentication](README.md) and [nsc](../../nats-tools/nsc/nsc). The `resolver` option specifies a URL where the nats-server can retrieve an account JWT. There are two built-in resolver implementations:

 - `URL`
 - `MEMORY`
 
> If the operator JWT specified in `operator` contains an account resolver URL, `resolver` only needs to be specified in order to overwrite that default.

## URL Resolver

The `URL` resolver specifies a URL where the server can append an account public key to retrieve that account's JWT. Convention for [NATS Account JWT Servers](../../nats-tools/nas) is to serve JWTs at: `http://localhost:9090/jwt/v1/accounts/`. For such a configuration you would specify the resolver as follows:

```yaml
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

> Note that if you are not using a nats-account-server, the URL can be anything as long as by appending the public key for an account, the requested JWT is returned.

If the server used requires client authentication, or you want to specify which CA is trusted for the lookup of account information, specify `resolver_tls`.
This [`tls` configuration map](securing_nats/tls.md) lets you further restrict TLS to the resolver.

## MEMORY

The `MEMORY` resolver is statically configured in the server's configuration file. The memory resolver makes use of the `resolver_preload` directive, which specifies a map of a public key to an account JWT:

```yaml
resolver: MEMORY
resolver_preload: {
ACSU3Q6LTLBVLGAQUONAGXJHVNWGSKKAUA7IY5TB4Z7PLEKSR5O6JTGR: eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJPRFhJSVI2Wlg1Q1AzMlFJTFczWFBENEtTSDYzUFNNSEZHUkpaT05DR1RLVVBISlRLQ0JBIiwiaWF0IjoxNTU2NjU1Njk0LCJpc3MiOiJPRFdaSjJLQVBGNzZXT1dNUENKRjZCWTRRSVBMVFVJWTRKSUJMVTRLM1lERzNHSElXQlZXQkhVWiIsIm5hbWUiOiJBIiwic3ViIjoiQUNTVTNRNkxUTEJWTEdBUVVPTkFHWEpIVk5XR1NLS0FVQTdJWTVUQjRaN1BMRUtTUjVPNkpUR1IiLCJ0eXBlIjoiYWNjb3VudCIsIm5hdHMiOnsibGltaXRzIjp7InN1YnMiOi0xLCJjb25uIjotMSwibGVhZiI6LTEsImltcG9ydHMiOi0xLCJleHBvcnRzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJ3aWxkY2FyZHMiOnRydWV9fX0._WW5C1triCh8a4jhyBxEZZP8RJ17pINS8qLzz-01o6zbz1uZfTOJGvwSTS6Yv2_849B9iUXSd-8kp1iMXHdoBA
}
```

The `MEMORY` resolver is recommended when the server has a small number of accounts that don't change very often.

For more information on how to configure a memory resolver, see [this tutorial](mem_resolver.md).
