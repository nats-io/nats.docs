NATS 是一个[基于主题](../../subjects.md)的 [发布-订阅](pubsub.md) 消息系统。订阅者(Subscribers) 在监听某个主题时，会接收到发布到该主题的消息。如果订阅者没有主动监听该主题，则不会接收到消息。订阅者可以使用通配符标记（例如 `*` 和 `>`）来匹配 单个标记 或 主题的后缀部分。

# NATS 发布/订阅 操作指南

本操作指南演示了订阅者如何监听主题，以及发布者如何向特定主题发消息的方式。

![](../../../.gitbook/assets/pubsubtut.svg)

## 操作指南前提条件

如果您尚未安装，请先在您的机器上[安装](../../what-is-nats/walkthrough_setup.md) `nats` CLI 工具，并可选地安装 nats-server。

### 1. 创建订阅者 1

在一个 shell 或命令提示符窗口中，启动一个客户端订阅程序。

```bash
nats sub <subject>
```

其中 `<subject>` 是要监听的主题。建议使用唯一且有意义的主题字符串，以确保即使使用通配符时，消息也能准确到达正确的订阅者。

例如：

```bash
nats sub msg.test
```

您应看到以下消息：_Listening on [msg.test]_

### 2. 创建一个发布者并发布一条消息

在另一个 shell 或命令提示符窗口中，创建一个 NATS 发布者并发送一条消息。

```bash
nats pub <subject> <message>
```

其中 `<subject>` 是主题名称，`<message>` 是要发布的文本。

例如：

```bash
nats pub msg.test "NATS MESSAGE"
```

### 3. 验证消息的发布与接收

您会注意到，发布者发送消息后会打印出：_Published [msg.test] : 'NATS MESSAGE'_。

订阅者接收到消息后会打印出：_\[#1\] Received on [msg.test]: 'NATS MESSAGE'_。

如果订阅者未收到消息，请检查发布者和订阅者是否使用了相同主题名称。

### 4. 尝试发布另一条消息

```bash
nats pub msg.test "NATS MESSAGE 2"
```

您会注意到，订阅者接收到这条消息。
请注意，每次订阅客户端接收到该主题的消息时，消息计数都会递增。

### 5. 创建订阅者 2

在一个新的 shell 或命令提示符窗口中，启动一个新的 NATS 订阅者。

```bash
nats sub msg.test
```

### 6. 使用发布者客户端再发布一条消息

```bash
nats pub msg.test "NATS MESSAGE 3"
```

确认两个订阅客户端都收到了消息。

### 7. 创建订阅者 3

在一个新的 shell 或命令提示符窗口中，创建一个新的订阅者，监听不同的主题。

```bash
nats sub msg.test.new
```

### 8. 再次发布一条消息

```bash
nats pub msg.test "NATS MESSAGE 4"
```

订阅者 1 和订阅者 2 收到了消息，但订阅者 3 没有收到。为什么？因为订阅者 3 并未监听发布者使用的主题。

### 9. 修改订阅者 3 使用通配符

将最后一个订阅者更改为监听 `msg.*` 并运行：

```bash
nats sub msg.*
```

注：NATS 仅支持订阅者使用通配符，而不能在发布消息时使用通配符主题。

### 10. 再次发布一条消息

```bash
nats pub msg.test "NATS MESSAGE 5"
```

这次，三个订阅客户端都应该收到消息。您可以尝试更多子字符串和通配符的组合，以加深对这一功能的理解。

# 参考资料

通过 NATS CLI 实现发布-订阅模式

{% embed url="https://www.youtube.com/watch?v=jLTVhP08Tq0" %}
Publish-subscribe pattern - NATS CLI
{% endembed %}
