# Queue Subscriptions

Subscribing to a queue group is only slightly different than subscribing to a subject alone. The application simply includes a queue name with the subscription. The effect of including the group is fairly major, since the server will now load balance messages between the members of the queue group, but the code differences are minimal.

Keep in mind that the queue groups in NATS are dynamic and do not require any server configuration. You can almost think of a regular subscription as a queue group of 1, but it is probably not worth thinking too much about that.

![](../../.gitbook/assets/queues.svg)

As an example, to subscribe to the queue `workers` with the subject `updates`:

!INCLUDE "../../\_examples/subscribe\_queue.html"

If you run this example with the publish examples that send to `updates`, you will see that one of the instances gets a message while the others you run won't. But the instance that receives the message will change.

