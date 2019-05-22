# Publish-Subscribe

NATS implements a publish-subscribe message distribution model for one-to-many communication. A publisher sends a message on a subject and any active subscriber listening on that subject receives the message. Subscribers can also register interest in wildcard subjects that work a bit like a regular expression (but only a bit). This one-to-many pattern is sometimes called fan-out.

<div class="graphviz"><code data-viz="dot">
digraph nats_pub_sub {
  rankdir=LR
  publisher [shape=box, style="rounded", label="Publisher"];
  subject [shape=circle, label="Subject"];
  sub1 [shape=box, style="rounded", label="Subscriber"];
  sub2 [shape=box, style="rounded", label="Subscriber"];
  sub3 [shape=box, style="rounded", label="Subscriber"];

  publisher -> subject [label="msg1"];
  subject -> sub1 [label="msg1"];
  subject -> sub2 [label="msg1"];
  subject -> sub3 [label="msg1"];
}
</code></div>

Try NATS publish subscribe on your own, using a live server by walking through the [pub-sub tutorial](../tutorials/pubsub.md).