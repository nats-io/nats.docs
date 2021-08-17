# Redelivery

When the server sends a message to a consumer, it expects to receive an ACK from this consumer. The consumer is the one specifying how long the server should wait before resending all unacknowledged messages to the consumer.

When the server restarts and recovers unacknowledged messages for a subscription, it will first attempt to redeliver those messages before sending new messages. However, if during the initial redelivery some messages don't make it to the client, the server cannot know that and will enable delivery of new messages.

_**So it is possible for an application to receive redelivered messages mixed with new messages. This is typically what happens outside of the server restart scenario.**_

For queue subscriptions, if a member has unacknowledged messages, when this member's `AckWait` \(which is the duration given to the server before the server should attempt to redeliver unacknowledged messages\) time elapses, the messages are redelivered to any other member in the group \(including itself\).

If a queue member leaves the group, its unacknowledged messages are redistributed to other queue members.

## Redelivery Of Acknowledged Messages

As described above, once the server sends a message to a consumer, a timer is started with a duration equal to the consumer's `AckWait`. After this interval is reached, and in the absence of an `Ack`, the message is redelivered.

Let's say that a consumer uses an `AckWait` of 5 seconds and the default `MaxInflight` of 1024 messages. Ten messages are available in the channel when this consumer is started. The server delivers them, and each one will be redelivered after 5 seconds if no `Ack` is received.

Suppose now that your application's message handler takes 4 seconds to process a single message, you can see that although the first message is acknowledged before the `AckWait` interval, the second message is not: it has been waiting in the library internal queue for 4 seconds while the first message was processed, and then it takes 4 more seconds to process that second message. After 1 second in the message callback, the server will already redeliver message 2. Since all other messages were delivered at the "same time", they too will be redelivered. Even if message 2 is acknowledged by the application, it does not prevent the redelivered message to be given again to the message callback.

After few processed messages \(and assuming that each takes 4 seconds of processing\), it is easy to see that some messages will be presented to the message callback many times over.

> One way to prevent this behavior would be to set `MaxInflight` to 1 when creating the subscription.

### Why is the library presenting an acknowledged message to the message callback?

For non-queue subscriptions, the libraries could have implemented some sort of ack floor mechanism that would allow it to detect that a message has been acknowledged by the user \(or auto-acknowledged when the callback returns\) and suppress the redelivered messages.

However, it is not possible for queue subscriptions - and they seem to be the most popular subscriptions - since a queue member can receive message sequences completely out of order. For instance, a member could receive message 1 to 10, while another member of the same group receive messages 11, 13 and 15. If the first member exits without acknowledging its messages, messages 1 to 10 may be redelivered to the member that already received messages 11, 13 and 15. So the concept of "floor" would not work. Some map/time-based detection approach could work, but is currently not implemented in any of the supported libraries.

