# Buffering Messages During Reconnect Attempts

The NATS client libraries try as much as possible to be fire and forget. One of the features that may be included in the library you are using is the ability to buffer outgoing messages when the connection is down.

During a short reconnect, these client can allow applications to publish messages that, because the server is offline, will be cached in the client. The library will then send those messages on reconnect. When the maximum reconnect buffer is reached, messages will no longer be publishable by the client.

Be aware, while the message appears to be sent to the application it is possible that it is never sent because the connection is never remade. Your applications should use patterns like acknowledgements to ensure delivery.

For clients that support this feature, you are able to configure the size of this buffer with bytes, messages or both.

!INCLUDE "../../_examples/reconnect_5mb.html"

> *As mentioned throughout this document, each client library may behave slightly differently. Please check the documentation for the library you are using.*
