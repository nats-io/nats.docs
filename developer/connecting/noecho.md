# Turning Off Echo'd Messages

By default the server will echo messages. This means that if a publisher on a connection sends a message to a subject any subscribers on that same connection may receive the message. Turning off echo is a fairly new feature for the NATS server, but some of the clients already support it.

<div class="graphviz"><code data-viz="dot">
digraph {
  rankdir=LR;
  subgraph cluster_1 {
        shape=box;
        style="rounded";
        label = "Connection #1";

        publisher [shape=box, style="rounded", label="Publisher"];
        subscriber_1 [shape=box, style="rounded", label="Subscriber"];
    }
  subgraph cluster_2 {
        shape=box;
        style="rounded";
        label = "Connection #2";

        subscriber_2 [shape=box, style="rounded", label="Subscriber"];
    }

    subject [shape=circle, label="Subject"];

    publisher -> subject [label="msg"];
    subject -> subscriber_1 [label="echo'd msg", style="dashed"];
    subject -> subscriber_2 [label="msg"];
}
</code></div>

Keep in mind that each connection will have to turn off echo, and that it is per connection, not per application. Also, turning echo on and off can result in a major change to your applications communications protocol since messages will flow or stop flowing based on this setting and the subscribing code won't have any indication as to why.

!INCLUDE "../../_examples/no_echo.html"
