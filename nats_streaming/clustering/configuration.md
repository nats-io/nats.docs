# Configuration

We can bootstrap a NATS Streaming cluster by providing the cluster topology using the `-cluster_peers` flag. This is simply the set of node IDs participating in the cluster. Note that once a leader is established, we can start subsequent servers without providing this configuration as they will automatically join the leader. If the server is recovering, it will use the recovered cluster configuration.

Here is an example of starting three servers in a cluster. For this example, we run a separate NATS server which the Streaming servers connect to.

```
nats-streaming-server -store file -dir store-a -clustered -cluster_node_id a -cluster_peers b,c -nats_server nats://localhost:4222

nats-streaming-server -store file -dir store-b -clustered -cluster_node_id b -cluster_peers a,c -nats_server nats://localhost:4222

nats-streaming-server -store file -dir store-c -clustered -cluster_node_id c -cluster_peers a,b -nats_server nats://localhost:4222
```

Note that once a leader is elected, subsequent servers can be started without providing the cluster configuration. They will automatically join the cluster. Similarly, the cluster node ID does not need to be provided as one will be automatically assigned. As long as the file store is used, this ID will be recovered on restart.

```
nats-streaming-server -store file -dir store-d -clustered -nats_server nats://localhost:4222
```

The equivalent clustering configurations can be specified in a configuration file under the `cluster` group. See the [Configuring](#configuring) section for more information.

Here is an example of a cluster of 3 nodes using the following configuration files. The nodes are running on `host1`, `host2` and `host3` respectively.

<b>NOTE</b> If you have an existing NATS cluster and want to run NATS Streaming Cluster on top of that, see details at the end of this section.

On `host1`, this configuration indicates that the server will accept client connections on port 4222. It will accept route connections on port 6222. It creates 2 routes, to `host2` and `host3` cluster port.

It defines the NATS Streaming cluster name as `mycluster`, uses a store file that points to the `store` directory. The `cluster` section inside `streaming` makes the NATS Streaming server run in cluster mode. This configuration explicitly define each node id (`a` for `host1`) and list its peers.
```
# NATS specific configuration
port: 4222
cluster {
  listen: 0.0.0.0:6222
  routes: ["nats://host2:6222", "nats://host3:6222"]
}

# NATS Streaming specific configuration
streaming {
  id: mycluster
  store: file
  dir: store
  cluster {
    node_id: "a"
    peers: ["b", "c"]
  }
}
```

Below is the configuration for the server running on `host2`. Notice how the routes are now to `host1` and `host3`. The other thing that changed is the node id that is set to `b` and peers are updated accordingly to `a` and `c`.

Note that the `dir` configuration is also `store` but these are local directories and do not (actually must not) be shared. Each node will have its own copy of the datastore. You could have each configuration have a different value for `dir` if desired.
```
# NATS specific configuration
port: 4222
cluster {
  listen: 0.0.0.0:6222
  routes: ["nats://host1:6222", "nats://host3:6222"]
}

# NATS Streaming specific configuration
streaming {
  id: mycluster
  store: file
  dir: store
  cluster {
    node_id: "b"
    peers: ["a", "c"]
  }
}
```

As you would expect, for `host3`, the routes are now to `host1` and `host2` and the node id is `c` while its peers
are `a` and `b`.
```
# NATS specific configuration
port: 4222
cluster {
  listen: 0.0.0.0:6222
  routes: ["nats://host1:6222", "nats://host2:6222"]
}

# NATS Streaming specific configuration
streaming {
  id: mycluster
  store: file
  dir: store
  cluster {
    node_id: "c"
    peers: ["a", "b"]
  }
}
```

In the example above, the configuration assumes no existing NATS Cluster and therefore configure the NATS routes between each node. Should you want to use an existing NATS cluster, do not include the "NATS specific configuration" section, instead, add `nats_server_url` in the `streaming` section to point to the NATS server you want.