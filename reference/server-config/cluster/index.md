# cluster

/ [config](reference/server-config/index.md) 

Configuration for clustering a set of servers.

## Properties

### [`name`](reference/server-config/name/index.md)

Name of the cluster.

### [`host`](reference/server-config/host/index.md)

Host for cluster route connections.

Default value: `0.0.0.0`

### [`port`](reference/server-config/port/index.md)

Port for cluster route connections.

Default value: `6222`

### [`listen`](reference/server-config/listen/index.md)

This is an alternate to setting the `host` and `port` separately.

### [`tls`](reference/server-config/tls/index.md)

TLS configuration for securing cluster connections.
`verify` is always enabled and `cert_file` is used for
both client and server for mutual TLS.

### [`advertise`](reference/server-config/advertise/index.md)

Advertised cluster `<host>:<port>`. Useful for cluster setups since
behind NAT. When using TLS this is important to set to control the
hostname that clients will use when discovering the route so TLS
hostname verification does not fail.

### [`no_advertise`](reference/server-config/no_advertise/index.md)

If true, the server will not send or gossip its client URLs to other servers in the cluster, nor
will it tell its clients about other servers' client URLs.

### [`routes`](reference/server-config/routes/index.md)

A list of server URLs to cluster with. Self-routes are ignored. Should authentication via token or username/password
be required, specify them as part of the URL.

### [`connect_retries`](reference/server-config/connect_retries/index.md)

After how many failed connect attempts to give up establishing a connection to a *discovered* route. Default is 0, do not retry.
When enabled, attempts will be made once a second. This, does not apply to explicitly configured routes.

Default value: `0`

### [`authorization`](reference/server-config/authorization/index.md)

Authorization map for configuring cluster routes. When a single username/password is used, it defines the authentication mechanism
this server expects, and how this server will authenticate itself when establishing a connection to a discovered route. This will
not be used for routes explicitly listed in routes and therefore have to be provided as part of the URL. With this authentication
mode, either use the same credentials throughout the system or list every route explicitly on every server.

If the `tls` configuration map specifies `verify_and_map` only, provide the expected username. Here different certificates can be
used, but they have to map to the same `username`. The authorization map also allows for timeout which is honored but users and
token configuration are not supported and will prevent the server from starting. The `permissions` block is ignored.

