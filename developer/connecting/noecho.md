# Turning Off Echo'd Messages

By default a NATS connection will echo messages if the connection also has interest in the published subject. This means that if a publisher on a connection sends a message to a subject any subscribers on that same connection will receive the message. Clients can opt to turn off this behavior, such that regardless of interest the message will not be delivered to subscribers on the same connection.

The NoEcho option can be useful in BUS patterns where all applications subscribe and publish to the same subject. Usually a publish represents a state change that the application already knows about, so in the case where the application publishes an update it does not need to process the update itself.

![](/assets/images/noecho.svg)

Keep in mind that each connection will have to turn off echo, and that it is per connection, not per application. Also, turning echo on and off can result in a major change to your applications communications protocol since messages will flow or stop flowing based on this setting and the subscribing code won't have any indication as to why.

!INCLUDE "../../_examples/no_echo.html"
