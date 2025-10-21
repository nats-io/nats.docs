# 连接

为了使 NATS 客户端应用能够连接到 NATS 服务，并订阅或发布消息到主题，它需要知道如何连接到 NATS 服务器以及如何进行身份验证。

## NATS URL

1. "NATS URL" 是一个字符串（采用 URL 格式），代表着 NATS 服务器的 IP 地址和端口，以及要建立的连接类型：
   * 仅通过 TLS 加密的 TCP 连接（即以 `tls://...` 开头的 NATS URL）
   * 如果服务器已配置为支持 TLS，则使用 TLS 加密；否则使用未加密的普通 TCP 连接（即以 `nats://...` 开头的 NATS URL）
   * WebSocket 连接（即以 `ws://...` 开头的 NATS URL）

### 连接到集群

请注意，当连接到带集群的 NATS 服务基础设施时，存在多个 URL，应用程序应允许在其 NATS 连接功能中指定多个 URL（通常以逗号分隔的 URL 列表形式传递，例如 `"nats://server1:port1,nats://server2:port2"`）。

当连接到集群时，最好提供集群的完整“种子”URL 集合。

## 身份验证详细信息（Authentication details）

1. 如果需要：Authentication details 代表 应用程序向 NATS 服务器证明自己身份所需的详细信息。NATS 支持多种身份验证方案：
   * [用户名/密码凭据](./security/userpass.md)（可作为 NATS URL 的一部分传递）
   * [去中心化的 JWT 身份验证/授权](./security/creds.md)（应用程序配置包含 JWT 和私有 Nkey 的“凭据文件”位置）
   * [令牌身份验证](./security/token.md#connecting-with-a-token)（使用令牌字符串配置应用程序）
   * [TLS 证书](./security/tls.md#connecting-with-tls-and-verify-client-identity)（客户端配置为使用客户端 TLS 证书，服务器配置为将 TLS 客户端证书映射到服务器配置中定义的用户）
   * [带有挑战的 NKEY](./security/nkey.md)（客户端配置种子和用户 NKey）

### 运行时配置

您的应用程序应提供一种方式，在运行时配置要使用的 NATS URL。如果您希望使用安全的基础设施，应用程序必须提供要使用的凭据文件（.creds）的定义，或者在 URL 中编码令牌或 Nkey 的方法。

## 连接选项

除了连接性和安全性详细信息外，NATS 连接还有许多选项，从[超时](../reconnect/README.md#connection-timeout-attributes)到[重连](../reconnect/README.md#reconnection-attributes)，再到在应用程序中设置[异步错误和连接事件回调处理程序](../reconnect/README.md#advisories)。

## 参考资料

WebSocket 和 NATS

{% embed url="https://www.youtube.com/watch?v=AbAR9zgJnjY" %}
WebSocket 和 NATS | Hello World
{% endembed %}

NATS WebSockets 和 React

{% embed url="https://www.youtube.com/watch?v=XS_Q0i6orSk" %}
NATS WebSockets 和 React
{% endembed %}