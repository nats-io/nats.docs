## Concepts

In JetStream the configuration for storing messages is defined separately from how they are consumed. Storage is defined in a *Stream* and consuming messages is defined by multiple *Consumers*.

We'll discuss these 2 subjects in the context of this architecture.

![Orders](../.gitbook/assets/images/streams-and-consumers-75p.png)

While this is an incomplete architecture it does show a number of key points:

 * Many related subjects are stored in a Stream
 * Consumers can have different modes of operation and receive just subsets of the messages
 * Multiple Acknowledgement modes are supported

A new order arrives on `ORDERS.received`, gets sent to the `NEW` Consumer who, on success, will create a new message on `ORDERS.processed`.  The `ORDERS.processed` message again enters the Stream where a `DISPATCH` Consumer receives it and once processed it will create an `ORDERS.completed` message which will again enter the Stream. These operations are all `pull` based meaning they are work queues and can scale horizontally.  All require acknowledged delivery ensuring no order is missed.

All messages are delivered to a `MONITOR` Consumer without any acknowledgement and using Pub/Sub semantics - they are pushed to the monitor.

As messages are acknowledged to the `NEW` and `DISPATCH` Consumers, a percentage of them are Sampled and messages indicating redelivery counts, ack delays and more, are delivered to the monitoring system.