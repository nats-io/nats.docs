# Request-Reply

Request-Reply is a common pattern in modern distributed systems. A request is sent and the application either waits on the response with a certain timeout or receives a response asynchronously. The increased complexity of modern systems requires features such as location transparency, scale up and scale down, observability and more. Many technologies need additional components, sidecars and proxies to accomplish the complete feature set.

NATS supports this pattern with its core communication mechanism, publish and subscribe. A request is published on a given subject with a reply subject, and responders listen on that subject and send responses to the reply subject. Reply subjects are unique subjects called _inbox_ that are dynamically directed back to the requestor, regardless of location of either party.

NATS allows multiple responders to run and form dynamic queue groups for transparent scale up. The ability for NATS applications to drain before exiting allows scale down with no requests being dropped. And since NATS is based on publish-subscribe, observability is as simple as running another application that can view requests and responses to measure latency, watch for anomalies, direct scalability and more.

The power of NATS even allows multiple responses where the first response is utilized and the system efficiently discards the additional ones. This allows for a sophisticated pattern to have multiple responders reduce response latency and jitter.

![](../../../.gitbook/assets/reqrepl.svg)

Try NATS request-reply on your own, using a live server by walking through the [request/reply walkthrough.](reqreply_walkthrough.md)
