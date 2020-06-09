# Configuration

The `gateway` [configuration block](gateway.md#gateway-configuration-block) is similar to a [`cluster`](../clustering/cluster_config.md) block:

```text
gateway {
    name: "A"
    listen: "localhost:7222"
    authorization {
        user: gwu
        password: gwp
    }

    gateways: [
        {name: "A", url: "nats://gwu:gwp@localhost:7222"},
        {name: "B", url: "nats://gwu:gwp@localhost:7333"},
        {name: "C", url: "nats://gwu:gwp@localhost:7444"},
    ]
}
```

One difference is that instead of `routes` you specify `gateways`. As expected _self-gateway_ connections are ignored, so you can share gateway configurations with minimal fuss.

Starting a server:

```text
> nats-server -c A.conf
[85803] 2019/05/07 10:50:55.902474 [INF] Starting nats-server version 2.0.0
[85803] 2019/05/07 10:50:55.903669 [INF] Gateway name is A
[85803] 2019/05/07 10:50:55.903684 [INF] Listening for gateways connections on localhost:7222
[85803] 2019/05/07 10:50:55.903696 [INF] Address for gateway "A" is localhost:7222
[85803] 2019/05/07 10:50:55.903909 [INF] Listening for client connections on 0.0.0.0:4222
[85803] 2019/05/07 10:50:55.903914 [INF] Server id is NBHUDBF3TVJSWCDPG2HSKI4I2SBSPDTNYEXEMOFAZUZYXVA2IYRUGPZU
[85803] 2019/05/07 10:50:55.903917 [INF] Server is ready
[85803] 2019/05/07 10:50:56.830669 [INF] 127.0.0.1:50892 - gid:2 - Processing inbound gateway connection
[85803] 2019/05/07 10:50:56.830673 [INF] 127.0.0.1:50891 - gid:1 - Processing inbound gateway connection
[85803] 2019/05/07 10:50:56.831079 [INF] 127.0.0.1:50892 - gid:2 - Inbound gateway connection from "C" (NBHWDFO3KHANNI6UCEUL27VNWL7NWD2MC4BI4L2C7VVLFBSMZ3CRD7HE) registered
[85803] 2019/05/07 10:50:56.831211 [INF] 127.0.0.1:50891 - gid:1 - Inbound gateway connection from "B" (ND2UJB3GFUHXOQ2UUMZQGOCL4QVR2LRJODPZH7MIPGLWCQRARJBU27C3) registered
[85803] 2019/05/07 10:50:56.906103 [INF] Connecting to explicit gateway "B" (localhost:7333) at 127.0.0.1:7333
[85803] 2019/05/07 10:50:56.906104 [INF] Connecting to explicit gateway "C" (localhost:7444) at 127.0.0.1:7444
[85803] 2019/05/07 10:50:56.906404 [INF] 127.0.0.1:7333 - gid:3 - Creating outbound gateway connection to "B"
[85803] 2019/05/07 10:50:56.906444 [INF] 127.0.0.1:7444 - gid:4 - Creating outbound gateway connection to "C"
[85803] 2019/05/07 10:50:56.906647 [INF] 127.0.0.1:7444 - gid:4 - Outbound gateway connection to "C" (NBHWDFO3KHANNI6UCEUL27VNWL7NWD2MC4BI4L2C7VVLFBSMZ3CRD7HE) registered
[85803] 2019/05/07 10:50:56.906772 [INF] 127.0.0.1:7333 - gid:3 - Outbound gateway connection to "B" (ND2UJB3GFUHXOQ2UUMZQGOCL4QVR2LRJODPZH7MIPGLWCQRARJBU27C3) registered
```

Once all the gateways are up, these clusters of one will forward messages as expected:

```text
> nats-sub -s localhost:4333 ">"
Listening on [>]

# On a different session...
> nats-pub -s localhost:4444 foo bar
Published [foo] : 'bar'

# nats-sub should print 
[#1] Received on [foo] : 'bar'
```

## `Gateway` Configuration Block

| Property | Description |
| :--- | :--- |
| `name` | Name for this cluster, all gateways belonging to the same cluster, should specify the same name. |
| `reject_unknown` | If `true`, gateway will reject connections from gateways that are not configured in `gateways`. |
| `gateways` | List of Gateway [entries](gateway.md#gateway-entry) - see below. |
| `host` | Interface where the gateway will listen for incoming gateway connections. |
| `port` | Port where the gateway will listen for incoming gateway connections. |
| `listen` | Combines `host` and `port` as `<host>:<port>` |
| `tls` | A [`tls` configuration map](../securing_nats/tls.md) for securing gateway connections. `verify` is always enabled. Unless otherwise specified in a [`gateway`](gateway.md#gateway-entry), `cert_file` will be the default client certificate. [See](../securing_nats/tls.md#wrong-key-usage) for certificate pitfalls. |
| `advertise` | Hostport `<host>:<port>` to advertise how this server can be contacted by other gateway members. This is useful in setups with NAT. |
| `connect_retries` | After how many failed connect attempts to give up establishing a connection to a discovered gateway. Default is `0`, do not retry. When enabled, attempts will be made once a second. This, does not apply to explicitly configured gateways. |
| `authorization` | [Authorization](../securing_nats/auth_intro/#authorization-map) map for gateways. When `token` or a single `username`/`password` are used, they define the authentication mechanism this server expects. What authentication values other server have to provide when connecting. They also specify how this server will authenticate itself when establishing a connection to a discovered gateway. This will not be used for gateways explicitly listed in [`gateways`](gateway.md#gateway-entry) and therefore have to be provided as part of the URL. If you use token or password based authentication, either use the same credentials throughout the system or list every gateway explicitly on every server. If the `tls` configuration map specifies `verify_and_map` only provide the expected `username`. Here different certificates can be used, but they do have to map to the same `username`. The authorization map also allows for `timeout` which is honored but `users` and `permissions` are ignored. |

### `Gateway` Entry

The `gateways` configuration block is a list of gateway entries with the following properties:

| Property | Description |
| :--- | :--- |
| `name` | Gateway name. |
| `url` | Hostport `<host>:<port>` describing where the remote gateway can be reached. If multiple IPs are returned, one is randomly selected. |
| `urls` | A list of `url` strings. |
| `tls` | A [`tls` configuration map](../securing_nats/tls.md) for creating a secure gateway connection. If the top-level `gateway{}` tls block contains certificates that have both client and server purposes, it is possible to omit this one and the server will use the certificates from the `gateway{tls{}}` section. |

By using `urls` and an array, you can specify a list of endpoints that form part of a cluster as below. A NATS Server will pick one of those addresses randomly and only establish a single outbound gateway connection to one of the members from another cluster:

```text
gateway {
    name: "DC-A"
    listen: "localhost:7222"

    gateways: [
        {name: "DC-A", urls: ["nats://localhost:7222", "nats://localhost:7223", "nats://localhost:7224"]},
        {name: "DC-B", urls: ["nats://localhost:7332", "nats://localhost:7333", "nats://localhost:7334"]},
        {name: "DC-C", urls: ["nats://localhost:7442", "nats://localhost:7333", "nats://localhost:7335"]}
    ]
}
```

