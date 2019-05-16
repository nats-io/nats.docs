# Queue Subscribers & Sharing Work

NATS provides a load balancing feature called queue subscriptions. Using queue subscribers will load balance message delivery across a group of subscribers which can be used to provide application fault tolerance and scale workload processing.

To create a queue subscription, subscribers register a queue name. All subscribers with the same queue name form the queue group. As messages on the registered subject are published, one member of the group is chosen randomly to receive the message. Although queue groups have multiple subscribers, each message is consumed by only one.

Queue subscribers are ideal for auto scaling as you can add or remove them anytime, without any configuration changes or restarting the server or clients.

<div class="graphviz"><code data-viz="dot">
digraph nats_queues {
  rankdir=LR
  publisher [shape=box, style="rounded", label="Publisher"];
  subject [shape=circle, label="Queue"];
  sub1 [shape=box, style="rounded", label="Subscriber"];
  sub2 [shape=box, style="rounded", label="Subscriber"];
  sub3 [shape=box, style="rounded", label="Subscriber"];

  publisher -> subject [label="msgs 1,2,3"];
  subject -> sub1 [label="msg 2"];
  subject -> sub2 [label="msg 1"];
  subject -> sub3 [label="msg 3"];
}
</code></div>

Try NATS queue subscriptions on your own, using a live server by walking through the [queueing tutorial](../tutorials/queues.md).