# leafnodes

Configuration for setting up leaf node connections.

*Aliases*

- `leaf`


*Reloadable*: No

*Types*

- `object`


## Properties

### Incoming Connections

A server that has been configured to *accept* connections
from one or more leaf nodes. This would be the *hub* in a
hub-and-spoke topology, for example.

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [host](/ref/config/leafnodes/host) | Host name the server will listen on for incoming leaf node connections. | ``0.0.0.0`` | No |
| [port](/ref/config/leafnodes/port) | Port the server will listen for incoming leaf node connections. | ``7422`` | Yes |
| [listen](/ref/config/leafnodes/listen) | This is an alternate to setting the `host` and `port` separately. | `-` | Yes |
| [tls](/ref/config/leafnodes/tls) | TLS configuration for securing leaf node connections. | `-` | Yes |
| [advertise](/ref/config/leafnodes/advertise) | Hostport to advertise how this sever be contacted by leaf nodes. This is useful for setups with a NAT. | `-` | Yes |
| [no_advertise](/ref/config/leafnodes/no_advertise) | If true, the server will not be advertised to leaf nodes. | ``false`` | Yes |
| [authorization](/ref/config/leafnodes/authorization) | Authorization scoped to accepting leaf node connections. | `-` | Yes |
| [min_version](/ref/config/leafnodes/min_version) | The minimum server version required of the connecting leaf node. This must be at least version `2.8.0`. | `-` | Yes |
### Outgoing Connections

A server that has been configured to *connect* to another
server configured to accept leaf node connections. In a
hub-and-spoke topology, this would be the *spoke*, typically
in a remote location or on an edge device.

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [remotes](/ref/config/leafnodes/remotes) | List of entries specifiying servers where the leaf node client connection can be made. | `-` | No |
| [reconnect](/ref/config/leafnodes/reconnect) | Interval in seconds at which reconnect attempts to a remote server are made. | `-` | Yes |
