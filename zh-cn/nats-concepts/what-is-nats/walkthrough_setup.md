# 入门设置

我们已为您提供了入门指南，以便您自行尝试使用 NATS（以及 JetStream）。为了跟随这些入门指南操作，您可以选择以下任一选项：

* 必须安装 `nats` CLI 工具，并且必须安装本地 NATS 服务器（或者您可以使用您有权访问的远程服务器）。
* 您可以使用 Synadia 的 NGS。
* 您甚至可以使用安装 NATS 时所用的演示服务器。该服务器可通过 `nats://demo.nats.io` 访问（这是一个 NATS 连接 URL；不是浏览器 URL。您需要将其传递给 NATS 客户端应用）。

## 安装 [`nats`](../../using-nats/nats-tools/nats_cli/) CLI 工具

请参考 [README 文件中的安装部分](https://github.com/nats-io/natscli?tab=readme-ov-file#installation)。

## 在本地安装 NATS 服务器（如需）

如果您打算在本地运行服务器，则首先需要安装并启动它。  
请参阅 [NATS 服务器安装文档](../../running-a-nats-service/installation.md)。

或者，如果您已经知道如何在远程服务器上使用 NATS，则只需通过 `-s` 选项将服务器 URL 传递给 `nats`，或者最好使用 `nats context add` 创建一个上下文，以指定服务器 URL 和包含用户 JWT 的凭据文件。

### 启动 NATS 服务器（如需）

要在本地启动一个简单的演示服务器，只需运行以下命令：

```bash
nats-server
```

（或 `nats-server -m 8222`，如果您希望启用 HTTP 监控功能）

当服务器成功启动后，您将看到以下消息：

```
[14524] 2021/10/25 22:53:53.525530 [INF] Starting nats-server
[14524] 2021/10/25 22:53:53.525640 [INF]   Version:  2.6.1
[14524] 2021/10/25 22:53:53.525643 [INF]   Git:      [not set]
[14524] 2021/10/25 22:53:53.525647 [INF]   Name:     NDAUZCA4GR3FPBX4IFLBS4VLAETC5Y4PJQCF6APTYXXUZ3KAPBYXLACC
[14524] 2021/10/25 22:53:53.525650 [INF]   ID:       NDAUZCA4GR3FPBX4IFLBS4VLAETC5Y4PJQCF6APTYXXUZ3KAPBYXLACC
[14524] 2021/10/25 22:53:53.526392 [INF] Starting http monitor on 0.0.0.0:8222
[14524] 2021/10/25 22:53:53.526445 [INF] Listening for client connections on 0.0.0.0:4222
[14524] 2021/10/25 22:53:53.526684 [INF] Server is ready
```

NATS 服务器现在正在 TCP 端口 4222 上监听客户端连接。