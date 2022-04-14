# Object Store
**NOTICE: Experimental Preview**

The Object Store allows you to store data of any (i.e. large) size by implementing a chunking mechanism, allowing you to for example store and retrieve files (i.e. the object) of any size by associating them with a path and a file name (i.e. the key).

{% tabs %}
{% tab title="Go" %}
```go
// ObjectStoreManager creates, loads and deletes Object Stores
//
// Notice: Experimental Preview
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
// Notice: Experimental Preview
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
{% endtabs %}