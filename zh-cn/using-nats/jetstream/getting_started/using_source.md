# 使用源代码

JetStream 的设计目标之一是原生支持 Core NATS，因此尽管我们肯定会为客户端添加一些语法糖以使其更具吸引力，但在本次技术预览中，我们将使用纯正的旧 NATS。

您需要本地获取nats-server源代码副本，并且需要切换到jetstream分支。

```shell
git clone https://github.com/nats-io/nats-server.git
cd nats-server
git checkout master
go build
ls -l nats-server
```

启动服务器时，您可以使用`-js`标志。这将使服务器合理地使用内存和磁盘。以下是我机器上的一个示例运行。目前，JetStream默认最多会使用1TB的磁盘空间和可用内存的75%。

```shell
nats-server -js
```
```text
[16928] 2019/12/04 19:16:29.596968 [INF] Starting nats-server version 2.2.0
[16928] 2019/12/04 19:16:29.597056 [INF] Git commit [not set]
[16928] 2019/12/04 19:16:29.597072 [INF] Starting JetStream
[16928] 2019/12/04 19:16:29.597444 [INF] ----------- JETSTREAM (Beta) -----------
[16928] 2019/12/04 19:16:29.597451 [INF]   Max Memory:      96.00 GB
[16928] 2019/12/04 19:16:29.597454 [INF]   Max Storage:     1.00 TB
[16928] 2019/12/04 19:16:29.597461 [INF]   Store Directory: "/var/folders/m0/k03vs55n2b54kdg7jm66g27h0000gn/T/jetstream"
[16928] 2019/12/04 19:16:29.597469 [INF] ----------------------------------------
[16928] 2019/12/04 19:16:29.597732 [INF] Listening for client connections on 0.0.0.0:4222
[16928] 2019/12/04 19:16:29.597738 [INF] Server id is NAJ5GKP5OBVISP5MW3BFAD447LMTIOAHFEWMH2XYWLL5STVGN3MJHTXQ
[16928] 2019/12/04 19:16:29.597742 [INF] Server is ready
```

如果您希望覆盖存储目录，可以这样做：

```shell
nats-server -js -sd /tmp/test
```
```text
[16943] 2019/12/04 19:20:00.874148 [INF] Starting nats-server version 2.2.0
[16943] 2019/12/04 19:20:00.874247 [INF] Git commit [not set]
[16943] 2019/12/04 19:20:00.874273 [INF] Starting JetStream
[16943] 2019/12/04 19:20:00.874605 [INF] ----------- JETSTREAM (Beta) -----------
[16943] 2019/12/04 19:20:00.874613 [INF]   Max Memory:      96.00 GB
[16943] 2019/12/04 19:20:00.874615 [INF]   Max Storage:     1.00 TB
[16943] 2019/12/04 19:20:00.874620 [INF]   Store Directory: "/tmp/test/jetstream"
[16943] 2019/12/04 19:20:00.874625 [INF] ----------------------------------------
[16943] 2019/12/04 19:20:00.874868 [INF] Listening for client connections on 0.0.0.0:4222
[16943] 2019/12/04 19:20:00.874874 [INF] Server id is NCR6KDDGWUU2FXO23WAXFY66VQE6JNWVMA24ALF2MO5GKAYFIMQULKUO
[16943] 2019/12/04 19:20:00.874877 [INF] Server is ready
```

这些选项也可以在您的配置文件中设置：

```text
// 启用jetstream；若使用空块（里面不填写任何配置）将使用默认值启用 jetstream
jetstream {
    // jetstream数据将存储在 /data/nats-server/jetstream
    store_dir: "/data/nats-server"

    // 1GB
    max_memory_store: 1073741824

    // 10GB
    max_file_store: 10737418240
}
```

