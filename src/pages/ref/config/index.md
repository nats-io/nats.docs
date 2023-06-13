# Server Config

While the NATS server has many flags that allow for simple testing of features, the NATS server products provide a flexible configuration format that combines the best of traditional formats and newer styles such as JSON and YAML.

## Syntax

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

The NATS configuration file is parsed with UTF-8 encoding.

{% callout type="note" %}
The NATS configuration in the file can also be rendered as a JSON object (with comments!), but to combine it with variables the variables still have to be unquoted.
{% /callout %}

### Strings and Numbers

The configuration parser is very forgiving, as you have seen:

* values can be a primitive, or a list, or a map
* strings and numbers typically do the right thing
* numbers support units such as, 1K for 1000, 1KB for 1024

String values that start with a digit _can_ create issues. To force such values as strings, quote them.

Bad Config:

```text
listen: 127.0.0.1:4222
authorization: {
    # BAD!
    token: 3secret
}
```

Good Config:

```text
listen: 127.0.0.1:4222
authorization: {
    token: "3secret"
}
```

### Variables

Server configurations can specify variables. Variables allow you to reference a value from one or more sections in the configuration. Variables:

* Are block-scoped
* Are referenced with a `$` prefix. They have to be unquoted when being referenced, for example an assigment like `foo = "$example"` will result in `foo` being the literal string `"$example"`.
* Can be resolved from environment variables having the same name

{% callout type="warning" %}
If the environment variable value begins with a number you may have trouble resolving it depending on the server version you are running.
{% /callout %}

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

The environment variable can either be inlined (below) or previously exported.

```
TOKEN="hello" nats-server -c /config/file
```

### Include Directive

The `include` directive allows you to split a server configuration into several files. This is useful for separating configuration into chunks that you can easily reuse between different servers.

Includes _must_ use relative paths, and are relative to the main configuration \(the one specified via the `-c` option\):

server.conf:

```text
listen: 127.0.0.1:4222
include ./auth.conf
```

{% callout type="note" %}
Note that `include` is not followed by `=` or `:`, as it is a _directive_.
{% /callout %}

auth.conf:

```text
authorization: {
    token: "f0oBar"
}
```

Starting the server only needs to refer to the top-level config containing the include.

```text
nats-server -c server.conf
```

*Reloadable*: No

*Types*



## Properties

### Connectivity

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [host](/ref/config/host) | Host for client connections. | ``0.0.0.0`` | No |
| [port](/ref/config/port) | Port for client connections. Use `-1` for a random available port. | ``4222`` | Yes |
| [listen](/ref/config/listen) | `<host>:<port>` for a client connections. | `-` | Yes |
| [client_advertise](/ref/config/client_advertise) | Advertised client `<host>:<port>`. Useful for cluster setups behind a NAT. | `-` | Yes |
| [tls](/ref/config/tls) | TLS configuration for client and HTTP monitoring. | `-` | Yes |
| [allow_non_tls](/ref/config/allow_non_tls) | Allow mixed TLS and non-TLS on the same port. | `-` | Yes |
| [ocsp](/ref/config/ocsp) | OCSP Stapling is honored by default for certificates that have the `status_request` `Must-Staple` flag. If explicitly disabled, the server will not request staples even if `Must-Staple` is present. | ``true`` | Yes |
| [mqtt](/ref/config/mqtt) | Configuration for enabling the MQTT interface. | `-` | Yes |
| [websocket](/ref/config/websocket) | Configuration for enabling the WebSocket interface. | `-` | Yes |
### Centralized Auth

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [authorization](/ref/config/authorization) | Static single or multi-user declaration. | `-` | Yes |
| [accounts](/ref/config/accounts) | Static set of accounts. | `-` | Yes |
| [no_auth_user](/ref/config/no_auth_user) | Name of the user that non-authenticated clients will inherit the authorization controls of. This must be a user defined in either the `authorization` or `accounts` block. | `-` | Yes |
### Decentralized Auth

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [operator](/ref/config/operator) | One or more operator JWTs, either in files or inlined. | `-` | Yes |
| [trusted_keys](/ref/config/trusted_keys) | One or more operator public keys to trust. | `-` | Yes |
| [resolver](/ref/config/resolver) | Takes takes precedence over the value obtained from the `operator` if defined.  If a string value is used, it must be `MEMORY` or `URL(<url>)` where where `url` is an HTTP endpoint pointing to the [NATS account resolver](https://docs.nats.io/legacy/nas).  Note: the NATS account resolver is deprecated and the built-in NATS-based resolver should be used. | `-` | Yes |
| [resolver_tls](/ref/config/resolver_tls) |  | `-` | Yes |
| [resolver_preload](/ref/config/resolver_preload) | Map of account public key to the account JWT. | `-` | Yes |
| [resolver_pinned_accounts](/ref/config/resolver_pinned_accounts) |  | `-` | Yes |
| [system_account](/ref/config/system_account) | Name or public key of the account that will be deemed the *system* account. | ``$SYS`` | Yes |
| [no_system_account](/ref/config/no_system_account) |  | `-` | Yes |
### Clustering

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [cluster](/ref/config/cluster) | Configuration for clustering a set of servers. | `-` | Yes |
| [gateway](/ref/config/gateway) | Configuration for setting up gateway connections between clusters. | `-` | No |
### Leafnodes

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [leafnodes](/ref/config/leafnodes) | Configuration for setting up leaf node connections. | `-` | No |
### JetStream

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [jetstream](/ref/config/jetstream) |  | ``false`` | Yes |
| [store_dir](/ref/config/store_dir) | Directory to use for file-based JetStream storage. | `-` | Yes |
### Subject Mapping

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [mappings](/ref/config/mappings) |  | `-` | Yes |
### Logging

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [debug](/ref/config/debug) | If true, enables debug log messages. | ``false`` | Yes |
| [trace](/ref/config/trace) | If true, enables protocol trace log messages, excluding the system account. | ``false`` | Yes |
| [trace_verbose](/ref/config/trace_verbose) | If true, enables protocol trace log messages, including the system account. | ``false`` | Yes |
| [logtime](/ref/config/logtime) | If false, log without timestamps. | ``true`` | Yes |
| [logtime_utc](/ref/config/logtime_utc) | If true, log timestamps with be in UTC rather than the local timezone. | ``false`` | Yes |
| [logfile](/ref/config/logfile) | Log file name. | `-` | Yes |
| [logfile_size_limit](/ref/config/logfile_size_limit) | Size in bytes after the log file rolls over to a new one. | ``0`` | Yes |
| [syslog](/ref/config/syslog) | Log to syslog. | ``false`` | Yes |
| [remote_syslog](/ref/config/remote_syslog) | Remote syslog address. | `-` | Yes |
### Monitoring and Tracing

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [server_name](/ref/config/server_name) | The servers name, shows up in logging. Defaults to the generated server ID. When JetStream is used, within a domain, all server names need to be unique. | `-` | Yes |
| [server_tags](/ref/config/server_tags) | One or more tags associated with the server. This is currently used for placement of JetStream streams and consumers. | `-` | Yes |
| [http](/ref/config/http) | Listen specification `<host>:<port>` for server monitoring. | `-` | Yes |
| [https](/ref/config/https) | Listen specification `<host>:<port>` for TLS server monitoring. | `-` | Yes |
| [http_port](/ref/config/http_port) | HTTP port for server monitoring. | `-` | Yes |
| [https_port](/ref/config/https_port) | HTTPS port for server monitoring. | `-` | Yes |
| [http_base_path](/ref/config/http_base_path) | Base path for monitoring endpoints. | `-` | Yes |
| [connect_error_reports](/ref/config/connect_error_reports) | Number of attempts at which a repeated failed route, gateway or leaf node connection is reported. Connect attempts are made once every second. | ``3600`` | Yes |
| [reconnect_error_reports](/ref/config/reconnect_error_reports) | Number of failed attempt to reconnect a route, gateway or leaf node connection. Default is to report every attempt. | ``1`` | Yes |
| [max_traced_msg_len](/ref/config/max_traced_msg_len) | Set a limit to the trace of the payload of a message. | ``0`` | Yes |
### Runtime Configuration

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [max_control_line](/ref/config/max_control_line) | Maximum length of a protocol line (including combined length of subject and queue group). Increasing this value may require client changes to be used. Applies to all traffic. | ``4KB`` | Yes |
| [max_connections](/ref/config/max_connections) | Maximum number of active client connections. | ``64K`` | Yes |
| [max_payload](/ref/config/max_payload) | Maximum number of bytes in a message payload. Reducing this size may force you to implement chunking in your clients. Applies to client and leafnode payloads. It is not recommended to use values over 8MB but `max_payload` can be set up to 64MB. The max payload must be equal or smaller to the `max_pending` value. | ``1MB`` | Yes |
| [max_pending](/ref/config/max_pending) | Maximum number of bytes buffered for a connection Applies to client connections. Note that applications can also set `PendingLimits` (number of messages and total size) for their subscriptions. | ``64MB`` | Yes |
| [max_subscriptions](/ref/config/max_subscriptions) | Maximum numbers of subscriptions per client and leafnode accounts connection. A value of `0` means unlimited. | ``0`` | Yes |
| [max_subscription_tokens](/ref/config/max_subscription_tokens) |  | `-` | Yes |
| [ping_interval](/ref/config/ping_interval) | Duration at which pings are sent to clients, leaf nodes and routes. In the presence of client traffic, such as messages or client side pings, the server will not send pings. Therefore it is recommended to keep this value bigger than what clients use. | ``2m`` | Yes |
| [ping_max](/ref/config/ping_max) | After how many unanswered pings the server will allow before closing the connection. | ``2`` | Yes |
| [write_deadline](/ref/config/write_deadline) | Maximum number of seconds the server will block when writing. Once this threshold is exceeded the connection will be closed. See slow consumer on how to deal with this on the client. | ``10s`` | Yes |
| [no_header_support](/ref/config/no_header_support) | Disables support for message headers. | `-` | Yes |
| [disable_sublist_cache](/ref/config/disable_sublist_cache) | If true, disable subscription caches for all accounts. This saves resources in situations where different subjects are used all the time. | ``false`` | Yes |
| [lame_duck_duration](/ref/config/lame_duck_duration) | Must be at least 30s. | ``2m`` | Yes |
| [lame_duck_grace_period](/ref/config/lame_duck_grace_period) | This is the duration the server waits, after entering lame duck mode, before starting to close client connections | ``10s`` | Yes |
| [pidfile](/ref/config/pidfile) |  | `-` | Yes |
| [ports_file_dir](/ref/config/ports_file_dir) |  | `-` | Yes |
| [prof_port](/ref/config/prof_port) |  | `-` | Yes |
| [default_js_domain](/ref/config/default_js_domain) | Account to domain name mapping. | `-` | Yes |
