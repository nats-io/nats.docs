# Clustering

Clustering in Jetstream is required for a highly available and scalable system.  Behind
clustering is RAFT.  There's no need to understand RAFT in depth to use clustering, but knowing a little explains some of the requirements behind setting up Jetstream clusters.

## RAFT
JetStream uses a NATS optimized RAFT algorithm for clustering.  Typically raft generates a lot of traffic, but the NATS server optimizes this by combining the data plane for replicating messages with the messages RAFT would normally use to ensure consensus.

### Raft groups
The RAFT groups include API handlers sstreams, consumers, and an internal algorithm designates which servers handle which streams and consumers.

The raft algorithm has a few requirements:
- A log to persist state
- A quorum for consensus. 

### The Quorum
In order to ensure data consistency across complete restarts, a quorum of servers is required.  A quorum is ½ cluster size + 1.  This is the minimum number of nodes to ensure at least one node has the most recent data and state after a catastrophic failure.  So for a cluster size of 3, you’ll need at least two Jetstream enabled NATS servers available to store new messages. For a cluster size of 5, you’ll need at least 3 NATS servers, and so forth.

### Cluster Size
Generally we recommend 3 or 5 Jetstream enabled servers in a NATS cluster.  This balances scalability with a tolerance for failure.  For example, if 5 servers are Jetstream enabled You would want two servers is one “zone”, two servers in another, and the remaining server in a third.  This means you can lose any one “zone” at any time and continue operating.

### Mixing Jetstream enabled servers with standard NATS servers

This is possible, and even recommended in some cases.  By mixing server types you can dedicate certain machines optimized for storage for Jetstream and others optimized solely for compute for standard NATS servers, reducing operational expense.  With the right configuration, the standard servers would handle non-persistent NATS traffic and the Jetstream enabled servers would handle Jetstream traffic.  

## Configuration

To configure Jetstream clusters, just configure clusters as you normally would by specifying a cluster block in the configuration.  Any Jetstream enabled servers in the list of clusters will automatically chatter and set themselves up.  Unlike core NATS clustering though, each Jetstream node must specify a server name and cluster name.

Below are explicity listed server configuration for a three node cluster across three machinges, `host_a`, `host_b`, and `host_c`.

### Server 1 (host_a)

```text
server_name=server1
listen=4222

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: c1
  listen: localhost:6222
  routes: [
    nats-route://host_b:6222
    nats-route://host_c:6222
  ]
}
```

### Server 2 (host_b)

```text
server_name=server2
listen=4222

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: c1
  listen: localhost:6222
  routes: [
    nats-route://host_a:6222
    nats-route://host_c:6222
  ]
}
```

### Server 3 (host_c)

```text
server_name=server3
listen=4222

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: c1
  listen: localhost:6222
  routes: [
    nats-route://host_a:6222
    nats-route://host_b:6222
  ]
}
```

Choose a data directory that makes sense for your environment, ideally a fast SDD, and launch each server.  After two servers are running you'll be ready to use Jetstream.