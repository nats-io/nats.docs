# Acknowledgements

In a system with at-most-once semantics, there are times when messages are lost. If your application is doing request-reply then it can simply use timeouts to handle network and application failures. When you are using one-way messaging the easiest way to insure message delivery is to turn it into a request-reply with the concept of an acknowledgement message, or ACKS. In NATS an ACK can simply be an empty message, a message with no body.

<div class="graphviz"><code data-viz="dot">
digraph nats_request_reply {
  rankdir=LR

  subgraph {
    publisher [shape=box, style="rounded", label="Publisher"];
  }

  subgraph {
    subject [shape=circle, label="Subject"];
    reply [shape=circle, label="Reply"];
    {rank = same subject reply}
  }

  subgraph {
    sub1[shape=box, style="rounded", label="Subscriber"];
  }

  publisher -> subject [label="msg1"];
  publisher -> reply [style="invis", weight=2];
  subject -> sub1 [label="msg1"];
  sub1 -> reply [label="ack"];
  reply -> publisher;
}
</code></div>

Because the ACK can be empty it can take up very little network bandwidth, but the idea of the ACK turns a simple fire-and-forget into a fire-and-know world where the sender can be sure that the message was received by the other side, or with [scatter-gather](reqreply.md), several other sides.