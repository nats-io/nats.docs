# NATS 命令行工具

## 从客户端应用使用 NATS

连接到 NATS 消息系统最常见的形式是通过使用为 NATS 提供的 [40 多种客户端库](../developing-with-nats/developer.md) 中的任意一种构建的应用程序。

客户端应用将连接到一个 NATS 服务器实例，无论是单个服务器、服务器集群，甚至是全球超级集群（例如 [Synadia Cloud](https://www.synadia.com/cloud?utm_source=nats_docs&utm_medium=nats)），并通过一系列订阅者契约发送和接收消息。如果应用程序是用 GoLang 编写的，NATS 服务器甚至可以被[嵌入到 Go 应用程序中](https://dev.to/karanpratapsingh/embedding-nats-in-go-19o)。

当使用具有足够权限的账户时，客户端 API 还能访问几乎所有服务器配置任务。

## 命令行工具

除了使用客户端 API 管理 NATS 服务器之外，NATS 生态系统还提供了许多工具，用于通过 NATS 和流与其它应用程序和服务交互、支持服务器配置、增强监控或优化性能，例如：

* 一般交互与管理
  * [nats](nats_cli/README.md) - `nats` 命令行工具是从终端或脚本中与 NATS 和 JetStream 交互、测试和管理的最简单方式。其功能列表不断增长，请下载最新版本 [natscli](https://github.com/nats-io/natscli/releases)。
* 安全性
  * [nk](nk.md) - 生成 NKey，用于与 nsc 结合使用的 JSON Web Tokens (JWT)
  * [nsc](nsc/) - 配置运营商、账户、用户和权限，以便稍后将其推送到生产服务器。除非您正在使用 [Synadia Control Plane](https://www.docs.synadia.com/platform/control-plane?utm_source=nats_docs&utm_medium=nats)，否则这是创建安全配置的首选工具。
  * [nats account server](https://nats-io.gitbook.io/legacy-nats-docs/nats-account-server) - （**遗留项目，已被内置的 NATS resolver 取代**）自定义安全服务器。NAS 仍可用作定制安全集成的参考实现。
* 监控
  * [nats top](nats_top/) - 监控 NATS 服务器
  * [prometheus-nats-exporter](https://github.com/nats-io/prometheus-nats-exporter) - 将 NATS 服务器指标导出到 [Prometheus](https://prometheus.io/) 和 [Grafana](https://grafana.com) 仪表板。
* 基准测试
  * 请参阅 [nats](nats_cli/README.md) 工具的 [nats bench](nats_cli/natsbench.md) 子命令