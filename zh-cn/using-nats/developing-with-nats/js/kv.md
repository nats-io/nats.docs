# 键值存储

由于键值存储是在 JetStream 持久层之上构建的，你可以从你的 JetStream [context](context.md) 中获取 KeyValueManager 对象。

键必须与 NATS 主题采用相同格式，即它可以是以点分隔的标记列表（这意味着在监视存储桶时，你可以使用通配符来匹配键的层次结构），并且只能包含[有效字符](../../../nats-concepts/subjects.md#characters-allowed-for-subject-names)。值可以是任何字节数组。

### 创建和删除 KV 存储桶

你可以根据需要创建任意数量独立的键值存储实例，称为“存储桶”。存储桶通常是通过管理方式创建、清除或删除的（例如，使用 `nats` CLI 工具），但也可以使用以下 KeyValueManager 调用之一完成：

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
{% tab title="Java" %}
```java
/**
 * Create a key value store.
 * @param config the key value configuration
 * @return bucket info
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws IllegalArgumentException the server is not JetStream enabled
 */
KeyValueStatus create(KeyValueConfiguration config) throws IOException, JetStreamApiException;

/**
* Get the list of bucket names.
* @return list of bucket names
* @throws IOException covers various communication issues with the NATS
*         server such as timeout or interruption
* @throws JetStreamApiException the request had an error related to the data
* @throws InterruptedException if the thread is interrupted
*/
List<String> getBucketNames() throws IOException, JetStreamApiException, InterruptedException;

/**
* Gets the info for an existing bucket.
* @param bucketName the bucket name to use
* @throws IOException covers various communication issues with the NATS
*         server such as timeout or interruption
* @throws JetStreamApiException the request had an error related to the data
* @return the bucket status object
*/
KeyValueStatus getBucketInfo(String bucketName) throws IOException, JetStreamApiException;

/**
* Deletes an existing bucket. Will throw a JetStreamApiException if the delete fails.
* @param bucketName the stream name to use.
* @throws IOException covers various communication issues with the NATS
*         server such as timeout or interruption
* @throws JetStreamApiException the request had an error related to the data
*/
void delete(String bucketName) throws IOException, JetStreamApiException;
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
  static async create(
    js: JetStreamClient,
    name: string,
    opts: Partial<KvOptions> = {},
  ): Promise<KV>

static async bind(
    js: JetStreamClient,
    name: string,
    opts: Partial<{ codec: KvCodecs }> = {},
): Promise<KV>

destroy(): Promise<boolean>
```
{% endtab %}
{% tab title="Python" %}
```python
# from the JetStreamContext

async def key_value(self, bucket: str) -> KeyValue:

async def create_key_value(
    self,
    config: Optional[api.KeyValueConfig] = None,
    **params,
) -> KeyValue:
    """
    create_key_value takes an api.KeyValueConfig and creates a KV in JetStream.
    """
    
async def delete_key_value(self, bucket: str) -> bool:
    """
    delete_key_value deletes a JetStream KeyValue store by destroying
    the associated stream.
    """  
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

// Create a new Key Value Store or get an existing one
ValueTask<INatsKVStore> CreateStoreAsync(string bucket, CancellationToken cancellationToken = default);

// Get a list of bucket names
IAsyncEnumerable<string> GetBucketNamesAsync(CancellationToken cancellationToken = default);

// Gets the status for all buckets
IAsyncEnumerable<NatsKVStatus> GetStatusesAsync(CancellationToken cancellationToken = default);

// Delete a Key Value Store
ValueTask<bool> DeleteStoreAsync(string bucket, CancellationToken cancellationToken = default);

//
```
{% endtab %}

{% tab title="C" %}
```C
NATS_EXTERN natsStatus 	kvConfig_Init (kvConfig *cfg)
 	Initializes a KeyValue configuration structure.
 
NATS_EXTERN natsStatus 	js_CreateKeyValue (kvStore **new_kv, jsCtx *js, kvConfig *cfg)
 	Creates a KeyValue store with a given configuration.
 
NATS_EXTERN natsStatus 	js_KeyValue (kvStore **new_kv, jsCtx *js, const char *bucket)
 	Looks-up and binds to an existing KeyValue store.
 
NATS_EXTERN natsStatus 	js_DeleteKeyValue (jsCtx *js, const char *bucket)
 	Deletes a KeyValue store.
 
NATS_EXTERN void 	kvStore_Destroy (kvStore *kv)
 	Destroys a KeyValue store object.
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
{% tab title="Java" %}
```java
/**
* Get the entry for a key
* @param key the key
* @return the KvEntry object or null if not found.
* @throws IOException covers various communication issues with the NATS
*         server such as timeout or interruption
* @throws JetStreamApiException the request had an error related to the data
* @throws IllegalArgumentException the server is not JetStream enabled
*/
KeyValueEntry get(String key) throws IOException, JetStreamApiException;

/**
* Get the specific revision of an entry for a key.
* @param key the key
* @param revision the revision
* @return the KvEntry object or null if not found.
* @throws IOException covers various communication issues with the NATS
*         server such as timeout or interruption
* @throws JetStreamApiException the request had an error related to the data
* @throws IllegalArgumentException the server is not JetStream enabled
*/
KeyValueEntry get(String key, long revision) throws IOException, JetStreamApiException;
```  
{% endtab %}
{% tab title="JavaScript" %}
```javascript
async get(k: string): Promise<KvEntry | null>
```
{% endtab %}
{% tab title="Python" %}
```python
async def get(self, key: str) -> Entry:
   """
   get returns the latest value for the key.
   """
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

// Get an entry from the bucket using the key
ValueTask<NatsKVEntry<T>> GetEntryAsync<T>(string key, ulong revision = default, INatsDeserialize<T>? serializer = default, CancellationToken cancellationToken = default);

//
```
{% endtab %}

{% tab title="C" %}
```C
NATS_EXTERN natsStatus 	kvStore_Get (kvEntry **new_entry, kvStore *kv, const char *key)
 	Returns the latest entry for the key.
 
NATS_EXTERN natsStatus 	kvStore_GetRevision (kvEntry **new_entry, kvStore *kv, const char *key, uint64_t revision)
 	Returns the entry at the specific revision for the key.
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
// Create will add the key/value pair if it does not exist.
Create(key string, value []byte) (revision uint64, err error)
// Update will update the value if the latest revision matches.
Update(key string, value []byte, last uint64) (revision uint64, err error)
```
{% endtab %}
{% tab title="Java" %}
```java
/**
 * Put a byte[] as the value for a key
 * @param key the key
 * @param value the bytes of the value
 * @return the revision number for the key
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws IllegalArgumentException the server is not JetStream enabled
 */
long put(String key, byte[] value) throws IOException, JetStreamApiException;

/**
 * Put a string as the value for a key
 * @param key the key
 * @param value the UTF-8 string
 * @return the revision number for the key
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws IllegalArgumentException the server is not JetStream enabled
 */
long put(String key, String value) throws IOException, JetStreamApiException;

/**
 * Put a long as the value for a key
 * @param key the key
 * @param value the number
 * @return the revision number for the key
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws IllegalArgumentException the server is not JetStream enabled
 */
long put(String key, Number value) throws IOException, JetStreamApiException;

/**
 * Put as the value for a key iff the key does not exist (there is no history)
 * or is deleted (history shows the key is deleted)
 * @param key the key
 * @param value the bytes of the value
 * @return the revision number for the key
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws IllegalArgumentException the server is not JetStream enabled
 */
long create(String key, byte[] value) throws IOException, JetStreamApiException;

/**
 * Put as the value for a key iff the key exists and its last revision matches the expected
 * @param key the key
 * @param value the bytes of the value
 * @param expectedRevision the expected last revision
 * @return the revision number for the key
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws IllegalArgumentException the server is not JetStream enabled
 */
long update(String key, byte[] value, long expectedRevision) throws IOException, JetStreamApiException;
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
  async put(
    k: string,
    data: Uint8Array,
    opts: Partial<KvPutOptions> = {},
  ): Promise<number>

create(k: string, data: Uint8Array): Promise<number>    
    
update(k: string, data: Uint8Array, version: number): Promise<number>
```
{% endtab %}
{% tab title="Python" %}
```python
async def put(self, key: str, value: bytes) -> int:
    """
    put will place the new value for the key into the store
    and return the revision number.
    """
    
async def update(self, key: str, value: bytes, last: int) -> int:
    """
    update will update the value iff the latest revision matches.
    """    
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

// Put a value into the bucket using the key
// returns revision number
ValueTask<ulong> PutAsync<T>(string key, T value, INatsSerialize<T>? serializer = default, CancellationToken cancellationToken = default);

//
```
{% endtab %}

{% tab title="C" %}
```C
NATS_EXTERN natsStatus 	kvStore_Put (uint64_t *rev, kvStore *kv, const char *key, const void *data, int len)
 	Places the new value for the key into the store.
 
NATS_EXTERN natsStatus 	kvStore_PutString (uint64_t *rev, kvStore *kv, const char *key, const char *data)
 	Places the new value (as a string) for the key into the store.
 
NATS_EXTERN natsStatus 	kvStore_Create (uint64_t *rev, kvStore *kv, const char *key, const void *data, int len)
 	Places the value for the key into the store if and only if the key does not exist.
 
NATS_EXTERN natsStatus 	kvStore_CreateString (uint64_t *rev, kvStore *kv, const char *key, const char *data)
 	Places the value (as a string) for the key into the store if and only if the key does not exist.
 
NATS_EXTERN natsStatus 	kvStore_Update (uint64_t *rev, kvStore *kv, const char *key, const void *data, int len, uint64_t last)
 	Updates the value for the key into the store if and only if the latest revision matches.
 
NATS_EXTERN natsStatus 	kvStore_UpdateString (uint64_t *rev, kvStore *kv, const char *key, const char *data, uint64_t last)
 	Updates the value (as a string) for the key into the store if and only if the latest revision matches.
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
{% tab title="Java" %}
```java
/**
* Soft deletes the key by placing a delete marker.
* @param key the key
* @throws IOException covers various communication issues with the NATS
*         server such as timeout or interruption
* @throws JetStreamApiException the request had an error related to the data
*/
void delete(String key) throws IOException, JetStreamApiException;

/**
* Purge all values/history from the specific key
* @param key the key
* @throws IOException covers various communication issues with the NATS
*         server such as timeout or interruption
* @throws JetStreamApiException the request had an error related to the data
*/
void purge(String key) throws IOException, JetStreamApiException;
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
delete(k: string): Promise<void>
    
purge(k: string): Promise<void>
```
{% endtab %}
{% tab title="Python" %}
```python
async def delete(self, key: str) -> bool:
    """
    delete will place a delete marker and remove all previous revisions.
    """
    
async def purge(self, key: str) -> bool:
    """
    purge will remove the key and all revisions.
    """    
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

// Delete an entry from the bucket
ValueTask DeleteAsync(string key, NatsKVDeleteOpts? opts = default, CancellationToken cancellationToken = default);

// Purge an entry from the bucket
ValueTask PurgeAsync(string key, NatsKVDeleteOpts? opts = default, CancellationToken cancellationToken = default);

//
```
{% endtab %}

{% tab title="C" %}
```C
NATS_EXTERN natsStatus 	kvStore_Delete (kvStore *kv, const char *key)
 	Deletes a key by placing a delete marker and leaving all revisions.
 
NATS_EXTERN natsStatus 	kvStore_Purge (kvStore *kv, const char *key, kvPurgeOptions *opts)
 	Deletes a key by placing a purge marker and removing all revisions.
 	
NATS_EXTERN natsStatus 	kvStore_PurgeDeletes (kvStore *kv, kvPurgeOptions *opts)
 	Purge and removes delete markers.
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
{% tab title="Java" %}
```java
/**
 * Get a list of the keys in a bucket.
 * @return List of keys
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws InterruptedException if the thread is interrupted
 */
List<String> keys() throws IOException, JetStreamApiException, InterruptedException;
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
async keys(k = ">"): Promise<QueuedIterator<string>>
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

// Get all the keys in the bucket
IAsyncEnumerable<string> GetKeysAsync(NatsKVWatchOpts? opts = default, CancellationToken cancellationToken = default);

// Get a filtered set of keys in the bucket
IAsyncEnumerable<string> GetKeysAsync(IEnumerable<string> filters, NatsKVWatchOpts? opts = default, CancellationToken cancellationToken = default);

//
```
{% endtab %}

{% tab title="C" %}
```C
NATS_EXTERN natsStatus 	kvStore_Keys (kvKeysList *list, kvStore *kv, kvWatchOptions *opts)
 	Returns all keys in the bucket.
 
NATS_EXTERN void 	kvKeysList_Destroy (kvKeysList *list)
 	Destroys this list of KeyValue store key strings.
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
{% tab title="Java" %}
```java
/**
 * Get the history (list of KeyValueEntry) for a key
 * @param key the key
 * @return List of KvEntry
 * @throws IOException covers various communication issues with the NATS
 *         server such as timeout or interruption
 * @throws JetStreamApiException the request had an error related to the data
 * @throws InterruptedException if the thread is interrupted
 */
List<KeyValueEntry> history(String key) throws IOException, JetStreamApiException, InterruptedException;
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
async history(
    opts: { key?: string; headers_only?: boolean } = {},
  ): Promise<QueuedIterator<KvEntry>>
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

// Get the history of an entry by key
IAsyncEnumerable<NatsKVEntry<T>> HistoryAsync<T>(string key, INatsDeserialize<T>? serializer = default, NatsKVWatchOpts? opts = default, CancellationToken cancellationToken = default);

//
```
{% endtab %}

{% tab title="C" %}
```C
NATS_EXTERN natsStatus 	kvStore_History (kvEntryList *list, kvStore *kv, const char *key, kvWatchOptions *opts)
 	Returns all historical entries for the key.
 
NATS_EXTERN void 	kvEntryList_Destroy (kvEntryList *list)
 	Destroys this list of KeyValue store entries.
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
{% tab title="Java" %}
```java
/**
 * Watch updates for a specific key
 */
NatsKeyValueWatchSubscription watch(String key, KeyValueWatcher watcher, KeyValueWatchOption... watchOptions) throws IOException, JetStreamApiException, InterruptedException;

/**
 * Watch updates for all keys
 */
NatsKeyValueWatchSubscription watchAll(KeyValueWatcher watcher, KeyValueWatchOption... watchOptions) throws IOException, JetStreamApiException, InterruptedException;
```
{% endtab %}
{% tab title="JavaScript" %}
```javascript
  async watch(
    opts: {
      key?: string;
      headers_only?: boolean;
      initializedFn?: callbackFn;
    } = {},
  ): Promise<QueuedIterator<KvEntry>>
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

// Start a watcher for specific keys
// Key to watch is subject-based and wildcards may be used
IAsyncEnumerable<NatsKVEntry<T>> WatchAsync<T>(string key, INatsDeserialize<T>? serializer = default, NatsKVWatchOpts? opts = default, CancellationToken cancellationToken = default);

// Start a watcher for specific keys
// Key to watch are subject-based and wildcards may be used
IAsyncEnumerable<NatsKVEntry<T>> WatchAsync<T>(IEnumerable<string> keys, INatsDeserialize<T>? serializer = default, NatsKVWatchOpts? opts = default, CancellationToken cancellationToken = default);

// Start a watcher for all the keys in the bucket
IAsyncEnumerable<NatsKVEntry<T>> WatchAsync<T>(INatsDeserialize<T>? serializer = default, NatsKVWatchOpts? opts = default, CancellationToken cancellationToken = default);

//
```
{% endtab %}

{% tab title="C" %}
```C
NATS_EXTERN natsStatus 	kvStore_Watch (kvWatcher **new_watcher, kvStore *kv, const char *keys, kvWatchOptions *opts)
 	Returns a watcher for any updates to keys that match the keys argument.
 
NATS_EXTERN natsStatus 	kvStore_WatchAll (kvWatcher **new_watcher, kvStore *kv, kvWatchOptions *opts)
 	Returns a watcher for any updates to any keys of the KeyValue store bucket.
```
{% endtab %}

{% endtabs %}
