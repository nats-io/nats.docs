# Восстановление после аварий

В случае необратимой потери персистентности сообщений JetStream на одном или нескольких узлах сервера есть два сценария восстановления:

* Автоматическое восстановление с целых узлов кворума
* Ручное восстановление из существующих snapshots stream (бэкапов)

{% hint style="danger" %}
Для stream с репликацией R1 данные сохраняются только на одном узле. Если этот узел не подлежит восстановлению, единственный вариант — восстановление из бэкапа.
{% endhint %}

## Автоматическое восстановление

NATS автоматически создаст замещающие реплики stream при следующих условиях:

* затронутый stream имеет конфигурацию репликации R3 (или выше)
* оставшиеся целые узлы (реплики stream) обеспечивают минимальный RAFT‑кворум: floor(R/2) + 1
* доступны узлы в кластере stream для новых реплик
* затронутые узлы удалены из RAFT Meta‑группы домена stream (например, `nats server cluster peer-remove`)

## Ручное восстановление

Snapshots (они же бэкапы) можно заранее создавать для любого stream независимо от конфигурации репликации.

Бэкап включает (по умолчанию):

* конфигурацию и состояние stream
* конфигурацию и состояние durable consumer stream
* все payload‑данные сообщений, включая метаданные (timestamps, headers)

### Бэкап

CLI‑команда `nats stream backup` используется для создания snapshots stream и его durable consumers.

{% hint style="info" %}
Если вы владелец аккаунта и хотите сделать бэкап ВСЕХ streams аккаунта, используйте `nats account backup`.
{% endhint %}

{% hint style="warning" %}
Streams, хранящиеся в памяти, не поддерживают snapshots. Бэкап возможен только для streams с файловым хранением.
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

Во время операции бэкапа stream переводится в состояние, при котором конфигурация не может изменяться и данные не будут выталкиваться политиками retention.

{% hint style="info" %}
Прогресс с использованием полосы в терминале можно отключить через `--no-progress`, тогда будут выводиться строки логов.
{% endhint %}

### Восстановление

Существующий бэкап (как выше) можно восстановить на тот же или новый NATS server (или кластер) с помощью команды `nats stream restore`.

{% hint style="info" %}
`nats stream restore` восстанавливает один stream из одного каталога бэкапа. Чтобы восстановить все streams сразу, используйте `nats account restore`, как описано ниже.
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

Прогресс с использованием полосы в терминале можно отключить через `--no-progress`, тогда будут выводиться строки логов.

## Бэкап и восстановление на уровне аккаунта

В средах, где CLI `nats` используется интерактивно для конфигурации сервера, у вас нет желаемого состояния, из которого можно воссоздать сервер. Это не лучший способ администрирования; мы рекомендуем управление конфигурациями, но многие используют этот подход.

Команды `nats account backup` и `nats account restore` позволяют забэкапить и восстановить все streams аккаунта сразу, включая их конфигурацию, состояние consumer и все данные сообщений.

### Бэкап аккаунта

```shell
nats account backup /data/js-backup
```
Output
```text
Performing backup of all streams to /data/js-backup

    Streams: 3
       Size: 14 KiB
  Consumers: 2

Starting backup of Stream "EVENTS" with 0 B
Received 1.5 KiB compressed data in 2 chunks for stream "EVENTS" in 0s, 16 KiB uncompressed

Starting backup of Stream "ORDERS" with 55 B
Received 976 B compressed data in 2 chunks for stream "ORDERS" in 1ms, 9.5 KiB uncompressed

Starting backup of Stream "WORK" with 7.3 KiB
Received 7.3 KiB compressed data in 2 chunks for stream "WORK" in 0s, 30 KiB uncompressed
```

Это создаст подкаталог для каждого stream внутри `/data/js-backup`, каждый содержит полный snapshot stream (конфигурацию, состояние consumer и данные сообщений) в том же формате, что и `nats stream backup`.

Доступные флаги для `nats account backup`:

| Флаг | Описание |
| :--- | :--- |
| `--consumers` | Включить конфигурацию и состояние consumer |
| `--check` | Проверить целостность бэкапа |
| `--force` | Принудительно перезаписать существующий каталог бэкапа |
| `--critical-warnings` | Считать предупреждения критическими ошибками |

### Восстановление аккаунта

```shell
nats account restore /data/js-backup
```
Output
```text
Restoring backup of all 3 streams in directory "/data/js-backup"

Starting restore of Stream "EVENTS" from file "/data/js-backup/EVENTS"
Restored stream "EVENTS" in 0s
...

Starting restore of Stream "ORDERS" from file "/data/js-backup/ORDERS"
Restored stream "ORDERS" in 1ms
...

Starting restore of Stream "WORK" from file "/data/js-backup/WORK"
Restored stream "WORK" in 0s
...
```

Это восстановит все подкаталоги stream, найденные в `/data/js-backup`, включая все данные сообщений и состояние consumer.

Доступные флаги для `nats account restore`:

| Флаг | Описание |
| :--- | :--- |
| `--cluster` | Целевой кластер для восстановленных streams |
| `--tag` | Тег размещения для восстановленных streams |

{% hint style="warning" %}
`nats account restore` завершится с ошибкой, если stream с таким же именем уже существует. Перед восстановлением из бэкапа нужно удалить существующий stream.
{% endhint %}
