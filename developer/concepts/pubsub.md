# Publish Subscribe

NATS implements a publish subscribe message distribution model as a one-to-many communication. A publisher sends a message on a subject and any active subscriber listening on that subject receives the message. Subscribers can also register interest in wildcard subjects. NATS and NATS Streaming combine to offer two qualities of service:

- **At Most Once Delivery (NATS w/TCP reliability)** - In the basic NATS platform, if a subscriber is not listening on the subject (no subject match), or is not active when the message is sent, the message is not received. NATS is a fire-and-forget messaging system. If you need higher levels of service, you can either use NATS Streaming, or build the additional reliability into your client(s) yourself.

- **At Least Once Delivery (NATS Streaming)** -  Some applications require higher levels of service and more stringent delivery guarantees but at the potential cost of lower message throughput and higher end-to-end delivery latency. These applications rely on the underlying messaging transport to ensure that messages are delivered to subscribers irrespective of network outages or whether or not a subscriber is offline at a particular point in time.

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