# 叶子节点

_叶子节点_ 扩展了任何规模的现有 NATS 系统，可选地桥接运营商和安全域。叶子节点服务器会按需将消息从本地客户端透明地路由到一个或多个远程 NATS 系统，反之亦然。叶子节点使用本地策略对客户端进行身份验证和授权。根据任一方的叶子节点连接权限，允许消息流入集群或流入叶子节点。

叶子节点在 IoT 和边缘场景中非常有用，当本地服务器流量应该是低 RTT 且本地的（译注：本地的，在此处指消息仅在本地服务器管辖的客户端之间流转），除非路由到超级集群时。NATS 的队列语义通过优先服务本地队列消费者在叶子连接中得到遵守。

- 连接到叶子节点的客户端在本地（叶子节点处）进行身份验证（如果不需要身份验证，则直接连接）
- 叶子节点和集群之间的流量遵守用于创建叶子连接的用户配置的限制。
  - 允许用户发布的主题被导出到集群。
  - 允许用户订阅的主题被导入到叶子节点。

与[集群](../clustering/)或[网关](../gateways/)节点不同，叶子节点本身不需要可达，可以用于显式配置任何无环图拓扑。

如果叶子节点连接到一个集群，建议将其配置为知道**所有**_种子服务器_，并让**每个**_种子服务器_ 都接受来自叶子节点的连接。如果远程集群的配置发生变化，发现协议将传播能够接受叶子连接的节点。一个叶子节点可以有多个远程连接，每个连接到不同的集群。每个 remote 中的 URL 都需要指向同一个集群。如果集群中的一个节点被配置为叶子节点，则**所有**节点都需要配置。同样，如果集群中的一个服务器接受叶子节点连接，则**所有**服务器都需要接受。

> 叶子节点是桥接你控制的本地 NATS 服务器与第三方管理的服务器之间流量的重要组件。例如 [Synadia 的 NGS](https://www.synadia.com/cloud) 允许账户使用叶子节点，但可以访问全球网络，以便廉价地连接地理分布的服务器或小型集群。

[叶子节点配置选项](leafnode_conf.md)

## 叶子节点配置教程

主服务器只是一个标准的 NATS 服务器。连接到主集群的客户端仅使用令牌身份验证，但可以使用任何类型的身份验证。服务器在端口 7422（默认端口）允许叶子节点连接：

```
leafnodes {
    port: 7422
}
authorization {
    token: "s3cr3t"
}
```

启动服务器：

```bash
nats-server -c /tmp/server.conf
```

输出摘要

```text
...
[5774] 2019/12/09 11:11:23.064276 [INF] Listening for leafnode connections on 0.0.0.0:7422
...
```

我们在服务器上创建一个响应者来监听 'q' 上的请求，它会恰当地响应 '42'：

```bash
nats reply -s nats://s3cr3t@localhost q 42
```

叶子节点允许本地客户端通过端口 4111 连接，并且不需要任何类型的身份验证。配置指定了远程集群的位置，并指定了如何连接到它（在这个示例下只是一个简单的令牌）：

```
listen: "127.0.0.1:4111"
leafnodes {
    remotes = [
        {
          url: "nats://s3cr3t@localhost"
        },
    ]
}
```

在远程叶子连接使用 `tls` 的情况下：

```
listen: "127.0.0.1:4111"
leafnodes {
    remotes = [
        {
          url: "tls://s3cr3t@localhost"
        },
    ]
}
```

注意叶子节点配置列出了多个 `remotes`。`url` 指定了服务器上允许叶子节点连接的端口。

启动叶子节点服务器：

```bash
nats-server -c /tmp/leaf.conf
```

输出摘要

```text
....
[3704] 2019/12/09 09:55:31.548308 [INF] Listening for client connections on 127.0.0.1:4111
...
[3704] 2019/12/09 09:55:31.549404 [INF] Connected leafnode to "localhost"
```

把一个客户端连接到叶子服务器并向 'q' 发出请求：

```bash
nats req -s nats://127.0.0.1:4111 q ""
```

```text
Published [q] : ''
Received  [_INBOX.Ua82OJamRdWof5FBoiKaRm.gZhJP6RU] : '42'
```

## 使用远程全局服务的叶子节点示例

在这个例子中，我们将一个叶子节点连接到 Synadia 的 [NGS](https://www.synadia.com/cloud)。在免费开发者账户和付费账户上都能使用叶子节点功能。要使用 NGS，请确保你已经注册并在本地系统上加载了一个账户。如果你还没有账户，只需不到 30 秒就可以获得一个免费账户来跟随操作！

`nsc` 工具可以与多个账户和运营商一起操作，因此，确保你正在使用正确的运营商和账户至关重要。你可以像下面这样使用 `nsc` 工具设置账户。`DELETE_ME` 账户被用作示例，它作为免费账户在 NGS 注册。

```bash
❯ nsc env -a DELETE_ME
❯ nsc describe account
+--------------------------------------------------------------------------------------+
|                                   Account Details                                    |
+---------------------------+----------------------------------------------------------+
| Name                      | DELETE_ME                                                |
| Account ID                | ABF3NX7FJLDCUO5QXBH56PV6EU4PR5HFCUJBXAG57AKSDUBTGORDFOLI |
| Issuer ID                 | ODSKBNDIT3LTZWFSRAWOBXSBZ7VZCDQVU6TBJX3TQGYXUWRU46ANJJS4 |
| Issued                    | 2023-03-02 18:18:42 UTC                                  |
| Expires                   |                                                          |
+---------------------------+----------------------------------------------------------+
| Max Connections           | 10                                                       |
| Max Leaf Node Connections | Not Allowed                                              |
| Max Data                  | 1.0 GB (1000000000 bytes)                                |
| Max Exports               | 2                                                        |
| Max Imports               | 7                                                        |
| Max Msg Payload           | 1.0 kB (1000 bytes)                                      |
| Max Subscriptions         | 10                                                       |
| Exports Allows Wildcards  | True                                                     |
| Disallow Bearer Token     | False                                                    |
| Response Permissions      | Not Set                                                  |
+---------------------------+----------------------------------------------------------+
| Jetstream                 | Disabled                                                 |
+---------------------------+----------------------------------------------------------+
| Exports                   | None                                                     |
+---------------------------+----------------------------------------------------------+
```

`nsc` 工具知道该账户，所以让我们继续为我们的示例创建一个用户。

```bash
nsc add user leaftestuser
```

```text
[ OK ] generated and stored user key "UB5QBEU4LU7OR26JEYSG27HH265QVUFGXYVBRD7SVKQJMEFSZTGFU62F"
[ OK ] generated user creds file "~/.nkeys/creds/synadia/leaftest/leaftestuser.creds"
[ OK ] added user "leaftestuser" to account "leaftest"
```

让我们像之前一样创建一个叶子节点连接：

```
leafnodes {
    remotes = [
        {
          url: "tls://connect.ngs.global"
          credentials: "/Users/alberto/.nkeys/creds/synadia/leaftest/leaftestuser.creds"
        },
    ]
}
```

叶子节点的默认端口是 7422，所以我们不必指定它。

让我们启动叶子服务器：

```bash
nats-server -c /tmp/ngs_leaf.conf
```

```text
...
[4985] 2023/03/03 10:55:51.577569 [INF] Listening for client connections on 0.0.0.0:4222
...
[4985] 2023/03/03 10:55:51.918781 [INF] Connected leafnode to "connect.ngs.global"
```

再次，让我们连接一个响应者，但这次是连接到 Synadia 的 NGS。NSC 连接指定了凭据文件：

```bash
nsc reply q 42
```

现在让我们从本地主机发出请求：

```bash
nats-req q ""
```

```text
Published [q] : ''
Received  [_INBOX.hgG0zVcVcyr4G5KBwOuyJw.uUYkEyKr] : '42'
```

## 叶子节点授权

在某些情况下，你可能想要限制从叶子节点导出或从叶子连接导入的消息。你可以通过限制叶子连接客户端可以发布和订阅的内容来指定限制。请参阅 [NATS 授权](../securing_nats/authorization.md)了解如何做到这一点。

## TLS 优先握手

_自 NATS v2.10.0 起_

叶子节点连接遵循以下模型：当创建到服务器的 TCP 连接时，服务器将立即以明文发送 [INFO 协议消息](../../../reference/nats-protocol/nats-protocol/README.md#info)。此 INFO 协议提供元数据，包括服务器是否需要安全连接。

某些环境不希望配置为接受 TLS 连接的叶子节点服务器有任何明文发送的流量。可以使用 websocket 连接来绕过这一点。但是，如果不需要 websocket，接受和远程服务器可以[配置](./leafnode_conf.md#tls-block)为在发送 INFO 协议消息之前执行 TLS 握手。
