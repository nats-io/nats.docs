# What is NATS

NATS messaging enables the exchange of data that is segmented into messages among computer applications and services. These messages are addressed by subjects and do not depend on network location. This provides an abstraction layer between the application or service and the underlying physical network. Data is encoded and framed as a message and sent by a publisher. The message is received, decoded, and processed by one or more subscribers.

NATS makes it easy for programs to communicate across different environments, languages, cloud providers and on-premise systems. Clients connect to the NATS system, usually via a single URL, and then subscribe or publish messages to subjects. With this simple design, NATS lets programs share common message-handling code, isolate resources and interdependencies, and scale by easily handling an increase in message volume, whether those are service requests or stream data.

<div class="graphviz"><code data-viz="dot">
graph nats {
  graph [splines=ortho, nodesep=1];

  publisher [shape="record", label="{Application 1 | <nats> NATS Publisher}"];
  application [shape="record", label="{Application 3 | <nats>  }"];
  natsserver [shape="box", label="", width=4, height=0, penwidth=1];
  subscriber [shape="record", label="{<nats> NATS Subscriber | Application 2}"];

  publisher:nats -- natsserver [penwidth=2];
  application:nats -- natsserver;
  natsserver -- subscriber:nats [penwidth=2, dir="forward"];
}
</code></div>

NATS core offers an **at most once** quality of service. If a subscriber is not listening on the subject (no subject match), or is not active when the message is sent, the message is not received. This is the same level of guarantee that TCP/IP provides. By default, NATS is a fire-and-forget messaging system. If you need higher levels of service, you can use [NATS Streaming](/nats_streaming/intro.md) or build additional reliability into your client applications with proven and scalable reference designs.
