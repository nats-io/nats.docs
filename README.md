# Welcome

## The official [NATS](https://nats.io/) documentation

NATS is a simple, secure and high performance open source data layer for cloud native applications, IoT messaging, and microservices architectures.

We feel that it should be the backbone of your communication between services. It doesn't matter what language, protocol, or platform you are using; NATS is the best way to connect your services.

### 10,000 foot view

* Publish and subscribe to messages at millions of messages per second. At most once delivery.
* Supports fan-in/out delivery patterns
* Request/reply
* Every major language is supported
* Persistence via JetStream
  * at least once delivery or **exactly once** delivery
  * work queues
  * stream processing
  * data replication
  * data retention
  * data deduplication
  * Higher order data structures
    * Key/Value with watchers, versioning, and TTL
    * Object storage with versioning
* Security
  * TLS
  * JWT-based zero trust security
* Clustering
  * High availability
  * Fault tolerance
  * Auto-discovery
* Protocols supported
  * TCP
  * MQTT
  * WebSockets

All of this in a single binary that is easy to deploy and manage. No external dependencies, just drop it in and add a configuration file to point to other NATS servers and you are ready to go. In fact, you can even embed NATS in your application (for Go users)!

## Guided tour

1. In general we recommend trying to solve your problems first using [Core NATS](nats-concepts/core-nats/).
2. If you need to share state between services, take a look at the [KV](nats-concepts/jetstream/key-value-store/) or [Object Store](nats-concepts/jetstream/object-store/obj_store.md) in JetStream.
3. When you need lower level access to persistence streams, move on to using [JetStream](nats-concepts/jetstream/) directly for more advanced messaging patterns.
4. Learn about [deployment strategies](nats-concepts/adaptive_edge_deployment.md)
5. Secure your deployments with [zero trust security](running-a-nats-service/configuration/securing_nats/jwt/)

## Contribute

NATS is Open Source as is this documentation. Please [let us know](mailto:info@nats.io) if you have updates and/or suggestions for these docs. You can also create a Pull Request using the `Edit on GitHub` link on each page.

## Additional questions?

Feel free to chat with us on Slack [slack.nats.io](https://slack.nats.io).

Thank you from the entire NATS Team of Maintainers for your interest in NATS!
