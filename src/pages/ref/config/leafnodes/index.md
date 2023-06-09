# leafnodes

/ [Server Config](/ref/config/index.md) 

Configuration for setting up leaf node connections.

*Aliases*

- `leaf`


*Reloadable*: `true`

*Types*

- `object`


## Properties

### Incoming Connections

A server that has been configured to *accept* connections
from one or more leaf nodes. This would be the *hub* in a
hub-and-spoke topology, for example.

#### [`host`](/ref/config/leafnodes/host/index.md)

Host name the server will listen on for incoming
leaf node connections.

Default value: `0.0.0.0`

#### [`port`](/ref/config/leafnodes/port/index.md)

Port the server will listen for incoming leaf node
connections.

Default value: `7422`

#### [`listen`](/ref/config/leafnodes/listen/index.md)

This is an alternate to setting the `host` and `port` separately.

#### [`tls`](/ref/config/leafnodes/tls/index.md)

TLS configuration for securing leaf node connections.

#### [`advertise`](/ref/config/leafnodes/advertise/index.md)

Hostport to advertise how this sever be contacted
by leaf nodes. This is useful for setups with a NAT.

#### [`no_advertise`](/ref/config/leafnodes/no_advertise/index.md)

If true, the server will not be advertised to leaf nodes.

Default value: `false`

#### [`authorization`](/ref/config/leafnodes/authorization/index.md)

Authorization scoped to accepting leaf node connections.

#### [`min_version`](/ref/config/leafnodes/min_version/index.md)

The minimum server version required of the connecting
leaf node. This must be at least version `2.8.0`.

### Outgoing Connections

A server that has been configured to *connect* to another
server configured to accept leaf node connections. In a
hub-and-spoke topology, this would be the *spoke*, typically
in a remote location or on an edge device.

#### [`remotes`](/ref/config/leafnodes/remotes/index.md)

List of entries specifiying servers where the leaf
node client connection can be made.

#### [`reconnect`](/ref/config/leafnodes/reconnect/index.md)

Interval in seconds at which reconnect attempts to a
remote server are made.

