# nats-top

[nats-top](https://github.com/nats-io/nats-top) 是一个类似于 [top](http://man7.org/linux/man-pages/man1/top.1.html) 的工具，用于监控 nats-server 服务器。

nats-top 工具可提供 NATS 服务器的动态实时视图。nats-top 可以实时显示关于 NATS 服务器的各种系统摘要信息，例如订阅、待处理字节数、消息数量等。例如：

```bash
nats-top
```
```text
nats-server version 0.6.4 (uptime: 31m42s)
Server:
  Load: CPU: 0.8%   Memory: 5.9M  Slow Consumers: 0
  In:   Msgs: 34.2K  Bytes: 3.0M  Msgs/Sec: 37.9  Bytes/Sec: 3389.7
  Out:  Msgs: 68.3K  Bytes: 6.0M  Msgs/Sec: 75.8  Bytes/Sec: 6779.4

Connections: 4
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION SUBSCRIPTIONS
  127.0.0.1:56134      2        5       0           11.6K       11.6K       1.1M        905.1K      go       1.1.0   foo, hello
  127.0.1.1:56138      3        1       0           34.2K       0           3.0M        0           go       1.1.0    _INBOX.a96f3f6853616154d23d1b5072
  127.0.0.1:56144      4        5       0           11.2K       11.1K       873.5K      1.1M        go       1.1.0   foo, hello
  127.0.0.1:56151      5        8       0           11.4K       11.5K       1014.6K     1.0M        go       1.1.0   foo, hello
```

## 安装

可以使用 `go install` 安装 nats-top。例如：

```bash
go install github.com/nats-io/nats-top
```

对于较新版本的 Go，您需要使用 `go install github.com/nats-io/nats-top@latest`。

注意：根据您的设置，您可能需要以用户 `sudo` 身份运行上述命令。如果您收到错误提示，由于 $GOPATH 未设置而无法安装 nats-top，但实际上已设置，请使用命令 `sudo -E go get github.com/nats-io/nats-top` 来安装 nats-top。`-E` 标志告诉 sudo 保留当前用户的环境。

## 使用方法

安装完成后，可以使用命令 `nats-top` 和可选参数运行 nats-top。

```bash
nats-top [-s server] [-m monitor] [-n num_connections] [-d delay_in_secs] [-sort by]
```

## 选项

可选参数包括以下内容：

| 选项 | 描述 |
| :--- | :--- |
| `-m monitor` | 从 nats-server 获取监控 HTTP 端口。 |
| `-n num_connections` | 限制请求连接到服务器的数量（默认为 1024）。 |
| `-d delay_in_secs` | 屏幕刷新间隔（默认为 1 秒）。 |
| `-sort by` | 用于对连接进行排序的字段（见下文）。 |

## 命令

在 nats-top 视图中，您可以使用以下命令。

### option

Use the `o<option>` command to set the primary sort key to the `<option>` value. The option value can be one of the following: `cid`, `subs`, `pending`, `msgs_to`, `msgs_from`, `bytes_to`, `bytes_from`, `lang`, `version`.

You can also set the sort option on the command line using the `-sort` flag. For example: `nats-top -sort bytes_to`.

### limit

Use the `n<limit>` command to set the sample size of connections to request from the server.

You can also set this on the command line using the `-n num_connections` flag. For example: `nats-top -n 1`.

Note that if `n<limit>` is used in conjunction with `-sort`, the server will respect both options allowing queries such as the following: Query for the connection with largest number of subscriptions: `nats-top -n 1 -sort subs`.

### s, ? and q Commands

Use the `s` command to toggle displaying connection subscriptions.

Use the `?` command to show help message with options.

Use the `q` command to quit nats-top.

### 教程

有关 nats-top 的演练，请查看 [教程](nats-top-tutorial.md)。