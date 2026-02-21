# Мониторинг

## Метрики сервера

У JetStream есть HTTP endpoint /[jsz ](../../configuration/monitoring.md#jetstream-information) и доступны advisories.

## Уведомления (Advisories)

JetStream публикует ряд advisories, которые могут информировать операции о здоровье и состоянии Streams. Эти advisories публикуются в обычные NATS subject под `$JS.EVENT.ADVISORY.>` и при желании их можно хранить в Streams JetStream.

Команда `nats event --js-advisory` позволяет просматривать все эти события в консоли. Пакет Golang [jsm.go](https://github.com/nats-io/jsm.go) может потреблять и отображать эти события и имеет типы данных для каждого события.

Для всех этих событий существуют JSON Schemas, которые можно посмотреть в CLI командой `nats schema show <schema kind>`.

| Описание                                 | Subject | Kind                                                    |
|:--------------------------------------------| :--- |:--------------------------------------------------------|
| Взаимодействия с API                        | `$JS.EVENT.ADVISORY.API` | `io.nats.jetstream.advisory.v1.api_audit`               |
| CRUD‑операции stream                        | `$JS.EVENT.ADVISORY.STREAM.CREATED.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_action`           |
| CRUD‑операции consumer                      | `$JS.EVENT.ADVISORY.CONSUMER.CREATED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_action`         |
| Snapshot начат с `nats stream backup`       | `$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_CREATE.<STREAM>` | `io.nats.jetstream.advisory.v1.snapshot_create`         |
| Snapshot завершен                           | `$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_COMPLETE.<STREAM>` | `io.nats.jetstream.advisory.v1.snapshot_complete`       |
| Restore начат с `nats stream restore`       | `$JS.EVENT.ADVISORY.STREAM.RESTORE_CREATE.<STREAM>` | `io.nats.jetstream.advisory.v1.restore_create`          |
| Restore завершен                            | `$JS.EVENT.ADVISORY.STREAM.RESTORE_COMPLETE.<STREAM>` | `io.nats.jetstream.advisory.v1.restore_complete`        |
| Достигнут максимум доставок consumer        | `$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.max_deliver`             |
| Доставка сообщения выполнена AckNak         | `$JS.EVENT.ADVISORY.CONSUMER.MSG_NAKED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.nak`                     |
| Доставка сообщения остановлена AckTerm      | `$JS.EVENT.ADVISORY.CONSUMER.MSG_TERMINATED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.terminated`              |
| Сообщение ack‑нуто в sampled Consumer       | `$JS.EVENT.METRIC.CONSUMER.ACK.<STREAM>.<CONSUMER>` | `io.nats.jetstream.metric.v1.consumer_ack`              |
| Кластерный Stream избрал нового лидера      | `$JS.EVENT.ADVISORY.STREAM.LEADER_ELECTED.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_leader_elected`   |
| Кластерный Stream потерял кворум            | `$JS.EVENT.ADVISORY.STREAM.QUORUM_LOST.<STREAM>` | `io.nats.jetstream.advisory.v1.stream_quorum_lost`      |
| Кластерный Consumer избрал нового лидера    | `$JS.EVENT.ADVISORY.CONSUMER.LEADER_ELECTED.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_leader_elected` |
| Кластерный Consumer потерял кворум          | `$JS.EVENT.ADVISORY.CONSUMER.QUORUM_LOST.<STREAM>.<CONSUMER>` | `io.nats.jetstream.advisory.v1.consumer_quorum_lost`    |

## Дашборды

См. [NATS Surveyor Dashboards](https://github.com/nats-io/nats-surveyor/tree/main/docker-compose/grafana/provisioning/dashboards).
