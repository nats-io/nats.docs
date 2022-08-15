# WebSocket

_Supported since NATS Server version 2.2_

WebSocket support can be enabled in the server and may be used alongside the traditional TCP socket connections. TLS, compression and Origin Header checking are supported.

**Important**

* NATS Supports only WebSocket data frames in Binary, not Text format \([https://tools.ietf.org/html/rfc6455\#section-5.6](https://tools.ietf.org/html/rfc6455#section-5.6)\). The server will always send in Binary and your clients MUST send in Binary too.
* For writers of client libraries: a WebSocket frame is not guaranteed to contain a full NATS protocol \(actually will generally not\). Any data from a frame must be going through a parser that can handle partial protocols. See the protocol description [here](../../../reference/nats-protocol/nats-protocol/).

