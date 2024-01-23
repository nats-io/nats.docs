# Disaster Recovery

In the event of unrecoverable JetStream message persistence on one (or more) server nodes, there are two recovery scenarios:

* Automatic recovery from intact quorum nodes
* Manual recovery from existing stream snapshots (backups)

{% hint style="danger" %}
For R1 streams, data is persisted on one server node only. If that server node is unrecoverable then recovery from
backup is the sole option.
{% endhint %}

## Automatic Recovery

NATS will create replacement stream replicas automatically under the following conditions:

* Impacted stream is of replica configuration R3 (or greater)
* Remaining intact nodes (stream replicas) meet minimum RAFT quorum: floor(R/2) + 1
* Available node(s) in the stream's cluster for new replica(s)
* Impacted node(s) removed from the stream's domain RAFT Meta group (e.g. `nats server raft peer-remove`)

## Manual Recovery

Snapshots (also known as backups) can pro-actively be made of any stream regardless of replication configuration.

The backup includes (by default):

* Stream configuration and state
* Stream durable consumer configuration and state
* All message payload data including metadata like timestamps and headers

### Backup

The `nats stream backup` CLI command is used to create snapshots of a stream and its durable consumers.

{% hint style="info" %}
As an account owner, if you wish to make a backup of ALL streams in your account, you may use `nats account backup` instead.
{% endhint %}

```shell
nats stream backup ORDERS '/data/js-backup/backup1'
```
Output
```text
Starting backup of Stream "ORDERS" with 13 data blocks

2.4 MiB/s [====================================================================] 100%

Received 13 MiB bytes of compressed data in 3368 chunks for stream "ORDERS" in 1.223428188s, 813 MiB uncompressed
```

During a backup operation, the stream is placed in a status where it's configuration cannot change and no data will be
evicted based on stream retention policies.

{% hint style="info" %}
Progress using the terminal bar can be disabled using `--no-progress`, it will then issue log lines instead.
{% endhint %}

### Restore

An existing backup (as above) can be restored to the same or a new NATS server (or cluster) using the `nats stream restore` command.

{% hint style="info" %}
If there are multiple streams in the backup directory, they will all be restored.
{% endhint %}

```shell
nats stream restore '/data/js-backup/backup1'
```
Output
```text
Starting restore of Stream "ORDERS" from file "/data/js-backup/backup1"

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
nats account backup /data/js-backup
```
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
nats account restore /tmp/backup --update-streams
```
```text
15:57:42 Reading file /tmp/backup/stream_ORDERS.json
15:57:42 Reading file /tmp/backup/stream_ORDERS_consumer_NEW.json
15:57:42 Updating Stream ORDERS configuration
15:57:42 Restoring Consumer ORDERS > NEW
```

The `nats account restore` tool does not support restoring data, the same process using `nats stream restore`, as outlined earlier, can be used which will also restore Stream and Consumer configurations and state.


{% hint style="warning" %}
On restore, if a stream already exists in the server of same name and account, you will receive a `Stream {name} already exist` error.
{% endhint %}