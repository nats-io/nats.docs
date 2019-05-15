# Request-Reply

The pattern of sending a message and receiving a response is encapsulated in most client libraries into a request method. Under the covers this method will publish a message with a unique reply-to subject and wait for the response before returning. In the older versions of some libraries a completely new reply-to subject is created each time. In newer versions, a subject hierarchy is used so that a single subscriber in the client library listens for a wildcard, and requests are sent with a unique child subject of a single subject.

The primary difference between the request method and publishing with a reply-to is that the library is only going to accept one response, and in most libraries the request will be treated as a synchronous action. The library may provide a way to set the timeout. For example, updating the previous publish example we may request `time` with a one second timeout:

!INCLUDE "../../_examples/request_reply.html"

You can also build your own request-reply using publish-subscribe if you need a different semantic or timing.
