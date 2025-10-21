# 在 Docker 中运行 JetStream

本小教程将展示如何在本地 Docker 容器中运行一个启用了 JetStream 的 NATS 服务器。这使得您可以快速且无风险地试用 JetStream 的多种功能。

使用官方的 `nats` 镜像启动一个服务器。通过 `-js` 选项启用 JetStream，通过 `-p` 选项将本地的 4222 端口转发到容器内的服务器端口（4222 是默认的客户端连接端口）。

```shell
docker run -p 4222:4222 nats -js
```

要将 JetStream 数据持久化到卷中，可以结合使用 `-v` 和 `-sd` 选项：

```shell
docker run -p 4222:4222 -v nats:/data nats -js -sd /data
```

服务器运行后，使用 `nats bench` 创建一个流并发布一些消息到该流。

```shell
nats bench -s localhost:4222 benchsubject --js --pub 1 --msgs=100000
```

JetStream 会持久化这些消息（默认情况下存储在磁盘上）。现在可以通过以下命令消费这些消息：

```shell
nats bench -s localhost:4222 benchsubject --js --sub 3 --msgs=100000
```

您还可以使用 `nats` 命令检查流的各个方面，例如：

```shell
nats -s localhost:4222 stream list
╭────────────────────────────────────────────────────────────────────────────────────╮
│                                       Streams                                      │
├─────────────┬─────────────┬─────────────────────┬──────────┬────────┬──────────────┤
│ Name        │ Description │ Created             │ Messages │ Size   │ Last Message │
├─────────────┼─────────────┼─────────────────────┼──────────┼────────┼──────────────┤
│ benchstream │             │ 2024-06-07 20:26:38 │ 100,000  │ 16 MiB │ 35s          │
╰─────────────┴─────────────┴─────────────────────┴──────────┴────────┴──────────────╯
```

### 相关和有用的信息：
 * [NATS 服务器官方 Docker 镜像](https://github.com/nats-io/nats-docker) 及其 [issues](https://github.com/nats-io/nats-docker/issues)
 * [DockerHub 上的 `nats` 镜像](https://hub.docker.com/_/nats)
 * [`nats` CLI 工具](/using-nats/nats-tools/nats_cli/) 和 [`nats bench`](/using-nats/nats-tools/nats_cli/natsbench)
 * [管理 JetStream](/nats_admin/jetstream_admin/)