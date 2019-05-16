# Request Reply

NATS supports two flavors of request reply messaging: point-to-point or one-to-many. Point-to-point involves the fastest or first to respond. In a one-to-many exchange, you can set a limit on the number of responses the requestor may receive or use a timeout to limit on the speed of the response.

In a request-response exchange the publish request operation publishes a message with a reply subject expecting a response on that reply subject. Many libraries allow you to use a function that will automatically wait for a response with a timeout. You can also handle that waiting process yourself.

The common pattern used by the libraries is that the request creates a unique inbox and performs a request call with the inbox reply and returns the first reply received. This is optimized in the case of multiple responses by ignoring later responses automatically.

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
