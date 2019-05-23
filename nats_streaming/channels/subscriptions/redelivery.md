# Redelivery

When the server sends a message to a consumer, it expects to receive an ACK from this consumer. The consumer is the one specifying how long the server should wait before resending all unacknowledged messages to the consumer.

When the server restarts and recovers unacknowledged messages for a subscription, it will first attempt to redelivery those messages before sending new messages. However, if during the initial redelivery some messages don't make it to the client, the server cannot know that and will enable delivery of new messages.

***So it is possible for an application to receive redelivered messages mixed with new messages. This is typically what happens outside of the server restart scenario.***

For queue subscriptions, if a member has unacknowledged messages, when this member `AckWait` (which is the duration given to the server before the server should attempt to redeliver unacknowledged messages) time elapses, the messages are redelivered to any other member in the group (including itself).

If a queue member leaves the group, its unacknowledged messages are redistributed to other queue members.