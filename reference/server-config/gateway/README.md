# gateway

/ [Config](../README.md) 

Configuration for setting up gateway connections
between clusters.

## Properties

### [`name`](name/README.md)

Name of this cluster. All gateway connections belonging to the
same cluster must specify the same name.

### [`reject_unknown_cluster`](reject_unknown_cluster/README.md)

If true, gateway will reject connections from cluster that are
not configured in gateways. It does so by checking if the cluster
name, provided by the incomming connection, exists as named gateway.
This effectively disables gossiping of new cluster. It does not
restrict a configured gateway, thus cluster, from dynamically growing.

Default value: `false`

### [`host`](host/README.md)

Interface where the gateway will listen for incoming gateway
connections.

Default value: `0.0.0.0`

### [`port`](port/README.md)

Port where the gateway will listen for incoming gateway connections.

Default value: `7222`

### [`listen`](listen/README.md)

`<host>:<port>` format. Alternative to `host`/`port`.

### [`tls`](tls/README.md)

A `tls` configuration map for securing gateway connections. `verify`
is always enabled. Unless otherwise, `cert_file` will be the default
client certificate.

### [`advertise`](advertise/README.md)

`<host>:<port>` to advertise how this server can be contacted by
other gateway members. This is useful in setups with NAT.

### [`connect_retries`](connect_retries/README.md)

After how many failed connect attempts to give up establishing
a connection to a discovered gateway. Default is 0, do not retry.
When enabled, attempts will be made once a second. This, does not
apply to explicitly configured gateways.

Default value: `0`

### [`authorization`](authorization/README.md)

Authorization map for gateways. When a single username/password is
used, it defines the authentication mechanism this server expects,
and how this server will authenticate itself when establishing
a connection to a discovered gateway. This will not be used for
gateways explicitly listed in gateways and therefore have to be
provided as part of the URL. With this authentication mode, either
use the same credentials throughout the system or list every gateway
explicitly on every server. If the tls configuration map specifies
verify_and_map only provide the expected username. Here different
certificates can be used, but they do have to map to the same username.
The authorization map also allows for timeout which is honored but
users and token configuration are not supported and will prevent the
server from starting. The permissions block is ignored.

### [`gateways`](gateways/README.md)

List of gateway entries.

