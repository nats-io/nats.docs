# Flags

The NATS server has many flags to customize its behavior without having to write a configuration file.

The configuration flags revolve around:

* Server Options
* Logging
* Authorization
* TLS Security
* Clustering
* Information

## Server Options

| Flag                  | Description                                                                            |
| --------------------- | -------------------------------------------------------------------------------------- |
| `-a`, `--addr`        | Host address to bind to (default: `0.0.0.0` - all interfaces).                         |
| `-p`, `--port`        | NATS client port (default: 4222).                                                      |
| `-P`, `--pid`         | File to store the process ID (PID).                                                    |
| `-m`, `--http_port`   | HTTP port for monitoring dashboard (exclusive of `--https_port`).                      |
| `-ms`, `--https_port` | HTTPS port monitoring for monitoring dashboard (exclusive of `--http_port`).           |
| `-c`, `--config`      | Path to NATS server configuration file.                                                |
| `-sl`, `--signal`     | Send a signal to nats-server process. See [process signaling](../nats_admin/signals.md). |
| `--client_advertise`  | Client HostPort to advertise to other servers.                                         |
| `-t`                  | Test configuration and exit                                                            |

## JetStream Options

| Flag                 | Description                     |
| -------------------- | ------------------------------- |
| `-js`, `--jetstream` | Enable JetStream functionality. |
| `-sd`, `--store_dir` | Set the storage directory.      |

## Authentication Options

The following options control straightforward authentication:

| Flag     | Description                                                                              |
| -------- | ---------------------------------------------------------------------------------------- |
| `--user` | Required _username_ for connections (exclusive of `--token`).                            |
| `--pass` | Required _password_ for connections (exclusive of `--token`).                            |
| `--auth` | Required _authorization token_ for connections (exclusive of `--user` and `--password`). |

See [token authentication](../configuration/securing_nats/auth_intro/tokens.md), and [username/password](../configuration/securing_nats/auth_intro/username_password.md) for more information.

## Logging Options

The following flags are available on the server to configure logging:

| Flag                    | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| `-l`, `--log`           | File to redirect log output                                   |
| `-T`, `--logtime`       | Specify `-T=false` to disable timestamping log entries        |
| `-s`, `--syslog`        | Log to syslog or windows event log                            |
| `-r`, `--remote_syslog` | The syslog server address, like `udp://localhost:514`         |
| `-D`, `--debug`         | Enable debugging output                                       |
| `-V`, `--trace`         | Enable protocol trace log messages                            |
| `-VV`                   | Verbose trace (traces system account as well)                 |
| `-DV`                   | Enable both debug and protocol trace messages                 |
| `-DVV`                  | Debug and verbose trace (traces system account as well)       |
| `--max_traced_msg_len`  | Maximum printable length for traced messages. 0 for unlimited |

You can read more about [logging configuration here](../configuration/logging.md).

## TLS Options

| Flag          | Description                                |
| ------------- | ------------------------------------------ |
| `--tls`       | Enable TLS, do not verify clients          |
| `--tlscert`   | Server certificate file                    |
| `--tlskey`    | Private key for server certificate         |
| `--tlsverify` | Enable client TLS certificate verification |
| `--tlscacert` | Client certificate CA for verification     |

You can read more about [tls configuration here](/running-a-nats-service/configuration/securing_nats/tls.md).

## Cluster Options

The following flags are available on the server to configure clustering:

| Flag                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `--routes`            | Comma-separated list of cluster URLs to solicit and connect |
| `--cluster`           | Cluster URL for clustering requests                         |
| `--no_advertise`      | Do not advertise known cluster information to clients       |
| `--cluster_advertise` | Cluster URL to advertise to other servers                   |
| `--connect_retries`   | For implicit routes, number of connect retries              |

You can read more about [clustering configuration here](/running-a-nats-service/configuration/clustering/README.md).

## Common Options

| Flag              | Description       |
| ----------------- | ----------------- |
| `-h`, `--help`    | Show this message |
| `-v`, `--version` | Show version      |
| `--help_tls`      | TLS help          |
