# Object Store

{% hint style="warning" %}
If your objects fit within the JetStream [maximum message size](/running-a-nats-service/configuration#limits) (default 1MB, configurable up to 64MB), you should use the [Key/Value Store](/nats-concepts/jetstream/key-value-store/) instead. KV store is inherently simpler and more reliable for smaller data, providing immediate consistency and atomic operations without the complexity of chunking.
{% endhint %}

JetStream, the persistence layer of NATS, not only allows for the higher qualities of service and features associated with 'streaming', but it also enables some functionalities not found in messaging systems.

One such feature is the Object store functionality, which allows client applications to create `buckets` (corresponding to streams) that can store a set of files. Files are stored and transmitted in chunks, allowing files of arbitrary size to be transferred safely over the NATS infrastructure.

**Note:**  Object store is not a distributed storage system. All files in a bucket will need to fit on the target file system.

* [Walkthrough](obj_walkthrough.md)
* [Details](../../../using-nats/developing-with-nats/js/object.md)

## Basic Capabilities

The Object Store implements a chunking mechanism, allowing you to for example store and retrieve files (i.e. the object) of any size by associating them with a path or file name as the key.
 
* `add` a `bucket` to hold the files.
* `put` Add a file to the bucket
* `get` Retrieve the file and store it to a designated location
* `del` Delete a file

## Advanced Capabilities 

* `watch` Subscribe to changes in the bucket. Will receive notifications on successful `put` and `del` operations.
