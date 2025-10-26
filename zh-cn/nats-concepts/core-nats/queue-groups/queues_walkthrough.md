# NATS 队列操作指南

NATS 支持一种使用 [队列组](queue.md) 的负载均衡形式。订阅者注册一个队列组名称，组中的单个订阅者会被随机选择来接收消息。

## 指南前提条件

如果您尚未安装，请先[安装](/nats-concepts/what-is-nats/walkthrough_setup.md) `nats` CLI 工具，并可选地在您的机器上安装 nats-server。

### 1. 启动队列组的第一个成员

`nats reply` 命令不仅会订阅主题，还会自动加入一个队列组（默认为 `"NATS-RPLY-22"`）。

```bash
nats reply foo "service instance A Reply# {{Count}}"
```

### 2. 启动队列组的第二个成员

在新的窗口中执行：

```bash
nats reply foo "service instance B Reply# {{Count}}"
```

### 3. 启动队列组的第三个成员

在新的窗口中执行：

```bash
nats reply foo "service instance C Reply# {{Count}}"
```

### 4. 发布一条 NATS 消息

```bash
nats request foo "Simple request"
```

### 5. 验证消息发布与接收

您应该看到只有队列组中的一个订阅者接收到消息并进行回复，同时您也可以从收到的回复消息中看到是哪个队列组订阅者处理了请求（即服务实例 A、B 或 C）。

### 6. 再次发布一条消息

```bash
nats request foo "Another simple request"
```

您应该看到这次由队列组中的另一个订阅者随机接收到消息。

您还可以连续发送任意数量的请求。从收到的消息中，您将看到这些请求在队列组成员之间的分布情况。例如：`nats request foo --count 10 "Request {{Count}}"`

### 7. 停止/启动 队列组成员

您可以随时启动另一个服务实例，或者终止某个实例，观察队列组如何自动处理实例的加入和移除。


## 参考资料

使用 NATS CLI 的队列组

{% embed url="https://youtu.be/jLTVhP08Tq0?t=101" %}
Queue Groups NATS CLI
{% endembed %}