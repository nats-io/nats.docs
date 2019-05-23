# Store Interface

Every store implementation follows the [Store interface](https://github.com/nats-io/nats-streaming-server/blob/master/stores/store.go).

On startup, the server creates a unique instance of the `Store`. The constructor of a store implementation can do some initialization and configuration check, but *must not* access, or attempt to recover, the storage at this point. This is important because when the server runs on Fault Tolerance mode, the storage must be shared across many servers but only one server can be using it.

After instantiating the store, the server will then call `Recover()` in order to recover the persisted state. For implementations that do not support persistence, such as the provided `MemoryStore`, this call will simply return `nil` (without error) to indicate that no state was recovered.

The `Store` is used to add/delete clients, create/lookup channels, etc...

Creating/looking up a channel will return a `ChannelStore`, which points to two other interfaces, the `SubStore` and `MsgStore`. These stores, for a given channel, handle subscriptions and messages respectively.

If you wish to contribute to a new store type, your implementation must include all these interfaces. For stores that allow recovery (such as file store as opposed to memory store), there are additional structures that have been defined and should be returned by `Recover()`.

The memory and the provided file store implementations both use a generic store implementation to avoid code duplication. When writing your own store implementation, you can do the same for APIs that don't need to do more than what the generic implementation provides. You can check [MemStore](https://github.com/nats-io/nats-streaming-server/blob/master/stores/memstore.go) and [FileStore](https://github.com/nats-io/nats-streaming-server/blob/master/stores/filestore.go) implementations for more details.
