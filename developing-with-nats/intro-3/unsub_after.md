# Unsubscribing After N Messages

NATS provides a special form of unsubscribe that is configured with a message count and takes effect when that many messages are sent to a subscriber. This mechanism is very useful if only a single message is expected.

The message count you provide is the total message count for a subscriber. So if you unsubscribe with a count of 1, the server will stop sending messages to that subscription after it has received one message. If the subscriber has already received one or more messages, the unsubscribe will be immediate. This action based on history can be confusing if you try to auto unsubscribe on a long running subscription, but is logical for a new one.

> Auto unsubscribe is based on the total messages sent to a subscriber, not just the new ones.

Auto unsubscribe can also result in some tricky edge cases if a server cluster is used. The client will tell the server of the unsubscribe count when the application requests it. But if the client disconnects before the count is reached, it may have to tell another server of the remaining count. This dance between previous server notifications and new notifications on reconnect can result in unplanned behavior.

Finally, most of the client libraries also track the max message count after an auto unsubscribe request. Which means that the client will stop allowing messages to flow even if the server has miscounted due to reconnects or some other failure in the client library.

The following example shows unsubscribe after a single message:

!INCLUDE "../../\_examples/unsubscribe\_auto.html"

