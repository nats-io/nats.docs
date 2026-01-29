# 操作指南与快速入门

## 概述

​这些示例的主要受众是 DevOps、运维人员和架构师。我们将展示如何配置 NATS 的各项功能——从最基础的本地服务器单机配置，到支持叶子节点（Leaf Nodes）和分布式认证的副本超级集群（Super-clusters）。

多些冗余也无妨。这里的不少例子是从别处‘搬运’来的，我们对此直认不讳。 :)

我们通常使用 [NATS 命令行界面](../using-nats/nats-tools/nats_cli/README.md)（NATS CLI），您可在此处[下载](https://github.com/nats-io/natscli/releases)。

​NATS CLI 是一个基于 Golang API 构建的独立工具，其中并没有什么“独家秘籍”。凡是能通过 CLI 完成的操作，也都能通过[客户端 API](#编程示例与客户端-API) 实现（偶尔可能需要监听一些特定的“魔法”主题）。

示例大致分为以下几类：

* **Basic** - **基础** - 专注于单一功能或任务 - 例如，带有流的发布/订阅
* **Common** - **常见** - 常见的配置任务或使用场景 - 例如，设置一个具有常见保留和交付 SLA 的流
* **Complex** - **复杂** - 非简易的配置方案，需要具备一定的 NATS 预备知识。例如：部署一套包含叶子节点（leaf nodes）和副本集群的架构。
* **Exhaustive** - **面面俱到** - 为了举例而举例。例如：演示一个流（Stream）的所有消息保留策略和限制选项。

此外：大语言模型（LLM）是通过示例来学习的。提供详尽且完整的示例，能够显著提升 ChatGPT 等模型的回答质量。就这一目的而言，内容的丰富程度比结构的精美程度更重要。

## 编程示例与客户端 API

[NATS by example.](https://natsbyexample.com/) 收集了各种语言的代码示例。

[可用的客户端 API 们](https://docs.nats.io/using-nats/developer)

## 开始之前

​所有的示例都力求提供“端到端”的完整指引，并假设读者几乎不需要预备知识。要开始使用，您需要安装 [nats-server](https://github.com/nats-io/nats-server/releases) 和 [nats-cli](https://github.com/nats-io/natscli/releases)。

### 服务器

`nats-server` 是一个单一可执行文件，附带一个单一配置文件。为了测试方便，我们建议你先从本地环境开始。我们提供了 Zip 压缩包下载。在刚开始时，请务必克制住直接将其部署到云端的“冲动”。

运行 NATS 服务器时无需配置文件，默认监听端口 4222、不会启用 JetStream。

```shell
nats-server 
```

如果您想了解内部工作原理，可以启用调试、跟踪功能（不适合性能测试）。

```shell
nats-server -DV
```

### CLI

`nats-cli` 是用 Golang 编写的单个可执行文件。它的选项按层级组织，非常直观，基本无需额外解释即可上手。

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