# Auto Configuration

We can also bootstrap a NATS Streaming cluster by starting **one server** as the seed node using the `-cluster_bootstrap` flag. This node will elect itself leader, **so it's important to avoid starting multiple servers as seed**. Once a seed node is started, other servers will automatically join the cluster. If the server is recovering, it will use the recovered cluster configuration.

Here is an example of starting three servers in a cluster by starting one as the seed and letting the others automatically join:

```text
nats-streaming-server -store file -dir store-a -clustered -cluster_bootstrap -nats_server nats://localhost:4222

nats-streaming-server -store file -dir store-b -clustered -nats_server nats://localhost:4222

nats-streaming-server -store file -dir store-c -clustered -nats_server nats://localhost:4222
```

For a given cluster ID, if more than one server is started with `cluster_bootstrap` set to true, each server with this parameter will report the misconfiguration and exit.

The very first server that bootstrapped the cluster can be restarted, however, the operator **must remove the datastores** of the other servers that were incorrectly started with the bootstrap parameter before attempting to restart them. If they are restarted with existing state, even without the `-cluster_bootstrap` parameter, they will once again start as a leader.

