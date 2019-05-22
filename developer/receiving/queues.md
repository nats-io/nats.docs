# Queue Subscriptions

Subscribing to a queue group is only slightly different than subscribing to a subject alone. The application simply includes a queue name with the subscription. The effect of including the group is fairly major, since the server will now load balance messages between the members of the queue group, but the code differences are minimal.

Keep in mind that the queue groups in NATS are dynamic and do not require any server configuration. You can almost think of a regular subscription as a queue group of 1, but it is probably not worth thinking too much about that.

<div class="graphviz"><code data-viz="dot">
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="PUB updates"];
  subject [shape=circle, label="nats-server"];
  sub1 [shape=box, style="rounded", label="SUB updates workers"];
  sub2 [shape=box, style="rounded", label="SUB updates workers"];
  sub3 [shape=box, style="rounded", label="SUB updates workers"];

  publisher -> subject [label="msgs 1,2,3"];
  subject -> sub1 [label="msg 2"];
  subject -> sub2 [label="msg 1"];
  subject -> sub3 [label="msg 3"];
}
</code></div>

As an example, to subscribe to the queue `workers` with the subject `updates`:

!INCLUDE "../../_examples/subscribe_queue.html"

If you run this example with the publish examples that send to `updates`, you will see that one of the instances gets a message while the others you run won't. But the instance that receives the message will change.