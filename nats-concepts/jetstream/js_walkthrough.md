# Пошаговое руководство по NATS JetStream

Ниже — небольшой walkthrough по созданию потока и consumer и взаимодействию с потоком через [nats cli](https://github.com/nats-io/natscli).

## Предусловие: включение JetStream

Если вы запускаете локальный `nats-server`, остановите его и перезапустите с включенным JetStream, используя `nats-server -js` (если это еще не сделано).

Затем проверьте, что JetStream включен:

```shell
nats account info
```
```text
Account Information

                           User: 
                        Account: $G
                        Expires: never
                      Client ID: 5
                      Client IP: 127.0.0.1
                            RTT: 128µs
              Headers Supported: true
                Maximum Payload: 1.0 MiB
                  Connected URL: nats://127.0.0.1:4222
              Connected Address: 127.0.0.1:4222
            Connected Server ID: NAMR7YBNZA3U2MXG2JH3FNGKBDVBG2QTMWVO6OT7XUSKRINKTRFBRZEC
       Connected Server Version: 2.11.0-dev
                 TLS Connection: no

JetStream Account Information:

Account Usage:

                        Storage: 0 B
                         Memory: 0 B
                        Streams: 0
                      Consumers: 0

Account Limits:

            Max Message Payload: 1.0 MiB

  Tier: Default:

      Configuration Requirements:

        Stream Requires Max Bytes Set: false
         Consumer Maximum Ack Pending: Unlimited

      Stream Resource Usage Limits:

                               Memory: 0 B of Unlimited
                    Memory Per Stream: Unlimited
                              Storage: 0 B of Unlimited
                   Storage Per Stream: Unlimited
                              Streams: 0 of Unlimited
                            Consumers: 0 of Unlimited
```

Если вы видите следующее, то JetStream _не_ включен:

```text
JetStream Account Information:

   JetStream is not supported in this account
```

## 1. Создание потока

Начнем с создания потока, который будет захватывать и хранить сообщения, опубликованные на subject "foo".

Введите `nats stream add <Stream name>` (в примерах ниже назовем поток "my_stream"), затем введите "foo" как имя subject и нажмите Enter, чтобы использовать значения по умолчанию для остальных атрибутов потока:

```shell
nats stream add my_stream
```
```text
? Subjects foo
? Storage file
? Replication 1
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Per Subject Messages Limit -1
? Total Stream Size -1
? Message TTL -1
? Max Message Size -1
? Duplicate tracking time window 2m0s
? Allow message Roll-ups No
? Allow message deletion Yes
? Allow purging subjects or the entire stream Yes
Stream my_stream was created

Information for Stream my_stream created 2024-06-07 12:29:36

              Subjects: foo
              Replicas: 1
               Storage: File

Options:

             Retention: Limits
       Acknowledgments: true
        Discard Policy: Old
      Duplicate Window: 2m0s
            Direct Get: true
     Allows Msg Delete: true
          Allows Purge: true
        Allows Rollups: false

Limits:

      Maximum Messages: unlimited
   Maximum Per Subject: unlimited
         Maximum Bytes: unlimited
           Maximum Age: unlimited
  Maximum Message Size: unlimited
     Maximum Consumers: unlimited

State:

              Messages: 0
                 Bytes: 0 B
        First Sequence: 0
         Last Sequence: 0
      Active Consumers: 0
```

Затем можно посмотреть информацию о только что созданном потоке:

```shell
nats stream info my_stream
```
```text
Information for Stream my_stream created 2024-06-07 12:29:36

              Subjects: foo
              Replicas: 1
               Storage: File

Options:

             Retention: Limits
       Acknowledgments: true
        Discard Policy: Old
      Duplicate Window: 2m0s
            Direct Get: true
     Allows Msg Delete: true
          Allows Purge: true
        Allows Rollups: false

Limits:

      Maximum Messages: unlimited
   Maximum Per Subject: unlimited
         Maximum Bytes: unlimited
           Maximum Age: unlimited
  Maximum Message Size: unlimited
     Maximum Consumers: unlimited

State:

              Messages: 0
                 Bytes: 0 B
        First Sequence: 0
         Last Sequence: 0
      Active Consumers: 0
```

## 2. Публикация сообщений в поток

Теперь запустим издателя:

```shell
nats pub foo --count=1000 --sleep 1s "publication #{{.Count}} @ {{.TimeStamp}}"
```

Поскольку сообщения публикуются на subject "foo", они также захватываются и сохраняются в потоке. Это можно проверить через `nats stream info my_stream` и даже посмотреть сами сообщения с помощью `nats stream view my_stream` или `nats stream get my_stream`.

## 3. Создание consumer

На этом этапе, если вы создадите подписчика Core NATS (то есть non‑streaming) для subject `foo`, вы получите _только_ сообщения, опубликованные после запуска подписчика — это нормальное поведение для Core NATS. Чтобы получить replay всех сообщений, содержащихся в потоке (включая опубликованные ранее), мы создадим consumer.

Мы можем административно создать consumer командой `nats consumer add <Consumer name>`. В этом примере назовем consumer `pull_consumer`, оставим subject доставки пустым (то есть просто нажмем Enter), потому что создаем pull consumer, и выберем `all` для стартовой политики. Далее оставляем значения по умолчанию и подтверждаем Enter. Поток, в котором создается consumer, — это `my_stream`, созданный выше.

```shell
nats consumer add
```
```text
? Consumer name pull_consumer
? Delivery target (empty for Pull Consumers) 
? Start policy (all, new, last, subject, 1h, msg sequence) all
? Acknowledgment policy explicit
? Replay policy instant
? Filter Stream by subjects (blank for all) 
? Maximum Allowed Deliveries -1
? Maximum Acknowledgments Pending 0
? Deliver headers only without bodies No
? Add a Retry Backoff Policy No
? Select a Stream my_stream
Information for Consumer my_stream > pull_consumer created 2024-06-07T12:32:09-05:00

Configuration:

                    Name: pull_consumer
               Pull Mode: true
          Deliver Policy: All
              Ack Policy: Explicit
                Ack Wait: 30.00s
           Replay Policy: Instant
         Max Ack Pending: 1,000
       Max Waiting Pulls: 512

State:

  Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
    Acknowledgment Floor: Consumer sequence: 0 Stream sequence: 0
        Outstanding Acks: 0 out of maximum 1,000
    Redelivered Messages: 0
    Unprocessed Messages: 74
           Waiting Pulls: 0 of maximum 512
```

Вы можете в любой момент проверить статус consumer через `nats consumer info`, посмотреть сообщения в потоке через `nats stream view my_stream` или `nats stream get my_stream`, или даже удалить отдельные сообщения из потока командой `nats stream rmm`.

## 3. Подписка через consumer

Теперь, когда consumer создан и в потоке есть сообщения, можно начать подписку на consumer:

```shell
nats consumer next my_stream pull_consumer --count 1000
```

Это выведет все сообщения в потоке, начиная с первого (опубликованного ранее), и продолжит выводить новые сообщения по мере публикации, пока не будет достигнут лимит `count`.

Обратите внимание: в этом примере мы создаем pull consumer с «durable» именем, а значит, consumer может быть разделен между любым количеством процессов потребления. Например, вместо одного `nats consumer next` с `count` 1000, можно запустить два экземпляра `nats consumer` с `count` 500 и увидеть распределение потребления сообщений между этими экземплярами `nats`.

#### Повторное воспроизведение сообщений

После того как вы прошли все сообщения в потоке с помощью consumer, вы можете получить их снова, просто создав нового consumer или удалив текущего (`nats consumer rm`) и создав его заново (`nats consumer add`).

## 4. Очистка

Вы можете очистить поток (и освободить связанные с ним ресурсы, например сообщения в потоке) командой `nats stream purge`.

Вы также можете удалить поток (что автоматически удалит всех consumers, определенных для этого потока) командой `nats stream rm`.
