NATS has a built-in distributed persistence system called [JetStream](/jetstream/jetstream.md) upon which a number of functionalities are built:

* Streaming, or the ability to store and replay at will (and in order if needed) messages published on one or more subjects
  
* Key/Value store, or the ability to store, retrieve and delete value messages using a key

Note that JetStream completely replaces the [STAN](/legacy.md) legacy NATS streaming module.