# 监控

## 服务器指标

JetStream 有一个 /[jsz ](../../configuration/monitoring.md#jetstream-information)HTTP 端点和可用的告警信息。

## 告警信息

JetStream 会发布一系列告警信息，这些信息可以告知操作人员有关流（Streams）的健康状况和状态。这些告警信息发布到正常的 NATS 主题中，位于 `$JS.EVENT.ADVISORY.>` 中，如果需要，可以将这些告警信息存储在 JetStream 流中。

命令 `nats event --js-advisory` 可以在控制台上查看所有这些事件。Golang 包 [jsm.go](https://github.com/nats-io/jsm.go) 可以消费并呈现这些事件，并为每种事件提供相应的数据类型。

所有这些事件都有描述它们的 JSON Schemas，可以通过 CLI 使用 `nats schema show <schema kind>` 命令查看。

| Description                                 | Subject | Kind                                                    |
|:--------------------------------------------| :--- |:--------------------------------------------------------|
| API interactions                            | `$JS.EVENT.ADVISORY.API` | `io.nats.jetstream.advisory.v1.api_audit`               |
| Stream CRUD operations                      | `$JS.EVENT.ADVISORY.STREAM.CREATED.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_action`           |
| Consumer CRUD operations                    | `$JS.EVENT.ADVISORY.CONSUMER.CREATED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_action`         |
| Snapshot started using `nats stream backup` | `$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_CREATE.<STREAM>` | `io.nats.jetstream.advisory.v1.snapshot_create`         |
| Snapshot completed                          | `$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_COMPLETE.<STREAM>` | `io.nats.jetstream.advisory.v1.snapshot_complete`       |
| Restore started using `nats stream restore` | `$JS.EVENT.ADVISORY.STREAM.RESTORE_CREATE.<STREAM>` | `io.nats.jetstream.advisory.v1.restore_create`          |
| Restore completed                           | `$JS.EVENT.ADVISORY.STREAM.RESTORE_COMPLETE.<STREAM>` | `io.nats.jetstream.advisory.v1.restore_complete`        |
| Consumer maximum delivery reached           | `$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.max_deliver`             |
| Message delivery naked using AckNak         | `$JS.EVENT.ADVISORY.CONSUMER.MSG_NAKED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.nak`                     |
| Message delivery terminated using AckTerm   | `$JS.EVENT.ADVISORY.CONSUMER.MSG_TERMINATED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.terminated`              |
| Message acknowledged in a sampled Consumer  | `$JS.EVENT.METRIC.CONSUMER.ACK.<STREAM>.<CONSUMER>` | `io.nats.jetstream.metric.v1.consumer_ack`              |
| Clustered Stream elected a new leader       | `$JS.EVENT.ADVISORY.STREAM.LEADER_ELECTED.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_leader_elected`   |
| Clustered Stream lost quorum                | `$JS.EVENT.ADVISORY.STREAM.QUORUM_LOST.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_quorum_lost`      |
| Clustered Consumer elected a new leader     | `$JS.EVENT.ADVISORY.CONSUMER.LEADER_ELECTED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_leader_elected` |
| Clustered Consumer lost quorum              | `$JS.EVENT.ADVISORY.CONSUMER.QUORUM_LOST.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_quorum_lost`    |

## 仪表板

看看 [NATS Surveyor Dashboards](https://github.com/nats-io/nats-surveyor/tree/main/docker-compose/grafana/provisioning/dashboards)。