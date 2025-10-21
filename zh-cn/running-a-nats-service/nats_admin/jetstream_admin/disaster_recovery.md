# 灾难恢复

当一个（或多个）服务器节点上的 JetStream 消息持久化发生不可恢复的故障时，有两种恢复场景：

* 从保持完好的法定人数节点自动恢复
* 从现有的流快照（备份）手动恢复

{% hint style="danger" %}
对于 R1 （仅1个副本）流，数据仅持久化在一个服务器节点上。如果该服务器节点无法恢复，则从备份恢复是唯一的选择。
{% endhint %}

## 自动恢复

在以下条件下，NATS 会自动创建替代的流副本：

* 受影响的流配置了 R3（或更高）的副本
* 剩余完好的节点（流副本）满足最低 RAFT 法定人数：floor(R/2) + 1
* 流的集群中有可用节点用于放置新副本
* 受影响的节点已从流的域 RAFT 元组中移除（例如使用 `nats server raft peer-remove` 命令）

## 手动恢复

无论复制配置如何，都可以为任何流主动创建快照（也称为备份）。

备份默认包括：

* 流配置和状态
* 流持久消费者配置和状态
* 所有消息负载数据，包括时间戳和头部等元数据

### 备份

使用 `nats stream backup` CLI 命令可以创建流及其持久消费者的快照。

{% hint style="info" %}
作为账户所有者，如果你希望备份账户中的所有流，可以使用 `nats account backup` 命令。
{% endhint %}

```shell
nats stream backup ORDERS '/data/js-backup/backup1'
```
输出
```text
Starting backup of Stream "ORDERS" with 13 data blocks

2.4 MiB/s [====================================================================] 100%

Received 13 MiB bytes of compressed data in 3368 chunks for stream "ORDERS" in 1.223428188s, 813 MiB uncompressed
```

在备份操作期间，流会进入一种状态，其配置无法更改，并且不会根据流保留策略驱逐任何数据。

{% hint style="info" %}
可以使用 `--no-progress` 选项禁用终端进度条显示，届时它将改为输出日志行。
{% endhint %}

### 恢复

可以使用 `nats stream restore` 命令将现有备份（如上所述）恢复到相同或新的 NATS 服务器（或集群）。

{% hint style="info" %}
如果备份目录中有多个流，它们将全部被恢复。
{% endhint %}

```shell
nats stream restore '/data/js-backup/backup1'
```
输出
```text
Starting restore of Stream "ORDERS" from file "/data/js-backup/backup1"

13 MiB/s [====================================================================] 100%

Restored stream "ORDERS" in 937.071149ms

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.>
...
```

`/data/js-backup/ORDERS.tgz` 文件也可以解压缩到已停止的 NATS 服务器的数据目录中。

可以使用 `--no-progress` 选项禁用终端进度条显示，届时它将改为输出日志行。

## 交互式 CLI

在通过交互方式使用 `nats` CLI 配置服务器的环境中，你并没有一个用于重新创建服务器的期望状态。这不是管理服务器的理想方式，我们推荐使用配置管理，但许多人会采用这种方法。

在这种情况下，你可以将配置备份到一个目录中，以便日后从该目录恢复配置。文件存储支持的数据也可以被备份。

```shell
nats account backup /data/js-backup
```
```text
15:56:11 Creating JetStream backup into /data/js-backup
15:56:11 Stream ORDERS to /data/js-backup/stream_ORDERS.json
15:56:11 Consumer ORDERS > NEW to /data/js-backup/stream_ORDERS_consumer_NEW.json
15:56:11 Configuration backup complete
```

这会备份流和消费者的配置。

在同一过程中，也可以通过传递 `--data` 参数来备份数据，这将创建类似 `/data/js-backup/stream_ORDERS.tgz` 的文件。

之后可以恢复数据，对于流，我们支持就地编辑流配置以匹配备份中的内容。

```shell
nats account restore /tmp/backup --update-streams
```
```text
15:57:42 Reading file /tmp/backup/stream_ORDERS.json
15:57:42 Reading file /tmp/backup/stream_ORDERS_consumer_NEW.json
15:57:42 Updating Stream ORDERS configuration
15:57:42 Restoring Consumer ORDERS > NEW
```

`nats account restore` 工具不支持恢复数据，可以使用前面概述的 `nats stream restore` 命令执行相同的过程，该命令也会恢复流和消费者的配置及状态。

{% hint style="warning" %}
在恢复时，如果服务器中已存在同名同账户的流，你将收到 `Stream {name} already exist` 错误。
{% endhint %}