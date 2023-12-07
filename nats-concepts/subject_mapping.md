# Subject Mapping and Partitioning

Subject mapping and transforms is a very powerful feature of the NATS server, useful for scaling some forms of distributed message processing through partitioning, for canary deployments, A/B testing, chaos testing, and migrating to a new subject namespace.

There are multiple places where you can apply subject transforms:

* At the Core NATS level each account has its own set of subject transforms, which will apply to any message published by client applications for that account, and you can also use subject transforms as part of the imports and exports between accounts.
* At the JetStream level you can define subject transforms as part of the stream configuration, which will apply to any message published to that stream, and you can also use subject transforms as part of the mirror and source configurations and for message republishing.

When not using operator JWT security, you can define the Core NATS account level subject transforms in server configuration files, and you simply need to send a signal for the nats-server process to reload the configuration whenever you change a transform for the change to take effect.

When using operator JWT security with the built-in resolver you define the transforms and the import/exports in the account JWT so after modifying them they will take effect as soon as you push the updated account JWT to the servers.

{% hint style="info" %}
You can easily test subject transforms using the [`nats`](../using-nats/nats-tools/nats\_cli/) CLI tool command `nats server mapping`.
{% endhint %}

## Simple Mapping

The example of `foo:bar` is straightforward. All messages the server receives on subject `foo` are remapped and can be received by clients subscribed to `bar`.

```
nats server mapping foo bar
```

## Subject Token Reordering

Wildcard tokens may be referenced by position number in the destination mapping using (only for versions 2.8.0 and above of `nats-server`) `{{wildcard(position)}}`. E.g. `{{wildcard(1)}}` references the first wildcard token, `{{wildcard(2)}}` references the second wildcard token, etc...

Example: with this transform `"bar.*.*" : "baz.{{wildcard(2)}}.{{wildcard(1)}}"`, messages that were originally published to `bar.a.b` are remapped in the server to `baz.b.a`. Messages arriving at the server on `bar.one.two` would be mapped to `baz.two.one`, and so forth. Try it for yourself using `nats server mapping`.

```
nats server mapping "bar.*.*"  "baz.{{wildcard(2)}}.{{wildcard(1)}}"
```

## Dropping Subject Tokens

You can drop tokens from the subject by not using all the wildcard tokens in the destination transform, with the exception of mappings defined as part of import/export between accounts in which case _all_ the wildcard tokens must be used in the transform destination.

## Splitting Tokens

There are two ways you can split tokens:

### Splitting on a separator

You can split a token on each occurrence of a separator string using the `split(separator)` transform function.

Examples:

* Split on '-': `nats server mapping "*" "{{split(1,-)}}" foo-bar` returns `foo.bar`.
* Split on '--': `nats server mapping "*" "{{split(1,--)}}" foo--bar` returns `foo.bar`.

### Splitting at an offset

You can split a token in two at a specific location from the start or the end of the token using the `SplitFromLeft(wildcard index, offset)` and `SplitFromRight(wildcard index, offset)` transform functions (note that the upper camel case on all subject transform function names is optional you can also use all lowercase function names if you prefer).

Examples:

* Split the token at 4 from the left: `nats server mapping "*" "{{splitfromleft(1,4)}}" 1234567` returns `1234.567`.
* Split the token at 4 from the right: `nats server mapping "*" "{{splitfromright(1,4)}}" 1234567` returns `123.4567`.

## Slicing Tokens

You can slice tokens into multiple parts at a specific interval from the start or the end of the token by using the `SliceFromLeft(wildcard index, number of characters)` and `SliceFromRight(wildcard index, number of characters)` mapping functions.

Examples:

* Split every 2 characters from the left: `nats server mapping "*" "{{slicefromleft(1,2)}}" 1234567` returns `12.34.56.7`.
* Split every 2 characters from the right: `nats server mapping "*" "{{slicefromright(1,2)}}" 1234567` returns `1.23.45.67`.

## Deterministic Subject token Partitioning

Deterministic token partitioning allows you to use subject-based addressing to deterministically divide (partition) a flow of messages where one or more of the subject tokens make up the key upon which the partitioning will be based, into a number of smaller message flows.

For example: new customer orders are published on `neworders.<customer id>`, you can partition those messages over 3 partition numbers (buckets), using the `partition(number of partitions, wildcard token positions...)` function which returns a partition number (between 0 and number of partitions-1) by using the following mapping `"neworders.*" : "neworders.{{wildcard(1)}}.{{partition(3,1)}}"`.

{% hint style="info" %}
Note that multiple token positions can be specified to form a kind of _composite partition key_. For example, a subject with the form `foo.*.*` can have a partition transform of `foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(5,1,2)}}` which will result in five partitions in the form `foo.*.*.<n>`, but using the hash of the two wildcard tokens when computing the partition number.
{% endhint %}

This particular transform means that any message published on `neworders.<customer id>` will be mapped to `neworders.<customer id>.<a partition number 0, 1, or 2>`. i.e.:

| Published on          | Mapped to               |
| --------------------- | ----------------------- |
| neworders.customerid1 | neworders.customerid1.0 |
| neworders.customerid2 | neworders.customerid2.2 |
| neworders.customerid3 | neworders.customerid3.1 |
| neworders.customerid4 | neworders.customerid4.2 |
| neworders.customerid5 | neworders.customerid5.1 |
| neworders.customerid6 | neworders.customerid6.0 |

The transform is deterministic because (as long as the number of partitions is 3) 'customerid1' will always map to the same partition number. The mapping is hash-based, it's distribution is random but tends towards 'perfectly balanced' distribution (i.e. the more keys you map the more the number of keys for each partition will tend to converge to the same number).

You can partition on more than one subject wildcard token at a time, e.g.: `{{partition(10,1,2)}}` distributes the union of token wildcards 1 and 2 over 10 partitions.

| Published on | Mapped to |
| ------------ | --------- |
| foo.1.a      | foo.1.a.1 |
| foo.1.b      | foo.1.b.0 |
| foo.2.b      | foo.2.b.9 |
| foo.2.a      | foo.2.a.2 |

What this deterministic partition transform enables is the distribution of the messages that are subscribed to using a single subscriber (on `neworders.*`) into three separate subscribers (respectively on `neworders.*.0`, `neworders.*.1` and `neworders.*.2`) that can operate in parallel.

```
nats server mapping "foo.*.*" "foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(3,1,2)}}"
```

### When is deterministic partitioning needed

The core NATS queue-groups and JetStream durable consumer mechanisms to distribute messages amongst a number of subscribers are partition-less and non-deterministic, meaning that there is no guarantee that two sequential messages published on the same subject are going to be distributed to the same subscriber. While in most use cases a completely dynamic, demand-driven distribution is what you need, it does come at the cost of guaranteed ordering because if two subsequent messages can be sent to two different subscribers which would then both process those messages at the same time at different speeds (or the message has to be re-transmitted, or the network is slow, etc...) and that could result in potential 'out of order' message delivery.

This means that if the application requires strictly ordered message processing, you need to limit distribution of messages to 'one at a time' (per consumer/queue-group, i.e. using the 'max acks pending' setting), which in turn hurts scalability because it means no matter how many workers you have subscribed only one at a time is doing any processing work.

Being able to evenly split (i.e. partition) subjects in a deterministic manner (meaning that all the messages on a particular subject are always mapped to the same partition) allows you to distribute and scale the processing of messages in a subject stream while still maintaining strict ordering per subject by for example inserting a partition number as a token in the message subject as part of the stream definition and then using subject filters to create a consumer per partition (or set of partitions).

Another reason to need deterministic partitioning is in the extreme message publication rate scenarios where you are reaching the limits of the throughput of incoming messages into a stream capturing messages using a wildcard subject. This limit can be ultimately reached at very high message rates due to the fact that a single nats-server process is acting as the RAFT leader (coordinator) for any given stream and can therefore become a limiting factor. In that case, distributing (i.e. partitioning) that stream into a number of smaller streams (each one with its own RAFT leader and therefore all these RAFT leaders are spread over all of the JetStream-enabled nats-servers in the cluster rather than a single one) in order to scale.

Yet another use case where deterministic partitioning can help is if you want to leverage local data caching of data (context or potentially heavy historical data for example) that the subscribing process need to access as part of the processing of the messages.

## Weighted Mappings

Traffic can be split by percentage from one subject transform to multiple subject transforms.

### For A/B Testing or Canary Releases

Here's an example for canary deployments, starting with version 1 of your service.

Applications would make requests of a service at `myservice.requests`. The responders doing the work of the server would subscribe to `myservice.requests.v1`. Your configuration would look like this:

```
  myservice.requests: [
    { destination: myservice.requests.v1, weight: 100% }
  ]
```

All requests to `myservice.requests` will go to version 1 of your service.

When version 2 comes along, you'll want to test it with a canary deployment. Version 2 would subscribe to `myservice.requests.v2`. Launch instances of your service.

Update the configuration file to redirect some portion of the requests made to `myservice.requests` to version 2 of your service.

For example the configuration below means 98% of the requests will be sent to version 1 and 2% to version 2.

```
    myservice.requests: [
        { destination: myservice.requests.v1, weight: 98% },
        { destination: myservice.requests.v2, weight: 2% }
    ]
```

Once you've determined Version 2 is stable you can switch 100% of the traffic over to it and you can then shut down the version 1 instance of your service.

### For Traffic Shaping in Testing

Traffic shaping is also useful in testing. You might have a service that runs in QA that simulates failure scenarios which could receive 20% of the traffic to test the service requestor.

`myservice.requests.*: [{ destination: myservice.requests.{{wildcard(1)}}, weight: 80% }, { destination: myservice.requests.fail.{{wildcard(1)}}, weight: 20% }`

### For Artificial Loss

Alternatively, introduce loss into your system for chaos testing by mapping a percentage of traffic to the same subject. In this drastic example, 50% of the traffic published to `foo.loss.a` would be artificially dropped by the server.

`foo.loss.>: [ { destination: foo.loss.>, weight: 50% } ]`

You can both split and introduce loss for testing. Here, 90% of requests would go to your service, 8% would go to a service simulating failure conditions, and the unaccounted for 2% would simulate message loss.

`myservice.requests: [{ destination: myservice.requests.v3, weight: 90% }, { destination: myservice.requests.v3.fail, weight: 8% }]` the remaining 2% is "lost"

## Cluster scoped Mappings

If you are running a super-cluster you can define transforms that apply only to messages being published from a specific cluster.

For example if you have 3 clusters named `east` `central` and `west` and you want to map messages published on `foo` in the `east` cluster to `foo.east`, those published in the `central` cluster to `foo.central` and so on for `west` you can do so by using the `cluster` keyword in the mapping source and destination.

```
mappings = {
        "foo":[
               {destination:"foo.west", weight: 100%, cluster: "west"},
               {destination:"foo.central", weight: 100%, cluster: "central"},
               {destination:"foo.east", weight: 100%, cluster: "east"}
        ]
}
```

This means that the application can be portable in terms of deployment and does not need to be configured with the name of the cluster it happens to be connected in order to compose the subject: it just publishes to `foo` and the server will map it to the appropriate subject based on the cluster it's running in.

## Subject Mapping and Transforms in Streams

You can define subject mapping transforms as part of the stream configuration.

Transforms can be applied in multiple places in the stream configuration:

* You can apply a subject mapping transformation as part of a Stream mirror.
* You can apply a subject mapping transformation as part of a Stream source.
* You can apply an overall stream ingress subject mapping transformation that applies to all matching messages regardless of how they are ingested into the stream.
* You can also apply a subject mapping transformation as part of the re-publishing of messages.

Note that when used in Mirror, Sources or Republish, the subject transforms are filters with optional transformation, while when used in the Stream configuration it only transforms the subjects of the matching messages and does not act as a filter.

![](../assets/images/stream-transform.png)
