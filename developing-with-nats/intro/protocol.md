# Controlling the Client/Server Protocol

The protocol between the client and the server is fairly simple and relies on a control line and sometimes a body. The control line contains the operations being sent, like PING or PONG, followed by a carriage return and line feed, CRLF or "\r\n". The server has a setting that can limit the maximum size of a control line. For PING and PONG this doesn't come into play, but for messages that contain subject names, the control line length can be important. The server is also configured with a maximum payload size, which limits the size of a message body. The server sends the maximum payload size to the client at connect time but doesn't currently tell the client the maximum control line size.

## Set the Maximum Control Line Size

Some clients will try to limit the control line size internally to prevent an error from the server. These clients may or may not allow you to set the size being used, but if they do, the size should be set to match the server configuration.

For example, to set the maximum control line size to 2k:

!INCLUDE "../../\_examples/control\_2k.html"

## Get the Maximum Payload Size

While the client can't control the maximum payload size, clients may provide a way for applications to get the size after the connection is made. This will allow the application to chunk or limit data as needed to pass through the server.

!INCLUDE "../../\_examples/max\_payload.html"

## Turn On Pedantic Mode

The NATS server provides a _pedantic_ mode that does extra checks on the protocol. By default, this setting is off but you can turn it on:

!INCLUDE "../../\_examples/connect\_pedantic.html"

## Turn On/Off Verbose Mode

The NATS server also provide a _verbose_ mode. By default, verbose mode is enabled and the server will reply to every message from the client with either a +OK or a -ERR. Most clients turn off verbose mode, which disables all of the +OK traffic. Errors are rarely subject to verbose mode and client libraries handle them as documented. To turn on verbose mode, likely for testing:

!INCLUDE "../../\_examples/connect\_verbose.html"

