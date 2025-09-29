# WebSocket

_自 NATS 服务器版本 2.2 起支持_

可以在服务器中启用 WebSocket 支持，并且可以与传统的 TCP 套接字连接一起使用。支持 TLS、压缩和 Origin 头检查。

**重要说明**

* NATS 仅支持二进制格式的 WebSocket 数据帧，不支持文本格式（[https://tools.ietf.org/html/rfc6455#section-5.6](https://tools.ietf.org/html/rfc6455#section-5.6)）。服务器将始终以二进制格式发送，你的客户端也必须以二进制格式发送。
* 对于客户端库的编写者：WebSocket 帧不保证包含完整的 NATS 协议（实际上通常不会）。来自帧的任何数据都必须通过可以处理部分协议的解析器。请参阅[此处](../../../reference/nats-protocol/nats-protocol/)的协议描述。
