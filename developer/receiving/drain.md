# Draining Connections and Subscriptions

A feature recently added across the NATS client libraries is the ability to drain connections or subscriptions. Closing a connection, or unsubscribing from a subscription are generally considered immediate requests. When you close or unsubscribe the library will halt messages in any pending queue or cache for subscribers. When you drain a subscription or connection, it will process any cached/pending messages before closing.

Drain provides clients that use queue subscriptions with a way to bring down applications without losing any messages. A client can bring up a new queue member, drain and shut down the old queue member, all without losing messages sent to the old client. Without drain, there is the possibility of lost messages due to queue timing.

The libraries can provide drain on a connection or on a subscriber, or both.

For a connection the process is essentially:

  1. Drain subscriptions
  2. Stop new messages from being published
  3. Flush any remaining messages
  4. Close

As an example of draining a connection:

!INCLUDE "../../_examples/drain_conn.html"

The mechanics of drain for a subscription are simpler:

 1. Unsubscribe at the server
 2. Process known messages
 3. Clean up

The API for drain can generally be used instead of unsubscribe:

!INCLUDE "../../_examples/drain_sub.html"

Because draining can involve messages flowing to the server, for a flush and asynchronous message processing, the timeout for drain should generally be higher than the timeout for a simple message request/reply or similar.