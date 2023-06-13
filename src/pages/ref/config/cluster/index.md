# cluster

Configuration for clustering a set of servers.

*Reloadable*: Yes

*Types*

- `object`


## Properties

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [name](/ref/config/cluster/name) | Name of the cluster. | `-` | Yes |
| [host](/ref/config/cluster/host) | Host for cluster route connections. | ``0.0.0.0`` | No |
| [port](/ref/config/cluster/port) | Port for cluster route connections. | ``6222`` | Yes |
| [listen](/ref/config/cluster/listen) | This is an alternate to setting the `host` and `port` separately. | `-` | Yes |
| [tls](/ref/config/cluster/tls) | TLS configuration for securing cluster connections. `verify` is always enabled and `cert_file` is used for both client and server for mutual TLS. | `-` | Yes |
| [advertise](/ref/config/cluster/advertise) | Advertised cluster `<host>:<port>`. Useful for cluster setups since behind NAT. When using TLS this is important to set to control the hostname that clients will use when discovering the route so TLS hostname verification does not fail. | `-` | Yes |
| [no_advertise](/ref/config/cluster/no_advertise) | If true, the server will not send or gossip its client URLs to other servers in the cluster, nor will it tell its clients about other servers' client URLs. | `-` | Yes |
| [routes](/ref/config/cluster/routes) | A list of server URLs to cluster with. Self-routes are ignored. Should authentication via token or username/password be required, specify them as part of the URL. | `-` | Yes |
| [connect_retries](/ref/config/cluster/connect_retries) | After how many failed connect attempts to give up establishing a connection to a *discovered* route. Default is 0, do not retry. When enabled, attempts will be made once a second. This, does not apply to explicitly configured routes. | ``0`` | Yes |
| [authorization](/ref/config/cluster/authorization) | Authorization map for configuring cluster routes. When a single username/password is used, it defines the authentication mechanism this server expects, and how this server will authenticate itself when establishing a connection to a discovered route. This will not be used for routes explicitly listed in routes and therefore have to be provided as part of the URL. With this authentication mode, either use the same credentials throughout the system or list every route explicitly on every server.  If the `tls` configuration map specifies `verify_and_map` only, provide the expected username. Here different certificates can be used, but they have to map to the same `username`. The authorization map also allows for timeout which is honored but users and token configuration are not supported and will prevent the server from starting. The `permissions` block is ignored. | `-` | Yes |
