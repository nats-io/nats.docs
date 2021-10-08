# What is NATS

NATS messaging enables the exchange of data that is segmented into messages among computer applications and services. These messages are addressed by subjects and do not depend on network location. This provides an abstraction layer between the application or service and the underlying physical network. Data is encoded and framed as a message and sent by a publisher. The message is received, decoded, and processed by one or more subscribers.

NATS makes it easy for programs to communicate across different environments, languages, cloud providers and on-premise systems. Clients connect to the NATS system, usually via a single URL, and then subscribe or publish messages to subjects. With this simple design, NATS lets programs share common message-handling code, isolate resources and interdependencies, and scale by easily handling an increase in message volume, whether those are service requests or stream data.

![](../.gitbook/assets/intro.svg)

_Core NATS_ offers an **at most once** quality of service. If a subscriber is not listening on the subject \(no subject match\), or is not active when the message is sent, the message is not received. This is the same level of guarantee that TCP/IP provides. _Core NATS_ is a fire-and-forget messaging system, will only hold messages in memory and will never write messages directly to disk.

If you need higher qualities of service (such as **exactly once**), or functionalities such persistent streaming, de-coupled flow control, and Key/Value Store, you can use [NATS JetStream ](/jetstream/jetstream.md), which is built-in into the NATS server (just needs to be enabled). Of course you can also always build additional reliability into your client applications yourself with proven and scalable reference designs such as acks and sequence numbers.

