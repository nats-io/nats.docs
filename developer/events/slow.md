# Addressing Slow Consumers

NATS is designed to move messages through the server quickly. As a result, NATS depends on the applications to consider and respond to changing message rates. The server will do a bit of impedance matching, but if a client is too slow the server will eventually cut them off. These cut off connections are called _slow consumers_.

One way some of the libraries deal with bursty message traffic is to cache incoming messages for a subscription. So if an application can handle 10 messages per second and sometimes receives 20 messages per second, the library may hold the extra 10 to give the application time to catch up. To the server, the application will appear to be handling the messages and consider the connection healthy. It is up to the client library to decide what to do when the cache is too big, but most client libraries will drop incoming messages.

Receiving and dropping messages from the server keeps the connection to the server healthy, but creates an application requirement. There are several common patterns:

* Use request/reply to throttle the sender and prevent overloading the subscriber
* Use a queue with multiple subscribers splitting the work
* Persist messages with something like NATS streaming

Libraries that cache incoming messages may provide two controls on the incoming queue, or pending messages. These are useful if the problem is bursty publishers and not a continuous performance mismatch. Disabling these limits can be dangerous in production and although setting these limits to 0 may help find problems, it is also a dangerous proposition in production.

> Check your libraries documentation for the default settings, and support for disabling these limits.

The incoming cache is usually per subscriber, but again, check the specific documentation for your client library.

## Limiting Incoming/Pending Messages by Count and Bytes

The first way that the incoming queue can be limited is by message count. The second way to limit the incoming queue is by total size. For example, to limit the incoming cache to 1,000 messages or 5mb whichever comes first:

!INCLUDE "../../_examples/slow_pending_limits.html"

## Detect a Slow Consumer and Check for Dropped Messages

When a slow consumer is detected and messages are about to be dropped, the library may notify the application. This process may be similar to other errors or may involve a custom callback.

Some libraries, like Java, will not send this notification on every dropped message because that could be noisy. Rather the notification may be sent once per time the subscriber gets behind. Libraries may also provide a way to get a count of dropped messages so that applications can at least detect a problem is occurring.

!INCLUDE "../../_examples/slow_listener.html"
