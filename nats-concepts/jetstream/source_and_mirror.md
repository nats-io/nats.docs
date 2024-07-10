# Source and Mirror

When a stream is configured with a `source` or `mirror`, it will automatically and asynchronously replicate messages from the origin stream. There are several options when declaring the configuration.

- `Name` - Name of the origin stream to source messages from.
- `StartSeq` - An optional start sequence of the origin stream to start mirroring from.
- `StartTime` - An optional message start time to start mirroring from. Any messages that are equal to or greater than the start time will be included.
- `FilterSubject` - An optional filter subject which will include only messages that match the subject, typically including a wildcard. Note, this cannot be used with `SubjectTransforms`.
- `SubjectTransforms` - An optional set of [subject transforms](../../running-a-nats-service/configuration/configuring_subject_mapping.md) to apply when sourcing messages from the origin stream. Note, in this context, the `Source` will act as a filter on the origin stream and the `Destination` can optionally be provided to apply a transform. Since multiple subject transforms can be used, disjoint subjects can be sourced from the origin stream while maintaining the order of the messages. Note, this cannot be used with `FilterSubject`.
- `Domain` - An optional JetStream domain of where the origin stream exists. This is commonly used in a hub cluster and leafnode topology.

The stream using a source or mirror configuration can have its own retention policy, replication, and storage type.

{% hint style="info" %}
* Changes to to the stream using source or mirror,e.g. deleting messages or publishing, do not reflect back on the origin stream from which the data was received.
* Deletes in the origin stream are NOT replicated through a `source` or `mirror` agreement.
{% endhint %}

{% hint style="info" %}
`Sources` is a generalization of the `Mirror` and allows for sourcing data from one or more streams concurrently. 
If you require the target stream to act as a read-only replica:
* Configure the stream without listen subjects **or**
* Temporarily disable the listen subjects through client authorizations. 
{% endhint %}

## Source specifics
A stream defining `Sources` is a generalized replication mechanism and allows for sourcing data from **one or more streams** concurrently as well as allowing direct write/publish by clients. Essentially the source streams and client writes are aggregated into a single interleaved stream.
Subject transformation and filtering allow for powerful data distribution architectures.

{% hint style="info" %}
Sourcing messages does not retain sequence numbers. But it retain the in stream sequence of messages . Between streams sourced to the same target, the sequence of messages is undefined.
{% endhint %}

## Mirror specifics
A mirror can source its messages from **exactly one stream** and a clients can not directly write to the  mirror. Although messages cannot be published to a mirror directly by clients, messages can be deleted on-demand (beyond the retention policy), and consumers have all capabilities available on regular streams.

{% hint style="info" %}
* Mirroring messages always retains the sequence numbers of the origin stream. 
* Mirrors can be used for for (geographic) load distribution with the `MirrorDirect` stream attribute. See: [https://docs.nats.io/nats-concepts/jetstream/streams#configuration](https://docs.nats.io/nats-concepts/jetstream/streams#configuration)

{% endhint %}

## Expected behavior in edge conditions

* Source and mirror contracts are designed with one-way (geographic) data replication in mind. Neither configuration provides full synchronization between streams, which would include deletes or replication of other stream attributes.

* The content of the stream from which a source or mirror is drawn needs to be reasonable stable. Quickly deleting messages after publishing them may result in inconsistent replication due to the asynchronous nature of the replication process.

* Sources and Mirror try to be be efficient in replicating messages and are lenient towards the source/mirror origin temporarily not being reachable, e.g. when using leaf nodes, which are connected intermittently. For sake of efficiency the recovery interval in case of a disconnect is 10-20s.

* Mirror and source agreements do not create a visible consumer in the origin stream.

###  WorkQueue retention

Source and mirror work with origin stream with workqueue retention. The source/mirror will act as a consumer removing messages from the origin stream. 

The intended usage is for moving messages conveniently from one location to another (e.g. from a leaf node). It does not trivially implement a distributed workqueue. But a with the help of subject filtering can approximate a distributed workqueue.

{% hint style="warning" %}
If you try to create additional consumers on the origin stream the behavior is undefined.  
{% endhint %}

### Interest base retention

{% hint style="warning" %}
Source and mirror for interest based streams is not supported. Jetstream does not forbid this configuration but the behavior is undefined and may change in the future.
{% endhint %}


