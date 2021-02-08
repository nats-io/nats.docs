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
    port: 443

    # This will optionally specify what host:port for websocket
    # connections to be advertised in the cluster
    # advertise: "host:port"

    # TLS configuration is required by default
    tls {
      cert_file: "/path/to/cert.pem"
      key_file: "/path/to/key.pem"
    }

    # For test environments, you can disable the need for TLS
    # by explicitly setting this option to `true`
    # no_tls: true

    # If same_origin is true, then the Origin header of the
    # client request must match the request's Host.
    # same_origin: true

    # This list specifies the only accepted values for
    # the client's request Origin header. The scheme,
    # host and port must match. By convention, the
    # absence of TCP port in the URL will be port 80
    # for an "http://" scheme, and 443 for "https://".
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

    # Name of the cookie, which if present in WebSocket upgrade headers,
    # will be treated as the JWT during CONNECT phase as long as
    # the "jwt" field specified in the CONNECT protocol is missing or empty.
    # Note that the server needs to be running in operator mode for this
    # option to be used.
    # jwt_cookie: "my_jwt_cookie_name"

    # If no user name is provided when a websocket client connects, will default
    # this user name in the authentication phase. If specified, this will
    # override, for websocket clients, any `no_auth_user` value defined in the
    # main configuration file.
    # Note that this is not compatible with running the server in operator mode.
    # no_auth_user: "my_username_for_apps_not_providing_credentials"

    # See below to know what is the normal way of limiting websocket clients
    # to specific users.
    # If there are no users specified in the configuration, this simple authorization
    # block allows you to override the values that would be configured in the
    # equivalent block in the main section.
    # authorization {
    #     # If this is specified, the client has to provide the same username
    #     # and password to be able to connect.
    #     # username: "my_user_name"
    #     # password: "my_password"
    #
    #     # If this is specified, the password field in the CONNECT has to
    #     # match this token.
    #     # token: "my_token"
    #
    #     # This overrides the main's authorization timeout. For consistency
    #     # with the main's authorization configuration block, this is expressed
    #     # as a number of seconds.
    #     # timeout: 2.0
    #}
}
```

## Authorization of Websocket Users

A new field when configuring users allows you to restrict which type of connections are allowed for a specific user.

Consider this configuration:

```
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}}
  ]
}
```

If a websocket client were to connect and use the username `foo` and password `foopwd`, it would be accepted.
Now suppose that you would want websocket client to only be accepted if it connected using the username `bar`
and password `barpwd`, then you would use the option `allowed_connection_types` to restrict which type
of connections can bind to this user.

```
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}, allowed_connection_types: ["WEBSOCKET"]}
  ]
}
```

The option `allowed_connection_types` (also can be named `connection_types` or `clients`) as you can see
is a list, and you can allow several type of clients. Suppose you want the user `bar` to accept both
standard NATS clients and websocket clients, you would configure the user like this:

```
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}, allowed_connection_types: ["STANDARD", "WEBSOCKET"]}
  ]
}
```

The absence of `allowed_connection_types` means that all type of connections are allowed (the default behavior).

The possible values are currently:
* `STANDARD`
* `WEBSOCKET`
* `LEAFNODE`
* `MQTT`

## Leaf nodes connections

You can configure remote Leaf node connections so that they connect to the Websocket port instead of the Leaf node port.
See [Leafnode](leafnodes/leafnode_conf.md#connecting-using-websocket-protocol) section.
