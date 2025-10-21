# 自动重连

如果当前服务器连接因任何原因断开，那么，至少所有在 [nats.io GitHub 页面](https://github.com/nats-io) 上维护的客户端库，都会自动尝试重新连接。重新连接上服务器后，客户端库会自动重建所有订阅，因此应用程序程序员无需写任何代码处理重连机制。

除非特别 [禁用](disable.md)，否则客户端将尝试重新连接到它已知的其中一台服务器，无论是通过 `connect` 调用中提供的 URL，还是通过先前与 NATS 系统通信时系统提供的 URL。此功能使 NATS 应用程序和 NATS 系统本身能够自我修复，并在无需额外配置或干预的情况下重新配置自身。

您可以调整每次连接尝试之间的[等待时间](wait.md)、最大重连次数[限制](max.md)，以及调整重连[缓冲区](buffer.md)的大小。
## Tips

您的应用程序可以注册回调函数以接收[事件](events.md)，从而获得以下连接相关事件的通知：

* `ClosedCB ConnHandler`

当客户端不再连接时，将调用 ClosedCB 处理程序。

* `DisconnectedCB ConnHandler`

每当连接断开时，将调用 DisconnectedCB 处理程序。如果设置了 DisconnectedErrCB，则不会调用此处理程序。
**已弃用**：请改用 DisconnectedErrCB，后者会传递导致断开连接事件的错误。

* `DisconnectedErrCB ConnErrHandler`

每当连接断开时，将调用 DisconnectedErrCB 处理程序。断开连接时的错误可能为 nil，例如用户显式关闭连接时。
**注意**：如果设置了 DisconnectedErrCB，则不会调用 DisconnectedCB。

* `ReconnectedCB ConnHandler`

每当连接成功重新连接时，将调用 ReconnectedCB 处理程序。

* `DiscoveredServersCB ConnHandler`

每当有新服务器加入集群时，将调用 DiscoveredServersCB 处理程序。

* `AsyncErrorCB ErrHandler`
  
每当发生异步连接错误时（例如 慢速消费者 错误），将调用 AsyncErrorCB 处理程序。

## 连接超时属性

* `Timeout time.Duration`

Timeout 设置连接 Dial 操作的超时时间。默认值为 `2 * time.Second`。

* `PingInterval time.Duration`

PingInterval 是客户端向服务器发送 ping 命令的时间间隔，如果设置为 0 或负数则禁用。默认值为 `2 * time.Minute`。

* `MaxPingsOut int`

MaxPingsOut 是在引发 ErrStaleConnection 错误之前，可以等待响应的最大未决 ping 命令数量。默认值为 `2`。

## 重连属性

除了上述提到的错误和提示回调之外，您还可以在连接选项中设置一些重连属性：

* `AllowReconnect bool`

AllowReconnect 启用在从当前服务器断开连接时使用重连逻辑。默认值为 `true`。

* `MaxReconnect int`

MaxReconnect 设置在放弃之前尝试的重连次数。如果为负数，则永远不会放弃尝试重新连接。默认值为 `60`。

* `ReconnectWait time.Duration`

ReconnectWait 设置尝试重新连接（失败）后的退避时间。默认值为 `2 * time.Second`。

* `CustomReconnectDelayCB ReconnectDelayHandler`
  
CustomReconnectDelayCB 在库尝试了服务器列表中的每个 URL ，仍未能重新连接后被调用。它将当前尝试次数传递给用户。此函数返回库在再次尝试重新连接前休眠的时间。强烈建议该值包含一定的抖动，以防止所有连接同时尝试重新连接。

* `ReconnectJitter time.Duration`
  
ReconnectJitter 设置在没有使用 TLS 的情况下，添加到 *ReconnectWait* 的随机延迟的上限。请注意，任何抖动都会受到 ReconnectJitterMax 的限制。默认值为 `100 * time.Millisecond`。

* `ReconnectJitterTLS time.Duration`

ReconnectJitterTLS 设置在使用 TLS 的情况下，添加到 *ReconnectWait* 的随机延迟的上限。请注意，任何抖动都会受到 ReconnectJitterMax 的限制。默认值为 `1 * time.Second`。

* `ReconnectBufSize int`

ReconnectBufSize 是重连期间缓冲 bufio 的大小。一旦耗尽，发布操作将返回错误。默认值为 `8 * 1024 * 1024`。

* `RetryOnFailedConnect bool`

RetryOnFailedConnect 在无法连接到初始设置中的服务器时，立即设置连接为重连状态。此时将使用 *MaxReconnect* 和 *ReconnectWait* 选项，与已建立连接断开时类似。如果设置了 ReconnectHandler，则会在第一次成功重新连接时调用（如果初始连接失败），如果设置了 ClosedHandler，则会在连接失败时调用（在耗尽 MaxReconnect 次尝试后）。默认值为 `false`