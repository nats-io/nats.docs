# 入门指南

使用 JetStream 非常简单。虽然我们通常将 JetStream 视为一个独立的组件，但实际上它是一个打包到 NATS 服务器中的子系统，需要启用后才能使用。

## 命令行

通过启动 NATS 服务器时指定 `-js` 标志来启用 JetStream。

```
$ nats-server -js
```

## 配置文件

您也可以通过配置文件启用 JetStream。默认情况下，JetStream 子系统会将数据存储在 `/tmp` 目录中。以下是一个最小化的配置文件，它将数据存储在本地的“nats”目录中，适合开发和本地测试。

`$ nats-server -c js.conf`

```text
# js.conf
jetstream {
   store_dir=nats
}
```

标准情况下，JetStream 将以集群模式运行，并且会复制数据，因此存储 JetStream 数据的最佳位置是在本地的高速 SSD 上。应特别避免使用 NAS 或 NFS 存储来存放 JetStream 数据。

有关更多信息，请参阅 [使用 Docker ](../../../running-a-nats-service/running/nats_docker/jetstream_docker.md) 和 [ 使用源代码 ](using_source.md)。

