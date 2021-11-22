# Update Notifications

The `nats-account-server` can notify a nats-server about [JWT](../../nats-server/configuration/securing_nats/jwt/) updates, enabling the NATS server to update itself to the newly updated JWT.

To push notifications, the nats-account-server makes use of [system accounts](../../nats-server/configuration/sys_accounts/).

Here's a nats-account-server configuration with updates enabled:

```text
operatorjwtpath: "/users/synadia/.nsc/nats/AAA/AAA.jwt",
systemaccountjwtpath: "/users/synadia/.nsc/nats/AAA/accounts/SYS/SYS.jwt"
http {
    port: 9090
},
store {
    dir: "/tmp/as_store",
    readonly: false,
    shard: true
}
nats {
  servers: [nats://localhost:4222]
  usercredentials: "/Users/synadia/.nkeys/AAA/accounts/SYS/users/sys.creds"
}
```

The above configuration:

* Sets the `operatorjwtpath` to verify pushed JWTs are signed by the operator
* Sets the `systemaccountjwtpath` so that the `nats-server` can ask for the system account \(which the nats-account-server will trigger when it connects to the nats-server\)

The `nats` section:

* Sets the `servers` with a list of NATS urls
* Sets `usercredentials` to the credentials file for the system account user that issues notifications.

When the account server starts:

* It makes a connection to the NATS server using the `usercredentials` of the system account.

The NATS server configuration looks like:

```text
operator: /users/synadia/.nsc/nats/AAA/AAA.jwt
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
system_account: AAUR7CJU5WTR2RROXOJJFTJFJQPZ6B4VF2NOX6OQ6SQMPIKLQYQ7T37U
```

It specifies:

* The `operator` JWT
* The `resolver` URL where the nats-account-server will create requests. Note the nats-account-server log prints the exact value you should provide for this setting:

```text
...
2019/05/31 16:47:50.519361 [INF] configure the nats-server with:
2019/05/31 16:47:50.519368 [INF]   resolver: URL(http://localhost:9090/jwt/v1/accounts/)
...
```

The nats-account-server has to be running before that nats-server starts, as currently, the nats-server will verify that it can connect to the resolver on startup.

```shell
nats-account-server -c nas_not.conf
```
Output
```text
2019/05/31 18:00:26.327583 [INF] loading configuration from "/Users/synadia/Desktop/nats_jwt_doc/as_dir/nas_not.conf"
2019/05/31 18:00:26.327833 [INF] starting NATS Account server, version 0.0-dev
2019/05/31 18:00:26.327852 [INF] server time is Fri May 31 18:00:26 CDT 2019
2019/05/31 18:00:26.327862 [INF] loading operator from /users/synadia/.nsc/nats/AAA/AAA.jwt
2019/05/31 18:00:26.328278 [INF] loading system account from /users/synadia/.nsc/nats/AAA/accounts/SYS/SYS.jwt
2019/05/31 18:00:26.328590 [INF] creating a store at /tmp/as_store
2019/05/31 18:00:26.328619 [INF] connecting to NATS for notifications
2019/05/31 18:00:26.329875 [ERR] failed to connect to NATS, nats: no servers available for connection
2019/05/31 18:00:26.329884 [ERR] will try to connect again in 1000 milliseconds
2019/05/31 18:00:26.330541 [INF] http listening on port 9090
2019/05/31 18:00:26.330548 [INF] nats-account-server is running
2019/05/31 18:00:26.330551 [INF] configure the nats-server with:
2019/05/31 18:00:26.330557 [INF]   resolver: URL(http://localhost:9090/jwt/v1/accounts/)
2019/05/31 18:00:27.330103 [INF] connecting to NATS for notifications
2019/05/31 18:00:27.331215 [ERR] failed to connect to NATS, nats: no servers available for connection
2019/05/31 18:00:27.331223 [ERR] will try to connect again in 1000 milliseconds
```

Then start the NATS server:

```shell
nats-server -c /tmp/server.conf
```
Output
```text
[57440] 2019/05/31 18:01:29.940149 [INF] Starting nats-server version 1.4.1
[57440] 2019/05/31 18:01:29.940234 [INF] Git commit [not set]
[57440] 2019/05/31 18:01:29.940468 [INF] Listening for client connections on 0.0.0.0:4222
[57440] 2019/05/31 18:01:29.940476 [INF] Server is ready
```

At this point, you have both servers running. You can submit updates to the nats-account-server using `nsc`:

```shell
nsc push -A
```
Output
```text
successfully pushed all accounts [A, B, SYS]
```

The account server should show the updates in its log:

```text
2019/05/31 18:02:29.702044 [INF] updated JWT for account - ACVEO3LPVRGE - GSO7ZQPXXNTBBEEGXFFLFXZLCGOA5ABUOADZBPASYGCDIEJ6QQPQ
2019/05/31 18:02:29.702988 [INF] updated JWT for account - ADDVBX4VPWSN - VPBI4OHVJ7ITKX6S2RWHHJ3BB6JFZ7NPJN33JH6L752T2YI2QJKA
2019/05/31 18:02:29.703745 [INF] updated JWT for account - AAUR7CJU5WTR - NHEPTVMURCQEURAWHX6LUUMO4KCQUAP4JCLIQANP3JTNPMG3IFWQ
```

