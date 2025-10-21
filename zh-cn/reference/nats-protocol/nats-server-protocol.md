# NATS 集群协议

## NATS Cluster Protocol

NATS 服务器集群协议描述了在 [集群](../../running-a-nats-service/configuration/clustering/)内的 NATS 服务器之间传递的协议，用于共享账户、订阅、转发消息以及共享有关新服务器的集群拓扑信息。这是一个简单的基于文本的协议。服务器通过常规的 TCP/IP 或 TLS 套接字进行通信，使用一组小型的协议操作，这些操作以换行符终止。

NATS 服务器实现了一个 [零分配字节解析器](https://youtu.be/ylRKac5kSOk?t=10m46s)，该解析器快速且高效。

NATS 集群协议与 NATS 客户端协议非常相似。在集群的上下文中，可以将服务器视作代表其连接的客户端运行的代理，负责订阅、取消订阅、发送和接收消息。

## NATS 集群协议约定

**主题名称和通配符**：NATS 集群协议与客户端协议在主题名称和通配符方面具有相同的功能和限制。然而，客户端仅绑定到单个账户，而集群协议则处理所有账户。

**字段分隔符**：NATS 协议消息的字段由空白字符（空格 `' '` 或制表符 `\t`）分隔。多个空白字符将被视为单个字段分隔符。

**换行符**：与其他基于文本的协议一样，NATS 使用 `CR` 后跟 `LF` (`CR+LF`, `\r`, `0x0D0A`) 来终止协议消息。此换行序列也用于标记 `RMSG` 协议消息中实际消息负载的开头。

## NATS 集群协议消息

下表简要描述了 NATS 集群协议消息。与客户端协议类似，NATS 协议操作名称不区分大小写，因此 `SUB foo 1\r` 等效于 `sub foo 1\r` 。

点击名称可查看更详细的信息，包括语法：

| OP Name                                      | Sent By       | Description                                                                  |
| -------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| [`INFO`](nats-server-protocol.md#info)       | All Servers   | Sent after initial TCP/IP connection and to update cluster knowledge         |
| [`CONNECT`](nats-server-protocol.md#connect) | All Servers   | Sent to establish a route                                                    |
| [`RS+`](nats-server-protocol.md#sub)         | All Servers   | Subscribes to a subject for a given account on behalf of interested clients. |
| [`RS-`](nats-server-protocol.md#unsub)       | All Servers   | Unsubscribe (or auto-unsubscribe) from subject for a given account.          |
| [`RMSG`](nats-server-protocol.md#rmsg)       | Origin Server | Delivers a message for a given subject and account to another server.        |
| [`PING`](nats-server-protocol.md#pingpong)   | All Servers   | PING keep-alive message                                                      |
| [`PONG`](nats-server-protocol.md#pingpong)   | All Servers   | PONG keep-alive response                                                     |
| [`-ERR`](nats-server-protocol.md#-err)       | All Servers   | Indicates a protocol error. May cause the remote server to disconnect.       |

以下各节将解释每个协议消息。

## INFO

### 描述

一旦服务器接受来自另一台服务器的连接，它将发送有关自身的信息，以及认证和交换消息所需的配置和安全要求。

连接的服务器也会发送一个 `INFO` 消息。接受服务器将添加一个包含连接服务器地址和端口的 `ip` 字段，并将新服务器的 `INFO` 消息转发给所有已路由到的服务器。

集群中的任何服务器如果收到带有 `ip` 字段的 `INFO` 消息，将尝试连接到该地址上的服务器，除非已经连接。这种代表连接服务器传播 `INFO` 消息的方式，实现了新加入集群服务器的自动发现。

### 语法

`INFO {["option_name":option_value],...}`

有效的选项如下：

* `server_id`：NATS 服务器的唯一标识符
* `version`：NATS 服务器的版本
* `go`：构建 NATS 服务器时使用的 golang 版本
* `host`：在集群参数/选项中指定的主机
* `port`：在集群参数/选项中指定的端口号
* `auth_required`：如果设置为真，则服务器应在连接时尝试进行认证。
* `tls_required`：如果设置为真，则服务器必须使用 TLS 进行认证。
* `max_payload`：服务器将接受的最大有效载荷大小。
* `connect_urls`：客户端可以连接的服务器 URL 列表。
* `ip`：服务器的可选路由连接地址，格式为 `nats-route://<hostname>:<port>`

### 示例

以下是从 NATS 服务器接收到的 `INFO` 字符串示例，其中包含 `ip` 字段。

```
INFO {"server_id":"KP19vTlB417XElnv8kKaC5","version":"2.0.0","go":"","host":"localhost","port":5222,"auth_required":false,"tls_required":false,"tls_verify":false,"max_payload":1048576,"ip":"nats-route://127.0.0.1:5222/","connect_urls":["localhost:4222"]}
```

## CONNECT

### 描述

`CONNECT` 消息类似于 [`INFO`](nats-server-protocol.md#info) 消息。一旦 NATS 服务器与另一台服务器建立了 TCP/IP 套接字连接，并且已收到 [`INFO`](nats-server-protocol.md#info) 消息，服务器将发送 `CONNECT` 消息，以提供有关当前连接以及安全信息的更多信息。

### 语法

`CONNECT {["option_name":option_value],...}`

有效的选项如下：

* `tls_required`：指示服务器是否需要 SSL 连接。
* `auth_token`：授权令牌
* `user`：连接用户名（如果设置了 `auth_required`）
* `pass`：连接密码（如果设置 `auth_required`）
* `name`：生成的服务器名称
* `lang`：服务器实现语言（go）。
* `version`：服务器版本。

### 示例

以下是来自服务器默认字符串的一个示例。

`CONNECT {"tls_required":false,"name":"wt0vffeQyoDGMVBC2aKX0b"}\r`

## RS+

### 描述

`RS+` 启动对给定账户上某个主题的订阅，可选地使用分布式队列组名和权重因子。请注意，队列订阅将使用 RS+ 来增加和减少队列权重，除非权重因子为 0。

### 语法

**订阅**：`RS+ <account> <subject>\r`

**队列订阅**：`RS+ <account> <subject> <queue> <weight>\r`

其中：

* `account`：与主题兴趣关联的账户
* `subject`：主题
* `queue`：可选队列组名
* `weight`：可选队列组权重，表示兴趣/订阅者的数量

## RS-

### 描述

`RS-` 取消对给定账户上指定主题的订阅。当服务器不再对某个主题感兴趣时，会发送此消息。

### 语法

**订阅**：`RS- <account> <subject>\r`

其中：

* `account`：与主题兴趣关联的账户
* `subject`：主题

## RMSG

### 描述

`RMSG` 协议消息将消息传递给另一台服务器。

### 语法

`RMSG <account> <subject> [reply-to] <#bytes>\r\n[payload]\r`

其中：

* `account`：与主题兴趣关联的账户
* `subject`：收到此消息的主题名称
* `reply-to`：可选回复主题
* `#bytes`：有效载荷的字节数
* `payload`：消息的有效载荷数据

## PING/PONG

### 描述

`PING` 和 `PONG` 实现了服务器之间的简单保活机制。一旦两台服务器建立彼此之间的连接，NATS 服务器将不断以可配置的时间间隔向其他服务器发送 `PING` 消息。如果另一台服务器未能在配置的响应时间内回复 `PONG` 消息，则服务器将终止其连接。如果您的连接长时间处于空闲状态，它将被切断。

如果另一台服务器发送 ping 请求，服务器将回复 pong 消息，以通知另一台服务器它仍然存在。

### 语法

`PING\r` `PONG\r`

## -ERR

### 描述

`-ERR` 消息由服务器用于向另一台服务器指示协议、授权或其他运行时连接错误。大多数此类错误会导致远程服务器关闭连接。