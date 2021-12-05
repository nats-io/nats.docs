# Configuration

## `leafnodes` Configuration Block

The leaf node configuration block is used to configure incoming as well as outgoing leaf node connections. Most properties are for the configuration of incoming connections. The properties `remotes` and `reconnect` are for outgoing connections.

| Property        | Description                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`          | Interface where the server will listen for incoming leafnode connections.                                                                   |
| `port`          | Port where the server will listen for incoming leafnode connections (default is 7422).                                                      |
| `listen`        | Combines `host` and `port` as `<host>:<port>`                                                                                               |
| `tls`           | TLS configuration block (same as other nats-server [`tls` configuration](/running-a-nats-service/configuration/securing_nats/tls.md)).                                                |
| `advertise`     | Hostport `<host>:<port>` to advertise how this server can be contacted by leaf nodes. This is useful in cluster setups with NAT.            |
| `no_advertise`  | if `true` the server shouldn't be advertised to leaf nodes.                                                                                 |
| `authorization` | Authorization block. [**See Authorization Block section below**](leafnode_conf.md#authorization-block).                                    |
| `remotes`       | List of [`remote`](leafnode_conf.md#leafnode-remotes-entry-block) entries specifying servers where leafnode client connection can be made. |
| `reconnect`     | Interval in seconds at which reconnect attempts to a remote server are made.                                                                |

## Authorization Block

| Property   | Description                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `user`     | Username for the leaf node  connection.                                                                                               |
| `password` | Password for the user entry.                                                                                                          |
| `account`  | [Account](../securing_nats/accounts.md) this leaf node connection should be bound to.                                                |
| `timeout`  | Maximum number of seconds to wait for leaf node  authentication.                                                                      |
| `users`    | List of credentials and account to bind to leaf node  connections. [**See User Block section below**](leafnode_conf.md#users-block). |

### Users Block

| Property   | Description                                                                            |
| ---------- | -------------------------------------------------------------------------------------- |
| `user`     | Username for the leaf node connection.                                                 |
| `password` | Password for the user entry.                                                           |
| `account`  | [Account](../securing_nats/accounts.md) this leaf node connection should be bound to. |

Here are some examples of using basic user/password authentication for leaf nodes (note while this is using accounts it is not using JWTs)

Singleton mode:

```
leafnodes {
  port: ...
  authorization {
    user: leaf
    password: secret
    account: TheAccount
  }
}
```

With above configuration, if a soliciting server creates a Leafnode connection with url: `nats://leaf:secret@host:port`, then the accepting server will bind the leafnode connection to the account "TheAccount". This account need to exist otherwise the connection will be rejected.

Multi-users mode:

```
leafnodes {
  port: ...
  authorization {
    users = [
      {user: leaf1, password: secret, account: account1}
      {user: leaf2, password: secret, account: account2}
    ]
  }
}
```

With the above, if a server connects using `leaf1:secret@host:port`, then the accepting server will bind the connection to account `account1`. If using `leaf2` user, then the accepting server will bind to connection to `account2`.

If username/password (either singleton or multi-users) is defined, then the connecting server MUST provide the proper credentials otherwise the connection will be rejected.

If no username/password is provided, it is still possible to provide the account the connection should be associated with:

```
leafnodes {
  port: ...
  authorization {
    account: TheAccount
  }
}
```

With the above, a connection without credentials will be bound to the account "TheAccount".

If other form of credentials are used (jwt, nkey or other), then the server will attempt to authenticate and if successful associate to the account for that specific user. If the user authentication fails (wrong password, no such user, etc..) the connection will be also rejected.

## LeafNode `remotes` Entry Block

| Property         | Description                                                                                                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | Leafnode URL (URL protocol should be `nats-leaf`).                                                                                                                                                                                                                         |
| `urls`           | Leafnode URL array. Supports multiple URLs for discovery, e.g., urls: \[ "nats-leaf://host1:7422", "nats-leaf://host2:7422" ]                                                                                                                                              |
| `account`        | [Account](../securing_nats/accounts.md) name or JWT public key identifying the local account to bind to this remote server. Any traffic locally on this account will be forwarded to the remote server.                                                                   |
| `credentials`    | Credential file for connecting to the leafnode server.                                                                                                                                                                                                                     |
| `tls`            | A [TLS configuration](leafnode_conf.md#tls-configuration-block) block. Leafnode client will use specified TLS certificates when connecting/authenticating.                                                                                                                |
| `ws_compression` | If connecting with [Websocket](leafnode_conf.md#connecting-using-websocket-protocol) protocol, this boolean (`true` or `false`) indicates to the remote server that it wishes to use compression. The default is `false`.                                                 |
| `ws_no_masking`  | If connecting with [Websocket](leafnode_conf.md#connecting-using-websocket-protocol) protocol, this boolean indicates to the remote server that it wishes not to mask outbound WebSocket frames. The default is `false`, which means that outbound frames will be masked. |

### Connecting using WebSocket protocol

Since NATS 2.2.0, Leaf nodes support outbound WebSocket connections by specifying `ws` as the scheme component of the remote server URLs:

```
leafnodes {
  remotes [
    {urls: ["ws://hostname1:443", "ws://hostname2:443"]}
  ]
}
```

Note that if a URL has the `ws` scheme, all URLs the list must be `ws`. You cannot mix and match. Therefore this would be considered an invalid configuration:

```
  remotes [
    # Invalid configuration that will prevent the server from starting
    {urls: ["ws://hostname1:443", "nats-leaf://hostname2:7422"]}
  ]
```

Note that the decision to make a TLS connection is not based on `wss://` (as opposed to `ws://`) but instead in the presence of a TLS configuration in the `leafnodes{}` or the specific remote configuration block.

To configure Websocket in the remote server, check the [Websocket](../websocket/) section.

### `tls` Configuration Block

| Property            | Description                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `cert_file`         | TLS certificate file.                                                                                                      |
| `key_file`          | TLS certificate key file.                                                                                                  |
| `ca_file`           | TLS certificate authority file.                                                                                            |
| `insecure`          | Skip certificate verification.                                                                                             |
| `verify`            | If `true`, require and verify client certificates.                                                                         |
| `verify_and_map`    | If `true`, require and verify client certificates and use values map certificate values for authentication purposes.       |
| `cipher_suites`     | When set, only the specified TLS cipher suites will be allowed. Values must match golang version used to build the server. |
| `curve_preferences` | List of TLS cypher curves to use in order.                                                                                 |
| `timeout`           | TLS handshake timeout in fractional seconds.                                                                               |
