# jetstream

/ [config](/reference/server-config/index.md) 

## Properties

### [`enabled`](/reference/server-config/enabled/index.md)

If true, enables the JetStream subsystem.

Default value: `false`

### [`store_dir`](/reference/server-config/store_dir/index.md)

Directory to use for JetStream storage.

Default value: `/tmp/nats/jetstream`

### [`max_memory_store`](/reference/server-config/max_memory_store/index.md)

Maximum size of the *memory* storage.
Defaults to 75% of available memory.

### [`max_file_store`](/reference/server-config/max_file_store/index.md)

Maximum size of the *file* storage.
Defaults to up to 1TB if available.

