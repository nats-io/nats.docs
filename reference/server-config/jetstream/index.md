# jetstream

/ [Config](../index.md) 

## Properties

### [`enabled`](enabled/index.md)

If true, enables the JetStream subsystem.

Default value: `false`

### [`store_dir`](store_dir/index.md)

Directory to use for JetStream storage.

Default value: `/tmp/nats/jetstream`

### [`max_memory_store`](max_memory_store/index.md)

Maximum size of the *memory* storage.
Defaults to 75% of available memory.

### [`max_file_store`](max_file_store/index.md)

Maximum size of the *file* storage.
Defaults to up to 1TB if available.

