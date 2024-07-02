# Core NATS

Core NATS is the foundational functionality in a NATS system. It operates on a publish-subscribe model using subject/topic-based addressing. This model offers two significant advantages: location independence and a default many-to-many (M:N) communication pattern. These fundamental concepts enable powerful and innovative solutions for common development patterns, such as microservices, without requiring additional technologies like load balancers, API gateways, or DNS configuration.

NATS systems can be enhanced with [JetStream](../../nats-concepts/jetstream), which adds persistence capabilities. While Core NATS provides best-effort, at-most-once message delivery, JetStream introduces at-least-once and exactly-once semantics.
