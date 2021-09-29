NATS has a built-in distributed persistence system called [JetStream](/jetstream/jetstream.md) upon which a number of functionalities are built:

* Streaming, or the ability to store and replay at will (and in order if needed) messages published on one or more subjects with:
  * File or memory storage
  * De-coupled flow control
  * Fault-tolerance and Disaster Recovery with replication and mirroring
  * Multiple sources per stream with subject filtering for consumers
  * 3 retention policies (limits, interest and work queue)
  * Many replay policies
    * All, last new, by starting sequence number, by start time
    * Last message per subject
    * Instant or original replay speed
  * Mirroring between streams
* Key/Value store, or the ability to store, retrieve and delete _value_ messages associated with a _key_

Client applications can retrieve or consume messages in streams:
* Using `push` (callback) or highly horizontally scalable `pull` (with batching if needed) consumers
* As durable or ephemeral consumers
* Using explicit or automatic acknowledgements with:
  * Acks
  * Negative-Acks
  * 'In Progress' acks

JetStream also can provide the _exactly once_ quality of service by combining message de-duplication using client application provided unique id on the publisher's side and double-acks on the consumer's side.

Finally, JetStream can also do encryption at rest of the data it stores.

###### Legacy
Note that JetStream completely replaces the [STAN](/legacy-stan.md) legacy NATS streaming layer.