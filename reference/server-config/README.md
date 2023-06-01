# Server Config

## Properties

### Connectivity

#### [`host`](host/README.md)

Host for client connections.

Default value: `0.0.0.0`

#### [`port`](port/README.md)

Port for client connections. Use `-1` for a
random available port.

Default value: `4222`

#### [`listen`](listen/README.md)

`<host>:<port>` for a client connections.

#### [`client_advertise`](client_advertise/README.md)

Advertised client `<host>:<port>`. Useful for cluster setups
behind a NAT.

#### [`tls`](tls/README.md)

TLS configuration for client and HTTP monitoring.

#### [`allow_non_tls`](allow_non_tls/README.md)

Allow mixed TLS and non-TLS on the same port.

#### [`ocsp`](ocsp/README.md)



#### [`mqtt`](mqtt/README.md)

Configuration for enabling the MQTT interface.

#### [`websocket`](websocket/README.md)

Configuration for enabling the WebSocket interface.

### Centralized Auth

#### [`authorization`](authorization/README.md)

Static single or multi-user declaration.

#### [`accounts`](accounts/README.md)

Static set of accounts.

#### [`no_auth_user`](no_auth_user/README.md)

Name of the user that non-authenticated clients
will inherit the authorization controls of. This must be a user
defined in either the `authorization` or `accounts` block.

### Decentralized Auth

#### [`operator`](operator/README.md)

One or more operator JWTs, either in files or inlined.

#### [`trusted_keys`](trusted_keys/README.md)

One or more operator public keys to trust.

#### [`resolver`](resolver/README.md)

Takes takes precedence over the value obtained from
the `operator` if defined.

#### [`resolver_tls`](resolver_tls/README.md)



#### [`resolver_preload`](resolver_preload/README.md)

Map of account public key to the account JWT.

#### [`resolver_pinned_accounts`](resolver_pinned_accounts/README.md)



#### [`system_account`](system_account/README.md)

Name or public key of the account that will be deemed the
*system* account.

Default value: `$SYS`

#### [`no_system_account`](no_system_account/README.md)



### Clustering

#### [`cluster`](cluster/README.md)

Configuration for clustering a set of servers.

#### [`gateway`](gateway/README.md)

Configuration for setting up gateway connections
between clusters.

### Leafnodes

#### [`leafnodes`](leafnodes/README.md)

Configuration for setting up leaf node connections.

### JetStream

#### [`jetstream`](jetstream/README.md)



### Subject Mapping

#### [`mappings`](mappings/README.md)



### Logging

#### [`debug`](debug/README.md)

If true, enables debug log messages.

Default value: `false`

#### [`trace`](trace/README.md)

If true, enables protocol trace log messages,
excluding the system account.

Default value: `false`

#### [`trace_verbose`](trace_verbose/README.md)

If true, enables protocol trace log messages,
including the system account.

Default value: `false`

#### [`logtime`](logtime/README.md)

If false, log without timestamps.

Default value: `true`

#### [`logtime_utc`](logtime_utc/README.md)

If true, log timestamps with be in UTC rather than the local timezone.

Default value: `false`

#### [`logfile`](logfile/README.md)

Log file name.

#### [`logfile_size_limit`](logfile_size_limit/README.md)

Size in bytes after the log file rolls over to a new one.

Default value: `0`

#### [`syslog`](syslog/README.md)

Log to syslog.

Default value: `false`

#### [`remote_syslog`](remote_syslog/README.md)

Remote syslog address.

### Monitoring and Tracing

#### [`server_name`](server_name/README.md)

The servers name, shows up in logging. Defaults to the generated
server ID. When JetStream is used, within a domain, all server
names need to be unique.

#### [`server_tags`](server_tags/README.md)

One or more tags associated with the server. This is currently
used for placement of JetStream streams and consumers.

#### [`http`](http/README.md)

Listen specification `<host>:<port>` for server monitoring.

#### [`https`](https/README.md)

Listen specification `<host>:<port>` for TLS server monitoring.

#### [`http_port`](http_port/README.md)

HTTP port for server monitoring.

#### [`https_port`](https_port/README.md)

HTTPS port for server monitoring.

#### [`http_base_path`](http_base_path/README.md)

Base path for monitoring endpoints.

#### [`connect_error_reports`](connect_error_reports/README.md)

Number of attempts at which a repeated failed route, gateway
or leaf node connection is reported. Connect attempts are made
once every second.

Default value: `3600`

#### [`reconnect_error_reports`](reconnect_error_reports/README.md)

Number of failed attempt to reconnect a route, gateway or
leaf node connection. Default is to report every attempt.

Default value: `1`

#### [`max_traced_msg_len`](max_traced_msg_len/README.md)

Set a limit to the trace of the payload of a message.

Default value: `0`

### Runtime Configuration

#### [`max_control_line`](max_control_line/README.md)

Maximum length of a protocol line (including combined length of subject and queue group). Increasing this value may require client changes to be used. Applies to all traffic.

Default value: `4KB`

#### [`max_connections`](max_connections/README.md)

Maximum number of active client connections.

Default value: `64K`

#### [`max_payload`](max_payload/README.md)

Maximum number of bytes in a message payload. Reducing this size may force you to implement chunking in your clients. Applies to client and leafnode payloads. It is not recommended to use values over 8MB but `max_payload` can be set up to 64MB. The max payload must be equal or smaller to the `max_pending` value.

Default value: `1MB`

#### [`max_pending`](max_pending/README.md)

Maximum number of bytes buffered for a connection Applies to client connections. Note that applications can also set `PendingLimits` (number of messages and total size) for their subscriptions.

Default value: `64MB`

#### [`max_subscriptions`](max_subscriptions/README.md)

Maximum numbers of subscriptions per client and leafnode accounts connection. A value of `0` means unlimited.

Default value: `0`

#### [`max_subscription_tokens`](max_subscription_tokens/README.md)



#### [`ping_interval`](ping_interval/README.md)

Duration at which pings are sent to clients, leaf nodes and routes.
In the presence of client traffic, such as messages or client side
pings, the server will not send pings. Therefore it is recommended
to keep this value bigger than what clients use.

Default value: `2m`

#### [`ping_max`](ping_max/README.md)

After how many unanswered pings the server will allow before closing
the connection.

Default value: `2`

#### [`write_deadline`](write_deadline/README.md)

Maximum number of seconds the server will block when writing. Once
this threshold is exceeded the connection will be closed. See slow
consumer on how to deal with this on the client.

Default value: `10s`

#### [`no_header_support`](no_header_support/README.md)

Disables support for message headers.

#### [`disable_sublist_cache`](disable_sublist_cache/README.md)

If true, disable subscription caches for all accounts. This saves
resources in situations where different subjects are used
all the time.

Default value: `false`

#### [`lame_duck_duration`](lame_duck_duration/README.md)

Must be at least 30s.

Default value: `2m`

#### [`lame_duck_grace_period`](lame_duck_grace_period/README.md)

This is the duration the server waits, after entering
lame duck mode, before starting to close client connections

Default value: `10s`

#### [`pidfile`](pidfile/README.md)



#### [`ports_file_dir`](ports_file_dir/README.md)



#### [`prof_port`](prof_port/README.md)



#### [`default_js_domain`](default_js_domain/README.md)

Account to domain name mapping.

