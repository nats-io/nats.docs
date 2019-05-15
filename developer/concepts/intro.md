# NATS Messaging Concepts

NATS messaging involves the electronic exchange of data among computer applications and provides a layer between the application and the underlying physical network. Application data is encoded as a message and sent by a publisher. The message is received, decoded, and processed by one or more subscribers. A subscriber can process a NATS message synchronously or asynchronously, depending on the client library used. 

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

Asynchronous processing uses a callback message handler to process messages. When a message arrives, the registered callback handler receives control to process the message. The client or the consuming application is not blocked from performing other work while it is waiting for a message. Asynchronous processing lets you create multi-threaded dispatching designs.

Synchronous processing requires that application code explicitly call a method to process an incoming message. Typically the message request is a blocking call that suspends processing until a message becomes available and if no message is available, the period for which the message processing call blocks, would be set by the client. Synchronous processing is typically used by a server whose purpose is to wait for and process incoming request messages and to send replies to the requesting application.

NATS makes it easy for programs to communicate across different environments, languages, and systems because all a client has to do is parse the message. NATS lets programs share common message-handling code, isolate resources and interdependencies, and scale by easily handling an increase in message volume.