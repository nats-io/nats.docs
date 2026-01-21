# Subject Mapping and Transforms

Subject mapping and transforms is a powerful feature of the NATS server. Transformations (we will use mapping and transform interchangeably) apply to various situations when messages are generated and ingested, acting as translations and in some scenarios as filters. 

{% hint style="warning" %}
Mapping and transforms is an advanced topic. Before proceeding, please ensure you understand NATS concepts like clusters, accounts and streams.
{% endhint %}

**Transforms can be defined (for details see below):**
* On the root of the config file (applying to the default $G account). Applying to all matching messages entering through client or leaf node connection into this account. Non-matching subjects will be unchanged.
* On the individual account level following the same rules as above.
* On subjects, which are imported into an account.
* In [JetStream](#subject-mapping-and-transforms-in-streams) context:
    * On messages imported by streams
    * On messages republished by JetStream
    * On messages copied to a stream via a source or mirror. For this purpose, the transform acts as a filter.

**Transforms may be used for:**
* Translating between namespaces. E.g. when mapping between accounts, but also when clusters and leaf nodes implement different semantics for the same subject. 
* Suppressing subjects. E.g. Temporarily for testing.
* For backward compatibility after changing the subject naming hierarchy.
* Merging subjects together.
* [Disambiguation and isolation on super-clusters or leaf nodes](#cluster-scoped-mappings), by using different transforms in different clusters and leaf nodes.
* Testing. E.g. merging a test subject temporarily into a production subject or rerouting a production subject away from a production consumer.
* [Partitioning subjects](#deterministic-subject-token-partitioning) and JetStream streams
* [Filtering](#subject-mapping-and-transforms-in-streams) messages copied (sourced/mirrored) into a JetStream stream
* [Chaos testing and sampling. Mappings can be weighted](#weighted-mappings). Allowing for a certain percentage of messages to be rerouted, simulating loss, failure etc.
* ...

**Priority and sequence of operations** 

* Transforms are applied as soon as a message enters the scope in which the transform was defined (cluster, account, leaf node, stream) and independent of how they arrived (publish by client, passing through gateway, stream import, stream source/mirror). And before any routing or subscription interest is applied. The message will appear as if published from the transformed subject under all circumstances.

* Transforms are **not applied recursively** in the same scope. This is necessary to prevent trivial loops. In the example below only the first matching rule is applied.

```shell
mappings: {
	transform.order target.order
	target.order transform.order
}
```

* Transforms are **applied in sequence** as they pass through different scopes. For example:
    1. A subject is transformed while being published
    2. Routed to a leaf node and transformed when received on the leaf node
    3. Imported into a stream and stored under a transformed name
    4. Republished from the stream to Core NATS under a final target subject
    
On a central cluster:
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
	orders.* orders.central.{{wildcard(1)}}
}
```
OR
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
	orders.> orders.central.>}
}
```

On a leaf cluster    
```
server_name: "store1"
cluster: { name: "store1" }
mappings: {
	orders.central.* orders.local.{{wildcard(1)}}
}
```

A stream config on the leaf cluster   
```
{
  "name": "orders",
  "subjects": [ "orders.local.*"],
  "subject_transform":{"src":"orders.local.*","dest":"orders.{{wildcard(1)}}"},
  "retention": "limits",
  ...
  "republish": [
    {
      "src": "orders.*",
      "dest": "orders.trace.{{wildcard(1)}}""
    }
  ],
```

**Security**

When using **config file-based account management** (not using JWT security), you can define the core NATS account level subject transforms in server configuration files, and simply need to reload the configuration whenever you change a transform for the change to take effect.

When using **operator JWT security** (distributed security) with the built-in resolver you define the transforms and the import/exports in the account JWT, so after modifying them, they will take effect as soon as you push the updated account JWT to the servers.

**Testing and debugging** 

{% hint style="info" %}
You can easily test individual subject transform rules using the [`nats`](../using-nats/nats-tools/nats\_cli/) CLI tool command `nats server mapping`. See examples below.
{% endhint %}

{% hint style="info" %}
From NATS server 2.11 (and NATS versions published thereafter) the handling of subjects, including mappings can be observed with `nats trace`

In the example below a message is first disambiguated from `orders.device1.order1` -> `orders.hub.device1.order1`. Then imported into a stream and stored under its original name.

```shell
nats trace orders.device1.order1

Tracing message route to subject orders.device1.order1

Client "NATS CLI Version development" cid:16 cluster:"hub" server:"hub" version:"2.11.0-dev"
    Mapping subject:"orders.hub.device1.order1"
--J JetStream action:"stored" stream:"orders" subject:"orders.device1.order1"
--X No active interest

Legend: Client: --C Router: --> Gateway: ==> Leafnode: ~~> JetStream: --J Error: --X

Egress Count:

  JetStream: 1
````
{% endhint %}



## Simple mappings

The example of `foo:bar` is straightforward. All messages the server receives on subject `foo` are remapped and can be received by clients subscribed to `bar`.

```
nats server mapping foo bar foo
> bar
```
When no subject is provided the command will operate in interactive mode:

```
nats server mapping foo bar
> Enter subjects to test, empty subject terminates.
>
> ? Subject foo
> bar

> ? Subject test
> Error: no matching transforms available
```

Example server config. Note that the mappings below apply only to the default $G account. 
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
    orders.flush  orders.central.flush 
	orders.* orders.central.{{wildcard(1)}}
}
```

Mapping a full wildcard
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
    orders.>  orders.central.> 
}
```

With accounts. While this mapping applies to a specific account.

```
server_name: "hub"
cluster: { name: "hub" }

accounts {
    accountA: { 
        mappings: {
            orders.flush  orders.central.flush 
        	orders.* orders.central.{{wildcard(1)}}
        }
    }
}
```

## Mapping a full wildcard '>'
A full wildcard token can be used ONCE in source expression and must be present on the destination expression as well exactly once.

Example: Prefixing a subject:
```
nats server mapping ">"  "baz.>" bar.a.b
> baz.bar.b.a
```



## Subject token reordering

Wildcard tokens may be referenced by position number in the destination mapping using (only for versions 2.8.0 and above of `nats-server`). Syntax: `{{wildcard(position)}}`. E.g. `{{wildcard(1)}}` references the first wildcard token, `{{wildcard(2)}}` references the second wildcard token, etc..

Example: with this transform `"bar.*.*" : "baz.{{wildcard(2)}}.{{wildcard(1)}}"`, messages that were originally published to `bar.a.b` are remapped in the server to `baz.b.a`. Messages arriving at the server on `bar.one.two` would be mapped to `baz.two.one`, and so forth. Try it for yourself using `nats server mapping`.

```
nats server mapping "bar.*.*"  "baz.{{wildcard(2)}}.{{wildcard(1)}}" bar.a.b
> baz.b.a
```

{% hint style="info" %}
An older style deprecated mapping syntax using `$1`.`$2` en lieu of  `{{wildcard(1)}}.{{wildcard(2)}}` may be seen in other examples.
{% endhint %}



## Dropping subject tokens

You can drop tokens from the subject by not using all the wildcard tokens in the destination transform, with the exception of mappings defined as part of import/export between accounts in which case _all_ the wildcard tokens must be used in the transform destination. 

```
nats server mapping "orders.*.*" "foo.{{wildcard(2)}}" orders.local.order1
> orders.order1
```

{% hint style="info" %}
Import/export mapping must be mapped bidirectionally unambiguous.
{% endhint %}

## Splitting tokens

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

## Slicing tokens

You can slice tokens into multiple parts at a specific interval from the start or the end of the token by using the `SliceFromLeft(wildcard index, number of characters)` and `SliceFromRight(wildcard index, number of characters)` mapping functions.

Examples:

* Split every 2 characters from the left: `nats server mapping "*" "{{slicefromleft(1,2)}}" 1234567` returns `12.34.56.7`.
* Split every 2 characters from the right: `nats server mapping "*" "{{slicefromright(1,2)}}" 1234567` returns `1.23.45.67`.

## Deterministic subject token partitioning

Deterministic token partitioning allows you to use subject-based addressing to deterministically divide (partition) a flow of messages where one or more of the subject tokens is mapped into a partition key. Deterministically means, the same tokens are always mapped into the same key. The mapping will appear random and may not be `fair` for a small number of subjects.

For example: new customer orders are published on `neworders.<customer id>`, you can partition those messages over 3 partition numbers (buckets), using the `partition(number of buckets, wildcard token positions...)` function which returns a partition number (between 0 and number of partitions-1) by using the following mapping `"neworders.*" : "neworders.{{wildcard(1)}}.{{partition(3,1)}}"`.

```
nats server mapping "neworders.*" "neworders.{{wildcard(1)}}.{{partition(3,1)}}" neworders.customerid1
> neworders.customerid1.0
```

{% hint style="info" %}
Note that multiple token positions can be specified to form a kind of _composite partition key_. For example, a subject with the form `foo.*.*` can have a partition transform of `foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(5,1,2)}}` which will result in five buckets in the form `foo.*.*.<n>`, but using the hash of the two wildcard tokens when computing the partition number.

```
nats server mapping "foo.*.*" "foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(5,1,2)}}" foo.us.customerid 
> foo.us.customerid.0
```
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

The transform is deterministic because (as long as the number of buckets is 3) 'customerid1' will always map to the same partition number. The mapping is hash-based, its distribution is random but tends towards 'perfectly balanced' distribution (i.e. the more keys you map the more the number of keys for each partition will tend to converge to the same number).

You can partition on more than one subject wildcard token at a time, e.g.: `{{partition(10,1,2)}}` distributes the union of token wildcards 1 and 2 over 10 buckets.

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

### When is deterministic partitioning uselful

The core NATS queue-groups and JetStream durable consumer mechanisms to distribute messages amongst a number of subscribers are partition-less and non-deterministic, meaning that there is no guarantee that two sequential messages published on the same subject are going to be distributed to the same subscriber. While in most use cases a completely dynamic, demand-driven distribution is what you need, it does come at the cost of guaranteed ordering because if two subsequent messages can be sent to two different subscribers which would then both process those messages at the same time at different speeds (or the message has to be re-transmitted, or the network is slow, etc.) and that could result in potential 'out of order' message delivery.

This means that if the application requires strictly ordered message processing, you need to limit distribution of messages to 'one at a time' (per consumer/queue-group, i.e. using the 'max acks pending' setting), which in turn hurts scalability because it means no matter how many workers you have subscribed, only one is doing any processing work at a time.

Being able to evenly split (i.e. partition) subjects in a deterministic manner (meaning that all the messages on a particular subject are always mapped to the same bucket) allows you to distribute and scale the processing of messages in a subject stream while still maintaining strict ordering per subject. For example, inserting a partition number as a token in the message subject as part of the stream definition and then using subject filters to create a consumer per bucket (or set of buckets).

Another scenario for deterministic partitioning is in the extreme message publication rate scenarios where you are reaching the limits of the throughput of incoming messages into a stream capturing messages using a wildcard subject. This limit can be ultimately reached at very high message rate due to the fact that a single nats-server process is acting as the RAFT leader (coordinator) for any given stream and can therefore become a limiting factor. In that case, distributing (i.e. partitioning) that stream into a number of smaller streams (each one with its own RAFT leader and therefore all these RAFT leaders are spread over all of the JetStream-enabled nats-servers in the cluster rather than a single one) in order to scale.

Yet another use case where deterministic partitioning can help is if you want to leverage local data caching of data (context or potentially heavy historical data for example) that the subscribing process need to access as part of the processing of the messages.

## Weighted mappings

Traffic can be split by percentage from one subject transform to multiple subject transforms.

### For A/B testing or canary releases

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

### For traffic shaping in testing

Traffic shaping is also useful in testing. You might have a service that runs in QA that simulates failure scenarios which could receive 20% of the traffic to test the service requestor.

`myservice.requests.*: [{ destination: myservice.requests.{{wildcard(1)}}, weight: 80% }, { destination: myservice.requests.fail.{{wildcard(1)}}, weight: 20% }`

### For artificial loss

Alternatively, introduce loss into your system for chaos testing by mapping a percentage of traffic to the same subject. In this drastic example, 50% of the traffic published to `foo.loss.a` would be artificially dropped by the server.

`foo.loss.>: [ { destination: foo.loss.>, weight: 50% } ]`

You can both split and introduce loss for testing. Here, 90% of requests would go to your service, 8% would go to a service simulating failure conditions, and the unaccounted for 2% would simulate message loss.

`myservice.requests: [{ destination: myservice.requests.v3, weight: 90% }, { destination: myservice.requests.v3.fail, weight: 8% }]` the remaining 2% is "lost"

## Cluster scoped mappings

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

## Subject mapping and transforms in streams

You can define subject mapping transforms as part of the stream configuration.

Transforms can be applied in multiple places in the stream configuration:

* You can apply a subject mapping transformation as part of a stream mirror
* You can apply a subject mapping transformation as part of a stream source
* You can apply an overall stream ingress subject mapping transformation that applies to all matching messages regardless of how they are ingested into the stream
* You can also apply a subject mapping transformation as part of the re-publishing of messages

Note that when used in Mirror, Sources or Republish, the subject transforms are filters with optional transformation, while when used in the Stream configuration it only transforms the subjects of the matching messages and does not act as a filter.

```
{
  "name": "orders",
  "subjects": [ "orders.local.*"],
  "subject_transform":{"src":"orders.local.*","dest":"orders.{{wildcard(1)}}"},
  "retention": "limits",
  ...
  "sources": [
    {
      "name": "other_orders",
      "subject_transforms": [
        {
          "src": "orders.online.*",
          "dest": "orders.{{wildcard(1)}}"
        }
      ]
    }
  ],
  "republish": [
    {
      "src": "orders.*",
      "dest": "orders.trace.{{wildcard(1)}}""
    }
  ]
    
}
```
{% hint style="info" %}
For `sources` and `republish` transforms the `src` expression will act as a filter. Non-matching subjects will be ignored.

For the stream level `subject_transform` non-matching subjects will stay untouched.
{% endhint %}

![](../assets/images/stream-transform.png)
