# 操作指南与快速入门

## 期望与内容

这些示例的主要受众是 Dev-Ops、运维人员和架构师。我们将展示如何配置 NATS 的各项功能，从简单的本地服务器到带有叶子节点的复制超级集群以及分布式认证。

冗余是好的。这里提供的许多示例在其他地方也能找到。我们毫无愧疚地直接引用。

我们通常使用 [NATS 命令行界面](../using-nats/nats-tools/nats_cli/README.md)（NATS CLI），您可在此处[下载](https://github.com/nats-io/natscli/releases)。

NATS CLI 是一个独立工具，基于 Golang API 构建，没有“魔法”。所有通过 CLI 完成的操作也可以通过 [客户端 API](#编程示例与客户端-API) 实现（有时也可以通过监听特定的“魔法”主题实现）。

示例大致分为以下几类：

* **Basic** - **基础** - 专注于单一功能或任务 - 例如，带有流的发布/订阅
* **Common** - **常见** - 常见的配置任务或使用场景 - 例如，设置一个具有常见保留和交付 SLA 的流
* **Complex** - **复杂** - 需要一些 NATS 先验知识的非平凡设置 - 例如，设置一个带有叶子节点、复制（容错）机制的集群
* **Exhaustive** - **详尽** - 仅为示例而提供的示例 - 例如，演示流的所有保留和限制选项

最后但同样重要的是：LLMs（大型语言模型）通过示例学习。提供详尽且完整的示例可以提高 ChatGPT 和响应的质量。就这一目的而言，内容比结构更重要。

## 编程示例与客户端 API

[NATS by example.](https://natsbyexample.com/) 收集了各种语言的代码示例。

[可用的客户端 API 们](https://docs.nats.io/using-nats/developer)

## 开始之前

示例力求端到端，并假设很少或没有先验知识。要开始使用，您需要安装 [nats-server](https://github.com/nats-io/nats-server/releases) 和 [nats-cli](https://github.com/nats-io/natscli/releases)。

### 服务器

`nats-server` 是一个单一可执行文件，附带一个单一配置文件。为了测试，我们建议从本地设置开始。提供了 ZIP 包。请暂时不要急于部署到云端。

运行 NATS 服务器时无需配置文件，默认监听端口 4222、不会启用 JetStream。

```shell
nats-server 
```

如果您想了解内部工作原理，可以启用调试、跟踪功能（不适合性能测试）。

```shell
nats-server -DV
```

### CLI

`nats-cli` 是用 Golang 编写的单个可执行文件，大部分选项都自解释，并按层次组织。

```shell
nats 

usage: nats [<flags>] <command> [<args> ...]

NATS Utility

NATS Server and JetStream administration.

See 'nats cheat' for a quick cheatsheet of commands

Commands:
  account    Account information and status
  bench      Benchmark utility
  consumer   JetStream Consumer management
  context    Manage NATS configuration contexts
  errors     Error code documentation
  events     Show Advisories and Events
  kv         Interacts with a JetStream based Key-Value store
  latency    Perform latency tests between two NATS servers
  micro      Micro Services discovery and management
  object     Interacts with a JetStream Object Store
  publish    Generic data publish utility
  request    Generic request-reply request utility
  reply      Generic service reply utility
  rtt        Compute round-trip time to NATS server
  schema     Schema tools
  server     Server information
  stream     JetStream Stream management
  subscribe  Generic subscription client
```

要了解发布操作，请使用以下命令：

```shell
nats publish 

usage: nats publish [<flags>] <subject> [<body>]

Generic data publish utility

Body and Header values of the messages may use Go templates to create unique
messages.

  nats pub test --count 10 "Message {{Count}} @ {{Time}}"

Multiple messages with random strings between 10 and 100 long:

  nats pub test --count 10 "Message {{Count}}: {{ Random 10 100 }}"

Available template functions are:

  Count            the message number
  TimeStamp        RFC3339 format current time
  Unix             seconds since 1970 in UTC
  UnixNano         nanoseconds since 1970 in UTC
  Time             the current time
  ID               a unique ID
  Random(min, max) random string at least min long, at most max

Args:
  <subject>  Subject to subscribe to
  [<body>]   Message body
```