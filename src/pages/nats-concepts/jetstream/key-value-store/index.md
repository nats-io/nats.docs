# Key/Value store

JetSteam, the persistence layer of NATS, doesn't just allow for higher qualities of service and features associated with 'streaming', but it also enables some functionalities not found in messaging systems.

One such feature is the Key/Value store functionality, which allows client applications to create 'buckets' and use them as immediately consistent, persistent [associative arrays](https://en.wikipedia.org/wiki/Associative_array).

You can use KV buckets to perform the typical operations you would expect from an immediately consistent key/value store:

* put: associate a value with a key
* get: retrieve the value associated with a key
* delete: clear any value associated with a key
* purge: clear all the values associated with all keys
* create: associate the value with a key only if there is currently no value associated with that key (i.e. compare to null and set)
* update: compare and set (aka compare and swap) the value for a key
* keys: get a copy of all the keys (with a value or operation associated to it)

You can set limits for your buckets, such as:
* the maximum size of the bucket
* the maximum size for any single value
* a TTL: how long the store will keep values for

Finally, you can even do things that typically can not be done with a Key/Value Store:

* watch: watch for changes the changes happening for a key, which is similar to subscribing (in the publish/subscribe sense) to the key: the watcher receives updates due to put or delete operations on the key pushed to it in real-time as they happen
* watch all: watch for all the changes happening on all the keys in the bucket 
* history: retrieve a history of the values (and delete operations) associated with each key over time (by default the history of buckets is set to 1, meaning that only the latest value/operation is stored)
