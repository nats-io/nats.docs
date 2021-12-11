# What is NATS

Software applications and services need to exchange data. NATS is an infrastructure that allows such data exchange, segmented in the form of messages. We call this a "**message oriented middleware**".

With NATS, application developers can:  

- Effortlessly build distributed and scalable client-server applications.

- Store and distribute data in realtime in a general manner. This can flexibly be achieved across various environments, languages, cloud providers and on-premises systems.

### NATS Client Applications

Developers use one of the NATS client libraries in their application code to allow them to publish, subscribe, request and reply between instances of the application or between completely separate applications. Those applications are generally referred to as 'client applications' or sometimes just as 'clients' throughout this manual (since from the point of view of the NATS server, they are clients).

### NATS Service Infrastructure

The NATS services are provided by one or more NATS server processes that are configured to interconnect with each other and provide a *NATS service infrastructure*. The NATS service infrastructure can scale from a single NATS server process running on an end device (the `nats-server` process is less than 20 MB in size!) all the way to a public global super-cluster of many clusters spanning all major cloud providers and all regions of the world such as Synadia's NGS.

### Connecting NATS Client applications to the NATS servers

To connect a NATS client application with a NATS service, and then subscribe or publish messages to subjects, it only needs to be configured with:

1. **URL:** A ['NATS URL'](/using-nats/developing-with-nats/connecting/README.md#nats-url). This is a string (in a URL format) that specifies the IP address and port where the NATS server(s) can be reached, and what kind of connection to establish (plain TCP, TLS, or Websocket).

2. **Authentication** (if needed): [Authentication](/using-nats/developing-with-nats/connecting/README.md#authentication-details) details for the application to identify itself with the NATS server(s). NATS supports multiple authentication schemes (username/password, decentralized JWT, token, TLS certificates and Nkey with challenge).

## Simple messaging design

NATS makes it easy for applications to communicate by sending and receiving messages. These messages are addressed and identified by subject strings, and do not depend on network location.

Data is encoded and framed as a message and sent by a publisher. The message is received, decoded, and processed by one or more subscribers.

![](../../.gitbook/assets/intro.svg)

With this simple design, NATS lets programs share common message-handling code, isolate resources and interdependencies, and scale by easily handling an increase in message volume, whether those are service requests or stream data.

### NATS Quality of service (QoS)

NATS offers multiple qualities of service, depending on whether the application uses just the _Core NATS_ functionality or also leverages the added functionalities enabled by _NATS JetStream_ (JetStream is built into `nats-server` but may not be enabled on all service infrastructures).  

- **At most once QoS:** _Core NATS_ offers an **at most once** quality of service. If a subscriber is not listening on the subject \(no subject match\), or is not active when the message is sent, the message is not received. This is the same level of guarantee that TCP/IP provides. _Core NATS_ is a fire-and-forget messaging system. It will only hold messages in memory and will never write messages directly to disk.

- **At-least / exactly once QoS:** If you need higher qualities of service (**at least once** and **exactly once**), or functionalities such as persistent streaming, de-coupled flow control, and Key/Value Store, you can use [NATS JetStream](/nats-concepts/jetstream/readme.md), which is built in to the NATS server (but needs to be enabled). Of course, you can also always build additional reliability into your client applications yourself with proven and scalable reference designs such as acks and sequence numbers.

