# NATS 2.10

Гид предназначен для пользователей NATS, обновляющихся с версий 2.9.x. Здесь приведён краткий обзор новых возможностей с ссылками на подробную документацию.

## Предостережения при обновлении

### Версии клиентов

Хотя все существующие клиентские версии продолжают работать, новые версии открывают доступ к дополнительным опциям для новых функций. Минимальные версии клиентов с полноценной поддержкой 2.10.0:

- CLI — [v0.1.0](https://github.com/nats-io/natscli/releases/tag/v0.1.0)
- nats.go — [v1.30.0](https://github.com/nats-io/nats.go/releases/tag/v1.30.0)
- nats.rs — [v0.32.0](https://github.com/nats-io/nats.rs/releases/tag/async-nats%2Fv0.32.0)
- nats.deno — [v1.17.0](https://github.com/nats-io/nats.deno/releases/tag/v1.17.0)
- nats.js — [v2.17.0](https://github.com/nats-io/nats.js/releases/tag/v2.17.0)
- nats.ws — [v1.18.0](https://github.com/nats-io/nats.ws/releases/tag/v1.18.0)
- nats.java — [v2.17.0](https://github.com/nats-io/nats.java/releases/tag/2.17.0)
- nats.net — [v1.1.0](https://github.com/nats-io/nats.net/releases/tag/1.1.0)
- nats.net.v2 — скоро!
- nats.py — скоро!
- nats.c — скоро!

### Helm-чарты

- k8s/nats — [v1.1.0](https://github.com/nats-io/k8s/releases/tag/nats-1.1.0)
- k8s/nack — [v0.24.0](https://github.com/nats-io/k8s/releases/tag/nack-0.24.0)

### Предупреждения по откату

Для критичных систем вроде NATS практикой считается безостановочное обновление; тем не менее иногда приходится откатываться. Это нежелательно и может нарушить стабильность и данные, но если откат неизбежен, обратите внимание на следующие моменты.

#### Изменения формата хранилища

В 2.10.0 изменён on-disk формат, что улучшает производительность, но делает данные несовместимыми со старыми серверами. Если после обновления с уже существующими данными выполнить откат, то более старый сервер не сможет прочитать новый формат.

Однако готовится специальная ветка 2.9.x, осведомлённая о ключевых изменениях в формате, чтобы при откате сервер мог стартовать. Поэтому если откат — единственный выход, возвращайтесь только к версии 2.9.22 или новее.

#### Новые опции потоков и потребителей

Ранее отсутствующие в сервере версии опции могут вызвать проблемы при откате:

- Multi-filter consumers: при откате фильтры не применяются, поскольку новое поле — список, а не строка.
- Subject-transform на потоках: при откате трансформация игнорируется, так как старый сервер не поддерживает поле.
- Сжатие потоков: потоки с включенным сжатием не будут загружаться на старых серверах.

## Возможности

### Платформы

- Экспериментальная поддержка [IBM z/OS](../running-a-nats-service/installation.md#supported-operating-systems-and-architectures)
- Экспериментальная поддержка [NetBSD](../running-a-nats-service/installation.md#supported-operating-systems-and-architectures)

### Перезагрузка

- Перезагрузку сервера теперь можно инициировать, отправив сообщение на [`$SYS.REQ.SERVER.<server-id>.RELOAD`](../running-a-nats-service/configuration/#configuration-reloading) от клиента, аутентифицированного в системном аккаунте.

### JetStream

- Появилась опция сервера [`sync_interval`](../running-a-nats-service/configuration/#jetstream), изменяющая интервал синхронизации данных потоков на диск, включая возможность мгновенной записи для силовых гарантий.

### Subject mapping

- Subject mapping теперь можно [определять на уровне кластера](../nats-concepts/subject_mapping.md#cluster-scoped-mappings) и задавать веса, чтобы в разных регионах действовали разные правила.
- Требование использования всех wildcard-токенов в subject-mapping или трансформациях ослаблено. Это касается конфигурации, mapping-а аккаунтов, subject-transform потоков и републикации, но не касается mapping-ов, связанных с импортом/экспортом потоков и сервисов между аккаунтами.

### Потоки

- Добавлено поле [`subject_transform`](../nats-concepts/jetstream/streams.md#subjecttransforms) для per-stream трансформации subject-ов, включая базовые потоки, зеркала и источники.
- Появилось поле [`metadata`](../nats-concepts/jetstream/streams.md#configuration) для произвольных KV-данных, дополняющее или заменяющее `description`.
- Добавлено поле [`first_seq`](../nats-concepts/jetstream/streams.md#configuration) для явного указания стартовой последовательности при создании.
- Добавлено поле [`compression`](../nats-concepts/jetstream/streams.md#configuration) для on-disk сжатия файловых потоков.
- Возможность редактировать [`republish`](../nats-concepts/jetstream/streams.md#republish) после создания потока.
- Републикованные сообщения теперь получают заголовок [`Nats-Time-Stamp`](../nats-concepts/jetstream/headers.md#republish) с оригинальным временем.
- Ответы `StreamInfo` содержат поле `ts` с серверным временем снимка, что позволяет рассчитывать локальное время.
- В зеркалах и источниках можно задавать массив subject-transform (фильтр + destination) вместо отдельной пары полей.
- Поток с несколькими `sources` может подключаться к одному и тому же потоку несколько раз при разных сочетаниях фильтра и трансформации, что позволяет дублировать часть сообщений.

### Потребители

- Добавлено поле [`filter_subjects`](../nats-concepts/jetstream/consumers.md#filtersubjects) — серверная фильтрация по нескольким несвязанным subject-ам.
- Поле [`metadata`](../nats-concepts/jetstream/consumers.md#configuration) позволяет сохранять пользовательские KV-данные, дополняя `description`.
- Ответ `ConsumerInfo` теперь содержит поле `ts` с серверным временем снимка.

### Key-value

- Добавлено поле [`metadata`](../nats-concepts/jetstream/key-value-store.md#configuration) с пользовательскими KV-данными.
- Бакет, настроенный как mirror или источник других бакетов, тоже может содержать такие метаданные.

### Object store

- Добавлено поле [`metadata`](../nats-concepts/jetstream/object-store.md#configuration) с произвольными KV-данными.

### Authn/Authz

- Добавлено серверное расширение `auth callout` ([auth callout](../running-a-nats-service/configuration/securing_nats/auth_callout.md)), позволяющее делегировать проверку аутентификации внешнему провайдеру и опционально устанавливать разрешения для авторизованного пользователя.

### Мониторинг

- В ответы [`/varz`](../running-a-nats-service/nats_admin/monitoring/#general-information) и [`/jsz`](../running-a-nats-service/nats_admin/monitoring/#jetstream-information) добавлено поле `unique_tag`, соответствующее конфигурации.
- В `/varz` появился блок `slow_consumer_stats` со статистикой медленных потребителей по клиентам, маршрутам, gateway и leafnode.
- К `/jsz` добавлен параметр `raft=1`, который расширяет ответ полями `stream_raft_group` и `consumer_raft_groups`.
- В ответ `$SYS.REQ.SERVER.PING.STATZ` введено поле `num_subscriptions`.
- Системный аккаунт теперь обрабатывает `$SYS.REQ.SERVER.PING.IDZ`, возвращая информацию о сервере, к которому подключён клиент.
- Системный аккаунт также отвечает на `$SYS.REQ.SERVER.PING.PROFILEZ`, даже если порт профилирования отключён.
- Пользовательский аккаунт отвечает на `$SYS.REQ.USER.INFO`, позволяя пользователю узнать свой аккаунт и разрешения.

### MQTT

- Добавлена поддержка [QoS2](../running-a-nats-service/configuration/mqtt/). Подробнее см. [MQTT implementation details](https://github.com/nats-io/nats-server/blob/main/server/README-MQTT.md).

### Clustering

- При настройке маршрутов введены оптимизации: пул TCP-соединений между серверами, опциональное закрепление аккаунтов за соединениями и сжатие трафика. Подробности — на странице [v2 routes](../running-a-nats-service/configuration/clustering/v2_routes.md).

### Leafnodes

- Появилась опция [`handshake_first`](../running-a-nats-service/configuration/leafnodes/#tls-first-handshake) для TLS-first handshake при подключении leafnode.

### Windows

- Добавлена переменная окружения [`NATS_STARTUP_DELAY`](../running-a-nats-service/running/windows_srv.md#nats_startup_delay-environment-variable), позволяющая изменять дефолтную задержку старта сервера (10 секунд).

## Улучшения

### Перезагрузка

- Команда [`nats-server --signal`](../running-a-nats-service/nats_admin/signals.md#multiple-processes) теперь поддерживает glob-выражения в параметре `<pid>`, позволяя выбирать заданное подмножество процессов `nats-server` на хосте.

### Потоки

- До 2.10 установка [`republish`](../nats-concepts/jetstream/streams.md#republish) на зеркалах вызывала ошибку. На потоках source републиковались только сообщения, удовлетворяющие настроенным `subjects`. Сейчас режим смягчён — републикация разрешена и на зеркалах, и включает все сообщения источников.

### Потребители

- В ответ на fetch добавлен заголовок, сообщающий клиенту, что запрос выполнен, без необходимости опираться на heartbeat. Это предотвращает избыточные fetch-запросы.

### Leafnodes

- Ранее leafnode с двумя или более remote, привязанными к одному hub-аккаунту, отклонялся. Теперь каждый remote может ассоциироваться с собственным локальным аккаунтом.

### MQTT

- Символ `.` в MQTT-темах теперь поддерживается. Подробности — в таблице соответствия [topic-subject](../running-a-nats-service/configuration/mqtt/).
