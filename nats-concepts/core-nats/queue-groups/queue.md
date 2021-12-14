# Queue Groups

## Queue Groups

NATS provides a built-in load balancing feature called distributed queues. Using queue subscribers will balance message delivery across a group of subscribers which can be used to provide application fault tolerance and scale workload processing.

To create a queue subscription, subscribers register a queue name. All subscribers with the same queue name form the queue group. This requires no configuration. As messages on the registered subject are published, one member of the group is chosen randomly to receive the message. Although queue groups have multiple subscribers, each message is consumed by only one.

Queue group names follow the same naming rules as [subjects](../../subjects.md). Foremost, they are case sensitive and cannot contain whitespace. Consider structuring queue groups hierarchically using `.`. Some server functionalities can use [wildcard matching](../../subjects.md#wildcards) on them.

One of the great features of NATS is that queue groups are defined by the application and their queue subscribers, not on the server configuration.

Queue subscribers are ideal for scaling services. Scale up is as simple as running another application, scale down is terminating the application with a signal that drains the in flight requests. This flexibility and lack of any configuration changes makes NATS an excellent service communication technology that can work with all platform technologies.

### No responder

When a request is made to a service (request/reply) and the NATS Server knows there are no services available (as there are no client applications currently subscribing to the subject in a queue-group) the server will short circuit the request. A “no-responders” protocol message will be sent back to the requesting client which will break from blocking API calls. This allows applications to immediately react which further enables building a highly responsive system at scale, even in the face of application failures and network partitions.

## Stream as a queue

With [JetStream](../../jetstream/readme.md) a stream can also be used as a queue by setting the retention policy to `WorkQueuePolicy` and leveraging [`pull` consumers](../../jetstream/consumers.md) to get easy horizontal scalability of the processing (or using an explicit ack push consumer with a queue group of subscribers).

![](../../../.gitbook/assets/queue.svg)

### Queuing geo-affinity

When connecting to a globally distributed NATS super-cluster, there is an automatic service geo-affinity due to the fact that a service request message will only be routed to another cluster (i.e. another region) if there are no listeners on the cluster available to handle the request locally.

### Tutorial

Try NATS queue subscriptions on your own, using a live server by walking through the [queueing walkthrough](queues_walkthrough.md).
