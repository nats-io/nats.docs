# 流

第一步是为我们与 `ORDERS` 相关的消息设置存储，这些消息通过一组使用通配符的主题到达，全部流入同一个流，并保留 1 年。

## 创建

```shell
nats str add ORDERS
```
```text
? Subjects to consume ORDERS.*
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Message count limit -1
? Message size limit -1
? Maximum message age limit 1y
? Maximum individual message size [? for help] (-1) -1
Stream ORDERS was created

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
     Maximum Messages: -1
        Maximum Bytes: -1
          Maximum Age: 8760h0m0s
 Maximum Message Size: -1
  Maximum Consumers: -1

Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 0
             LastSeq: 0
    Active Consumers: 0
```

您可以像上面这样以交互方式补全缺失的信息，也可以在一个命令中完成所有操作。在 CLI 中按 `?` 可以帮助您了解提示对应的 CLI 选项：

```shell
nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --dupe-window="0s" --replicas 1
```

此外，可以将配置存储在 JSON 文件中，其格式与 `$ nats str info ORDERS -j | jq .config` 相同：

```shell
nats str add ORDERS --config orders.json
```

## 列出

我们可以确认我们的流已创建：

```shell
nats str ls
```
```text
Streams:

    ORDERS
```

## 查询

可以查看关于流配置的信息，如果您没有像下面这样指定流，它会根据所有已知的流提示您：

```shell
nats str info ORDERS
```
```text
Information for Stream ORDERS created 2021-02-27T16:49:36-07:00

Configuration:

             Subjects: ORDERS.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 1y0d0h0m0s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited

State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

大多数像上面这样显示数据的命令都支持 `-j` 选项，以 JSON 格式显示结果：

```shell
nats str info ORDERS -j
```
```json
{
  "config": {
    "name": "ORDERS",
    "subjects": [
      "ORDERS.*"
    ],
    "retention": "limits",
    "max_consumers": -1,
    "max_msgs": -1,
    "max_bytes": -1,
    "max_age": 31536000000000000,
    "max_msg_size": -1,
    "storage": "file",
    "discard": "old",
    "num_replicas": 1,
    "duplicate_window": 120000000000
  },
  "created": "2021-02-27T23:49:36.700424Z",
  "state": {
    "messages": 0,
    "bytes": 0,
    "first_seq": 0,
    "first_ts": "0001-01-01T00:00:00Z",
    "last_seq": 0,
    "last_ts": "0001-01-01T00:00:00Z",
    "consumer_count": 0
  }
}
```

这是整个 `nats` 工具与 JetStream 相关操作的通用模式——提示输入必要的信息，但每个操作都可以非交互式运行，使其可用作一个 CLI API。所有像上面这样的信息输出都可以使用 `-j` 转换为 JSON。

## 复制

可以将一个流复制到另一个流，这也允许通过 CLI 标志调整新流的配置：

```shell
nats str cp ORDERS ARCHIVE --subjects "ORDERS_ARCHIVE.*" --max-age 2y
```
```text
Stream ORDERS was created

Information for Stream ORDERS created 2021-02-27T16:52:46-07:00

Configuration:

             Subjects: ORDERS_ARCHIVE.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 2y0d0h0m0s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited

State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

## 编辑

可以编辑流的配置，这允许通过 CLI 标志调整配置。这里我有一个错误创建的 ORDERS 流，我修复它：

```shell
nats str info ORDERS -j | jq .config.subjects
```
```text
[
  "ORDERS.new"
]
```

更改流的主题
```shell
nats str edit ORDERS --subjects "ORDERS.*"
```
```text
Stream ORDERS was updated

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
....
```

此外，可以将配置存储在 JSON 文件中，其格式与 `$ nats str info ORDERS -j | jq .config` 相同：

```shell
nats str edit ORDERS --config orders.json
```

## 发布消息到流中

现在让我们向我们的流添加一些消息。您可以使用 `nats pub` 来添加消息，传递 `--wait` 标志可以看到返回的发布确认。

您可以在无 ACK 机制的情况下发布：

```shell
nats pub ORDERS.scratch hello
```

但如果您想确保您的消息已到达 JetStream 并被持久化，您可以发出一个请求：

```shell
nats req ORDERS.scratch hello
```
```text
13:45:03 Sending request on [ORDERS.scratch]
13:45:03 Received on [_INBOX.M8drJkd8O5otORAo0sMNkg.scHnSafY]: '+OK'
```

在执行此操作时持续查看流的状态，您会看到其存储的消息数量增加。

```shell
nats str info ORDERS
```
```text
Information for Stream ORDERS
...
Statistics:

            Messages: 3
               Bytes: 147 B
            FirstSeq: 1
             LastSeq: 3
    Active Consumers: 0
```

在向流中放入一些临时数据后，我们可以清除所有数据——同时保持流处于活动状态：

## 删除所有数据

要删除流中的所有数据，请使用 `purge`：

```shell
nats str purge ORDERS -f
```
```text
...
State:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 1,000,001
             LastSeq: 1,000,000
    Active Consumers: 0
```

## 删除单条消息

可以从流中安全地删除单条消息：

```shell
nats str rmm ORDERS 1 -f
```

## 删除流

最后，出于演示目的，您也可以删除整个流并重新创建它。然后我们就可以准备创建消费者了：

```shell
nats str rm ORDERS -f
nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --dupe-window="0s" --replicas 1
```