# leafnodes

Configuration for setting up leaf node connections.

*Aliases*

- `leaf`


## Properties

### Incoming Connections

#### [`host`](host/README.md)

Host name the server will listen on for incoming
leaf node connections.

Default value: `0.0.0.0`

#### [`port`](port/README.md)

Port the server will listen for incoming leaf node
connections.

Default value: `7422`

#### [`listen`](listen/README.md)

This is an alternate to setting the `host` and `port` separately.

#### [`tls`](tls/README.md)

TLS configuration for securing leaf node connections.

#### [`advertise`](advertise/README.md)

Hostport to advertise how this sever be contacted
by leaf nodes. This is useful for setups with a NAT.

#### [`no_advertise`](no_advertise/README.md)

If true, the server will not be advertised to leaf nodes.

Default value: `false`

#### [`authorization`](authorization/README.md)

Authorization scoped to accepting leaf node connections.

#### [`min_version`](min_version/README.md)

The minimum server version required of the connecting
leaf node. This must be at least version `2.8.0`.

### Outgoing Connections

#### [`remotes`](remotes/README.md)

List of entries specifiying servers where the leaf
node client connection can be made.

#### [`reconnect`](reconnect/README.md)

Interval in seconds at which reconnect attempts to a
remote server are made.

