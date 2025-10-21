# 运行

nats-server 提供了许多命令行选项。要开始使用，您无需指定任何内容。如果没有设置任何标志，NATS 服务器将默认在端口 4222 上监听 NATS 客户端连接。默认情况下，安全功能是禁用的。

## 单机模式

当服务器启动时，它会打印一些信息，包括服务器正在监听客户端连接的位置（译注：ip和端口号）：

```shell
nats-server
```
```text
[61052] 2021/10/28 16:53:38.003205 [INF] Starting nats-server
[61052] 2021/10/28 16:53:38.003329 [INF]   Version:  2.6.1
[61052] 2021/10/28 16:53:38.003333 [INF]   Git:      [not set]
[61052] 2021/10/28 16:53:38.003339 [INF]   Name:     NDUP6JO4T5LRUEXZUHWXMJYMG4IZAJDNWETTA4GPJ7DKXLJUXBN3UP3M
[61052] 2021/10/28 16:53:38.003342 [INF]   ID:       NDUP6JO4T5LRUEXZUHWXMJYMG4IZAJDNWETTA4GPJ7DKXLJUXBN3UP3M
[61052] 2021/10/28 16:53:38.004046 [INF] Listening for client connections on 0.0.0.0:4222
[61052] 2021/10/28 16:53:38.004683 [INF] Server is ready
...
```

## Docker

您也能在 Docker 容器中运行 NATS 服务器：

```shell
docker run -p 4222:4222 -ti nats:latest
```
```text
[1] 2021/10/28 23:51:52.705376 [INF] Starting nats-server
[1] 2021/10/28 23:51:52.705428 [INF]   Version:  2.6.1
[1] 2021/10/28 23:51:52.705432 [INF]   Git:      [c91f0fe]
[1] 2021/10/28 23:51:52.705439 [INF]   Name:     NB32AP7VSM3FTKTVEGPQ3OZWSE4T7PQDVJSJMGYFIDKJA6TQEZMV2JNN
[1] 2021/10/28 23:51:52.705446 [INF]   ID:       NB32AP7VSM3FTKTVEGPQ3OZWSE4T7PQDVJSJMGYFIDKJA6TQEZMV2JNN
[1] 2021/10/28 23:51:52.705448 [INF] Using configuration file: nats-server.conf
[1] 2021/10/28 23:51:52.709505 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2021/10/28 23:51:52.709590 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2021/10/28 23:51:52.709882 [INF] Server is ready
[1] 2021/10/28 23:51:52.710394 [INF] Cluster name is 3tlKqFWx91wnnAekR76U9V
[1] 2021/10/28 23:51:52.710419 [WRN] Cluster name was dynamically generated, consider setting one
[1] 2021/10/28 23:51:52.710446 [INF] Listening for route connections on 0.0.0.0:6222
...
```

## 在 Linux 上以 systemd 服务方式运行 nats-server

您可以轻松快速地使用 `systemd` 启动（并在需要时重启）`nats-server` 进程。

请参阅位于 [nats-server 仓库](https://github.com/nats-io/nats-server/tree/main/util) 的 `util` 目录中的示例文件，您可以使用这些文件生成自己的 `/etc/systemd/system/nats.service` 文件。

## 退出状态

作为一项长期运行的服务，管理员理解`nats-server`如何保证其退出行为及背后的含义至关重要。

`nats-server`选择的处理原则是："在被要求关闭后能干净利落地退出"即视为成功退出——即使在通过POSIX信号发起关闭请求的平台上也是如此。在被要求关闭时成功退出并不算错误。

在配置服务管理器时（无论是`systemd`还是其他类型），我们建议将其配置为：当`nats-server`因非零退出状态码、信号终止或其他异常退出时自动重启它。这样服务管理器就能发挥其最佳功能：在需要时确保关键服务的可用性。但如果`nats-server`是正常退出的，服务管理器则不应重启它。需要注意的是，如果您的环境中除了通过服务代理之外没有其他与`nats-server`交互的方式，那么这个区别并不重要；只有当服务管理器之外的其他对象要求`nats-server`关闭时，这种区别才会显现出来。

## JetStream

请注意，要启用 JetStream 及其所有相关功能，您需要至少在一个服务器上启用它。

### 用命令行启用

通过在启动 NATS 服务器时指定 `-js` 标志来启用 JetStream。

`$ nats-server -js`

### 用配置文件启用

您也可以通过配置文件启用 JetStream。默认情况下，JetStream 子系统会将数据存储在 `/tmp` 目录中。以下是一个最小化的文件，它将数据存储在本地的“nats”目录中，适用于开发和本地测试。

```shell
nats-server -c js.conf
```

```text
# js.conf
jetstream {
   store_dir=nats
}
```

标准情况下，JetStream 将以集群模式运行，并且会复制数据，因此存储 JetStream 数据的最佳位置是在本地的高速 SSD 上。特别要注意的是，应避免使用 NAS 或 NFS 存储来存放 JetStream 数据。
有关容器化 NATS 的更多信息，请参阅 [此处](nats_docker/)。

