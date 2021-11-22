# Basics

Basic configuration revolves around 4 settings:

* The store to read JWTs from
* The HTTP/S configuration
* NATS \(for cases where updates are enabled\)
* Logging

For complete information, please refer to the project's [Github](https://github.com/nats-io/nats-account-server).

## Directory Configuration

You can start a server using a plain directory. In this case you'll be responsible for adding any JWT that you want resolved.

> The server looks for account JWTs by using the public key of the account as the file name followed by the extension `.jwt`. The server will not introspect the JWTs, so if you don't name the files correctly, it will fail to find them or serve a JWT that doesn't match the requested account.

```shell
mkdir /tmp/jwts
nats-account-server -dir /tmp/jwts
```
Output
```text
2019/05/10 11:33:40.501305 [INF] starting NATS Account server, version 0.0-dev
2019/05/10 11:33:40.501383 [INF] server time is Fri May 10 11:33:40 CDT 2019
2019/05/10 11:33:40.501404 [INF] creating a store at /tmp/jwts
2019/05/10 11:33:40.501430 [INF] NATS is not configured, server will not fire notifications on update
2019/05/10 11:33:40.510273 [INF] http listening on port 9090
2019/05/10 11:33:40.510283 [INF] nats-account-server is running
2019/05/10 11:33:40.510285 [INF] configure the nats-server with:
2019/05/10 11:33:40.510291 [INF]   resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

Configuration for the NATS server is the same as in the previous example:

```text
operator: /Users/synadia/.nsc/nats/Test/Test.jwt
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

A step by step tutorial using directory configuration can be found [here](dir_store.md).

## Configuration File

While the `-dir` store flag is sufficient for some very simple developer setups, any production or non-read-only server will require a configuration file.

Let's take a look at the configuration options:

### Configuration Options

| Option | Description |
| :--- | :--- |
| `http` | An `http` configuration block specifying HTTP options. |
| `logging` | A `logging` configuration block specifying server logging options. |
| `nats` | A `nats` configuration block specifying NATS connection information for the account server to push JWT changes to a NATS server. |
| `operatorjwtpath` | The path to an operator JWT. Required for non-read-only servers. Only JWTs signed by the operator \(or one of it's signing keys\) are accepted. |
| `store` | A `store` configuration block specifying store options. |
| `systemaccountjwtpath` | Path to an Account JWT that should be returned as the system account. |
| `primary` | URL for the primary, `protocol://host:port`. |
| `replicationtimeout` | Timeout, in milliseconds, used by the replica when talking to the primary, defaults to `5000`. |

### `store` Configuration

| Option | Description |
| :--- | :--- |
| `dir` | Configures a directory as a store. |
| `readonly` | If `true`, the store will not accept POST requests. Note that to receive requests, the store must also have `operatorjwtpath` specified as a root option. |
| `shard` | If `true`, JWTs will be stored in multiple sub directories of the store directory. |

## `logging` Options

| Option | Description |
| :--- | :--- |
| `time` | If `true`, a timestamp is added to log messages. |
| `debug` | If `true`, debug messages are logged. |
| `trace` | If `true`, trace messages are logged. |
| `colors` | If `true`, messages are logged using ANSI color escape sequences. |
| `pid` | If `true`, the process id for the server is added to log messages. |

## `http` Options

| Option | Description |
| :--- | :--- |
| `host` | Interface to listen for requests on. |
| `port` | Port to listen for requests on. |
| `readtimeout` | Max amount of time in milliseconds to wait for a http read operation to complete. |
| `writetimeout` | Max amount of time in milliseconds to wait for a http write operation to complete. |

## `nats` Options

| Option | Description |
| :--- | :--- |
| `servers` | List of NATS servers for the account server to use when connecting to a NATS server to publish updates. |
| `connecttimeout` | Max amount of time in milliseconds to wait for a NATS connection. |
| `reconnecttimewait` | Amount of time in milliseconds to between NATS server reconnect attempts. |
| `tls` | A `tls` configuration block. |
| `usercredentials` | A credentials _creds_ file for connecting to the NATS server. Account must be a member of a system account. |

## `tls` Options

| Option | Description |
| :--- | :--- |
| `root` | filepath to the CA certificate. |
| `cert` | filepath to the certificate. |
| `cert` | filepath to the certificate key. |

## Example Setup

Provided a setup with 4 accounts, one of them a system account, this example shows how to set up the account server by:

* adding the account server to the operator
* configuring the account server
* push the accounts to the account server
* configure a `nats-server` to make use of the account server
* test the setup

Set environment variables
```bash
export NKEYS_PATH=$(pwd)/nsc/nkeys
export NSC_HOME=$(pwd)/nsc/accounts
```

Run setup script that creates a few sample accounts and a system account
```shell
curl -sSL https://nats-io.github.io/k8s/setup/nsc-setup.sh | sh
```

List all accounts

```shell
nsc list accounts
```
Output
```text
╭─────────────────────────────────────────────────────────────────╮
│                            Accounts                             │
├──────┬──────────────────────────────────────────────────────────┤
│ Name │ Public Key                                               │
├──────┼──────────────────────────────────────────────────────────┤
│ A    │ AA6LOQIZRKEAC5FUGLMZHAXERZRQFAFQOO7YC6ZMQ325BYUAEPDUEIV5 │
│ B    │ ACPD2M7QFV33HPPY563PI7C664LXG2YVWXQBB6EAHDXZR7EK7L52AWUG │
│ STAN │ ABD4DPO745A5U2JKPWCI7LFGW4UCTN5LPUXDA5BCMXEYWLCU7J346NGU │
│ SYS  │ AB25DCM6BL5SDWYR45F65MSVOVXATN64AZXGI7IGS3IXBPWWDB4FIR2H │
╰──────┴──────────────────────────────────────────────────────────╯
```

Add the endpoint for the account server to which accounts can be published
```shell
nsc edit operator --account-jwt-server-url http://localhost:9090/jwt/v1/ --service-url nats://localhost:4222
```

Generate account server config that references the operator jwt

```shell
echo '
operatorjwtpath: "./nsc/accounts/nats/KO/KO.jwt"

http {
    port: 9090
}
' > nats-account-server.conf
```

Start the account server

```shell
nats-account-server -c nats-account-server.conf &
```

Upload the local accounts in the nsc directory structure

```shell
nsc push -A
```

Generate the NATS Server config that points to the account server
```shell
echo '
operator: "./nsc/accounts/nats/KO/KO.jwt"
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
system_account: AB25DCM6BL5SDWYR45F65MSVOVXATN64AZXGI7IGS3IXBPWWDB4FIR2H
' > nats-server.conf
```

Start the NATS Server in trusted operator mode

```shell
nats-server -c nats-server.conf &
```

Try to subscribe on account without permissions, this should fail

```shell
nats sub -creds nsc/nkeys/creds/KO/A/test.creds foo
```
Output
```text
nats: Permissions Violation for Subscription to "foo"
```

Subscribe then publish to subject should work on 'test' since enough permissions

```shell
nats sub -creds nsc/nkeys/creds/KO/A/test.creds test &
```
Published message on 'test' subject would be received by started subscriber above

```shell
nats pub -creds nsc/nkeys/creds/KO/A/test.creds test foo &
```

Subscribe using the system account user credentials can receive all system events
```shell
nats sub -creds nsc/nkeys/creds/KO/SYS/sys.creds '>'
```

