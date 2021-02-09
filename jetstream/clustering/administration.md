# Cluster Administration

Once a JetStream cluster is operating interactions with the CLI and with `nats` CLI is the same as before.  For these examples, lets assume we have a 5 server cluster, n1-n5 in a cluster named C1. 

## Creating clustered streams

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

## Forcing Stream and Consumer leader election

Every RAFT group has a leader that's elected by the group when needed. Generally there is no reason to interfere with this process, but you might want to trigger a leader change at a convenient time.  Leader elections will represent short interruptions to the stream so if you know you will work on a node later it might be worth moving leadership away from it ahead of time.

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

The same is true for consumers, `nats consumer cluster step-down ORDERS NEW`.

#### Forcing Meta Group leader election

Similar to Streams and Consumers above the Meta Group allows leader stand down. The Meta Group is cluster wide and spans all accounts, therefore to manage the meta group you have to use a `SYSTEM` user.

```nohighlight
$ nats server raft step-down --user system
17:44:24 Current leader: n2-c2
17:44:24 New leader: n1-c2
```

## Evicting a peer

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

