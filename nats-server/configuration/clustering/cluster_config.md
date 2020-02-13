# Configuration

The `cluster` configuration map has the following configuration options:

| Property | Description |
| :--- | :--- |
| `host` | Interface where the gateway will listen for incoming route connections. |
| `port` | Port where the gateway will listen for incoming route connections. |
| `listen` | Combines `host` and `port` as `<host>:<port>`. |
| `tls` | A [`tls` configuration map](../securing_nats/tls.md) for securing the clustering connection. |
| `advertise` | Hostport `<host>:<port>` to advertise how this server can be contacted by other cluster members. This is useful in setups with NAT. |
| `no_advertise` |  When set to `true`, do not advertise this server to clients. |
| `routes` | A list of other servers \(URLs\) to cluster with. Self-routes are ignored. Should authentication via `token` or `username`/`password` be required, specify them as part of the URL. |
| `connect_retries` | After how many failed connect attempts to give up establishing a connection to a discovered route. Default is `0`, do not retry. When enabled, attempts will be made once a second. This, does not apply to explicitly configured routes. |
| `authorization` | [Authorization](../securing_nats/auth_intro/README.md#Authorization-Map) map for configuring cluster routes. When `token` or a single `username`/`password` are used, they define the authentication mechanism this server expects. What authentication values other server have to provide when connecting. They also specify how this server will authenticate itself when establishing a connection to a discovered route. This will not be used for routes explicitly listed in `routes` and therefore have to be provided as part of the URL. If you use token or password based authentication, either use the same credentials throughout the system or list every route explicitly on every server. If the `tls` configuration map specifies `verify_and_map` only provide the expected `username`. Here different certificates can be used, but they do have to map to the same `username`. The authorization map also allows for `timeout` which is honored but `users` and `permissions` are ignored. |

```text
cluster {
  # host/port for inbound route connections from other server
  listen: localhost:4244 

  # Authorization for route connections
  # Other server can connect if they supply the credentials listed here
  # This server will connect to discovered routes using this user
  authorization {
    user: route_user
    password: pwd
    timeout: 0.5
  }

  # This server establishes routes with these server.
  # This server solicits new routes and Routes are actively solicited and connected to from this server.
  # Other servers can connect to us if they supply the correct credentials
  # in their routes definitions from above.
  routes = [
    nats-route://route_user:pwd@127.0.0.1:4245
    nats-route://route_user:pwd@127.0.0.1:4246
  ]
}
```
