# Websocket Support

*Supported since NATS Server version 2.2*

Websocket support can be enabled in the server and may be used alongside the
traditional TCP socket connections.  TLS, compression and
Origin Header checking are supported.

To enable websocket support in the server, add a `websockets` configuration
block in the server's configuration file like the following:

```
websocket {
    # Specify a host and port to listen for websocket connections
    # listen: "host:port"

    # It can also be configured with individual parameters,
    # namely host and port.
    # host: "hostname"
    # port: 4443

    # This will optionally specify what host:port for websocket
    # connections to be advertised in the cluster
    # advertise: "host:port"

    # TLS configuration is required
    tls {
      cert_file: "/path/to/cert.pem"
      key_file: "/path/to/key.pem"
    }

    # If same_origin is true, then the Origin header of the
    # client request must match the request's Host.
    # same_origin: true

    # This list specifies the only accepted values for
    # the client's request Origin header. The scheme,
    # host and port must match. By convention, the
    # absence of port for an http:// scheme will be 80,
    # and for https:// will be 443.
    # allowed_origins [
    #    "http://www.example.com"
    #    "https://www.other-example.com"
    # ]

    # This enables support for compressed websocket frames
    # in the server. For compression to be used, both server
    # and client have to support it.
    # compression: true

    # This is the total time allowed for the server to
    # read the client request and write the response back
    # to the client. This includes the time needed for the
    # TLS handshake.
    # handshake_timeout: "2s"
}
```

Leaf nodes support outbound websocket connections by specifying the `ws` as the
scheme component of the remote server URL, for example `ws://hostname:4443`.
