# Queue Subscriptions

Using queues, from a subscription standpoint, is super easy. The application simply includes a queue name with the subscription.

<div class="graphviz"><code data-viz="dot">
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="PUB updates"];
  subject [shape=circle, label="gnatsd"];
  sub1 [shape=box, style="rounded", label="SUB updates workers"];
  sub2 [shape=box, style="rounded", label="SUB updates workers"];
  sub3 [shape=box, style="rounded", label="SUB updates workers"];

  publisher -> subject [label="msgs 1,2,3"];
  subject -> sub1 [label="msg 2"];
  subject -> sub2 [label="msg 1"];
  subject -> sub3 [label="msg 3"];
}
</code></div>

For example, to subscribe to the queue `workers` with the subject `updates`:

!INCLUDE "../../_examples/subscribe_queue.html"

If you run this example with the publish examples that send to `updates`, you will see that one of the instances gets a message while the others you run won't. But the instance that receives the message will change.