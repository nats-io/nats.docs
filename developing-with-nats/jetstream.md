# Developing with JetStream

## Deciding to use streaming and higher qualities of service

In modern systems, applications can expose services or produce and consume data streams. A basic aspect of publish-subscribe messaging is temporal coupling: the subscribers need to be up and running to receive the message when it is published. At a high level, if observability is required, applications need to consume messages in the future, need to consume at their own pace, or need all messages, then JetStream's streaming functionalities provide the temporal de-coupling between publishers and consumers.

Using streaming and its associated higher qualities of service is the facet of messaging with the highest cost in terms of compute and storage.

### When to use streaming

Streaming is ideal when:

* A historical record of a stream is required. This is when a replay of data is required by a consumer.

* The last message produced on a stream is required for initialization and the producer may be offline.

* A-priori knowledge of consumers is not available, but consumers must receive messages. This is often a false assumption.

* Data producers and consumers are highly decoupled. They may be online at different times and consumers must receive messages.

* The data in messages being sent have a lifespan beyond that of the intended application lifespan.

* Applications need to consume data at their own pace.

* You want de-coupled flow control between the publishers and the consumers of the stream

* You need 'exactly-once' quality of service with de-duplication of publications and double-acknowledged consumption

Note that no assumptions should ever be made of who will receive and process data in the future, or for what purpose.

### When to use Core NATS

Using core NATS is ideal for the fast request path for scalable services where there is tolerance for message loss or when applications themselves handle message delivery guarantees.

These include:

* Service patterns where there is a tightly coupled request/reply
    * A request is made, and the application handles error cases upon timeout

      \(resends, errors, etc\). __Relying on a messaging system to resend here is

      considered an anti-pattern.__
* Where only the last message received is important and new messages will

  be received frequently enough for applications to tolerate a lost message.

  This might be a stock ticker stream, frequent exchange of messages in a

  service control plane, or device telemetry.

* Message TTL is low, where the value of the data being transmitted degrades

  or expires quickly.

* The expected consumer set for a message is available a-priori and consumers

  are expected to be live. The request/reply pattern works well here or

  consumers can send an application level acknowledgement.

* Control plane messages.

## JetStream functionality overview

### Streams
  * You can use 'AddStream' to idempotently define streams and their attributes (i.e. source subjects, retention and storage policies, limits)
  * You can use 'Purge' to purge the messages in a stream
  * You can use 'Delete' to delete a stream


### Publish to a stream
There is interoperability between 'Core NATS' and JetStream in the fact that the streams are listening to core NATS messages. _However_ you will notice that the NATS client libraries' JetStream calls include some 'Publish' calls and so may be wondering what is the difference between a 'Core NATS Publish' and a 'JetStream Publish'.

So yes, when a 'Core NATS' application publishes a message on a Stream's subject, that message will indeed get stored in the stream, but that's not really the intent as you are then publishing with the lower quality of service provided by Core NATS. So, while it will definitely work to just use the Core NATS Publish call to publish to a stream, look at it more as a convenience that you can use to help ease the migration of your applications to use streaming rather the desired end state or ideal design.

Instead, it is better for applications to use the JetStream Publish calls (which Core NATS subscribers not using Streams will still receive like any other publication) when publishing to a stream as:
* JetStream publish calls are acknowledged by the JetStream enabled servers, which allows for the following higher qualities of service
    * If the publisher receives the acknowledgement from the server it can safely discard any state it has for that publication, the message has not only been received correctly by the server, but it has also been successfully persisted.
    * Whether you use the synchronous or the asynchronous JetStream publish calls, there is an implied flow control between the publisher and the JetStream infrastructure.
    * You can have 'exactly-once' quality of service by the JetStream publishing application inserting a unique publication ID in a header field of the message.

#### See Also
* [Sync and Async JetStream publishing in Java](https://nats.io/blog/sync-async-publish-java-client/#synchronous-and-asynchronous-publishing-with-the-nats-java-library)

### Create a consumer
    
Consumers 'views' into a stream, with their own cursor. They are how client applications get messages from a stream sent (i.e. 'replayed') to them for processing or consumption. They can filter the messages in the stream according to a 'filtering subject' and define which part of the stream is replayed according to a 'replay policy'.

You can create *push* or *pull* consumers:
* *Push* consumers (specifically ordered push consumers) are the best way for an application to receive its own complete copy of the selected messages in the stream.
* *Pull* consumers are the best way to scale horizontally the processing (or consuming) of the selected messages in the stream using multiple client applications sharing the same pull consumer, and allow for the processing of messages in batches.

Consumers can be ephemeral or durable, and support different sets of acknowledgement policies; none, this sequence number, this sequence number and all before it.

#### Replay policy

You select which of the messages in the stream you want to have delivered to your consumer
* all
* from a sequence number
* from a point in time
* the last message
* the last message(s) for all the subject(s) in the stream

And you can select the replay speed to be instant or to match the initial publication rate into the stream

### Subscribe from a consumer

Client applications 'subscribe' from consumers using the JetStream's Subscribe, QueueSubscribe or PullSubscribe (and variations) calls. 

#### Acknowledging messages
Some consumers require the client application code to acknowledge the processing or consumption of the message, but there is more than one way to acknowledge (or not) a message

* `Ack` Acknowledges a message was completely handled 
* `Nak` Signals that the message will not be processed now and processing can move onto the next message, NAK'd message will be retried 
* `InProgress` When sent before the AckWait period indicates that work is ongoing and the period should be extended by another equal to `AckWait` 
* `Term` Instructs the server to stop redelivery of a message without acknowledging it as successfully processed

#### See Also
* Java
  * [JetStream Java tutorial](https://nats.io/blog/hello-world-java-client/)
  * [JetStream stream creation in Java](https://nats.io/blog/jetstream-java-client-01-stream-create/)
  * [JetStream publishing in Java](https://nats.io/blog/jetstream-java-client-02-publish/)
  * [Consumers in Java](https://nats.io/blog/jetstream-java-client-03-consume/)
  * [Push consumers in Java](https://nats.io/blog/jetstream-java-client-04-push-subscribe/#jetstream-push-consumers-with-the-natsio-java-library)
  * [Pull consumers in Java](https://nats.io/blog/jetstream-java-client-05-pull-subscribe/#jetstream-pull-consumers-with-the-natsio-java-library)