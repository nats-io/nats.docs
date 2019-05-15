# Request Reply

NATS supports two flavors of request reply messaging: point-to-point or one-to-many. Point-to-point involves the fastest or first to respond. In a one-to-many exchange, you set a limit on the number of responses the requestor may receive.

In a request-response exchange, publish request operation publishes a message with a reply subject expecting a response on that reply subject. You can request to automatically wait for a response inline.

The request creates an inbox and performs a request call with the inbox reply and returns the first reply received. This is optimized in the case of multiple responses.

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
    sub1 [shape=box, style="rounded", label="Subscriber"];
    sub2 [shape=box, style="rounded", label="Subscriber"];
    sub3 [shape=box, style="rounded", label="Subscriber"];
  }

  publisher -> subject [label="msg1"];
  publisher -> reply [style="invis", weight=2];
  reply -> sub3 [style="invis", weight=2];
  subject -> sub1 [label="msg1", style="dotted"];
  subject -> sub2 [label="msg1", style="dotted"];
  subject -> sub3 [label="msg1"];
  sub3 -> reply;
  reply -> publisher;
}
</code></div>

Try NATS request reply on your own, using a live server by walking through the [request/reply tutorial](../tutorials/reqreply.md).
