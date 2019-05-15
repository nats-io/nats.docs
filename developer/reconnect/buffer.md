# Buffering Messages During Reconnect Attempts

There is another setting that comes in to play during reconnection. This setting controls how much memory the client library will hold in the form of outgoing messages while it is disconnected. During a short reconnect, the client will generally allow applications to publish messages but because the server is offline, will be cached in the client. The library will then send those messages on reconnect. When the maximum reconnect buffer is reached, messages will no longer be publishable by the client.

!INCLUDE "../../_examples/reconnect_5mb.html"

> *As mentioned throughout this document, each client library may behave slightly differently. Please check the documentation for the library you are using.*