# JetStream Consumers

Consumers are how client applications get the messages stored in the streams. You can have many consumers on a single stream. Consumers are like a view on a stream, can filter messages and have some state (maintained by the servers) associated with them.

Consumers can be 'durable' or 'ephemeral'.

## Ephemeral consumers
Ephemeral consumers are meant to be used by a single instance of an application (e.g. to get its own replay of the messages in the stream).

Ephemeral consumers are not meant to last 'forever', they are defined automatically at subscription time by the client library and disappear after the application disconnect.

You (automatically) create an ephemeral consumer when you call the js.Subscribe function without specifying the Durable or Bind subscription options. Calling Drain on that subscription automatically deletes the underlying ephemeral consumer.
You can also explicitly create an ephemeral consumer by not passing a durable name option to the jsm.AddConsumer call.

## Durable consumers 
Durable consumers are meant to be used by multiple instances of an application, either to distribute and scale out the 
processing, or to persist the position of the consumer over the stream between runs of an application.

Durable consumers as the name implies are meant to last 'forever' and are typically created and deleted administratively rather than by the application code which only needs to specify the durable's well known name to use it.

You create a durable consumer using the `nats consumer add` CLI tool command, or programmatically by using the jsm.AddConsumer and passing a durable name option.

## Push and Pull consumers

Technically, there are two implementations of consumers identified as 'push' or 'pull' 
