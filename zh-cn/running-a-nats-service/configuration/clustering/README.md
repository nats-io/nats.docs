# 集群

## NATS 服务器集群

NATS 支持以集群模式运行多个服务器。你可以将服务器集群在一起，用于高容量消息系统、弹性和高可用性。

NATS 服务器们通过相互传播消息并连接到它们知道的所有服务器来实现这一点，从而动态形成完整网状结构。一旦客户端[连接](../../../using-nats/developing-with-nats/connecting/cluster.md)或[重新连接](/using-nats/developing-with-nats/reconnect)到特定服务器，它们就会被告知当前的集群成员。由于这种行为，集群可以增长、收缩和自我修复。完整网状结构也不一定需要显式配置。

请注意，NATS 集群服务器具有一跳的转发限制。这意味着每个 `nats-server` 实例**仅**将**从客户端**接收到的消息转发到其具有路由的紧邻 `nats-server` 实例。**从**路由接收到的消息仅分发给本地客户端。

为了使集群成功形成完整网状结构，并且 NATS 能够按文档中所述和预期的方式运行 - 允许临时错误 - 服务器必须能够相互连接，并且客户端必须能连接到集群中的每个服务器。

## 集群 URL

除了监听客户端的端口外，`nats-server` 还在"集群" URL（`-cluster` 选项）上监听。然后其他 `nats-server` 服务器可以将该 URL 添加到它们的 `-routes` 参数中以加入集群。这些选项也可以在[配置文件](cluster_config.md)中指定，但为简单起见，此概述中仅显示命令行版本。

## 运行简单集群

这是在同一个机器上运行的简单集群：

服务器 A - '种子服务器'

```bash
nats-server -p 4222 -cluster nats://localhost:4248 --cluster_name test-cluster
```

服务器 B

```shell
nats-server -p 5222 -cluster nats://localhost:5248 -routes nats://localhost:4248 --cluster_name test-cluster
```

检查服务器的输出以获取其选定的客户端和路由端口。

服务器 C

```shell
nats-server -p 6222 -cluster nats://localhost:6248 -routes nats://localhost:4248 --cluster_name test-cluster
```

检查服务器的输出以获取其选定的客户端和路由端口。

每个服务器都指定了客户端和集群端口。具有 routes 选项的服务器建立到 _种子服务器_ 的路由。由于集群协议会分享集群成员，所有服务器都能够发现集群中的其他服务器。当发现服务器时，发现服务器将自动尝试连接到它以形成 _完整网状结构_。通常每台机器上只运行一个服务器实例，因此你可以重用客户端端口（4222）和集群端口（4248），并简单地路由到种子服务器的主机/端口。

类似地，连接到集群中任何服务器的客户端将发现集群中的其他服务器。如果与服务器的连接中断，客户端将尝试连接到所有其他已知服务器。

没有 _种子服务器_ 的显式配置。它们仅作为集群其他成员以及客户端发现服务器的起点。因此，这些是客户端在其连接 URL 列表中以及集群成员在其路由列表中拥有的服务器。它们减少了配置，因为不需要每个服务器都在这些列表中。但其他服务器和客户端成功连接的能力取决于 _种子服务器_ 的运行。如果使用多个 _种子服务器_，它们也使用 routes 选项，因此它们可以相互建立路由。

## 命令行选项

支持以下集群选项：

```text
--routes [rurl-1, rurl-2]     Routes to solicit and connect
--cluster nats://host:port    Cluster URL for solicited routes
```

当 NATS 服务器路由到指定 URL 时，它将向路由中的所有其他服务器通告自己的集群 URL，从而有效地创建到所有其他服务器的路由网状结构。

**注意：**使用 `-routes` 选项时，还必须指定 `-cluster` 选项。

集群也可以使用服务器[配置文件](cluster_config.md)进行配置。

## 三服务器集群示例

以下示例演示如何在同一主机上运行 3 个服务器的集群。我们将从种子服务器开始，并使用 `-D` 命令行参数生成调试信息。

```bash
nats-server -p 4222 -cluster nats://localhost:4248 -D
```

或者，你可以使用配置文件，让我们称之为 `seed.conf`，内容类似这样：

```text
# Cluster Seed Node

listen: 127.0.0.1:4222
http: 8222

cluster {
  listen: 127.0.0.1:4248
}
```

并像这样启动服务器：

```bash
nats-server -config ./seed.conf -D
```

这将产生类似于以下的输出：

```text
[83329] 2020/02/12 16:04:52.369039 [INF] Starting nats-server version 2.1.4
[83329] 2020/02/12 16:04:52.369130 [DBG] Go build version go1.13.6
[83329] 2020/02/12 16:04:52.369133 [INF] Git commit [not set]
[83329] 2020/02/12 16:04:52.369360 [INF] Starting http monitor on 127.0.0.1:8222
[83329] 2020/02/12 16:04:52.369436 [INF] Listening for client connections on 127.0.0.1:4222
[83329] 2020/02/12 16:04:52.369441 [INF] Server id is NDSGCS74MG5ZUMBOVWOUJ5S3HIOW
[83329] 2020/02/12 16:04:52.369443 [INF] Server is ready
[83329] 2020/02/12 16:04:52.369534 [INF] Listening for route connections on 127.0.0.1:4248
```

也可以独立指定主机名和端口。至少需要端口。如果省略主机名，它将绑定到所有接口（'0.0.0.0'）。

```text
cluster {
  host: 127.0.0.1
  port: 4248
}
```

现在让我们再启动两个服务器，每个都连接到种子服务器。

```bash
nats-server -p 5222 -cluster nats://localhost:5248 -routes nats://localhost:4248 -D
```

在同一主机上运行时，我们需要为客户端连接（`-p`） 和用于接受其他路由的端口（`-cluster`）选择不同的端口。请注意，`-routes` 指向种子服务器的 `-cluster` 地址（`localhost:4248`）。

这是产生的日志。查看它如何连接并注册到种子服务器（`...GzM`）的路由。

```text
[83330] 2020/02/12 16:05:09.661047 [INF] Starting nats-server version 2.1.4
[83330] 2020/02/12 16:05:09.661123 [DBG] Go build version go1.13.6
[83330] 2020/02/12 16:05:09.661125 [INF] Git commit [not set]
[83330] 2020/02/12 16:05:09.661341 [INF] Listening for client connections on 0.0.0.0:5222
[83330] 2020/02/12 16:05:09.661347 [INF] Server id is NAABC2CKRVPZBIECMLZZA6L3PK
[83330] 2020/02/12 16:05:09.661349 [INF] Server is ready
[83330] 2020/02/12 16:05:09.662429 [INF] Listening for route connections on localhost:5248
[83330] 2020/02/12 16:05:09.662676 [DBG] Trying to connect to route on localhost:4248
[83330] 2020/02/12 16:05:09.663308 [DBG] 127.0.0.1:4248 - rid:1 - Route connect msg sent
[83330] 2020/02/12 16:05:09.663370 [INF] 127.0.0.1:4248 - rid:1 - Route connection created
[83330] 2020/02/12 16:05:09.663537 [DBG] 127.0.0.1:4248 - rid:1 - Registering remote route "NDSGCS74MG5ZUMBOVWOUJ5S3HIOW"
[83330] 2020/02/12 16:05:09.663549 [DBG] 127.0.0.1:4248 - rid:1 - Sent local subscriptions to route
```

从种子服务器的日志中，我们看到路由确实被接受：

```text
[83329] 2020/02/12 16:05:09.663386 [INF] 127.0.0.1:62941 - rid:1 - Route connection created
[83329] 2020/02/12 16:05:09.663665 [DBG] 127.0.0.1:62941 - rid:1 - Registering remote route "NAABC2CKRVPZBIECMLZZA6L3PK"
[83329] 2020/02/12 16:05:09.663681 [DBG] 127.0.0.1:62941 - rid:1 - Sent local subscriptions to route
```

最后，让我们启动第三个服务器：

```bash
nats-server -p 6222 -cluster nats://localhost:6248 -routes nats://localhost:4248 -D
```

再次注意，我们使用不同的客户端端口和集群地址，但仍然指向相同的种子服务器地址 `nats://localhost:4248`：

```text
[83331] 2020/02/12 16:05:12.838022 [INF] Listening for client connections on 0.0.0.0:6222
[83331] 2020/02/12 16:05:12.838029 [INF] Server id is NBE7SLUDLFIMHS2U6347N3DQEJ
[83331] 2020/02/12 16:05:12.838031 [INF] Server is ready
...
[83331] 2020/02/12 16:05:12.839203 [INF] Listening for route connections on localhost:6248
[83331] 2020/02/12 16:05:12.839453 [DBG] Trying to connect to route on localhost:4248
[83331] 2020/02/12 16:05:12.840112 [DBG] 127.0.0.1:4248 - rid:1 - Route connect msg sent
[83331] 2020/02/12 16:05:12.840198 [INF] 127.0.0.1:4248 - rid:1 - Route connection created
[83331] 2020/02/12 16:05:12.840324 [DBG] 127.0.0.1:4248 - rid:1 - Registering remote route "NDSGCS74MG5ZUMBOVWOUJ5S3HIOW"
[83331] 2020/02/12 16:05:12.840342 [DBG] 127.0.0.1:4248 - rid:1 - Sent local subscriptions to route
[83331] 2020/02/12 16:05:12.840717 [INF] 127.0.0.1:62946 - rid:2 - Route connection created
[83331] 2020/02/12 16:05:12.840906 [DBG] 127.0.0.1:62946 - rid:2 - Registering remote route "NAABC2CKRVPZBIECMLZZA6L3PK"
[83331] 2020/02/12 16:05:12.840915 [DBG] 127.0.0.1:62946 - rid:2 - Sent local subscriptions to route
```

首先创建到种子服务器（`...IOW`）的路由，然后接受来自 `...3PK` 的路由 - 这是第二个服务器的 ID。

种子服务器的日志显示它接受了来自第三个服务器的路由：

```text
[83329] 2020/02/12 16:05:12.840111 [INF] 127.0.0.1:62945 - rid:2 - Route connection created
[83329] 2020/02/12 16:05:12.840350 [DBG] 127.0.0.1:62945 - rid:2 - Registering remote route "NBE7SLUDLFIMHS2U6347N3DQEJ"
[83329] 2020/02/12 16:05:12.840363 [DBG] 127.0.0.1:62945 - rid:2 - Sent local subscriptions to route
```

第二个服务器的日志显示它连接到了第三个服务器。

```text
[83330] 2020/02/12 16:05:12.840529 [DBG] Trying to connect to route on 127.0.0.1:6248
[83330] 2020/02/12 16:05:12.840684 [DBG] 127.0.0.1:6248 - rid:2 - Route connect msg sent
[83330] 2020/02/12 16:05:12.840695 [INF] 127.0.0.1:6248 - rid:2 - Route connection created
[83330] 2020/02/12 16:05:12.840814 [DBG] 127.0.0.1:6248 - rid:2 - Registering remote route "NBE7SLUDLFIMHS2U6347N3DQEJ"
[83330] 2020/02/12 16:05:12.840827 [DBG] 127.0.0.1:6248 - rid:2 - Sent local subscriptions to route
```

此时，存在一个完整的 NATS 服务器集群网状结构。

### 测试集群

现在，以下操作应该可以工作：向第一个服务器（端口 4222）进行订阅。然后向每个服务器（端口 4222、5222、6222）发布消息。你应该能够毫无问题地接收消息。

测试服务器 A

```bash
nats sub -s "nats://127.0.0.1:4222" hello &
nats pub -s "nats://127.0.0.1:4222" hello world_4222
```

```text
23:34:45 Subscribing on hello
23:34:45 Published 10 bytes to "hello"

[#1] Received on "hello"
world_4222
```

测试服务器 B

```shell
nats pub -s "nats://127.0.0.1:5222" hello world_5222
```

```text
[#2] Received on "hello"
23:36:09 Published 10 bytes to "hello"
world_5222
```

测试服务器 C

```shell
nats pub -s "nats://127.0.0.1:6222" hello world_6222
```

```text
23:38:40 Published 10 bytes to "hello"
[#3] Received on "hello"
world_6222
```

使用种子（即 A、B 和 C）服务器 URL 进行测试

```shell
nats pub -s "nats://127.0.0.1:4222,nats://127.0.0.1:5222,nats://127.0.0.1:6222" hello whole_world
```

```text
[#4] Received on "hello"
23:39:16 Published 11 bytes to "hello"
whole_world
```