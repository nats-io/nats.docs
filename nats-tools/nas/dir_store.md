# Directory Store

## NATS Account Server Configuration

```text
OperatorJWTPath: "/users/synadia/.nsc/nats/AAA/AAA.jwt",
http {
    port: 9090
},
store {
    dir: "/tmp/as_store",
    readonly: false,
    shard: true
}
```

The server configuration specifies the `OperatorJWTPath` which is used to validate accounts submitted to the server. If an account is not signed by the specified operator, the update is rejected.

Starting the server:

```text
> nats-account-server -c nas.conf
2019/05/31 12:35:23.430128 [INF] loading configuration from "/Users/synadia/Desktop/nats_jwt_doc/as_dir/nas.conf"
2019/05/31 12:35:23.430417 [INF] starting NATS Account server, version 0.0-dev
2019/05/31 12:35:23.430434 [INF] server time is Fri May 31 12:35:23 CDT 2019
2019/05/31 12:35:23.430462 [INF] loading operator from /users/synadia/.nsc/nats/AAA/AAA.jwt
2019/05/31 12:35:23.430919 [INF] creating a store at /tmp/as_store
2019/05/31 12:35:23.430948 [INF] NATS is not configured, server will not fire notifications on update
2019/05/31 12:35:23.437938 [INF] http listening on port 9090
2019/05/31 12:35:23.437953 [INF] nats-account-server is running
2019/05/31 12:35:23.437956 [INF] configure the nats-server with:
2019/05/31 12:35:23.437966 [INF]   resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

On a new store, the server doesn't have any JWTs. This means that any nats-server that attempts to resolve accounts will fail. To add JWTs to the server, you can use a tool like [`curl` to post request](dir_store.md#add/using-curl-to-add-or-update-accounts). But it is much easier if you use `nsc` to update the nats-account-server.

## Using NSC to Add or Update Accounts

The `nsc` tool has built-in facilities to `push` JWTs related to an operator. The tool also performs validation of your JWTs to ensure that you push JWTs that will validate correctly.

If your operator doesn't have any entities, now it is a good time to add some:

```text
> nsc add account -n A
Generated account key - private key stored "~/.nkeys/AAA/accounts/A/A.nk"
Success! - added account "A"

> nsc add user -n u1
Generated user key - private key stored "~/.nkeys/AAA/accounts/A/users/u1.nk"
Generated user creds file "~/.nkeys/AAA/accounts/A/users/u1.creds"
Success! - added user "u1" to "A"

> nsc add user -n u2
Generated user key - private key stored "~/.nkeys/AAA/accounts/A/users/u2.nk"
Generated user creds file "~/.nkeys/AAA/accounts/A/users/u2.creds"
Success! - added user "u2" to "A"

> nsc add account -n B
Generated account key - private key stored "~/.nkeys/AAA/accounts/B/B.nk"
Success! - added account "B"
```

With the account and a couple of users in place, let's push all the accounts to the nats-account-server. If the account JWT server URL is not set on the operator, you may want to set it. Note that account servers typically require the path `/jwt/v1` in addition to the protocol and hostport \(or you can specify the `--account-jwt-server-url` flag to nsc's `push` command\).

```text
❯ nsc edit operator --account-jwt-server-url http://localhost:9090/jwt/v1

[ OK ] set account jwt server url to "http://localhost:9090/jwt/v1"
[ OK ] edited operator "AAA"
```

Going forward all interactions on behalf of the operator will use this account server. Now we can push all accounts.

```text
nsc push -A
successfully pushed all accounts [A,B]
```

Note that if the account server is not configured on the operator or there is a need to override temporarily, the `-u` option is availble on the `nsc push` command.

```text
> nsc push -u http://localhost:9090/jwt/v1/ -A
successfully pushed all accounts [A,B]
```

Quick checking of the store directory, shows that the JWTs have been sharded by their public keys:

```text
> tree as_store
as_store
├── 27
│   └── ACVEO3LPVRGE5W262FCYF3OMGQFJIW252AX75FEE6BUY752BFVDADN27.jwt
└── TY
    └── ADDVBX4VPWSNEDLWH5Y6ITASMXS3QY3L6KRNZ6VIQJ6Q3FRGR43NFHTY.jwt
```

Quick check on nsc to verify the ids of the accounts on nsc, match the files:

```text
> nsc list accounts -W
╭─────────────────────────────────────────────────────────────────╮
│                            Accounts                             │
├──────┬──────────────────────────────────────────────────────────┤
│ Name │ Public Key                                               │
├──────┼──────────────────────────────────────────────────────────┤
│ A    │ ACVEO3LPVRGE5W262FCYF3OMGQFJIW252AX75FEE6BUY752BFVDADN27 │
│ B    │ ADDVBX4VPWSNEDLWH5Y6ITASMXS3QY3L6KRNZ6VIQJ6Q3FRGR43NFHTY │
╰──────┴──────────────────────────────────────────────────────────╯
```

## Using Curl to Add or Update Accounts

```text
> curl -i -X POST localhost:9090/jwt/v1/accounts/AC7PO3MREV26U3LFZFP5BN3HAI32X3PKLBRVMPAETLEHWPQEUG7EJY4H --data-binary @/Users/synadia/.nsc/nats/Test/accounts/TestAccount/TestAccount.jwt -H "Content-Type: text/text"
```

Note that the `@` before the file name is required for `curl` to read the specified file, and use it as the payload. Otherwise, it will simply post the path specified, which will result in an update error.

Curl can also be used to [inspect](inspecting_jwts.md) JWTs.

