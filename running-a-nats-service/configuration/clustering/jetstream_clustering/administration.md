# Administration

Once a JetStream cluster is operating interactions with the CLI and with `nats` CLI is the same as before. For these examples, lets assume we have a 5 server cluster, n1-n5 in a cluster named C1.

## Account Level

Within an account there are operations and reports that show where users data is placed and which allow them some basic interactions with the RAFT system.

## Creating clustered streams

When adding a stream using the `nats` CLI the number of replicas will be asked, when you choose a number more than 1, \(we suggest 1, 3 or 5\), the data will be stored on multiple nodes in your cluster using the RAFT protocol as above.

```shell
nats str add ORDERS --replicas 3
```
Example output extract:
```text
....
Information for Stream ORDERS created 2021-02-05T12:07:34+01:00
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

### Viewing Stream Placement and Stats

Users can get overall statistics about their streams and also where these streams are placed:

```shell
nats stream report
```
Example output
```text
Obtaining Stream stats
+----------+-----------+----------+--------+---------+------+---------+----------------------+
| Stream   | Consumers | Messages | Bytes  | Storage | Lost | Deleted | Cluster              |
+----------+-----------+----------+--------+---------+------+---------+----------------------+
| ORDERS   | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1*, n2-c1, n3-c1 |
| ORDERS_3 | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1*, n2-c1, n3-c1 |
| ORDERS_4 | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1*, n2-c1, n3-c1 |
| ORDERS_5 | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1, n2-c1, n3-c1* |
| ORDERS_2 | 4         | 1,385    | 13 MiB | File    | 0    | 1       | n1-c1, n2-c1, n3-c1* |
| ORDERS_0 | 4         | 1,561    | 14 MiB | File    | 0    | 0       | n1-c1, n2-c1*, n3-c1 |
+----------+-----------+----------+--------+---------+------+---------+----------------------+
```

#### Forcing Stream and Consumer leader election

Every RAFT group has a leader that's elected by the group when needed. Generally there is no reason to interfere with this process, but you might want to trigger a leader change at a convenient time. Leader elections will represent short interruptions to the stream so if you know you will work on a node later it might be worth moving leadership away from it ahead of time.

Moving leadership away from a node does not remove it from the cluster and does not prevent it from becoming a leader again, this is merely a triggered leader election.

```shell
nats stream cluster step-down ORDERS
```
Example output
```text
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

## System Level

Systems users can view state of the Meta Group - but not individual Stream or Consumers.

### Viewing the cluster state

We have a high level report of cluster state:

```shell
nats server report jetstream --user system
```
Example output
```text
+--------------------------------------------------------------------------------------------------+
|                                        JetStream Summary                                         |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
| Server | Cluster | Streams | Consumers | Messages | Bytes  | Memory | File   | API Req | API Err |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
| n3-c2  | c2      | 0       | 0         | 0        | 0 B    | 0 B    | 0 B    | 1       | 0       |
| n3-c1  | c1      | 6       | 24        | 2,946    | 27 MiB | 0 B    | 27 MiB | 3       | 0       |
| n2-c2  | c2      | 0       | 0         | 0        | 0 B    | 0 B    | 0 B    | 3       | 0       |
| n1-c2  | c2      | 0       | 0         | 0        | 0 B    | 0 B    | 0 B    | 14      | 2       |
| n2-c1  | c1      | 6       | 24        | 2,946    | 27 MiB | 0 B    | 27 MiB | 15      | 0       |
| n1-c1* | c1      | 6       | 24        | 2,946    | 27 MiB | 0 B    | 27 MiB | 31      | 0       |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
|        |         | 18      | 72        | 8,838    | 80 MiB | 0 B    | 80 MiB | 67      | 2       |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
+---------------------------------------------------+
|            RAFT Meta Group Information            |
+-------+--------+---------+---------+--------+-----+
| Name  | Leader | Current | Offline | Active | Lag |
+-------+--------+---------+---------+--------+-----+
| n1-c1 | yes    | true    | false   | 0.00s  | 0   |
| n1-c2 |        | true    | false   | 0.05s  | 0   |
| n2-c1 |        | true    | false   | 0.05s  | 0   |
| n2-c2 |        | true    | false   | 0.05s  | 0   |
| n3-c1 |        | true    | false   | 0.05s  | 0   |
| n3-c2 |        | true    | false   | 0.05s  | 0   |
+-------+--------+---------+---------+--------+-----+
```

This is a full cluster wide report, the report can be limited to a specific account using `--account`.

Here we see the distribution of streams, messages, api calls etc by across 2 super clusters and an overview of the RAFT meta group.

In the Meta Group report the server `n2-c1` is not current and has not been seen for 9 seconds, it's also behind by 2 raft operations.

This report is built using raw data that can be obtained from the monitor port on the `/jsz` url, or over nats using:

```shell
nats server req jetstream --help
```
Output
```text
usage: nats server request jetstream [<flags>] [<wait>]

Show JetStream details

Flags:
  -h, --help                    Show context-sensitive help (also try --help-long and --help-man).
      --version                 Show application version.
  -s, --server=NATS_URL         NATS server urls
      --user=NATS_USER          Username or Token
      --password=NATS_PASSWORD  Password
      --creds=NATS_CREDS        User credentials
      --nkey=NATS_NKEY          User NKEY
      --tlscert=NATS_CERT       TLS public certificate
      --tlskey=NATS_KEY         TLS private key
      --tlsca=NATS_CA           TLS certificate authority chain
      --timeout=NATS_TIMEOUT    Time to wait on responses from NATS
      --js-api-prefix=PREFIX    Subject prefix for access to JetStream API
      --js-event-prefix=PREFIX  Subject prefix for access to JetStream Advisories
      --js-domain=DOMAIN        JetStream domain to access
      --context=CONTEXT         Configuration context
      --trace                   Trace API interactions
      --limit=2048              Limit the responses to a certain amount of records
      --offset=0                Start at a certain record
      --name=NAME               Limit to servers matching a server name
      --host=HOST               Limit to servers matching a server host name
      --cluster=CLUSTER         Limit to servers matching a cluster name
      --tags=TAGS ...           Limit to servers with these configured tags
      --account=ACCOUNT         Show statistics scoped to a specific account
      --accounts                Include details about accounts
      --streams                 Include details about Streams
      --consumer                Include details about Consumers
      --config                  Include details about configuration
      --leader                  Request a response from the Meta-group leader only
      --all                     Include accounts, streams, consumers and configuration

Args:
  [<wait>]  Wait for a certain number of responses
```

```shell
nats server req jetstream --leader
```

This will produce a wealth of raw information about the current state of your cluster - here requesting it from the leader only.

#### Forcing Meta Group leader election

Similar to Streams and Consumers above the Meta Group allows leader stand down. The Meta Group is cluster wide and spans all accounts, therefore to manage the meta group you have to use a `SYSTEM` user.

```shell
nats server raft step-down --user system
```
Example output
```text
17:44:24 Current leader: n2-c2
17:44:24 New leader: n1-c2
```

### Evicting a peer

Generally when shutting down NATS, including using Lame Duck Mode, the cluster will notice this and continue to function. A 5 node cluster can withstand 2 nodes being down.

There might be a case though where you know a machine will never return, and you want to signal to JetStream that the machine will not return. This will remove it from the Stream in question and all it's Consumers.

After the node is removed the cluster will notice that the replica count is not honored anymore and will immediately pick a new node and start replicating data to it. The new node will be selected using the same placement rules as the existing stream.

```shell
nats stream cluster peer-remove ORDERS
```
Example output
```text
? Select a Peer n4-c1
14:38:50 Removing peer "n4-c1"
14:38:50 Requested removal of peer "n4-c1"
```

At this point the stream and all consumers will have removed `n4-c1` from the group, they will all start new peer selection and data replication.

```shell
$ nats stream info ORDERS
```
Example output
```text
....
Cluster Information:

                 Name: c1
               Leader: n3-c1
              Replica: n1-c1, current, seen 0.02s ago
              Replica: n2-c1, outdated, seen 0.42s ago
```

We can see a new replica was picked, the stream is back to replication level of 3 and `n4-c1` is not active any more in this Stream or any of its Consumers.

