# JetStream Concepts

## Functionalities enabled by JetStream

JetSteam is NATS' built-in distributed persistence sub-system. It enables new functionalities and higher qualities of service on top of the base 'Core NATS' functionality.

### Temporal de-coupling

In modern systems applications can expose services or produce and consume data streams using publish-subscribe messaging systems such as NATS.

A basic aspect of basic publish-subscribe messaging is temporal coupling: the subscribers need to be up and running to receive the message when it is published. At a high level, if observability is required, applications need to consume messages in the future, need to come consume at their own pace, or need all messages, then JetStream's streaming functionalities provide the temporal de-coupling between publishers and consumers.

### Higher qualities of services

Besides temporal de-coupling of the publishers and subscribers (i.e. 'streaming'), there are other functionalities and qualities of service that JetStream enables

#### Guaranteed messaging

The 'core NATS' basic quality of service is what is called *'at most once'* delivery of messages. It means that while relying on reliable network transport protocol (i.e. TCP) for communications between servers and clients (and between the servers themselves in clusters) to recover from 'casual' network failures (i.e. packet drops), it is not a 'guaranteed' quality of service: there are some failure scenarios that can cause client applications to experience 'message loss', specifically:
* Disconnections:
If a client application experiences a network outage that is significant enough for it's TCP connection to the server to get dropped or reset it can then fail to receive some messages that were buffered (or published) during that outage.
* Slow consumers
The NATS server infrastructure is designed to 'protect itself' against 'bad clients'. Specifically, if a NATS client application subscribing to messages can not keep up with the flow of publications on the subject (i.e. if the application is a 'slow consumer'), while the nats-server will do its best to buffer messages to be delivered to a subscribing client application its resources are never infinite and therefore in order to protect the nats-server from running out of memory buffers (including the buffers to connected client applications) have limits. When a client buffer's limit it reached the nats-server will react by 'resetting' the connection with that client and purging the buffer.

While the nats-server does log a 'slow consumer' message when dropping a client connection to protect itself, from the client application's point of view it simply looks like the application experienced temporary server disconnection, and some messages may never be received.

JetStream offers a "guaranteed" quality of service through the use of various acknowledgements (for both the publishers and subscribers) that offer two qualities of service beyond the base 'at most once' quality of service of Core NATS:
* *"at least once"* quality of service: leverage JetSteam acknowledged Publish calls and acknowledged consumers to ensure that all messages are received, without any 'loss' due to failures or client applications not being always up or being slow to consume. It is called 'at least once' because there are still some failure scenario corner cases that could result in some messages actually being received more than once by the consuming application (which is not a problem if the processing of the received messages is idempotent) 
* *"exactly once"* quality of service: add to the above the ability for the nats-server to perform message de-duplication on the publisher's side and avoid consuming application getting some messages more than once while recovering from some failure scenarios through the use of 'double acknowledgements'

Both of those qualities of service mean that client applications will automatically recover from getting disconnected from the nats-server without any message loss (if durable consumers are used, the client applications can even stop and restart later). For 'slow consumers' using a stream means that the 'buffering' of the messages for that slow consumer happen in a stream (which can be much larger than a server buffer) rather than a server buffer.

### Flow control

The most obvious way to avoid 'slow consumers' would be to implement some form of flow-control. While there is an inherent form of flow-control provided by TCP for communications over a network, it doesn't directly apply to publish/subscribe messaging systems because unlike TCP which is purely point-to-point (i.e. '1 to 1'), publish-subscribe allows for '1 to N' (and 'N to M') communications. 

If you were to implement a form of flow control for basic 'Core NATS' publish-subscribe you would have to implement an 'end-to-end' form of flow control (meaning between the publisher and all of its current subscribers) and it would mean that you would end up flow controlling you publisher(s) to the _lowest common denominator_ of all the current subscribers. Meaning that the publisher(s) would be slowed down to not publish faster than the _slowest_ of all its subscribers.
Because of this 'lowest common denominator' aspect of end-to-end flow control in 1-to-N or N-to-M communications and because one of the most important use-case for publish-subscribe messaging systems is the distribution of *real-time* data, 'Core NATS' does _not_ implement any kind of end-to-end flow control.

While you can certainly implement you own form of end-to-end flow-control with 'Core NATS' by leveraging the request/reply operaions, it is instead much easier (and better) to use JetStream and leverage the *de-coupled* flow control functionality that it offers.

Flow-control over JetStream is *de-coupled* because it is not 'end-to-end' but rather independently between the client application publishing with JetStream and stream (i.e. the JetStream enabled nats-server(s)) and between the stream and the client applications using JetStream consumers.

## Storage
In JetStream the configuration for storing messages is defined separately from how they are consumed. Storage is defined in a _Stream_ and consuming messages is defined by multiple _Consumers_.