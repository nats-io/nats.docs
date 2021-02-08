# WebSockets

The nats-server supports WebSockets as first class citizens. This means web clients can access NATS directly. This opens many opportunities for accessing services in the back-end directly without having to proxy requests through HTTP. NATS websocket client support is provided via the [nats.ws](https://github.com/nats-io/nats.ws) client.

##  Server Configuration

WebSocket support is enabled on the server by providing a `websocket` configuration block. The configuration block offers the expected [server connectivity properties](https://docs.nats.io/nats-server/configuration#connectivity) such as:

- `listen`
- `port`
- `host`
- `advertise`
- `tls`
- `authorization`
- `no_auth_user`


Specific options to `websocket` are the following:

| Property | Description | Default |
| :--- | :--- | :--- |
| `no_tls` | Relax requirement of web socket to be require a TLS configuration. Use in non-production environments or when properly securing a server behind a proxy. If `tls` is configured, this option is ignored. | false |
| `same_origin` | [Cross-origin resource sharing option](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). When set to true, the HTTP origin header must match the request’s host. | `false` |
| `allowed_origins` | [Cross-origin resource sharing option](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). List of accepted origins. When empty, and `same_origin` is `false`, clients from any origin are allowed to connect. |
| `jwt_cookie` | Name for an HTTP cookie, that if present will be used as a client jwt. If the client is specifies a JWT, this option is ignored. [The cookie should be set by the HTTP server as described here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies). This setting is useful when generating NATS `Bearer` client JWTs as the result of some authentication mechanism. The HTTP server after correct authentication can issue a JWT for the user, that is set securely preventing access by unintended scripts. Note these JWTs must be [NATS JWTs](https://docs.nats.io/nats-server/configuration/securing_nats/jwt). | “” |
| `compress` | When set to true, the server will attempt to negotiate compression with the client.  Note that this simply enables the possibility for the server to negotiate compression. For compression to actually occur both client and servers must agree on the scheme. | false |

## The `advertise` and `no_advertise` Options

The `advertise` and [`no_advertise`](https://docs.nats.io/nats-server/configuration/clustering/cluster_config) options may be very useful when exposing your websocket server to clients. Depending on your cluster configuration it is possible for the server to gossip servers that are not directly accessible to the client. When locating your server behind a load balancer, you'll likely want to enable `no_advertise`, to prevent cluster updates with servers that are not accessible. If this is not possible, you can also enable the client-side option [`ignoreClusterUpdates`](https://github.com/nats-io/nats.deno#connection-options).

If your websocket clients will be coming from the public Internet, you may consider enabling the websocket services via a [leaf node](https://docs.nats.io/nats-server/configuration/leafnodes). This will provide an additional layer of control and security should you need it.
