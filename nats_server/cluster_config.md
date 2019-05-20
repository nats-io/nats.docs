## Cluster Configuration

The `cluster` configuration map has the following configuration options:

| Property | Description |
| :------  | :---- |
| `listen`   | host/port for inbound route connections |
| `authorization` | [authorization](authorization.md) map for configuring cluster clients. Supports `token`, `username`/`password` and `TLS authentication`. `permissions` are ignored. |
| `timeout` | Maximum amount of time (in seconds) to wait for a clustering connection to complete 
| `tls` | A [`tls` configuration map](tls.md#tls-configuration) for securing the clustering connection |
| `routes` | A list of other servers (URLs) to cluster with. Self-routes are ignored. |


```ascii
cluster {
  listen: localhost:4244 # host/port for inbound route connections

  # Authorization for route connections
  authorization {
    user: route_user
    # ./util/mkpasswd -p T0pS3cr3tT00!
        password: $2a$11$xH8dkGrty1cBNtZjhPeWJewu/YPbSU.rXJWmS6SFilOBXzmZoMk9m
    timeout: 0.5
  }

  # Routes are actively solicited and connected to from this server.
  # Other servers can connect to us if they supply the correct credentials
  # in their routes definitions from above.
  routes = [
    nats-route://user1:pass1@127.0.0.1:4245
    nats-route://user2:pass2@127.0.0.1:4246
  ]
}
```