# 故障排除

诊断 NATS JetStream 集群中的问题需要：

* 了解 [JetStream 概念](../../../../nats-concepts/jetstream/)
* 了解 [NATS 命令行界面 (CLI)](https://github.com/nats-io/natscli#the-nats-command-line-interface)

以下提示和命令（虽然不是详尽列表）在诊断 NATS JetStream 集群中的问题时可能很有用：

## 故障排除提示

1. 查看 [nats-server](https://github.com/nats-io/nats-server) 日志。默认情况下，只产生警告和错误日志，但调试和跟踪日志可以分别使用 `-D` 和 `-DV` 选项打开。或者，在[服务器配置](https://docs.nats.io/running-a-nats-service/configuration#monitoring-and-tracing)中启用 `debug` 或 `trace`。
2. 确保在 [NATS JetStream 配置](./#configuration)中，在此部分配置了至少一个系统用户：`{ $SYS { users } }`。

### `nats account` 命令

| Command                                                                 | Description                                 |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| [`nats account info`](../../../nats\_admin/jetstream\_admin/account.md) | Verify that JetStream is enabled on account |

### 基本 `nats server` 命令

| Command                                                       | Description                            |
| ------------------------------------------------------------- | -------------------------------------- |
| `nats server ls`                                              | List known servers                     |
| `nats server ping`                                            | Ping all servers                       |
| `nats server info`                                            | Show information about a single server |
| [`nats server check`](../../../clients.md#testing-your-setup) | Health check for NATS servers          |

### `nats server report` 命令

| Command                                                                       | Description                  |
| ----------------------------------------------------------------------------- | ---------------------------- |
| `nats server report connections`                                              | Report on connections        |
| `nats server report accounts`                                                 | Report on account activity   |
| [`nats server report jetstream`](administration.md#viewing-the-cluster-state) | Report on JetStream activity |

### `nats server request` 命令

| Command                                                                        | Description                   |
| ------------------------------------------------------------------------------ | ----------------------------- |
| [`nats server request jetstream`](administration.md#viewing-the-cluster-state) | Show JetStream details        |
| `nats server request subscriptions`                                            | Show subscription information |
| `nats server request variables`                                                | Show runtime variables        |
| `nats server request connections`                                              | Show connection details       |
| `nats server request routes`                                                   | Show route details            |
| `nats server request gateways`                                                 | Show gateway details          |
| `nats server request leafnodes`                                                | Show leafnode details         |
| `nats server request accounts`                                                 | Show account details          |

### `nats server cluster` 命令

| Command                                                                                       | Description                                                          |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`nats server cluster step-down`](administration.md#forcing-stream-and-consumer-leader-election) | Force a new leader election by standing down the current meta leader |
| [`nats server cluster peer-remove`](administration.md#evicting-a-peer)                           | Removes a server from a JetStream cluster                            |

### 实验性命令

| Command                                                                                | Description                                      |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [`nats traffic`](https://github.com/nats-io/natscli/blob/main/cli/traffic\_command.go) | Monitor NATS traffic. (**Experimental command**) |

## 进一步故障排除参考

* [测试您的设置](../../../clients.md#testing-your-setup)
