# Config

## Properties

**Connectivity**

### [`host`](/ref/config/host/index.md)

Host for client connections.

Default value: `0.0.0.0`

### [`port`](/ref/config/port/index.md)

Port for client connections. Use `-1` for a
random available port.

Default value: `4222`

### [`listen`](/ref/config/listen/index.md)

`<host>:<port>` for a client connections.

### [`client_advertise`](/ref/config/client_advertise/index.md)

Advertised client `<host>:<port>`. Useful for cluster setups
behind a NAT.

### [`tls`](/ref/config/tls/index.md)

TLS configuration for client and HTTP monitoring.

### [`allow_non_tls`](/ref/config/allow_non_tls/index.md)

Allow mixed TLS and non-TLS on the same port.

### [`ocsp`](/ref/config/ocsp/index.md)

### [`mqtt`](/ref/config/mqtt/index.md)

Configuration for enabling the MQTT interface.

### [`websocket`](/ref/config/websocket/index.md)

Configuration for enabling the WebSocket interface.

**Centralized Auth**

### [`authorization`](/ref/config/authorization/index.md)

Static single or multi-user declaration.

### [`accounts`](/ref/config/accounts/index.md)

Static set of accounts.

### [`no_auth_user`](/ref/config/no_auth_user/index.md)

Name of the user that non-authenticated clients
will inherit the authorization controls of. This must be a user
defined in either the `authorization` or `accounts` block.

**Decentralized Auth**

### [`operator`](/ref/config/operator/index.md)

One or more operator JWTs, either in files or inlined.

### [`trusted_keys`](/ref/config/trusted_keys/index.md)

One or more operator public keys to trust.

### [`resolver`](/ref/config/resolver/index.md)

Takes takes precedence over the value obtained from
the `operator` if defined.

### [`resolver_tls`](/ref/config/resolver_tls/index.md)

### [`resolver_preload`](/ref/config/resolver_preload/index.md)

Map of account public key to the account JWT.

### [`resolver_pinned_accounts`](/ref/config/resolver_pinned_accounts/index.md)

### [`system_account`](/ref/config/system_account/index.md)

Name or public key of the account that will be deemed the
_system_ account.

Default value: `$SYS`

### [`no_system_account`](/ref/config/no_system_account/index.md)

**Clustering**

### [`cluster`](/ref/config/cluster/index.md)

Configuration for clustering a set of servers.

### [`gateway`](/ref/config/gateway/index.md)

Configuration for setting up gateway connections
between clusters.

**Leafnodes**

### [`leafnodes`](/ref/config/leafnodes/index.md)

Configuration for setting up leaf node connections.

**JetStream**

### [`jetstream`](/ref/config/jetstream/index.md)

**Subject Mapping**

### [`mappings`](/ref/config/mappings/index.md)

**Logging**

### [`debug`](/ref/config/debug/index.md)

If true, enables debug log messages.

Default value: `false`

### [`trace`](/ref/config/trace/index.md)

If true, enables protocol trace log messages,
excluding the system account.

Default value: `false`

### [`trace_verbose`](/ref/config/trace_verbose/index.md)

If ture, enables protocol trace log messages,
including the system account.

Default value: `false`

### [`logtime`](/ref/config/logtime/index.md)

If false, log without timestamps.

Default value: `true`

### [`logfile`](/ref/config/logfile/index.md)

Log file name.

### [`logfile_size_limit`](/ref/config/logfile_size_limit/index.md)

Size in bytes after the log file rolls over to a new one.

Default value: `0`

### [`syslog`](/ref/config/syslog/index.md)

Log to syslog.

Default value: `false`

### [`remote_syslog`](/ref/config/remote_syslog/index.md)

Remote syslog address.

**Monitoring and Tracing**

### [`server_name`](/ref/config/server_name/index.md)

The servers name, shows up in logging. Defaults to the generated
server ID. When JetStream is used, within a domain, all server
names need to be unique.

### [`server_tags`](/ref/config/server_tags/index.md)

One or more tags associated with the server. This is currently
used for placement of JetStream streams and consumers.

### [`http`](/ref/config/http/index.md)

Listen specification `<host>:<port>` for server monitoring.

### [`https`](/ref/config/https/index.md)

Listen specification `<host>:<port>` for TLS server monitoring.

### [`http_port`](/ref/config/http_port/index.md)

HTTP port for server monitoring.

### [`https_port`](/ref/config/https_port/index.md)

HTTPS port for server monitoring.

### [`http_base_path`](/ref/config/http_base_path/index.md)

Base path for monitoring endpoints.

### [`connect_error_reports`](/ref/config/connect_error_reports/index.md)

Number of attempts at which a repeated failed route, gateway
or leaf node connection is reported. Connect attempts are made
once every second.

Default value: `3600`

### [`reconnect_error_reports`](/ref/config/reconnect_error_reports/index.md)

Number of failed attempt to reconnect a route, gateway or
leaf node connection. Default is to report every attempt.

Default value: `1`

### [`max_traced_msg_len`](/ref/config/max_traced_msg_len/index.md)

Set a limit to the trace of the payload of a message.

Default value: `0`

**Runtime Configuration**

### [`max_control_line`](/ref/config/max_control_line/index.md)

Maximum length of a protocol line (including combined length of subject and queue group). Increasing this value may require client changes to be used. Applies to all traffic.

Default value: `4KB`

### [`max_connections`](/ref/config/max_connections/index.md)

Maximum number of active client connections.

Default value: `64K`

### [`max_payload`](/ref/config/max_payload/index.md)

Maximum number of bytes in a message payload. Reducing this size may force you to implement chunking in your clients. Applies to client and leafnode payloads. It is not recommended to use values over 8MB but `max_payload` can be set up to 64MB. The max payload must be equal or smaller to the `max_pending` value.

Default value: `1MB`

### [`max_pending`](/ref/config/max_pending/index.md)

Maximum number of bytes buffered for a connection Applies to client connections. Note that applications can also set `PendingLimits` (number of messages and total size) for their subscriptions.

Default value: `64MB`

### [`max_subscriptions`](/ref/config/max_subscriptions/index.md)

Maximum numbers of subscriptions per client and leafnode accounts connection. A value of `0` means unlimited.

Default value: `0`

### [`max_subscription_tokens`](/ref/config/max_subscription_tokens/index.md)

### [`ping_interval`](/ref/config/ping_interval/index.md)

Duration at which pings are sent to clients, leaf nodes and routes.
In the presence of client traffic, such as messages or client side
pings, the server will not send pings. Therefore it is recommended
to keep this value bigger than what clients use.

Default value: `2m`

### [`ping_max`](/ref/config/ping_max/index.md)

After how many unanswered pings the server will allow before closing
the connection.

Default value: `2`

### [`write_deadline`](/ref/config/write_deadline/index.md)

Maximum number of seconds the server will block when writing. Once
this threshold is exceeded the connection will be closed. See slow
consumer on how to deal with this on the client.

Default value: `10s`

### [`no_header_support`](/ref/config/no_header_support/index.md)

Disables support for message headers.

### [`disable_sublist_cache`](/ref/config/disable_sublist_cache/index.md)

If true, disable subscription caches for all accounts. This saves
resources in situations where different subjects are used
all the time.

Default value: `false`

### [`lame_duck_duration`](/ref/config/lame_duck_duration/index.md)

Must be at least 30s.

Default value: `2m`

### [`lame_duck_grace_period`](/ref/config/lame_duck_grace_period/index.md)

This is the duration the server waits, after entering
lame duck mode, before starting to close client connections

Default value: `10s`

### [`pidfile`](/ref/config/pidfile/index.md)

### [`ports_file_dir`](/ref/config/ports_file_dir/index.md)

### [`prof_port`](/ref/config/prof_port/index.md)

### [`default_js_domain`](/ref/config/default_js_domain/index.md)

Account to domain name mapping.
