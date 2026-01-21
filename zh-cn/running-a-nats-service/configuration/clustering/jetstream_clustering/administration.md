# 管理

一旦 JetStream 集群运行，与 CLI 和 `nats` CLI 的交互与以前相同。对于这些示例，让我们假设我们有一个 5 服务器集群，n1-n5，位于名为 C1 的集群中。

## 账户级别

Within an account there are operations and reports that show where users data is placed and which allow them some basic interactions with the RAFT system.

## 创建集群流

使用 `nats` CLI 添加流时，将询问副本数量，当您选择大于 1 的数字时（我们建议 1、3 或 5），数据将使用上述 RAFT 协议存储在集群中的多个节点上。

```shell
nats stream add ORDERS --replicas 3
```
示例输出提取：
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

上面您可以看到，在所有显示流信息的情况下（例如添加后或使用 `nats stream info`）都会报告集群信息。

这里我们在 NATS 集群 `C1` 中有一个流，其当前领导者是节点 `n1-c1`，它有 2 个跟随者 - `n4-c1` 和 `n3-c1`。

`current` 表示跟随者是最新的并且拥有所有消息，这里两个集群对等节点都是最近看到的。

副本数量可以在日后继续更改。

### 查看流放置和统计信息

用户可以获取关于其流的总体统计信息以及这些流放置的位置：

```shell
nats stream report
```
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

#### 强制流和消费者领导者选举

每个 RAFT 组都有一个领导者，在需要时由组选举产生。通常没有理由干扰这个过程，但您可能希望在方便的时候触发领导者变更。领导者选举将代表对流的短暂中断，因此如果您知道稍后将在节点上工作，可能值得提前将领导权移开。

将领导权从节点移开不会将其从集群中移除，也不会阻止其再次成为领导者，这仅仅是一个触发的领导者选举。

```shell
nats stream cluster step-down ORDERS
```
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

对于消费者也是如此，`nats consumer cluster step-down ORDERS NEW`。

## 系统级别

系统用户可以查看元组的状态 - 但不能查看单个流或消费者。

### 查看集群状态

我们有集群状态的高级报告：

```shell
nats server report jetstream --user admin --password s3cr3t!
```
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
| n2-c1 |        | false   | true    | 9.00s  | 2   |
| n2-c2 |        | true    | false   | 0.05s  | 0   |
| n3-c1 |        | true    | false   | 0.05s  | 0   |
| n3-c2 |        | true    | false   | 0.05s  | 0   |
+-------+--------+---------+---------+--------+-----+
```

这是一个完整的集群范围报告，可以使用 `--account` 将报告限制到特定账户。

这里我们看到流、消息、API 调用等在 2 个超级集群中的分布情况以及 RAFT 元组的概述。

在元组报告中，服务器 `n2-c1` 不是最新的，已经有 9 秒没有被看到，它还落后 2 个 raft 操作。

此报告是使用原始数据构建的，可以从监控端口上的 `/jsz` url 获取，或通过 nats 使用：

```shell
nats server req jetstream --user admin --password s3cr3t! --help
```
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
nats server req jetstream --user admin --password s3cr3t! --leader
```

这将产生关于集群当前状态的大量原始信息 - 这里仅从领导者请求它。

#### 强制元组领导者选举

与上面的流和消费者类似，元组允许领导者卸任。元组是集群范围的，跨越所有账户，因此要管理元组，您必须使用 `SYSTEM` 用户。

```shell
nats server cluster step-down --user admin --password s3cr3t!
```
```text
17:44:24 Current leader: n2-c2
17:44:24 New leader: n1-c2
```

### 驱逐对等节点

通常在关闭 NATS 时，包括使用跛脚鸭模式，集群会注意到这一点并继续运行。

但可能有一种情况，您知道一个节点永远不会恢复（重新上线），并希望向 JetStream 发出该节点不会返回的信号。对等节点移除(peer-remove)操作将从指定的流及其所有消费者中移除该节点。

节点被移除后，集群会察觉到流的副本数量不再满足配置要求，并会立即选取一个新节点开始复制数据。新节点的选择将遵循与现有流相同的放置规则。

```shell
nats server cluster peer-remove n4-c1 --user admin --password s3cr3t!
```
```text
? Really remove offline peer n4-c1 (y/N)
```

{% hint style="danger" %}
从集群中移除对等节点(peer-remove)节点是一项破坏性操作，它会减小集群的规模。
理想情况下，一个将被移除的服务器应该已经离线。虽然也可以对仍在线的节点执行此操作，但在这种情况下，JetStream 将在这些节点上被禁用。该服务器应当被关闭且不再重启，或者如果必须重启，则应禁用 JetStream。
一个服务器在被 peer-remove 且磁盘被清空后，不应再以相同的 `server_name` 重新加入。这意味着在重启前，必须将其配置中的 server_name 更改为一个新值。
{% endhint %}

或者，如果您打算保留该节点、只是想将流从特定节点移走，您可以在流级别对节点执行 peer-remove。

```shell
nats stream cluster peer-remove ORDERS
```
```text
? Select a Peer n4-c1
14:38:50 Removing peer "n4-c1"
14:38:50 Requested removal of peer "n4-c1"
```

此时，该流及其所有消费者都将从组中移除 `n4-c1`。随后将选择一个新的节点（本例中选中了 `n2-c1` 作为新对等节点），并将数据复制到该节点。

```shell
$ nats stream info ORDERS
```
```text
....
Cluster Information:

                 Name: c1
               Leader: n3-c1
              Replica: n1-c1, current, seen 0.02s ago
              Replica: n2-c1, outdated, seen 0.42s ago
```

我们可以看到选择了一个新的副本，流重新回到了复制级别 3，并且 `n4-c1` 在此流或其任何消费者中不再活跃。
