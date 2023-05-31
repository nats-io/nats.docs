# advertise

/ [config](/reference/server-config/index.md) / [cluster](/reference/server-config/config/cluster/index.md) 

Advertised cluster `<host>:<port>`. Useful for cluster setups since
behind NAT. When using TLS this is important to set to control the
hostname that clients will use when discovering the route so TLS
hostname verification does not fail.

*Aliases*
- `cluster_advertise`

