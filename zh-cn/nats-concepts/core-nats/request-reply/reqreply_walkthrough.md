# NATS 请求-回复操作指南

NATS 支持 [请求-回复](reqreply.md) 消息传递模式。在本教程中，您将探索如何使用 NATS 交换点对点消息。

## 先决条件

如果您尚未安装，请先[安装](/nats-concepts/what-is-nats/walkthrough_setup.md) `nats` CLI 工具，并可选地在您的机器上安装 nats-server。

## 操作步骤

启动两个终端会话。这两个会话将用于运行 NATS 请求和回复客户端。

### 在一个终端中启动回复客户端

```bash
nats reply help.please 'OK, I CAN HELP!!!'
```

您应该看到以下消息：_Listening on \[help.please\]_

这表示 NATS 接收客户端正在“help.please”主题上监听请求消息。在 NATS 中，接收方是一个订阅者。

### 在另一个终端中运行请求客户端

```bash
nats request help.please 'I need help!'
```

NATS 请求客户端通过向“help.please”主题发送消息“I need help!”来发起请求。

NATS 接收客户端接收到该消息后，生成回复\(“OK, I CAN HELP!!!”\)，并将其发送到请求方的收件箱。