# What is NATS

NATS messaging involves the electronic exchange of data among computer applications and provides a layer between the application and the underlying physical network. Application data is encoded as a message and sent by a publisher. The message is received, decoded, and processed by one or more subscribers.

By providing a scalable service via a single URL, NATS makes it easy for programs to communicate across different environments, languages, and systems. All clients have to do is connect to the broker, subscribe or publish to a subject and process messages. With this simple design, NATS lets programs share common message-handling code, isolate resources and interdependencies, and scale by easily handling an increase in message volume.

<div class="graphviz"><code data-viz="dot">
graph nats {
  graph [splines=ortho, nodesep=1];

  publisher [shape="record", label="{Application 1 | <nats> NATS Publisher}"];
  application [shape="record", label="{Application 3 | <nats>  }"];
  gnatsd [shape="box", label="", width=4, height=0, penwidth=1];
  subscriber [shape="record", label="{<nats> NATS Subscriber | Application 2}"];

  publisher:nats -- gnatsd [penwidth=2];
  application:nats -- gnatsd;
  gnatsd -- subscriber:nats [penwidth=2, dir="forward"];
}
</code></div>

NATS core offers an **at most once** quality of service. If a subscriber is not listening on the subject (no subject match), or is not active when the message is sent, the message is not received. This is the same level of guarantee that TCP/IP provides. By default, NATS is a fire-and-forget messaging system. If you need higher levels of service, you can either use NATS Streaming, or build the additional reliability into your client(s) yourself.
