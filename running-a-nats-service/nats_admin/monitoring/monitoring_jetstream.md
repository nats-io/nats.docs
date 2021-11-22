# Monitoring

## Server Metrics

JetStream has a /[jsz ](../../configuration/monitoring.md#jetstream-information)HTTP endpoint and advisories available.

## Advisories

JetStream publishes a number of advisories that can inform operations about the health and the state of the Streams. These advisories are published to normal NATS subjects below `$JS.EVENT.ADVISORY.>` and one can store these advisories in JetStream Streams if desired.

The command `nats event --js-advisory` can view all these events on your console. The Golang package [jsm.go](https://github.com/nats-io/jsm.go) can consume and render these events and have data types for each of these events.

All these events have JSON Schemas that describe them, schemas can be viewed on the CLI using the `nats schema show <schema kind>` command.

| Description | Subject | Kind |
| :--- | :--- | :--- |
| API interactions | `$JS.EVENT.ADVISORY.API` | `io.nats.jetstream.advisory.v1.api_audit` |
| Stream CRUD operations | `$JS.EVENT.ADVISORY.STREAM.CREATED.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_action` |
| Consumer CRUD operations | `$JS.EVENT.ADVISORY.CONSUMER.CREATED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_action` |
| Snapshot started using `nats stream backup` | `$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_CREATE.<STREAM>` | `io.nats.jetstream.advisory.v1.snapshot_create` |
| Snapshot completed | `$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_COMPLETE.<STREAM>` | `io.nats.jetstream.advisory.v1.snapshot_complete` |
| Restore started using `nats stream restore` | `$JS.EVENT.ADVISORY.STREAM.RESTORE_CREATE.<STREAM>` | `io.nats.jetstream.advisory.v1.restore_create` |
| Restore completed | `$JS.EVENT.ADVISORY.STREAM.RESTORE_COMPLETE.<STREAM>` | `io.nats.jetstream.advisory.v1.restore_complete` |
| Consumer maximum delivery reached | `$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.max_deliver` |
| Message delivery terminated using AckTerm | `$JS.EVENT.ADVISORY.CONSUMER.MSG_TERMINATED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.terminated` |
| Message acknowledged in a sampled Consumer | `$JS.EVENT.METRIC.CONSUMER.ACK.<STREAM>.<CONSUMER>` | `io.nats.jetstream.metric.v1.consumer_ack` |
| Clustered Stream elected a new leader | `$JS.EVENT.ADVISORY.STREAM.LEADER_ELECTED.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_leader_elected` |
| Clustered Stream lost quorum | `$JS.EVENT.ADVISORY.STREAM.QUORUM_LOST.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_quorum_lost` |
| Clustered Consumer elected a new leader | `$JS.EVENT.ADVISORY.CONSUMER.LEADER_ELECTED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_leader_elected` |
| Clustered Consumer lost quorum | `$JS.EVENT.ADVISORY.CONSUMER.QUORUM_LOST.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_quorum_lost` |

## Dashboards

The [NATS Surveyor](https://github.com/nats-io/nats-surveyor) system has initial support for passing JetStream metrics to Prometheus, dashboards and more will be added towards final release.

