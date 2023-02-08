# leafnodes

/ [config](/reference/config/index.md) 

Configuration for setting up leaf node connections.

*Aliases*
- `leaf`

## Properties

**Incoming Connections**

### [`host`](/reference/config/host/index.md)

Host name the server will listen on for incoming
leaf node connections.

Default value: `0.0.0.0`

### [`port`](/reference/config/port/index.md)

Port the server will listen for incoming leaf node
connections.

Default value: `7422`

### [`listen`](/reference/config/listen/index.md)

This is an alternate to setting the `host` and `port` separately.

### [`tls`](/reference/config/tls/index.md)

TLS configuration for securing leaf node connections.

### [`advertise`](/reference/config/advertise/index.md)

Hostport to advertise how this sever be contacted
by leaf nodes. This is useful for setups with a NAT.

### [`no_advertise`](/reference/config/no_advertise/index.md)

If true, the server will not be advertised to leaf nodes.

Default value: `false`

### [`authorization`](/reference/config/authorization/index.md)

Authorization scoped to accepting leaf node connections.

### [`min_version`](/reference/config/min_version/index.md)

The minimum server version required of the connecting
leaf node. This must be at least version `2.8.0`.

**Outgoing Connections**

### [`remotes`](/reference/config/remotes/index.md)

List of entries specifiying servers where the leaf
node client connection can be made.

### [`reconnect`](/reference/config/reconnect/index.md)

Interval in seconds at which reconnect attempts to a
remote server are made.

