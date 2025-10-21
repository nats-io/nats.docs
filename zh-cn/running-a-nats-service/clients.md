# NATS 服务器客户端

NATS 客户端是指连接到由其连接 URL 指定的某个 NATS 服务器的应用程序，并使用凭据文件向服务器及整个 NATS 基础设施进行身份验证和授权。

nats-server 不附带任何客户端，但它的配套工具是 [`nats`](../using-nats/nats-tools/nats_cli/) CLI 工具，即使您不打算运行自己的服务器，也应安装它。因为它是测试、监控、管理和一般与 NATS 基础设施交互的最佳工具（无论该基础设施是一个隔离的本地服务器、叶子节点服务器、集群甚至全球超级集群）。

其他需要了解的 NATS 客户端工具有：[`nsc`](../using-nats/nats-tools/nsc/) CLI 工具（用于管理账户属性和用户 JWT 令牌）以及用于管理 Nkeys 的 ['nk'](../using-nats/nats-tools/nk.md) 工具（和库）。

此外，大多数客户端库都附带示例程序，演示了发布消息、订阅主题、发送请求并回复消息。

## 嵌入 NATS

如果您的应用程序是用 Go 编写的，并且符合您的使用场景和部署情况，您甚至可以将 NATS 服务器嵌入到您的应用程序中。

[在 Go 中嵌入 NATS](https://dev.to/karanpratapsingh/embedding-nats-in-go-19o)

## 安装 `nats` CLI 工具

请参考 [README 文件中的安装部分](https://github.com/nats-io/natscli?tab=readme-ov-file#installation)。

## 测试您的设置

打开一个终端并[启动 nats-server](broken-reference)：

```shell
nats-server
```

```
[45695] 2021/09/29 02:22:53.570667 [INF] Starting nats-server
[45695] 2021/09/29 02:22:53.570796 [INF]   Version:  2.6.1
[45695] 2021/09/29 02:22:53.570799 [INF]   Git:      [not set]
[45695] 2021/09/29 02:22:53.570804 [INF]   Name:     NAAACXGWSD6ZW5KVHOTSGGPU2JCMZUDSMY5GVZZP27DMRPWYINC2X6ZI
[45695] 2021/09/29 02:22:53.570807 [INF]   ID:       NAAACXGWSD6ZW5KVHOTSGGPU2JCMZUDSMY5GVZZP27DMRPWYINC2X6ZI
[45695] 2021/09/29 02:22:53.571747 [INF] Listening for client connections on 0.0.0.0:4222
[45695] 2021/09/29 02:22:53.572051 [INF] Server is ready
```

在另一个终端会话中，首先检查与服务器的连接：

```shell
nats server check connection -s nats://0.0.0.0:4222
```

```
OK Connection OK:connected to nats://127.0.0.1:4222 in 790.28µs OK:rtt time 69.896µs OK:round trip took 0.000102s | connect_time=0.0008s;0.5000;1.0000 rtt=0.0001s;0.5000;1.0000 request_time=0.0001s;0.5000;1.0000
```

接下来，使用 `nats` CLI 工具启动一个订阅者：

```shell
nats subscribe ">" -s nats://0.0.0.0:4222
```

请注意，当客户端连接时，服务器并未记录任何有趣的信息，因为除非发生特别事件，否则服务器输出相对安静。

为了让服务器输出更加活跃，您可以指定 `-V` 标志以启用服务器协议跟踪消息的日志记录。继续操作，按 `<ctrl>+c` 终止正在运行的服务器进程，并使用 `-V` 标志重新启动服务器：

```shell
nats-server -V
```

```
[45703] 2021/09/29 02:23:05.189377 [INF] Starting nats-server
[45703] 2021/09/29 02:23:05.189489 [INF]   Version:  2.6.1
[45703] 2021/09/29 02:23:05.189493 [INF]   Git:      [not set]
[45703] 2021/09/29 02:23:05.189497 [INF]   Name:     NAIBOVQLOZSDIUFQYZOQUGV3PNZUT66D4WF5MKS2G7N423UGJDH2DFWG
[45703] 2021/09/29 02:23:05.189500 [INF]   ID:       NAIBOVQLOZSDIUFQYZOQUGV3PNZUT66D4WF5MKS2G7N423UGJDH2DFWG
[45703] 2021/09/29 02:23:05.190236 [INF] Listening for client connections on 0.0.0.0:4222
[45703] 2021/09/29 02:23:05.190504 [INF] Server is ready
[45703] 2021/09/29 02:23:07.111053 [TRC] 127.0.0.1:51653 - cid:4 - <<- [CONNECT {"verbose":false,"pedantic":false,"tls_required":false,"name":"NATS CLI Version 0.0.26","lang":"go","version":"1.12.0","protocol":1,"echo":true,"headers":true,"no_responders":true}]
[45703] 2021/09/29 02:23:07.111282 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - <<- [PING]
[45703] 2021/09/29 02:23:07.111301 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - ->> [PONG]
[45703] 2021/09/29 02:23:07.111632 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - <<- [SUB >  1]
[45703] 2021/09/29 02:23:07.111679 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - <<- [PING]
[45703] 2021/09/29 02:23:07.111689 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - ->> [PONG]
```

若你已经创建了一个订阅者，你应该注意到订阅者的输出，它告诉你它已断开连接并重新连接。上面的服务器输出更有趣。您可以看到订阅者发送了一个协议中的 `CONNECT` 消息和一个 `PING` ，服务器则以 `PONG` 响应。

> 您可以在此处了解更多关于[NATS协议的信息](../reference-protocols.md)，但比协议文档更有趣的是[一个交互式演示](../reference/nats-protocol/nats-protocol-demo.md)。

在第三个终端中，发布您的第一条消息：

```shell
nats pub hello world -s nats://0.0.0.0:4222
```

在订阅者窗口中，您应该看到：

```
[#1] Received on "hello"
world
```

## 针对远程服务器进行测试

如果NATS服务器运行在非默认的不同机器或不同端口上，您需要通过指定 _NATS URL_（在`nats context`中或使用`-s`标志）来告知客户端。

### NATS URLs

NATS URL的格式为：`nats://<server>:<port>` 和 `tls://<server>:<port>`。使用`tls`协议的URL表示建立安全的TLS连接。

如果您要连接到集群，可以指定多个URL（用逗号分隔）。例如，如果您在本地机器上运行一个由3个NATS服务器组成的测试集群，分别监听端口4222、5222和6222，则可以指定：`nats://localhost:4222,nats://localhost:5222,nats://localhost:6222`。

### 示例

```shell
nats sub -s nats://server:port ">"
```

如果您想尝试连接到远程服务器，NATS团队维护了一个演示服务器，URL 是 `demo.nats.io`。

```shell
nats sub -s nats://demo.nats.io ">"
```
