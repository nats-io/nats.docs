# Потоки

Первый шаг — настроить хранение для сообщений, связанных с `ORDERS`. Они приходят на wildcard‑subject и попадают в один Stream, где сохраняются в течение 1 года.

## Создание

```shell
nats str add ORDERS
```
```text
? Subjects to consume ORDERS.*
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Message count limit -1
? Message size limit -1
? Maximum message age limit 1y
? Maximum individual message size [? for help] (-1) -1
Stream ORDERS was created

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
     Maximum Messages: -1
        Maximum Bytes: -1
          Maximum Age: 8760h0m0s
 Maximum Message Size: -1
  Maximum Consumers: -1

Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 0
             LastSeq: 0
    Active Consumers: 0
```

Можно получить недостающую информацию интерактивно, как выше, или сделать все одной командой. Нажатие `?` в CLI поможет сопоставить вопросы с опциями CLI:

```shell
nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --dupe-window="0s" --replicas 1
```

Также можно сохранить конфигурацию в JSON‑файле; формат такой же, как в `$ nats str info ORDERS -j | jq .config`:

```shell
nats str add ORDERS --config orders.json
```

## Список

Проверим, что Stream создан:

```shell
nats str ls
```
```text
Streams:

    ORDERS
```

## Запрос информации

Информацию о конфигурации Stream можно посмотреть, а если вы не указали Stream явно, как ниже, CLI предложит выбор из известных:

```shell
nats str info ORDERS
```
```text
Information for Stream ORDERS created 2021-02-27T16:49:36-07:00

Configuration:

             Subjects: ORDERS.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 1y0d0h0m0s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited

State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

Большинство команд, которые выводят данные как выше, поддерживают `-j` для JSON:

```shell
nats str info ORDERS -j
```
```json
{
  "config": {
    "name": "ORDERS",
    "subjects": [
      "ORDERS.*"
    ],
    "retention": "limits",
    "max_consumers": -1,
    "max_msgs": -1,
    "max_bytes": -1,
    "max_age": 31536000000000000,
    "max_msg_size": -1,
    "storage": "file",
    "discard": "old",
    "num_replicas": 1,
    "duplicate_window": 120000000000
  },
  "created": "2021-02-27T23:49:36.700424Z",
  "state": {
    "messages": 0,
    "bytes": 0,
    "first_seq": 0,
    "first_ts": "0001-01-01T00:00:00Z",
    "last_seq": 0,
    "last_ts": "0001-01-01T00:00:00Z",
    "consumer_count": 0
  }
}
```

Это общий паттерн для утилиты `nats` в части JetStream: она запрашивает недостающую информацию, но все действия можно выполнять неинтерактивно, используя CLI как API. Любой вывод, подобный выше, можно преобразовать в JSON с помощью `-j`.

## Копирование

Stream можно скопировать в другой, при этом конфигурацию нового можно скорректировать флагами CLI:

```shell
nats str cp ORDERS ARCHIVE --subjects "ORDERS_ARCHIVE.*" --max-age 2y
```
```text
Stream ORDERS was created

Information for Stream ORDERS created 2021-02-27T16:52:46-07:00

Configuration:

             Subjects: ORDERS_ARCHIVE.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 2y0d0h0m0s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited

State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

## Редактирование

Конфигурацию stream можно редактировать, что позволяет менять параметры через флаги CLI. Здесь у меня ошибочно созданный stream ORDERS, который я исправляю:

```shell
nats str info ORDERS -j | jq .config.subjects
```
```text
[
  "ORDERS.new"
]
```

Изменяем subjects для stream
```shell
nats str edit ORDERS --subjects "ORDERS.*"
```
```text
Stream ORDERS was updated

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
....
```

Также можно сохранить конфигурацию в JSON‑файле; формат такой же, как в `$ nats str info ORDERS -j | jq .config`:

```shell
nats str edit ORDERS --config orders.json
```

## Публикация в Stream

Теперь добавим сообщения в Stream. Можно использовать `nats pub` для отправки сообщений и добавить флаг `--wait`, чтобы увидеть ack публикации.

Можно публиковать без ожидания ack:

```shell
nats pub ORDERS.scratch hello
```

Но если вы хотите убедиться, что сообщения дошли до JetStream и были сохранены, можно сделать запрос:

```shell
nats req ORDERS.scratch hello
```
```text
13:45:03 Sending request on [ORDERS.scratch]
13:45:03 Received on [_INBOX.M8drJkd8O5otORAo0sMNkg.scHnSafY]: '+OK'
```

Периодически проверяйте статус Stream — вы увидите рост числа сохраненных сообщений.

```shell
nats str info ORDERS
```
```text
Information for Stream ORDERS
...
Statistics:

            Messages: 3
               Bytes: 147 B
            FirstSeq: 1
             LastSeq: 3
    Active Consumers: 0
```

После того как вы положили немного тестовых данных в Stream, можно очистить все данные, сохранив Stream активным:

## Удаление всех данных

Чтобы удалить все данные в stream, используйте `purge`:

```shell
nats str purge ORDERS -f
```
```text
...
State:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 1,000,001
             LastSeq: 1,000,000
    Active Consumers: 0
```

## Удаление одного сообщения

Одно сообщение можно безопасно удалить из stream:

```shell
nats str rmm ORDERS 1 -f
```

## Удаление набора

Наконец, для демонстрации, можно удалить весь Stream и создать заново. После этого можно переходить к созданию Consumers:

```shell
nats str rm ORDERS -f
nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --dupe-window="0s" --replicas 1
```
