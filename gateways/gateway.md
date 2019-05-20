
## Gateway Configuration

The `gateway` configuration block is similar to a `cluster` block:

```yaml
gateway {
	name: "A"
	listen: "localhost:7222"
	authorization {
		user: gwu
		password: gwp
	}

	gateways: [
		{name: "A", url: "nats-gateway://gwu:gwp@localhost:7222"},
		{name: "B", url: "nats-gateway://gwu:gwp@localhost:7333"},
		{name: "C", url: "nats-gateway://gwu:gwp@localhost:7444"},
	]
}
```

One difference is that instead of `routes` you specify `gateways`. As expected _self-gateway_ connections are ignored, so you can share gateway configurations with minimal fuzz.

Starting a server: 
```text
> nats-server -c A.conf
[85803] 2019/05/07 10:50:55.902474 [INF] Starting nats-server version 2.0.0-RC11
[85803] 2019/05/07 10:50:55.902547 [INF] Git commit [not set]
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
> nats-pub -s localhost:4444 foo bar
Published [foo] : 'bar'

# On a different session...
> nats-sub -s localhost:4333 ">"
Listening on [>]
[#1] Received on [foo]: 'bar'
```

### `Gateway` Configuration Block

| Property | Description |
| :------  | :---- |
| `advertise` | Hostport `<host>:<port>` to advertise to other gateways. |
| `authorization` | Authorization block (same as other nats-server `authorization` configuration). |
| `connect_retries` | Number of times the server will try to connect to a discovered gateway. |
| `gateways` | List of Gateway entries - see below. |
| `host` | Interface where the gateway will listen for incomming gateway connections. |
| `listen` | Combines `host` and `port` as `<host>:<port>` |
| `name` | Name for this cluster, all gateways belonging to the same cluster, should specify the same name. |
| `port` | Port where the gateway will listen for incomming gateway connections. |
| `reject_unknown` | If `true`, gateway will reject connections from gateways that are not configured in `gateways`. |
| `tls` | TLS configuration block (same as other nats-server `tls` configuration). |



#### `Gateway` Entry

The `gateways` configuration block is a list of gateway entries with the following properties:

| Property | Description |
| :------  | :---- |
| `name` | Gateway name. |
| `url` | Hostport `<host>:<port>` describing where the remote gateway can be reached. If multiple IPs are returned, one is randomly selected. |
| `urls` | A list of `url` |



### `TLS` Configuration Block

| Property | Description |
| :------  | :---- |
| `ca_file` | TLS certificate authority file. |
| `cert_file` | TLS certificate file. |
| `cipher_suites` | When set, only the specified TLS cipher suites will be allowed. Values must match golang version used to build the server.  |
| `curve_preferences` | List of TLS cypher curves to use in order. |
| `insecure` | Skip certificate verfication. |
| `key_file` | TLS certificate key file. |
| `timeout` | TLS handshake timeout in fractional seconds. |
| `verify_and_map` | If `true`, require and verify client certificates and use values map certificate values for authentication purposes. |
| `verify` | If `true`, require and verify client certificates. |
