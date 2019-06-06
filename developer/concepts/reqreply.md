# Request-Reply

Request-Reply is a common pattern in modern distributed systems. A request is sent and the application either waits on the response with a certain timeout or receives a response asynchronously.
The increased complexity of modern systems requires features such as location transparency, scale up and scale down, observability and more. Many technologies need additional components, sidecars and proxies to accomplish the complete feature set.

NATS supports this pattern with its core communication mechanism, publish and subscribe. A request is published on a given subject with a reply subject, and responders listen on that subject and send responses to the reply subject. Reply subjects
are usually a subject called and _INBOX that will be directed back to the requestor dynamically, regardless of location of either party.

NATS allows multiple responders to run and form dynamic queue groups for transparent scale up. The ability for NATS applications to drain before exiting allows scale down with no requests being dropped. And since NATS is based on publish-subscribe,
observability is as simple as running another application that can view requests and responses to measure latency, watch for anomalies, direct scalability and more.

The power of NATS even allows multiple responses where the first response is utilized and the system efficiently discards the additional ones. This allows for a sophisticated pattern to have multiple responders reduce response latency and jitter.

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
