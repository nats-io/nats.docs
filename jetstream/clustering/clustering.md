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

### RAFT Groups

**Meta Group** - all servers join the Meta Group and the JetStream API is managed by this group. A leader is elected and this owns the API and takes care of server placement.

![](images/meta-group.png) FIXME

**Stream Group** - each Stream creates a RAFT group, this group synchronizes state and data between its members. The elected leader handles ACKs and so forth, if there is no leader the stream will not accept messages.

![](images/stream-groups.png) FIXME

**Consumer Group** - each Consumer creates a RAFT group, this group synchronizes consumer state between its members. The group will live on the machines where the Stream Group is and handle consumption ACKs etc.  Each Consumer will have its own group.

![](images/consumer-groups.png) FIXME

### Cluster Size
Generally we recommend 3 or 5 Jetstream enabled servers in a NATS cluster.  This balances scalability with a tolerance for failure.  For example, if 5 servers are Jetstream enabled You would want two servers is one “zone”, two servers in another, and the remaining server in a third.  This means you can lose any one “zone” at any time and continue operating.

### Mixing Jetstream enabled servers with standard NATS servers

This is possible, and even recommended in some cases.  By mixing server types you can dedicate certain machines optimized for storage for Jetstream and others optimized solely for compute for standard NATS servers, reducing operational expense.  With the right configuration, the standard servers would handle non-persistent NATS traffic and the Jetstream enabled servers would handle Jetstream traffic.  

## Configuration

To configure Jetstream clusters, just configure clusters as you normally would by specifying a cluster block in the configuration.  Any Jetstream enabled servers in the list of clusters will automatically chatter and set themselves up.  Unlike core NATS clustering though, each Jetstream node **must specify** a server name and cluster name.

Below are explicity listed server configuration for a three node cluster across three machines, `n1-c1`, `n2-c1`, and `n3-c1`.

### Server 1 (host_a)

```nohighlight
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

### Server 2 (host_b)

```nohighlight
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

### Server 3 (host_c)

```nohighlight
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

Add nodes as necessary.  Choose a data directory that makes sense for your environment, ideally a fast SDD, and launch each server.  After two servers are running you'll be ready to use Jetstream.

## Administration

Once a JetStream cluster is operating interactions with the CLI and with `nats` CLI is the same as before.  For these examples, lets assume we have a 5 server cluster, n1-n5 in a cluster named C1. 

### Creating clustered streams

When adding a stream using the `nats` CLI the number of replicas will be asked, when you choose a number more than 1, (we suggest 1, 3 or 5), the data will be stored o multiple nodes in your cluster using the RAFT protocol as above.

```nohighlight
$ nats str add ORDERS --replicas 3
....
Information for Stream ORDERS_4 created 2021-02-05T12:07:34+01:00
....
Configuration:
....
             Replicas: 3
             
Cluster Information:

                 Name: C1
               Leader: n1-c1
              Replica: n4-c1, current, seen 0.07s ago
              Replica: n3-c1, current, seen 0.07s ago

```

Above you can see that the cluster information will be reported in all cases where Stream info is shown such as after add or using `nats stream info`.

Here we have a stream in the NATS cluster `C1`, its current leader is a node `n1-c1` and it has 2 followers - `n4-c1` and `n3-c1`.

The `current` indicates that followers are up to date and have all the messages, here both cluster peers were seen very recently.

The replica count cannot be edited once configured.

### Forcing leader election

Every RAFT group has a leader that's elected by the group when needed. Generally there is no reason to interfere with this process but you might want to trigger a leader change at a convenient time.  Leader elections will represent short interruptions to the stream so if you know you will work on a node later it might be worth moving leadership away from it ahead of time.

Moving leadership away from a node does not remove it from the cluster and does not prevent it from becoming a leader again, this is merely a triggered leader election.

```nohighlight
$ nats stream cluster step-down ORDERS
14:32:17 Requesting leader step down of "n1-c1" in a 3 peer RAFT group
14:32:18 New leader elected "n4-c1"

Information for Stream ORDERS created 2021-02-05T12:07:34+01:00
...
Cluster Information:

                 Name: c1
               Leader: n4-c1
              Replica: n1-c1, current, seen 0.12s ago
              Replica: n3-c1, current, seen 0.12s ago
```

### Evicting a peer

Generally when shutting down NATS, including using Lame Duck Mode, the cluster will notice this and continue to function. A 5 node cluster can withstand 2 nodes being down.

There might be a case though where you know a machine will never return, and you want to signal to JetStream that the machine will not return.  This will remove it from the Stream in question and all it's Consumers.

After the node is removed the cluster will notice that the replica count is not honored anymore and will immediately pick a new node and start replicating data to it.  The new node will be selected using the same placement rules as the existing stream.

```nohighlight
$ nats s cluster peer-remove ORDERS
? Select a Peer n4-c1
14:38:50 Removing peer "n4-c1"
14:38:50 Requested removal of peer "n4-c1"
```

At this point the stream and all consumers will have removed `n4-c1` from the group, they will all start new peer selection and data replication.

```nohighlight
$ nats stream info ORDERS
....
Cluster Information:

                 Name: c1
               Leader: n3-c1
              Replica: n1-c1, current, seen 0.02s ago
              Replica: n2-c1, outdated, seen 0.42s ago
```

We can see a new replica was picked, the stream is back to replication level of 3 and `n4-c1` is not active any more in this Stream or any of its Consumers.

