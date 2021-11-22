# Disaster Recovery

Disaster Recovery of the JetStream system is a topic we are still exploring and fleshing out and that will be impacted by the clustering work. For example replication will extend the options available to you.

Today we have a few approaches to consider:

* `nats` CLI + Configuration Backups + Data Snapshots
* Configuration Management + Data Snapshots

## Data Backup

In all scenarios you can perform data snapshots and restores over the NATS protocol. This is good if you do not manage the NATS servers hosting your data, and you wish to do a backup of your data.

The backup includes:

* Stream configuration and state
* Stream Consumer configuration and state
* All data including metadata like timestamps and headers

```shell
nats stream backup ORDERS /data/js-backup/ORDERS.tgz
```
Output
```text
Starting backup of Stream "ORDERS" with 13 data blocks

2.4 MiB/s [====================================================================] 100%

Received 13 MiB bytes of compressed data in 3368 chunks for stream "ORDERS" in 1.223428188s, 813 MiB uncompressed
```

During the backup the Stream is in a state where it's configuration cannot change and no data will be expired from it based on Limits or Retention Policies.

Progress using the terminal bar can be disabled using `--no-progress`, it will then issue log lines instead.

## Restoring Data

The backup made above can be restored into another server - but into the same Stream name.

```shell
nats str restore ORDERS /data/js-backup/ORDERS.tgz
```
Output
```text
Starting restore of Stream "ORDERS" from file "/data/js-backup/ORDERS.tgz"

13 MiB/s [====================================================================] 100%

Restored stream "ORDERS" in 937.071149ms

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.>
...
```

The `/data/js-backup/ORDERS.tgz` file can also be extracted into the data dir of a stopped NATS Server.

Progress using the terminal bar can be disabled using `--no-progress`, it will then issue log lines instead.

## Interactive CLI

In environments where the `nats` CLI is used interactively to configure the server you do not have a desired state to recreate the server from. This is not the ideal way to administer the server, we recommend Configuration Management, but many will use this approach.

Here you can back up the configuration into a directory from where you can recover the configuration later. The data for File backed stores can also be backed up.

```shell
nats backup /data/js-backup
```
Output
```text
15:56:11 Creating JetStream backup into /data/js-backup
15:56:11 Stream ORDERS to /data/js-backup/stream_ORDERS.json
15:56:11 Consumer ORDERS > NEW to /data/js-backup/stream_ORDERS_consumer_NEW.json
15:56:11 Configuration backup complete
```

This backs up Stream and Consumer configuration.

During the same process the data can also be backed up by passing `--data`, this will create files like `/data/js-backup/stream_ORDERS.tgz`.

Later the data can be restored, for Streams we support editing the Stream configuration in place to match what was in the backup.

```shell
nats restore /tmp/backup --update-streams
```
Output
```text
15:57:42 Reading file /tmp/backup/stream_ORDERS.json
15:57:42 Reading file /tmp/backup/stream_ORDERS_consumer_NEW.json
15:57:42 Updating Stream ORDERS configuration
15:57:42 Restoring Consumer ORDERS > NEW
```

The `nats restore` tool does not support restoring data, the same process using `nats stream restore`, as outlined earlier, can be used which will also restore Stream and Consumer configurations and state.

