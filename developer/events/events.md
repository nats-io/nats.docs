# Listen for Connection Events

While the connection status is interesting, it is perhaps more interesting to know when the status changes. Most, if not all, of the NATS client libraries provide a way to listen for events related to the connection and its status.

The actual API for these listeners is language dependent, but the following examples show a few of the more common use cases. See the API documentation for the client library you are using for more specific instructions.

Connection events may include the connection being closed, disconnected or reconnected. Reconnecting involves a disconnect and connect, but depending on the library implementation may also include multiple disconnects as the client tries to find a server, or the server is rebooted.

!INCLUDE "../../_examples/connection_listener.html"

## Listen for New Servers

When working with a cluster, servers may be added or changed. Some of the clients allow you to listen for this notification:

!INCLUDE "../../_examples/servers_added.html"

## Listen for Errors

The client library may separate server-to-client errors from events. Many server events are not handled by application code and result in the connection being closed. Listening for the errors can be very useful for debugging problems.

!INCLUDE "../../_examples/error_listener.html"