# Key Value Store

As the Key Value Store is built on top of the JetStream persistence layer you obtain a KeyValueManager or a KeyValue object from your JetStream [context](context.md).

### Creating, and deleting KV buckets

You can create as many independent key/value store instance, called 'buckets', as you need. Buckets are typically created, purged or deleted administratively (e.g. using the `nats` CLI tool), but this can also be done using one of the following KeyValueManager calls:

{% tabs %}
{% tab title="Go" %}
```go
// KeyValue will lookup and bind to an existing KeyValue store.
KeyValue(bucket string) (KeyValue, error)
// CreateKeyValue will create a KeyValue store with the following configuration.
CreateKeyValue(cfg *KeyValueConfig) (KeyValue, error)
// DeleteKeyValue will delete this KeyValue store (JetStream stream).
DeleteKeyValue(bucket string) error
```
{% endtab %}
{% endtabs %}

### Getting

You can do a get to get the current value on a key, or ask to get a specific revision of the value.

{% tabs %}
{% tab title="Go" %}
```go
// Get returns the latest value for the key.
Get(key string) (entry KeyValueEntry, err error)
// GetRevision returns a specific revision value for the key.
GetRevision(key string, revision uint64) (entry KeyValueEntry, err error)
```
{% endtab %}
{% endtabs %}

### Putting

The key is always a string, you can simply use Put to store a byte array, or the convenience `PutString` to put a string. For 'compare and set' functionality you can use `Create` and `Update`.

{% tabs %}
{% tab title="Go" %}
```go
Put(key string, value []byte) (revision uint64, err error)
// PutString will place the string for the key into the store.
PutString(key string, value string) (revision uint64, err error)
// Create will add the key/value pair iff it does not exist.
Create(key string, value []byte) (revision uint64, err error)
// Update will update the value iff the latest revision matches.
Update(key string, value []byte, last uint64) (revision uint64, err error)
```
{% endtab %}
{% endtabs %}

### Deleting

You can delete a specific key, or purge the whole key/value bucket.

{% tabs %}
{% tab title="Go" %}
```go
// Delete will place a delete marker and leave all revisions.
Delete(key string) error
// Purge will place a delete marker and remove all previous revisions.
Purge(key string) error
```
{% endtab %}
{% endtabs %}

### Getting all the keys

You can get the list of all the keys currently having a value associated using `Keys()`

{% tabs %}
{% tab title="Go" %}
```go
// Keys will return all keys.
Keys(opts ...WatchOpt) ([]string, error)
```
{% endtab %}
{% endtabs %}

### Getting the history for a key

The JetStream key/value store has a feature you don't usually find in key/value stores: the ability to keep a history of the values associated with a key (rather than just the current value). The depth of the history is specified when the key/value bucket is created, and the default is a history depth of 1 (i.e. no history).

{% tabs %}
{% tab title="Go" %}
```go
// History will return all historical values for the key.
History(key string, opts ...WatchOpt) ([]KeyValueEntry, error)
```
{% endtab %}
{% endtabs %}

### Watching for changes

Watching a key/value bucket is like subscribing to updates: you provide a callback and you can watch all of the keys in the bucket or specify which specific key(s) you want to be kept updated about.

{% tabs %}
{% tab title="Go" %}
```go
// Watch for any updates to keys that match the keys argument which could include wildcards.
// Watch will send a nil entry when it has received all initial values.
Watch(keys string, opts ...WatchOpt) (KeyWatcher, error)
// WatchAll will invoke the callback for all updates.
WatchAll(opts ...WatchOpt) (KeyWatcher, error)
```
{% endtab %}
{% endtabs %}
