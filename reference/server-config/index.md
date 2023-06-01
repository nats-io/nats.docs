# Config



## Properties

**Connectivity**

### [`host`](host)

Host for client connections.

Default value: `0.0.0.0`

### [`port`](port)

Port for client connections. Use `-1` for a
random available port.

Default value: `4222`

### [`listen`](listen)

`<host>:<port>` for a client connections.

### [`client_advertise`](client_advertise)

Advertised client `<host>:<port>`. Useful for cluster setups
behind a NAT.

### [`tls`](tls)

TLS configuration for client and HTTP monitoring.

### [`allow_non_tls`](allow_non_tls)

Allow mixed TLS and non-TLS on the same port.

### [`ocsp`](ocsp)



### [`mqtt`](mqtt)

Configuration for enabling the MQTT interface.

### [`websocket`](websocket)

Configuration for enabling the WebSocket interface.

**Centralized Auth**

### [`authorization`](authorization)

Static single or multi-user declaration.

### [`accounts`](accounts)

Static set of accounts.

### [`no_auth_user`](no_auth_user)

Name of the user that non-authenticated clients
will inherit the authorization controls of. This must be a user
defined in either the `authorization` or `accounts` block.

**Decentralized Auth**

### [`operator`](operator)

One or more operator JWTs, either in files or inlined.

### [`trusted_keys`](trusted_keys)

One or more operator public keys to trust.

### [`resolver`](resolver)

Takes takes precedence over the value obtained from
the `operator` if defined.

### [`resolver_tls`](resolver_tls)



### [`resolver_preload`](resolver_preload)

Map of account public key to the account JWT.

### [`resolver_pinned_accounts`](resolver_pinned_accounts)



### [`system_account`](system_account)

Name or public key of the account that will be deemed the
*system* account.

Default value: `$SYS`

### [`no_system_account`](no_system_account)



**Clustering**

### [`cluster`](cluster)

Configuration for clustering a set of servers.

### [`gateway`](gateway)

Configuration for setting up gateway connections
between clusters.

**Leafnodes**

### [`leafnodes`](leafnodes)

Configuration for setting up leaf node connections.

**JetStream**

### [`jetstream`](jetstream)



**Subject Mapping**

### [`mappings`](mappings)



**Logging**

### [`debug`](debug)

If true, enables debug log messages.

Default value: `false`

### [`trace`](trace)

If true, enables protocol trace log messages,
excluding the system account.

Default value: `false`

### [`trace_verbose`](trace_verbose)

If true, enables protocol trace log messages,
including the system account.

Default value: `false`

### [`logtime`](logtime)

If false, log without timestamps.

Default value: `true`

### [`logtime_utc`](logtime_utc)

If true, log timestamps with be in UTC rather than the local timezone.

Default value: `false`

### [`logfile`](logfile)

Log file name.

### [`logfile_size_limit`](logfile_size_limit)

Size in bytes after the log file rolls over to a new one.

Default value: `0`

### [`syslog`](syslog)

Log to syslog.

Default value: `false`

### [`remote_syslog`](remote_syslog)

Remote syslog address.

**Monitoring and Tracing**

### [`server_name`](server_name)

The servers name, shows up in logging. Defaults to the generated
server ID. When JetStream is used, within a domain, all server
names need to be unique.

### [`server_tags`](server_tags)

One or more tags associated with the server. This is currently
used for placement of JetStream streams and consumers.

### [`http`](http)

Listen specification `<host>:<port>` for server monitoring.

### [`https`](https)

Listen specification `<host>:<port>` for TLS server monitoring.

### [`http_port`](http_port)

HTTP port for server monitoring.

### [`https_port`](https_port)

HTTPS port for server monitoring.

### [`http_base_path`](http_base_path)

Base path for monitoring endpoints.

### [`connect_error_reports`](connect_error_reports)

Number of attempts at which a repeated failed route, gateway
or leaf node connection is reported. Connect attempts are made
once every second.

Default value: `3600`

### [`reconnect_error_reports`](reconnect_error_reports)

Number of failed attempt to reconnect a route, gateway or
leaf node connection. Default is to report every attempt.

Default value: `1`

### [`max_traced_msg_len`](max_traced_msg_len)

Set a limit to the trace of the payload of a message.

Default value: `0`

**Runtime Configuration**

### [`max_control_line`](max_control_line)

Maximum length of a protocol line (including combined length of subject and queue group). Increasing this value may require client changes to be used. Applies to all traffic.

Default value: `4KB`

### [`max_connections`](max_connections)

Maximum number of active client connections.

Default value: `64K`

### [`max_payload`](max_payload)

Maximum number of bytes in a message payload. Reducing this size may force you to implement chunking in your clients. Applies to client and leafnode payloads. It is not recommended to use values over 8MB but `max_payload` can be set up to 64MB. The max payload must be equal or smaller to the `max_pending` value.

Default value: `1MB`

### [`max_pending`](max_pending)

Maximum number of bytes buffered for a connection Applies to client connections. Note that applications can also set `PendingLimits` (number of messages and total size) for their subscriptions.

Default value: `64MB`

### [`max_subscriptions`](max_subscriptions)

Maximum numbers of subscriptions per client and leafnode accounts connection. A value of `0` means unlimited.

Default value: `0`

### [`max_subscription_tokens`](max_subscription_tokens)



### [`ping_interval`](ping_interval)

Duration at which pings are sent to clients, leaf nodes and routes.
In the presence of client traffic, such as messages or client side
pings, the server will not send pings. Therefore it is recommended
to keep this value bigger than what clients use.

Default value: `2m`

### [`ping_max`](ping_max)

After how many unanswered pings the server will allow before closing
the connection.

Default value: `2`

### [`write_deadline`](write_deadline)

Maximum number of seconds the server will block when writing. Once
this threshold is exceeded the connection will be closed. See slow
consumer on how to deal with this on the client.

Default value: `10s`

### [`no_header_support`](no_header_support)

Disables support for message headers.

### [`disable_sublist_cache`](disable_sublist_cache)

If true, disable subscription caches for all accounts. This saves
resources in situations where different subjects are used
all the time.

Default value: `false`

### [`lame_duck_duration`](lame_duck_duration)

Must be at least 30s.

Default value: `2m`

### [`lame_duck_grace_period`](lame_duck_grace_period)

This is the duration the server waits, after entering
lame duck mode, before starting to close client connections

Default value: `10s`

### [`pidfile`](pidfile)



### [`ports_file_dir`](ports_file_dir)



### [`prof_port`](prof_port)



### [`default_js_domain`](default_js_domain)

Account to domain name mapping.

