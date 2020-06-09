# Configuration

While the NATS server has many flags that allow for simple testing of features, the NATS server products provide a flexible configuration format that combines the best of traditional formats and newer styles such as JSON and YAML.

The NATS configuration file supports the following syntax:

* Lines can be commented with `#` and `//`
* Values can be assigned to properties with:
  * Equals sign: `foo = 2`
  * Colon: `foo: 2`
  * Whitespace: `foo 2`
* Arrays are enclosed in brackets: `["a", "b", "c"]`
* Maps are enclosed in braces: `{foo: 2}`
* Maps can be assigned with no key separator
* Semicolons can be used as terminators

## Strings and Numbers

The configuration parser is very forgiving, as you have seen:

* values can be a primitive, or a list, or a map
* strings and numbers typically do the right thing
* numbers support units such as, 1K for 1000, 1Kb for 1024

String values that start with a digit _can_ create issues. To force such values as strings, quote them.

_BAD Config_:

```text
listen: 127.0.0.1:4222
authorization: {
    # BAD!
    token: 3secret
}
```

Fixed Config:

```text
listen: 127.0.0.1:4222
authorization: {
    token: "3secret"
}
```

## Variables

Server configurations can specify variables. Variables allow you to reference a value from one or more sections in the configuration.

Variables:

* Are block-scoped
* Are referenced with a `$` prefix.
* Can be resolved from environment variables having the same name

> If the environment variable value begins with a number you may have trouble resolving it depending on the server version you are running.

```text
# Define a variable in the config
TOKEN: "secret"

# Reference the variable
authorization {
    token: $TOKEN
}
```

A similar configuration, but this time, the value is in the environment:

```text
# TOKEN is defined in the environment
authorization {
    token: $TOKEN
}
```

export TOKEN="hello"; nats-server -c /config/file

## Include Directive

The `include` directive allows you to split a server configuration into several files. This is useful for separating configuration into chunks that you can easily reuse between different servers.

Includes _must_ use relative paths, and are relative to the main configuration \(the one specified via the `-c` option\):

server.conf:

```text
listen: 127.0.0.1:4222
include ./auth.conf
```

> Note that `include` is not followed by `=` or `:`, as it is a _directive_.

auth.conf:

```text
authorization: {
    token: "f0oBar"
}
```

```text
> nats-server -c server.conf
```

## Configuration Properties

### Connectivity

| Property | Description | Default |
| :--- | :--- | :--- |
| `host` | Host for client connections. | `0.0.0.0` |
| `port` | Port for client connections. | `4222` |
| `listen` | Listen specification `<host>:<port>` for client connections. Either use this or the options `host` and/or `port`. | same as `host`, `port` |
| `client_advertise` | Alternative client listen specification `<host>:<port>` or just `<host>` to advertise to clients and other server. Useful in [cluster](clustering/cluster_config.md) setups with NAT. | Advertise what `host` and `port` specify. |
| [`tls`](securing_nats/tls.md) | Configuration map for tls for client and http monitoring. |  |
| [`cluster`](clustering/cluster_config.md) | Configuration map for [cluster](clustering/). |  |
| [`gateway`](gateways/gateway.md#gateway-configuration-block) | Configuration map for [gateway](gateways/). |  |
| [`leafnode`](leafnodes/leafnode_conf.md) | Configuration map for a [leafnode](leafnodes/). |  |

### Connection Timeouts

| Property | Description | Default |
| :--- | :--- | :--- |
| `ping_interval` | Duration at which pings are sent to clients, leaf nodes and routes. In the presence of client traffic, such as messages or client side pings, the server will not send pings. Therefore it is recommended to keep this value bigger than what [clients use](../../developing-with-nats/connecting/pingpong.md). | `"2m"` |
| `ping_max` | After how many unanswered pings the server will allow before closing the connection. | `2` |
| `write_deadline` | Maximum number of seconds the server will block when writing. Once this threshold is exceeded the connection will be closed. See [_slow consumer_](../../developing-with-nats/events/slow.md) on how to deal with this on the client. | `"2s"` |

### Limits

| Property | Description | Default |
| :--- | :--- | :--- |
| `max_connections` | Maximum number of active client connections. | `64K` |
| `max_control_line` | Maximum length of a protocol line \(including combined length of subject and queue group\). Increasing this value may require [client changes](../../developing-with-nats/connecting/misc.md#set-the-maximum-control-line-size) to be used. Applies to all traffic. | `4Kb` |
| `max_payload` | Maximum number of bytes in a message payload. Reducing this size may force you to implement [chunking](../../developing-with-nats/connecting/misc.md#get-the-maximum-payload-size) in your clients. Applies to client and leafnode payloads. | `1Mb` |
| `max_pending` | Maximum number of bytes buffered for a connection Applies to client connections. | `64Mb` |
| `max_subscriptions` | Maximum numbers of subscriptions per client and leafnode accounts connection. | `0`, unlimited |

### Authentication and Authorization

#### Centralized Authentication and Authorization

| Property | Description |
| :--- | :--- |
| [`authorization`](securing_nats/auth_intro/) | Configuration map for client authentication/authorization. |
| [`accounts`](securing_nats/accounts.md) | Configuration map for multi tenancy via accounts. |
| [`no_auth_user`](securing_nats/accounts.md#No-Auth-User) | [Username](securing_nats/auth_intro/username_password.md) present in the [authorization block](securing_nats/auth_intro/) or an [`account`](securing_nats/accounts.md). A client connecting without any form of authentication will be associated with this user, its permissions and account. |

#### Decentralized Authentication and Authorization

The Configuration options here refer to [JWT](securing_nats/jwt/) based authentication and authorization.

| Property | Description |
| :--- | :--- |
| [`operator`](securing_nats/jwt/#decentralized-authentication-and-authorization-configuration) | Path to an operator JWT. |
| [`resolver`](securing_nats/jwt/#decentralized-authentication-and-authorization-configuration) | Resolver type [`MEMORY`](securing_nats/jwt/resolver.md#memory) or [`URL(<url>)`](securing_nats/jwt/resolver.md#url-resolver) for account JWTs. \(When the operator JWT contains an account URL, it will be used as default. In this case `resolver` is only needed to overwrite the default.\) |
| [`resolver_tls`](securing_nats/jwt/resolver.md#url-resolver) | [`tls` configuration map](securing_nats/tls.md) for tls connections to the resolver. \(This is for an outgoing connection and therefore does not use `timeout`, `verify` and `map_and_verify`\) |
| [`resolver_preload`](securing_nats/jwt/resolver.md#memory) | [Map](securing_nats/jwt/resolver.md#memory) to preload account public keys and their corresponding JWT. Keys consist of `<account public nkey>`, value is the `<corresponding jwt>`. Only used when `resolver=MEMORY`. |

### Runtime Configuration

| Property | Description | Default |
| :--- | :--- | :--- |
| `disable_sublist_cache` | If `true` disable subscription caches for all accounts. This is saves resources in situations where different subjects are used all the time. | `false`, cache enabled |
| `lame_duck_duration` | In lame duck mode the server rejects new clients and **slowly** closes client connections. After this duration is over the server shuts down. Start lame duck mode with: [`nats-server --signal ldm`](../nats_admin/signals.md). | `"2m"` |

### Monitoring and Tracing

| Property | Description | Default |
| :--- | :--- | :--- |
| `server_name` | The servers name, shows up in logging. Defaults to the server's id. | Generated Server ID |
| `trace` | If `true` enable protocol trace log messages. Excludes the system account. | `false`, disabled |
| `trace_verbose` | If `true` enable protocol trace log messages. Includes the system account. | `false`, disabled |
| `debug` | If `true` enable debug log messages | `false`, disabled |
| `logtime` | If set to `false`, log without timestamps | `true`, include timestamp |
| `log_file` | Log file name, relative to... | No log file |
| [`log_size_limit`](logging.md#log-rotation) | Size in bytes after the log file rolls over to a new one | `0`, unlimited |
| `max_traced_msg_len` | Set a limit to the trace of the payload of a message. | `0`, unlimited |
| `syslog` | Log to syslog. | `false`, disabled |
| `remote_syslog` | [Syslog server](logging.md#syslog) address. |  |
| [`http_port`](monitoring.md) | http port for server monitoring. |  |
| [`http`](monitoring.md) | Listen specification `<host>:<port>`for server monitoring. |  |
| [`https_port`](monitoring.md) | https port for server monitoring. This is influenced by the tls property. |  |
| [`https`](monitoring.md) | Listen specification `<host>:<port>`for TLS server monitoring. |  |
| `system_account` | Name of the system account. Users of this account can subscribe to system events. See [System Accounts](sys_accounts/) for more details. |  |
| `pid_file` | File containing PID, relative to ... This can serve as input to [nats-server --signal](../nats_admin/signals.md) |  |
| `port_file_dir` | Directory to write a file containing the servers open ports to, relative to ... |  |
| `connect_error_reports` | Number of attempts at which a repeated failed route, gateway or leaf node connection is reported. Connect attempts are made once every second. | `3600`, approx every hour |
| `reconnect_error_reports` | Number of failed attempt to reconnect a route, gateway or leaf node connection. Default is to report every attempt. | `1`, every failed attempt |

## Configuration Reloading

A server can reload most configuration changes without requiring a server restart or clients to disconnect by sending the nats-server a [signal](../nats_admin/signals.md):

```text
> nats-server --signal reload
```

