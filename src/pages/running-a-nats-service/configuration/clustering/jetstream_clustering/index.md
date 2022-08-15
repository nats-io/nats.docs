# Clustering

Clustering in JetStream is required for a highly available and scalable system. Behind clustering is RAFT. There's no need to understand RAFT in depth to use clustering, but knowing a little explains some of the requirements behind setting up JetStream clusters.

## RAFT

JetStream uses a NATS optimized RAFT algorithm for clustering. Typically RAFT generates a lot of traffic, but the NATS server optimizes this by combining the data plane for replicating messages with the messages RAFT would normally use to ensure consensus. Each server participating requires an unique `server_name` \(only applies within the same domain\).

### RAFT Groups

The RAFT groups include API handlers, streams, consumers, and an internal algorithm designates which servers handle which streams and consumers.

The RAFT algorithm has a few requirements:

* A log to persist state
* A quorum for consensus

### The Quorum

In order to ensure data consistency across complete restarts, a quorum of servers is required. A quorum is ½ cluster size + 1. This is the minimum number of nodes to ensure at least one node has the most recent data and state after a catastrophic failure. So for a cluster size of 3, you’ll need at least two JetStream enabled NATS servers available to store new messages. For a cluster size of 5, you’ll need at least 3 NATS servers, and so forth.

### RAFT Groups

**Meta Group** - all servers join the Meta Group and the JetStream API is managed by this group. A leader is elected and this owns the API and takes care of server placement.

![Meta Group](../../../../.gitbook/assets/meta-group.png)

**Stream Group** - each Stream creates a RAFT group, this group synchronizes state and data between its members. The elected leader handles ACKs and so forth, if there is no leader the stream will not accept messages.

![Stream Groups](../../../../.gitbook/assets/stream-groups.png)

**Consumer Group** - each Consumer creates a RAFT group, this group synchronizes consumer state between its members. The group will live on the machines where the Stream Group is and handle consumption ACKs etc. Each Consumer will have their own group.

![Consumer Groups](../../../../.gitbook/assets/consumer-groups.png)

### Cluster Size

Generally, we recommend 3 or 5 JetStream enabled servers in a NATS cluster. This balances scalability with a tolerance for failure. For example, if 5 servers are JetStream enabled You would want two servers is one “zone”, two servers in another, and the remaining server in a third. This means you can lose any one “zone” at any time and continue operating.

### Mixing JetStream enabled servers with standard NATS servers

This is possible and even recommended in some cases. By mixing server types you can dedicate certain machines optimized for storage for Jetstream and others optimized solely for compute for standard NATS servers, reducing operational expense. With the right configuration, the standard servers would handle non-persistent NATS traffic and the JetStream enabled servers would handle JetStream traffic.

## Configuration

To configure JetStream clusters, just configure clusters as you normally would by specifying a cluster block in the configuration. Any JetStream enabled servers in the list of clusters will automatically chatter and set themselves up. Unlike core NATS clustering though, each JetStream node **must specify** a server name and cluster name.

Below are explicitly listed server configuration for a three-node cluster across three machines, `n1-c1`, `n2-c1`, and `n3-c1`.

### Server 1 \(host_a\)

```text
server_name=n1-c1
listen=4222

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: C1
  listen: localhost:6222
  routes: [
    nats-route://host_b:6222
    nats-route://host_c:6222
  ]
}
```

### Server 2 \(host_b\)

```text
server_name=n2-c1
listen=4222

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: C1
  listen: localhost:6222
  routes: [
    nats-route://host_a:6222
    nats-route://host_c:6222
  ]
}
```

### Server 3 \(host_c\)

```text
server_name=n3-c1
listen=4222

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: C1
  listen: localhost:6222
  routes: [
    nats-route://host_a:6222
    nats-route://host_b:6222
  ]
}
```

Add nodes as necessary. Choose a data directory that makes sense for your environment, ideally a fast SSD, and launch each server. After two servers are running you'll be ready to use JetStream.

