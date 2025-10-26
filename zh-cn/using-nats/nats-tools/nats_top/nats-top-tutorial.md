# 教程

您可以使用 [nats-top](https://github.com/nats-io/nats-top) 实时监控 NATS 服务器的连接和消息统计信息。

## 先决条件

* 设置您的 Go 环境 [参见此处](https://golang.org/doc/install)
* 安装 NATS 服务器 [参见此处](../../../running-a-nats-service/installation.md)

## 1. 安装 nats-top

```bash
go install github.com/nats-io/nats-top@latest
```

您可能需要运行以下命令：

```bash
sudo -E go install github.com/nats-io/nats-top
```

## 2. 启动启用监控的 NATS 服务器

```bash
nats-server -m 8222
```

## 3. 启动 nats-top

```bash
nats-top
```

结果如下：

```text
nats-server version 0.6.6 (uptime: 2m2s)
Server:
  Load: CPU:  0.0%  Memory: 6.3M  Slow Consumers: 0
  In:   Msgs: 0  Bytes: 0  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 0  Bytes: 0  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 0
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
```

## 4. 运行 NATS 客户端程序

运行一些 NATS 客户端程序并交换消息。

为获得最佳体验，建议运行多个订阅者，至少 2 或 3 个。请参考 [发布-订阅 客户端示例](../../../running-a-nats-service/clients.md)。

## 5. 检查 nats-top 的统计信息

```text
nats-server version 0.6.6 (uptime: 30m51s)
Server:
  Load: CPU:  0.0%  Memory: 10.3M  Slow Consumers: 0
  In:   Msgs: 56  Bytes: 302  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 98  Bytes: 512  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
  ::1:58651            6        1       0           52          0           260         0           go       1.1.0
  ::1:58922            38       1       0           21          0           105         0           go       1.1.0
  ::1:58953            39       1       0           21          0           105         0           go       1.1.0
```

## 6. 对 nats-top 统计信息进行排序

在 nats-top 中，输入命令 `o`，然后选择排序选项，例如 `bytes_to`。您会看到 nats-top 按升序对 `BYTES_TO` 列进行排序。

```text
nats-server version 0.6.6 (uptime: 45m40s)
Server:
  Load: CPU:  0.0%  Memory: 10.4M  Slow Consumers: 0
  In:   Msgs: 81  Bytes: 427  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 154  Bytes: 792  Msgs/Sec: 0.0  Bytes/Sec: 0
sort by [bytes_to]:
Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
  ::1:59259            83       1       0           4           0           20          0           go       1.1.0
  ::1:59349            91       1       0           2           0           10          0           go       1.1.0
  ::1:59342            90       1       0           0           0           0           0           go       1.1.0
```

## 7. 使用不同的排序选项

尝试使用不同的排序选项来探索 nats-top，例如：

`cid`, `subs`, `pending`, `msgs_to`, `msgs_from`, `bytes_to`, `bytes_from`, `lang`, `version`

也可以通过命令行参数 `-sort` 设置排序选项。例如：`nats-top -sort bytes_to`。

## 8. 显示已注册的订阅

在 nats-top 中，输入命令 `s` 开关连接订阅显示。启用（打开）后，您会在 nats-top 表格中看到订阅的主题：

```text
nats-server version 0.6.6 (uptime: 1h2m23s)
Server:
  Load: CPU:  0.0%  Memory: 10.4M  Slow Consumers: 0
  In:   Msgs: 108  Bytes: 643  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 185  Bytes: 1.0K  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION SUBSCRIPTIONS
  ::1:59708            115      1       0           6           0           48          0           go       1.1.0   foo.bar
  ::1:59758            122      1       0           1           0           8           0           go       1.1.0   foo
  ::1:59817            124      1       0           0           0           0           0           go       1.1.0   foo
```

## 9. 退出 nats-top

使用命令 `q` 退出 nats-top。

## 10. 以指定查询重新启动 nats-top

例如，查询订阅数最多的连接：

```bash
nats-top -n 1 -sort subs
```

结果：nats-top 只显示订阅数最多的客户端连接：

```text
nats-server version 0.6.6 (uptime: 1h7m0s)
Server:
  Load: CPU:  0.0%  Memory: 10.4M  Slow Consumers: 0
  In:   Msgs: 109  Bytes: 651  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 187  Bytes: 1.0K  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
  ::1:59708            115      1       0           6           0           48          0           go       1.1.0
```