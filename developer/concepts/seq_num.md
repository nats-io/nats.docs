# Sequence Numbers

A common problem for one-to-many messages is that a message can get lost or dropped due to a network failure. A simple pattern for resolving this situation is to include a sequence id with the message. Receivers can check the sequence id to see if they miss anything.

<div class="graphviz"><code data-viz="dot">
digraph nats_pub_sub {
  rankdir=LR
  publisher [shape=box, style="rounded", label="Publisher"];
  subject [shape=circle, label="Subject"];
  sub [shape=box, style="rounded", label="Subscriber"];

  publisher -> subject [label="updates.1"];
  publisher -> subject [label="updates.2"];
  publisher -> subject [label="updates.3"];

  subject -> sub [label="updates.*"];
}
</code></div>

In order to really leverage sequence ids there are a few things to keep in mind:

* Each sender will have to use their own sequence
* If possible, receivers should be able to ask for missing messages by id

With NATS you can embed sequence ids in the message, or you can include them in the subject. For example, a sender can send messages to `updates.1`, `updates.2`, etc... and the subscribers can listen to `updates.*` and optionally parse the subject to determine the sequence id.