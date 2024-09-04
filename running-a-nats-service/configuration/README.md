# Configuration

While the NATS server has many flags that allow for simple testing of features from command line. The standard way of configuring the NATS server product is through a configuration file. 
We use a simple configuration format that combines the best of traditional formats and newer styles such as JSON and YAML.

```shell
nats-server -config my-server.conf
```

The NATS configuration supports the following syntax:

- Lines can be commented with `#` and `//`
- Values can be assigned to properties with delimiters:
  - Equals sign: `foo = 2`
  - Colon: `foo: 2`
  - Whitespace: `foo 2`
- Arrays are enclosed in brackets: `["a", "b", "c"]`
- Maps are enclosed in braces: `{foo: 2}`
- Maps can be assigned with no delimiter `accounts { SYS {...}, cloud-user {...} }`  
- Semicolons can be optionally used as terminators `host: 127.0.0.1; port: 4222;`

The NATS configuration file is parsed with UTF-8 encoding. 

{% hint style="info" %}
We strongly recommend using only ASCII for names and values, limiting the use of Unicode, no ASCII text to comments.
{% endhint %}

#### Note

The NATS configuration in the file can also be rendered as a JSON object (with comments!), but to combine it with variables the variables still have to be unquoted.

{% hint style="info" %}
JSON config files should be limited machine generated configuration files
{% endhint %}

## Strings and Numbers

The configuration parser is very forgiving, as you have seen:

- values can be a primitive, or a list, or a map
- strings and numbers typically do the right thing
- numbers support units such as, 1K for 1000, 1KB for 1024

String values that start with a digit _can_ create issues. To force such values as strings, quote them.

_BAD Config_:

```text
listen: 127.0.0.1:4222
authorization: {
    # Bad - Number parsing error
    token: 3secret
}
```

Fixed Config:

```text
listen: 127.0.0.1:4222
authorization: {
    # Good
    token: "3secret"
}
```

## Variables

Server configurations can specify variables. Variables allow you to reference a value from one or more sections in the configuration.



**Variables syntax:**

* Are block-scoped
* Are referenced with a `$` prefix. Variables in quotes blocks are ignored. For example, a usage like `foo = "$VAR1"` will result in `foo` being the literal string `"$VAR1"`.
* Variables MUST be used to be recognized as such. The config parser will distinguish `unknown field` from variable by finding a reference to the variable. 
* Variable reference which are not defined will be resolved from environment variables.

**Variable resolution sequence:** 
* Look for variable in same scope
* Look for variable in parent scopes
* Look for variable in enviroment variables
* If not found stop server startup with the error below

`nats-server: variable reference for 'PORT' on line 5 can not be found`

{% hint style="warning" %}
If the environment variable value begins with a number you may have trouble resolving it depending on the server version you are running.
{% endhint %}


```text
# Define a variable in the config
TOKEN: "secret"

# Reference the variable
authorization {
    token: $TOKEN
}
```

```text
# Define a variable in the config
# But TOKEN is never used resulting in a config parsing error
TOKEN: "secret"

# Reference the variable
authorization {
    token: "another secret"
}
```
```shell
unknown field "TOKEN"
```

A similar configuration, but this time, the variable is resolved from the environment:
```shell
export TOKEN="hello"
nats-server -c /config/file
```

```text
# TOKEN is defined in the environment
authorization {
    token: $TOKEN
}
```



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

## Configuration Reloading

The config file is being read by the server on startup and is not re-scanned for changes and not locked. 

A server can reload most configuration changes without requiring a server restart or clients to disconnect by sending the nats-server a [signal](/running-a-nats-service/nats_admin/signals.md):

```shell
nats-server --signal reload
```

As of NATS v2.10.0, a reload signal can be sent on a NATS service using a system account user, where `<server-id>` is the unique ID of the server be targeted.

```shell
nats --user sys --password sys request '$SYS.REQ.SERVER.<server-id>.RELOAD' ""
```


## Configuration Properties

Config files have the following structure (in no specific order). All blocks and properties are optional (except host and port). 

Please see sections below for links to detailed explanations of each configuration block

```text
#General settings
host: 0.0.0.0
port: 4222

# Various server level options
# ...

# The following sections are maps with a set of (nested) properties

jetstream {
    # Jetstream storage location, limits and encryption
	store_dir: nats
}

tls { 
    # Configuration map for tls parameters used for client connections, 
    # routes and https monitoring connections.
}

gateway {
    # Configuration map for gateway. Gateways are used to connected clusters.
}

leafnodes {
    # Configuration map for leafnodes. LeafNodes are lightweight clusters.
}

mqtt {
    # Configuration map for mqtt. Allow clients to connect via mqtt protocol.
} 

websocket {
    # Configuration map for websocket. Allow clients to connect via websockets.
} 

accounts {
    # List of accounts and user within accounts
    # User may have an authorization and authentication section
}

authorization { 
    # User may have an authorization and authentication section
    # This section is only useful when no accounts are defined
}

mappings {
    # Subject mappings for default account
    # When accounts are defined this section must be in the account map
}

resolver {
    # Pointer to external Authentication/Authorization resolver
    # There are multiple possible resolver type explained in their own chapters of this docuemntaion
    # memory, nats-base, url ... more may be added in the future
    # This parameter can be a value `MEMORY` for simple configuration
    # or a map of properties for connecting to the resolver
}

resolver_tls {
    # TLS configuration for an URL based resolver
}

resolver_preload {
    # List of JWT tokens to be loaded at server start.
}

```

### Connectivity

| Property                                                                                           | Description                                                                                                                                                                           | Default / Example                                  |
| :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------- |
| `host`                                                                                             | Host for client connections.                                                                                                                                                          | `0.0.0.0`                                 |
| `port`                                                                                             | Port for client connections.                                                                                                                                                          | `4222`                                    |
| `listen`                                                                                           | Listen specification `<host>:<port>` for client connections. Either use this or the options `host` and/or `port`.                                                                     | `0.0.0.0:4222`  &nbsp; Inherits from `host` and `port`                    |
| `client_advertise`                                                                                 | Alternative client listen specification `<host>:<port>` or just `<host>` to advertise to clients and other server. Advertising is only active in [cluster](clustering/cluster_config.md) setups with NAT. Explicitly setting the URL is useful when the server is situated behind a load balancer and/or TLS server authentication requires the correct DNS name to be presented. To completely disable `client_advertise` please set `no_advertise: true` in the [cluster configuration](clustering/README.md) section.   | A list of all interfaces the the server is bound to. `E.g. 127.0.0.1:4222,192.168.0.13:4222` |
| [`tls`](/running-a-nats-service/configuration/securing_nats/tls.md)                                | Configuration map for [tls](securing_nats/tls.md) parameters used for client connections, routes and https monitoring connections.                                                                                                                             |                  `tls {}` &nbsp;No tls active by default. Plain text TCP/IP.                         |
| [`gateway`](/running-a-nats-service/configuration/gateways/gateway.md#gateway-configuration-block) | Configuration map for [gateway](/running-a-nats-service/configuration/gateways). Gateways are used to connected clusters into superclusters.                                                                                                     |    `gateway {}` &nbsp; None by default.                                       |
| [`leafnodes`](/running-a-nats-service/configuration/leafnodes/leafnode_conf.md)                    | Configuration map for [leafnodes](/running-a-nats-service/configuration/leafnodes). LeafNodes are lightweight clusters.                                                                                                  |                `leafnodes {}` &nbsp; None by default.                             |
| [`mqtt`](/running-a-nats-service/configuration/mqtt/mqtt_config.md)                                | Configuration map for [mqtt](/running-a-nats-service/configuration/mqtt). Allow clients to connect via mqtt protocol.                                                                                                            |       `mqtt {}` &nbsp; Not active by default.                                       |
| [`websocket`](/running-a-nats-service/configuration/websocket/websocket_conf.md)                   | Configuration map for [websocket](/running-a-nats-service/configuration/websocket).                                                                                                   |    `websocket {}` &nbsp; Not active by default.                                          |

### Clustering

| Property                                                                        | Description                                                                        | Default |
| :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- | :------ |
| [`cluster`](/running-a-nats-service/configuration/clustering/cluster_config.md) | Configuration map for [cluster](/running-a-nats-service/configuration/clustering). Nats Servers can form a cluster for load balancing and redundancy. |       `cluster {}` &nbsp; Not active by default.           |


### Subject Mappings

Note that each accounts forms its own subject namespace. Therefore the `mappings` section can appear on the server level (applying to the default account) or on the account level.

```text
host: 0.0.0.0
port:4222

mappings: {
	foo: bar
}

accounts: {
    accountA: { 
	mappings: {
	    orders.acme.*: orders.$1
	}
        users: [
            {user: admin, password: admin},
            {user: user, password: user}
           ]
    },
}
```



| Property                                                                        | Description                                                                        | Default |
| :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- | :------ |
| [`mappings`](configuring_subject_mapping.md) | Configuration map for [mapping subject](configuring_subject_mapping.md). Allows for subjects aliasing and patterns based translation. Can be used to great effect in supercluster and leafnode configuration and when sourcing streams.  |       `mappings {}` &nbsp; (none set)            |

### Connection Timeouts

| Property         | Description                                                                                                                                                                                                                                                                                                                | Default |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| `ping_interval`  | Duration at which pings are sent to clients, leaf nodes and routes. In the presence of client traffic, such as messages or client side pings, the server will not send pings. Therefore it is recommended to keep this value bigger than what [clients use](../../using-nats/developing-with-nats/connecting/pingpong.md). | `"2m"`  |
| `ping_max`       | After how many unanswered pings the server will allow before closing the connection.                                                                                                                                                                                                                                       | `2`     |
| `write_deadline` | Maximum number of seconds the server will block when writing. Once this threshold is exceeded the connection will be closed. See [_slow consumer_](/using-nats/developing-with-nats/events/slow.md) on how to deal with this on the client.                                                                                | `"10s"` |

### Limits

| Property            | Description                                                                                                                                                                                                                                                                                                                                                                                                   | Default        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------- |
| `max_connections`   | Maximum number of active client connections.                                                                                                                                                                                                                                                                                                                                                                  | `64K`          |
| `max_control_line`  | Maximum length of a protocol line \(including combined length of subject and queue group\). Increasing this value may require [client changes](/using-nats/developing-with-nats/connecting/misc.md#set-the-maximum-control-line-size) to be used. Applies to all traffic.                                                                                                                                     | `4KB`          |
| `max_payload`       | Maximum number of bytes in a message payload. Reducing this size may force you to implement [chunking](/using-nats/developing-with-nats/connecting/misc.md#get-the-maximum-payload-size) in your clients. Applies to client and leafnode payloads. It is not recommended to use values over 8MB but `max_payload` can be set up to 64MB. The max payload must be equal to or smaller than the `max_pending` value. | `1MB`          |
| `max_pending`       | Maximum number of bytes buffered for a connection. Applies to client connections. Note that applications can also set 'PendingLimits' (number of messages and total size) for their subscriptions.                                                                                                                                                                                                             | `64MB`         |
| `max_subscriptions` | Maximum numbers of subscriptions per client and leafnode accounts connection.                                                                                                                                                                                                                                                                                                                                 | `0`, unlimited |

### JetStream

You can enable JetStream in the server's configuration by simply adding a `jetstream {}` map.
By default, the JetStream subsystem will store data in the /tmp directory, but you can specify the directory to use via the `store_dir`, as well as the limits for JetStream storage (a value of 0 means no limit).

Normally JetStream will be run in clustered mode and will replicate data, so the best place to store JetStream data would be locally on a fast SSD. One should specifically avoid NAS or NFS storage for JetStream. 

{% hint style="warning" %}
Note that each JetStream enabled server MUST use its own individual storage directory.  Jetstream replicates data between cluster nodes (up to 5 replicas), achieving redundancy and availability through this.

Jetstream does not implement standby and fault tolerance through a shared file system. If a standby server shares a storage dir with an active server, you must make sure only one is active at any time. Access conflicts are not detected. We do not recommend such a setup.
{% endhint %}


Here's an example minimal file that will store data in a local "nats" directory with some limits.

`$ nats-server -c js.conf`

```text
jetstream {
  store_dir: nats

  # 1GB
  max_memory_store: 1073741824

  # 10GB
  max_file_store: 10737418240
}
```


| Property                  | Description                                                                                                                                                                               | Default                 | Version |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :------ |
| `store_dir`               | Directory to use for JetStream storage.                                                                                                                                                   | `/tmp/nats/jetstream`   | 2.2.0   |
| `max_memory_store`        | Maximum size of the 'memory' storage                                                                                                                                                      | 75% of available memory | 2.2.0   |
| `max_file_store`          | Maximum size of the 'file' storage. For units use `m mb g gb t tb`                                                                                                                                                         |  `1TB`  | 2.2.0   |
| `cipher`                  | Set to enable storage-level [encryption at rest](/running-a-nats-service/nats_admin/jetstream_admin/encryption_at_rest.md). Choose either `chachapoly` or `aes`.                          | (not set)               | 2.3.0   |
| `key`                     | The encryption key to use when encryption is enabled. A key length of at least 32 bytes is recommended. Note, this key is HMAC-256 hashed on startup which reduces the byte length to 64. | (not set)               | 2.3.0   |
| `max_outstanding_catchup` | Max in-flight bytes for stream catch-up                                                                                                                                                   | 32MB                    | 2.9.0   |
| `sync_interval`           | Examples: `10s` `1m` `always`  -   Change the default fsync/sync interval for page cache in the filestore. By default JetStream relies on stream replication in the cluster to guarantee data is available after an OS crash. If you run JetStream without replication or with a replication of just 2 you may want to shorten the fsync/sync interval. - You can force an fsync after each messsage with `always`, this will slow down the throughput to a few hundred msg/s.                                                                                                           | 2m                      | 2.10.0  |





### Authentication and Authorization

#### Centralized Authentication and Authorization

A default nats server will have no authentication or authorization enabled. This is useful for development and simple embedded use cases only. The default account is `$G`.

Once at least one user is configured in the authorization or accounts sections the default $G account an no-authentication user are disabled. You can restore no authentication access by setting the `no_auth_user`.

| Property                                                                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                     | Default                                                                                 |
| :--------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [`authorization`](/running-a-nats-service/configuration/securing_nats/auth_intro)              | Configuration map for client [authentication/authorization](securing_nats/auth_intro/README.md). List of user and their auth setting. This section is used when only the default account ($G) is active.                                                                                                                                                                                                        | `authorization {}` &nbsp;(not set)                                                      |
| [`accounts`](/running-a-nats-service/configuration/securing_nats/accounts.md)                  | Configuration map for multi tenancy via [accounts](securing_nats/accounts.md). A list of accounts each with its own users and their auth settings. Each acount forms its own subject and stream namespace, with not data shared unless explicit `import` and `export` is configured.                                                                                                                            | `accounts {}` &nbsp;(not set)                                                           |
| [`no_auth_user`](/running-a-nats-service/configuration/securing_nats/accounts.md#No-Auth-User) | [Username](/running-a-nats-service/configuration/securing_nats/auth_intro/username_password.md) present in the [authorization block](/running-a-nats-service/configuration/securing_nats/auth_intro) or an [`account`](/running-a-nats-service/configuration/securing_nats/accounts.md). A client connecting without any form of authentication will be associated with this user, its permissions and account. | (not set) - will deny unauthorized access by default if any other users are configured. |

#### Decentralized Authentication and Authorization

The Configuration options here refer to [JWT](/running-a-nats-service/configuration/securing_nats/jwt) based authentication and authorization.

| Property                                                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`operator`](/running-a-nats-service/configuration/securing_nats/jwt/README.md)                    | The Json Web Token of the [auth operator.](securing_nats/README.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [`resolver`](/running-a-nats-service/configuration/securing_nats/jwt/README.md)                    | The built-in NATS [`resolver`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#nats-based-resolver), [`MEMORY`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#memory) for static or [`URL(<url>)`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#url-resolver) to use an external account server. \(When the operator JWT contains an account URL, it will be used as default. In this case `resolver` is only needed to overwrite the default.\) |
| [`resolver_tls`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#url-resolver) | [`tls` configuration map](/running-a-nats-service/configuration/securing_nats/tls.md) for tls connections to the resolver. \(This is for an outgoing connection and therefore does not use `timeout`, `verify` and `map_and_verify`\)                                                                                                                                                                                                                                                                             |
| [`resolver_preload`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#memory)   | [Map](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#memory) to preload account public keys and their corresponding JWT. Keys consist of `<account public nkey>`, value is the `<corresponding jwt>`.                                                                                                                                                                                                                                                                                        |

### Runtime Configuration

| Property                 | Description                                                                                                                                                                                                                                                                      | Default                |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| `disable_sublist_cache`  | If `true` disable subscription caches for all accounts. This is saves resources in situations where different subjects are used all the time.                                                                                                                                    | `false`, cache enabled |
| `lame_duck_duration`     | In lame duck mode the server rejects new clients and **slowly** closes client connections. After this duration is over the server shuts down. This value cannot be set lower than 30 seconds. Start lame duck mode with: [`nats-server --signal ldm`](../nats_admin/signals.md). | `"2m"`                 |
| `lame_duck_grace_period` | This is the duration the server waits, after entering lame duck mode, before starting to close client connections                                                                                                                                                                | `"10s"`                |

### Cluster Configuration, Monitoring and Tracing

| Property                                                                          | Description                                                                                                                                                                                                              | Default                   |
| :-------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------ |
| `server_name`                                                                     | The servers name, shows up in logging. Defaults to the server's id. When JetStream is used, within a domain, all server names need to be unique.                                                                         | Generated Server ID       |
| `server_tags`                                                                     | A set of tags describing properties of the server. This will be exposed through `/varz` and can be used for system resource requests, such as placement of streams. It is recommended to use `key:value` style notation. | `[]`                      |
| `trace`                                                                           | If `true` enable protocol trace log messages. Excludes the system account.                                                                                                                                               | `false`, disabled         |
| `trace_verbose`                                                                   | If `true` enable protocol trace log messages. Includes the system account.                                                                                                                                               | `false`, disabled         |
| `debug`                                                                           | If `true` enable debug log messages                                                                                                                                                                                      | `false`, disabled         |
| `logtime`                                                                         | If set to `false`, log without timestamps                                                                                                                                                                                | `true`, include timestamp |
| `log_file`                                                                        | Log file name, relative to...                                                                                                                                                                                            | No log file               |
| [`log_size_limit`](/running-a-nats-service/configuration/logging.md#log-rotation) | Size in bytes after the log file rolls over to a new one                                                                                                                                                                 | `0`, unlimited            |
| `max_traced_msg_len`                                                              | Set a limit to the trace of the payload of a message.                                                                                                                                                                    | `0`, unlimited            |
| `syslog`                                                                          | Log to syslog.                                                                                                                                        | `false`, disabled         |
| `remote_syslog`                                                                   | [Syslog server](/running-a-nats-service/configuration/logging.md#syslog) address.                                                                                                                                        |     (not set)                      |
| [`http_port`](/running-a-nats-service/configuration/monitoring.md)                | http port for server monitoring.                                                                                                                                                                                         |      (inactive)                     |  
| [`http`](/running-a-nats-service/configuration/monitoring.md)                     | Listen specification `<host>:<port>`for server monitoring.                                                                                                                                                               |          (inactive)                    |
| [`https_port`](/running-a-nats-service/configuration/monitoring.md)               | https port for server monitoring. This is influenced by the tls property.                                                                                                                                                |           (inactive)                   |
| [`http_base_path`](/running-a-nats-service/configuration/monitoring.md)           | base path for monitoring endpoints.                                                                                                                                                                                      | `/`                       |
| [`https`](/running-a-nats-service/configuration/monitoring.md)                    | Listen specification `<host>:<port>`for TLS server monitoring.  Requires the `tls` section to be present.                                                                                                                                                         |       (inactive)                       |
| `system_account`                                                                  | Name of the system account. Users of this account can subscribe to system events. See [System Accounts](/running-a-nats-service/configuration/sys_accounts/README.md#system-account) for more details.                   |           `$SYS`                |
| `pid_file`                                                                        | File containing PID, relative to ... This can serve as input to [nats-server --signal](/running-a-nats-service/nats_admin/signals.md)                                                                                    |        (non set)                   |
| `port_file_dir`                                                                   | Directory to write a file containing the servers open ports to, relative to ...                                                                                                                                          |       (not set)                    |
| `connect_error_reports`                                                           | Number of attempts at which a repeated failed route, gateway or leaf node connection is reported. Connect attempts are made once every second.                                                                           | `3600`, approx every hour |
| `reconnect_error_reports`                                                         | Number of failed attempts to reconnect a route, gateway or leaf node connection. Default is to report every attempt.                                                                                                      | `1`, every failed attempt |

