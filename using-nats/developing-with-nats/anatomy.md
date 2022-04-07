# What do you use NATS for?

You can use NATS to exchange information with and make requests to other applications. You can also use NATS to make your application into a distributed peer-to-peer application.

At a high level your application can use NATS to:

1. Send (Publish) information to other applications or instances of your application.
2. Receive (Subscribe) information (in real-time or whenever your application runs) from other applications or instances of your application.
3. Make a request to a server or the service provided by another application.
4. Store shared (consistent) state/data between other applications or instances of your application.
5. Be informed in real-time about any new data being sent, or any changes to the shared state/data.

Using NATS means that, as an application developer you never have to worry about:

* Who sends the information that you want to receive.
* Who is interested in the information you are sending to others, or how many are interested or where they are.
* Where the service you are sending a request to is located, or how many currently active instances of that service there are.
* How many partitions or servers there are in the cluster.
* Security (just identify yourself).
* Whether your application is up and running at the time the information is sent or not (using JetStream).
* Flow control (using JetStream)
* Higher qualities of services such as **exactly-once** (using JetStream)
* Fault-tolerance, and which servers are up or down at any given time.
* The topology of the NATS server infrastructure or it is architected.

# Anatomy of a NATS Client Application

A NATS Client Application will use the NATS Client Library in the following way:

At initialization time it will first connect (securely if needed) to a NATS Service Infrastructure (i.e. one of the NATS servers).

Once successfully connected the application will:
  * Create messages and publish them to subjects or streams.
  * Subscribe to subject(s) or stream consumers to receive messages from other processes.
  * Publish request messages to a service and receive a reply message.
  * Receive request messages and send back replies or acknowledgements.
  * Associate and retrieve messages associated with keys in KV buckets.
  * Store and retrieve arbitrary large blobs with keys in the object store.
 
Finally, when the application terminates it should disconnect from the NATS Service Infrastructure. 

See the following sections to learn more about those activities.

# Connecting and disconnecting

The first thing any application needs to do is connect to NATS. Depending on the way the NATS Service Infrastructure being used is configured the connection may need to be secured, and therefore the application also needs to be able to specify security credentials at connection time. An application can create as many NATS connections as needed (each connection being completely independent, it could for example connect twice as two different users), although typically most applications only make a single NATS connection.

Once you have obtained a valid connection, you can use that connection in your application to use all of the Core NATS functionalities such as subscribing to subjects, publishing messages, making requests (and getting a JetStream context).

Finally, the application will need to disconnect safely from NATS.

## [Connect to NATS](connecting/README.md)

## Monitoring the NATS connection

It is recommended that the application use [connection event listeners](events/events.md) in order to be altered and log whenever connections, reconnections or disconnections happen. Note that in case of a disconnection from the NATS server process the client library will automatically attempt to [reconnect](reconnect/README.md) to one of the other NATS servers in the cluster. You can also always check the [current connection status](events/README.md).

## Disconnecting safely from NATS
The recommended way to disconnect is to use [Drain()](receiving/drain.md) which will wait for any ongoing processing to conclude and clean everything properly, but if you need to close the connection immediately you can use `close()` from your connection object.

# Working with messages

Messages store the data that applications exchange with each other. A message has a *subject*, a *data payload* (byte array), and may also have a *reply-to* and *header* fields.

You get messages returned or passed to your callbacks from subscribing, or making requests. The publish (and request) operations typically just take a subject and a byte array data payload and create the message for you, but you can also create a message yourself (if you want to set some headers).

Some messages can be 'acknowledged' (for example message received from JetStream pull consumers), and there are multiple forms of acknowledgements (including negative acknowledgements, and acknowledgements indicating that your application has properly received the message but needs more time to process it).

### Structured data

Some libraries allow you to easily [send](sending/structure.md) and [receive](receiving/structure.md) structured data.

# Using Core NATS
Once your application has successfully connected to the NATS Server infrastructure, you can then start using the returned connection object to interact with NATS.

## Core NATS Publishing
You can directly [publish](sending/README.md) on a connection some data addressed by a subject (or publish a pre-created messages with headers).

### Flush and Ping/Pong

Because of caching, if your application is highly sensitive to latency, you may want to [flush](sending/caches.md) after publishing. 

Many of the client libraries use the [PING/PONG interaction](connecting/pingpong.md) built into the NATS protocol to ensure that flush pushed all of the buffered messages to the server. When an application calls flush, most libraries will put a PING on the outgoing queue of messages, and wait for the server to respond with a PONG before saying that the flush was successful.

Even though the client may use PING/PONG for flush, pings sent this way do not count towards [max outgoing pings](connecting/pingpong.md).

## Core NATS Subscribing
The process of subscribing involves having the client library tell the NATS that an application is interested in a particular subject. When an application is done with a subscription it unsubscribes telling the server to stop sending messages.

Receiving messages with NATS can be library dependent, some languages, like Go or Java, provide synchronous and asynchronous APIs, while others may only support one type of subscription. In general, applications can receive messages [asynchronously](receiving/async.md) or [synchronously](receiving/sync.md).

You can always subscribe to more than one subject at a time using [wildcards](receiving/wildcards.md).

In all cases, the process of subscribing involves having the client library tell the NATS system that an application is interested in a particular subject. When an application is done with a subscription it unsubscribes telling the server to stop sending messages.

A client will receive a message for each matching subscription, so if a connection has multiple subscriptions using identical or overlapping subjects \(say `foo` and `>`\) the same message will be sent to the client multiple times.

A client will receive a message for each matching subscription, so if a connection has multiple subscriptions using identical or overlapping subjects \(say `foo` and `>`\) the same message will be sent to the client multiple times.

### Subscribe as part of a queue group
You can also subscribe [as part of a distributed *queue group*](receiving/queues.md). All the subscribers with the same queue group name form the distributed queue. The NATS Servers automatically distributes the messages published on the matching subject(s) between the members of the queue group.

On a given subject there can be more than one queue group created by subscribing applications, each queue group being an independent queue and distributing its own copy of the messages between the queue group members.

### Slow consumers
One thing to keep in mind when making Core NATS subscriptions to subjects is that your application must be able to keep up with the flow of messages published on the subject(s) or it will otherwise become a [slow consumer](events/slow.md)

## Unsubscribing

When you no longer want to receive the messages on a particular subject you must call [unsubscribe](receiving/unsubscribing.md), or you can [automatically unsubscribe](receiving/unsub_after.md) after receiving a specific number of messages.
## Making requests to services

You can also use NATS to easily and transparently invoke services without needing to know about the location or number of servers for the service. The connection's [request](sending/request_reply.md) call publishes a message on the specified subject that contains a [reply-to](sending/replyto.md) inbox subject and then waits for a reply message to be received by that inbox.
## Servicing and replying to requests

The server applications servicing those requests simply need to subscribe to the subject on which the requests are published, process the request messages they receive and [reply](receiving/reply.md) to the message on the subject contained in the request message's [Reply-to](receiving/reply.md) attribute.

Typically, there is no reason not to want to make your service distributed (i.e. scalable and fault-tolerant). This means that unless there's a specific reason not to, application servicing requests should [subscribe to the request subject using the same queue group name](receiving/queues.md). You can have more than one queue group present on a subject (for example you could have one queue group to distribute the processing of the requests between service instances, and another queue group to distribute the logging or monitoring of the requests being made to the service).
# Streaming with JetStream

Some applications can make use of the extra functionalities enabled by [JetStream](../jetstream/develop_jetstream.md) (streams, KV Store, Object Store). Just like you use the Core NATS connection object to invoke Core NATS operations, you use a [*JetStream context*](js/context.md) to invoke JetStream operations.

## Streaming functionalities

You can use [streams](../jetstream/model_deep_dive.md#stream-limits-retention-and-policy) for two broad use cases:
- Temporal decoupling: the ability for a subscribing application to get on demand a replay of the messages stored in the stream due to past (and possibly future) publications. 
- Queuing: the ability for instances of the subscribing application to get, and safely process and remove (i.e. consume) from the stream individual or batches of messages, effectively using a stream as a distributed work queue.

## Defining streams

Before you can use a stream to replay or consume messages published on a subject, it must be defined. The stream definition attributes specify
- what is being stored (i.e. which subject(s) the stream monitors)
- how it is being stored (e.g. file or memory storage, number of replicas)
- how long the messages are stored (e.g. depending on limits, or on interest, or as a work queue): the retention policy

Streams can be (and often are) administratively defined ahead of time (for example using the NATS CLI Tool). The application can also [manage streams (and consumers) programmatically](js/streams.md).
## Publishing to streams

Any message published, on a subject monitored by a stream gets stored in the stream. If your application publishes a message using the Core NATS publish call (from the connection object) on a stream's subject, the message will get stored in the stream, the Core NATS publishers do not know or care whether there is a stream for that subject or not.
However, if you know that there is going to be a stream defined for that subject you will get higher quality of service by [publishing using the JetStream Context's publish call](js/publish.md) (rather than the connection's publish call). This is because JetStream publications will receive an acknowledgement (or not) from the NATS Servers when the message has been positively received _and_ stored in the stream (while Core NATS publications are not acknowledged by the NATS Servers). This difference is also the reason why there are both synchronous and asynchronous versions of the JetStream publish operation.

## Stream consumers

Stream *consumers* are how application get messages from stream. To make another analogy to database concepts a consumers can be seen as a kind of 'views' (on a stream):

- Consumers can have a *subject filter* to select messages from the stream according to their subject names.
- Consumers have an *ack policy* which defines whether application must *acknowledge* the reception and processing of the messages being sent to them by the consumers (note that explicit acknowledgements are _required_ for some types of streams and consumer to work properly). As well as how long to wait for acknowledgements for and how many times the consumer should try to re-deliver un-acknowledged messages for.
- Consumers have a [*deliver policy*](../jetstream/model_deep_dive.md#consumer-starting-position) specifying where in the stream the consumer should start delivering messages from.
- Consumers have a *replay policy* to specify the speed at which messages are being replayed at by the consumer.

Consumers also have a small amount of state on the NATS Server to store some message sequence numbers 'cursors'. You can have as many consumers as you need per stream.

Client applications either create *ephemeral* consumers, or define/find *durable* consumers. Applications either subscribe to 'push' consumers (consumers defined with a delivery subject and optionally a queue group name for that delivery subject), or fetch on demand (including an optional prefetch) from 'pull' consumers (consumers defined without a delivery subject or queue group name as they don't need any while providing the same functionality).

### Ephemeral consumers

[Ephemeral consumers](../jetstream/model_deep_dive.md#ephemeral-consumers) are, as the name suggest, not meant to last and are automatically cleaned up by the NATS Servers when the application instance that created them shuts down. Ephemeral consumers are created on-demand by individual application instances and are used only by the application instance that created them.

Applications typically use ephemeral *ordered push consumers* to get they own copy of the messages stored in a stream whenever they want.

### Durable consumers

Durable consumers are, as the name suggest, meant to be 'always on', and used (shared) by multiple instances of the client application or by applications that get stopped and restarted multiple times and need to maintain state from one run of the application to another.

Durable consumers can be managed administratively using the NATS CLI Tool, or programmatically by the application itself. A consumer is created as a durable consumer simply by specifying a durable name at creation time.

Applications typically use *durable pull consumers* to distribute and scale horizontally the processing (or consumption) of the messages in a stream.

### Consumer acknowledgements

Some types of consumers (e.g. pull consumers) require the application receiving messages from the consumer to *explicitly* [acknowledge](../jetstream/model_deep_dive.md#acknowledgement-models) the reception and processing of those messages. The application can invoke one of the following acknowledgement functions on the message received from the consumer:
- `ack()` to positively acknowledge the reception and processing of the message
- `term()` to indicate that the message could not be and will never be able to be processed and should not be sent again later. Use term when the request is invalid.
- `nack()` to negatively acknowledge the processing of the message, indicating that the message should be sent again. Use nack when the request is valid but you are unable to process it. If this inability to process happens because of a temporary condition, you should also close your subscription temporarily until you are able to process again.
- `inProgress()` to indicate that the processing of the message is still on-going and more time is needed (before the message is considered for being sent again)

## Higher Qualities of Service

Besides temporal decoupling and queuing, JetStream also enables higher qualities of service compared to Core NATS. Defining a stream on a subject and using consumers brings the quality of service up to *at least once*, meaning that you are guaranteed to get the message (even if your application is down at publication time) but there are some corner case failure scenarios in which you could result in message duplication due to double publication of the message, or double processing of a message due to acknowledgement loss or crashing after processing but before acknowledging. You can enable and use [message de-duplication](../jetstream/model_deep_dive.md#message-deduplication) and double-acking to protect against those failure scenarios and get [exactly once](../jetstream/model_deep_dive.md#exactly-once-delivery) quality of service.

## KV Store

The [Key Value store](js/kv.md) functionality is implemented on top of JetStream, but offers a different interface in the form of keys and values rather than subject names and messages. You can use a bucket to put (including compare and set), get and delete a value (a byte array like a message payload) associated with a key (a string, like a subject). It also allows you to 'watch' for changes to the buket as they happen. And finally it allows you to maintain a history of the values associated with a key over time, as well as get a specific revision of the value.

## Object Store
(placeholder for future functionality)