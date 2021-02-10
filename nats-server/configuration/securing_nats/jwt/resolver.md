# Account Lookup Using a Resolver

The `resolver` configuration option is used in conjunction with [NATS JWT Authentication](./) and [nsc](../../../../nats-tools/nsc/). The `resolver` option specifies a URL where the nats-server can retrieve an account JWT. There are three built-in resolver implementations:

* [`URL`](resolver.md#URL-Resolver)
* [`MEMORY`](resolver.md#Memory)
* [NATS Based Resolver](resolver.md#nats-based-resolver)

> If the operator JWT specified in `operator` contains an account resolver URL, `resolver` only needs to be specified in order to overwrite that default.

## URL Resolver

The `URL` resolver specifies a URL where the server can append an account public key to retrieve that account's JWT. Convention for [NATS Account JWT Servers](../../../../nats-tools/nas/) is to serve JWTs at: `http://localhost:9090/jwt/v1/accounts/`. For such a configuration you would specify the resolver as follows:

```yaml
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

> Note that if you are not using a nats-account-server, the URL can be anything as long as by appending the public key for an account, the requested JWT is returned.

If the server used requires client authentication, or you want to specify which CA is trusted for the lookup of account information, specify `resolver_tls`. This [`tls` configuration map](../tls.md) lets you further restrict TLS to the resolver.

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

## NATS Based Resolver

NATS based resolver embed the functionality of the [account server](https://github.com/nats-io/nats-account-server) inside the nats-server.
To not have to store all account jwt on every server, this resolver has two sub types `full` and `cache`.
Their commonalities are that they exchange/lookup account jwt via NATS and the system account and store them in a local (not shared) directory.

### Full

This resolver stores all jwt and exchanges them in an eventually consistent way with other resolver of the same type.
[`nsc`](../../../../nats-tools/nsc/README.md) supports push/pull/purge with this resolver type. 
[JWTs](../../nats-server/configuration/securing_nats/jwt/), uploaded this way, are stored in a directory the server has exclusive access to. 

```yaml
resolver: {
    type: full
    # Directory in which account jwt will be stored
    dir: './jwt'
    # In order to support jwt deletion, set to true
    # If the resolver type is full delete will rename the jwt.
    # This is to allow manual restoration in case of inadvertent deletion.
    # To restore a jwt, remove the added suffix .delete and restart or send a reload signal.
    # To free up storage you must manually delete files with the suffix .delete.
    allow_delete: false
    # Interval at which a nats-server with a nats based account resolver will compare
    # it's state with one random nats based account resolver in the cluster and if needed,
    # exchange jwt and converge on the same set of jwt.
    interval: "2m"
    # limit on the number of jwt stored, will reject new jwt once limit is hit.
    limit: 1000
}
```

This resolver type also supports `resolver_preload`. When present, JWTs are listed are stored in the resolver.
There, they may be subject to updates. Restarts of the `nats-server` will hold on to these more recent versions.

Not every server in a cluster needs to be set to `full`.
You need enough to still serve your workload adequately, while some server are offline.

### Cache

This resolver only stores a subset of [JWT](../../nats-server/configuration/securing_nats/jwt/) and evicts others based on an LRU scheme. 
Missing jwt are downloaded from `full` nats based resolver. 
This resolver is essentially the URL Resolver in nats.

```yaml
resolver: {
    type: cache
    # Directory in which account jwt will be store
    dir: "./"
    # limit on the number of jwt stored, will evict old jwt once limit is hit.
    limit: 1000
    # How long to hold on to a jwt before discarding it. 
    ttl: "2m"
}
```

### NATS Based Resolver - Integration

The NATS based resolver utilizes the system account for lookup and upload of account [JWTs](../../nats-server/configuration/securing_nats/jwt/) .
If your application requires tighter integration you can make use of these subjects for tighter integration.

To upload or update any generated account jwt without [`nsc`](../../../../nats-tools/nsc/README.md), send it as request to `$SYS.REQ.CLAIMS.UPDATE`.
Each participating `full` nats based account resolver will respond with a message detailing success or failure.

To serve a requested account [JWT](../../nats-server/configuration/securing_nats/jwt/) yourself and essentially implement an account server, subscribe to `$SYS.REQ.ACCOUNT.*.CLAIMS.LOOKUP` and respond with the account jwt corresponding to the requested account id (wildcard).
