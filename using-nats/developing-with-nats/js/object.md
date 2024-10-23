# Object Store

The Object Store allows you to store data of any (i.e. large) size by implementing a chunking mechanism, allowing you to for example store and retrieve files (i.e. the object) of any size by associating them with a path and a file name (i.e. the key).
You obtain a ObjectStoreManager object from your JetStream [context](context.md).

{% tabs %}
{% tab title="Go" %}

```go
// ObjectStoreManager creates, loads and deletes Object Stores
//
// This functionality is EXPERIMENTAL and may be changed in later releases.
type ObjectStoreManager interface {
	// ObjectStore will lookup and bind to an existing object store instance.
	ObjectStore(bucket string) (ObjectStore, error)
	// CreateObjectStore will create an object store.
	CreateObjectStore(cfg *ObjectStoreConfig) (ObjectStore, error)
	// DeleteObjectStore will delete the underlying stream for the named object.
	DeleteObjectStore(bucket string) error
}

// ObjectStore is a blob store capable of storing large objects efficiently in
// JetStream streams
//
// This functionality is EXPERIMENTAL and may be changed in later releases.
type ObjectStore interface {
	// Put will place the contents from the reader into a new object.
	Put(obj *ObjectMeta, reader io.Reader, opts ...ObjectOpt) (*ObjectInfo, error)
	// Get will pull the named object from the object store.
	Get(name string, opts ...ObjectOpt) (ObjectResult, error)

	// PutBytes is convenience function to put a byte slice into this object store.
	PutBytes(name string, data []byte, opts ...ObjectOpt) (*ObjectInfo, error)
	// GetBytes is a convenience function to pull an object from this object store and return it as a byte slice.
	GetBytes(name string, opts ...ObjectOpt) ([]byte, error)

	// PutBytes is convenience function to put a string into this object store.
	PutString(name string, data string, opts ...ObjectOpt) (*ObjectInfo, error)
	// GetString is a convenience function to pull an object from this object store and return it as a string.
	GetString(name string, opts ...ObjectOpt) (string, error)

	// PutFile is convenience function to put a file into this object store.
	PutFile(file string, opts ...ObjectOpt) (*ObjectInfo, error)
	// GetFile is a convenience function to pull an object from this object store and place it in a file.
	GetFile(name, file string, opts ...ObjectOpt) error

	// GetInfo will retrieve the current information for the object.
	GetInfo(name string) (*ObjectInfo, error)
	// UpdateMeta will update the meta data for the object.
	UpdateMeta(name string, meta *ObjectMeta) error

	// Delete will delete the named object.
	Delete(name string) error

	// AddLink will add a link to another object into this object store.
	AddLink(name string, obj *ObjectInfo) (*ObjectInfo, error)

	// AddBucketLink will add a link to another object store.
	AddBucketLink(name string, bucket ObjectStore) (*ObjectInfo, error)

	// Seal will seal the object store, no further modifications will be allowed.
	Seal() error

	// Watch for changes in the underlying store and receive meta information updates.
	Watch(opts ...WatchOpt) (ObjectWatcher, error)

	// List will list all the objects in this store.
	List(opts ...WatchOpt) ([]*ObjectInfo, error)

	// Status retrieves run-time status about the backing store of the bucket.
	Status() (ObjectStoreStatus, error)
}
```
{% endtab %}

{% tab title="Python" %}

```python
    async def object_store(self, bucket: str) -> ObjectStore:

    async def create_object_store(
        self,
        bucket: str = None,
        config: Optional[api.ObjectStoreConfig] = None,
        **params,
    ) -> ObjectStore:
        """
        create_object_store takes an api.ObjectStoreConfig and creates a OBJ in JetStream.
        """
    async def delete_object_store(self, bucket: str) -> bool:
        """
        delete_object_store will delete the underlying stream for the named object.
        """
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net

/// <summary>
/// NATS Object Store context.
/// </summary>
public interface INatsObjContext
{
    /// <summary>
    /// Provides access to the JetStream context associated with the Object Store operations.
    /// </summary>
    INatsJSContext JetStreamContext { get; }

    /// <summary>
    /// Create a new object store.
    /// </summary>
    /// <param name="bucket">Bucket name.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object store object.</returns>
    ValueTask<INatsObjStore> CreateObjectStoreAsync(string bucket, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create a new object store.
    /// </summary>
    /// <param name="config">Object store configuration.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object store object.</returns>
    ValueTask<INatsObjStore> CreateObjectStoreAsync(NatsObjConfig config, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get an existing object store.
    /// </summary>
    /// <param name="bucket">Bucket name</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>The Object Store object</returns>
    ValueTask<INatsObjStore> GetObjectStoreAsync(string bucket, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete an object store.
    /// </summary>
    /// <param name="bucket">Name of the bucket.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Whether delete was successful or not.</returns>
    ValueTask<bool> DeleteObjectStore(string bucket, CancellationToken cancellationToken);
}

/// <summary>
/// NATS Object Store.
/// </summary>
public interface INatsObjStore
{
    /// <summary>
    /// Provides access to the JetStream context associated with the Object Store operations.
    /// </summary>
    INatsJSContext JetStreamContext { get; }

    /// <summary>
    /// Object store bucket name.
    /// </summary>
    string Bucket { get; }

    /// <summary>
    /// Get object by key.
    /// </summary>
    /// <param name="key">Object key.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object value as a byte array.</returns>
    ValueTask<byte[]> GetBytesAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get object by key.
    /// </summary>
    /// <param name="key">Object key.</param>
    /// <param name="stream">Stream to write the object value to.</param>
    /// <param name="leaveOpen"><c>true</c> to not close the underlying stream when async method returns; otherwise, <c>false</c></param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object metadata.</returns>
    /// <exception cref="NatsObjException">Metadata didn't match the value retrieved e.g. the SHA digest.</exception>
    ValueTask<ObjectMetadata> GetAsync(string key, Stream stream, bool leaveOpen = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Put an object by key.
    /// </summary>
    /// <param name="key">Object key.</param>
    /// <param name="value">Object value as a byte array.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object metadata.</returns>
    ValueTask<ObjectMetadata> PutAsync(string key, byte[] value, CancellationToken cancellationToken = default);

    /// <summary>
    /// Put an object by key.
    /// </summary>
    /// <param name="key">Object key.</param>
    /// <param name="stream">Stream to read the value from.</param>
    /// <param name="leaveOpen"><c>true</c> to not close the underlying stream when async method returns; otherwise, <c>false</c></param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object metadata.</returns>
    /// <exception cref="NatsObjException">There was an error calculating SHA digest.</exception>
    /// <exception cref="NatsJSApiException">Server responded with an error.</exception>
    ValueTask<ObjectMetadata> PutAsync(string key, Stream stream, bool leaveOpen = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Put an object by key.
    /// </summary>
    /// <param name="meta">Object metadata.</param>
    /// <param name="stream">Stream to read the value from.</param>
    /// <param name="leaveOpen"><c>true</c> to not close the underlying stream when async method returns; otherwise, <c>false</c></param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object metadata.</returns>
    /// <exception cref="NatsObjException">There was an error calculating SHA digest.</exception>
    /// <exception cref="NatsJSApiException">Server responded with an error.</exception>
    ValueTask<ObjectMetadata> PutAsync(ObjectMetadata meta, Stream stream, bool leaveOpen = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update object metadata
    /// </summary>
    /// <param name="key">Object key</param>
    /// <param name="meta">Object metadata</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object metadata</returns>
    /// <exception cref="NatsObjException">There is already an object with the same name</exception>
    ValueTask<ObjectMetadata> UpdateMetaAsync(string key, ObjectMetadata meta, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a link to another object
    /// </summary>
    /// <param name="link">Link name</param>
    /// <param name="target">Target object's name</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Metadata of the new link object</returns>
    ValueTask<ObjectMetadata> AddLinkAsync(string link, string target, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a link to another object
    /// </summary>
    /// <param name="link">Link name</param>
    /// <param name="target">Target object's metadata</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Metadata of the new link object</returns>
    ValueTask<ObjectMetadata> AddLinkAsync(string link, ObjectMetadata target, CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a link to another object store
    /// </summary>
    /// <param name="link">Object's name to be linked</param>
    /// <param name="target">Target object store</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Metadata of the new link object</returns>
    /// <exception cref="NatsObjException">Object with the same name already exists</exception>
    ValueTask<ObjectMetadata> AddBucketLinkAsync(string link, INatsObjStore target, CancellationToken cancellationToken = default);

    /// <summary>
    /// Seal the object store. No further modifications will be allowed.
    /// </summary>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <exception cref="NatsObjException">Update operation failed</exception>
    ValueTask SealAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get object metadata by key.
    /// </summary>
    /// <param name="key">Object key.</param>
    /// <param name="showDeleted">Also retrieve deleted objects.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object metadata.</returns>
    /// <exception cref="NatsObjException">Object was not found.</exception>
    ValueTask<ObjectMetadata> GetInfoAsync(string key, bool showDeleted = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// List all the objects in this store.
    /// </summary>
    /// <param name="opts">List options</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>An async enumerable object metadata to be used in an <c>await foreach</c></returns>
    IAsyncEnumerable<ObjectMetadata> ListAsync(NatsObjListOpts? opts = default, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves run-time status about the backing store of the bucket.
    /// </summary>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>Object store status</returns>
    ValueTask<NatsObjStatus> GetStatusAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Watch for changes in the underlying store and receive meta information updates.
    /// </summary>
    /// <param name="opts">Watch options</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <returns>An async enumerable object metadata to be used in an <c>await foreach</c></returns>
    IAsyncEnumerable<ObjectMetadata> WatchAsync(NatsObjWatchOpts? opts = default, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete an object by key.
    /// </summary>
    /// <param name="key">Object key.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/> used to cancel the API call.</param>
    /// <exception cref="NatsObjException">Object metadata was invalid or chunks can't be purged.</exception>
    ValueTask DeleteAsync(string key, CancellationToken cancellationToken = default);
}
```
{% endtab %}

{% endtabs %}
