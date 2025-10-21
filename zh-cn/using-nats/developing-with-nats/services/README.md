# 搭建服务（Services）

我们最近就服务协议的[初始规范](https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-32.md)达成了一致，以便我们能够为 NATS 客户端添加一流的服务支持，并在我们的工具中也支持这一功能。该服务协议是客户端与工具之间的约定，不需要 NATS 服务器以及 JetStream 提供任何特殊功能。

要查看您最喜爱的语言中的 NATS 客户端是否支持新的服务 API，请务必查阅该客户端的文档和 GitHub 仓库。由于服务 API 相对较新，可能并非所有客户端都已支持它。

要了解不同语言中服务 API 的实际使用情况，请查看 [NATS By Example](https://natsbyexample.com/examples/services/intro/go) 示例。

## 概念

在开始开发自己的服务之前，值得先了解一下服务 API 中的一些高层次概念。

### 服务

服务是最高的抽象层次，指的是逻辑上相关的一组功能。服务必须具有符合 [semver](https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string) 规则的名称和版本。服务可以在 NATS 系统内被发现。

### API 端点

服务端点是客户端与其交互的实体。您可以将端点视为服务中的单个操作。每个服务至少需要有一个端点。

### 组

组是一组端点的集合。组是可选的，它可以为端点提供逻辑关联，并为所有端点提供一个可选的公共主题前缀。

## 服务操作

服务 API 支持三种用于发现和服务可观测性的操作。虽然 NATS 客户端会负责在这些主题上进行响应，但开发者仍需负责对服务的实际端点发起的请求做出响应。

* `PING` - 在 `$SRV.PING.>` 主题上发起的请求会收集正在运行的服务的回复。这有助于工具进行服务列表查询。
* `STATS` - 在 `$SRV.STATS.>` 主题上发起的请求会查询服务的统计信息。可用的统计信息包括总请求数、总错误数和总处理时间。
* `INFO` - 在 `$SRV.INFO.>` 主题上发起的请求会获取服务定义和元数据，包括组、端点等信息。