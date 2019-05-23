# Supported Stores

In order to run NATS Streaming Server in clustered mode, you need to specify a persistent store. At this time you have the choice between `FILE` and `SQL`

The NATS Streaming stores server meta information, messages and subscriptions to the storage you configure using the `--store` option.

However, in clustered mode, we use RAFT for leader election. The raft layer uses its own stores which are currently necessarily file based. The location of the RAFT stores defaults to the current directory under a sub-directory named after the cluster ID, or you can configure it using `--cluster_log_path`.

This means that even if you select an SQL Store, there will still be a need for storing data on the file system.
