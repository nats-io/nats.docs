---
description: Использование JetStream на листовых узлах
---

# Leaf Nodes (листовые узлы)

Если хотите увидеть демонстрацию полного спектра возможностей, посмотрите наше [видео](https://youtu.be/0MkS_S7lyHk)

Один из сценариев использования сервера NATS, настроенного как [leaf node](../leafnodes), — обеспечить локальную сеть NATS даже при отсутствии связи с hub или облаком. Для поддержки такого «отключенного» сценария с JetStream также поддерживаются независимые острова JetStream, доступные через ту же сеть NATS.

Общая проблема нескольких независимых JetStream, доступных одному клиенту, — необходимость различать их. Например, возьмем leaf‑node с не‑кластеризованным JetStream на каждом сервере. Вы подключаетесь к одному из них, но какой JetStream ответит, когда вы используете JetStream API `$JS.API.>`?

Чтобы различать серверы, в блок конфигурации JetStream добавлена опция `domain`. При использовании следуйте правилам: каждый сервер в кластере и супер‑кластере должен иметь одинаковое имя домена. Это означает, что имена доменов могут различаться только между двумя серверами, если они соединены через leaf‑подключение. В результате JetStream API `$JS.API.>` также будет доступен под доменно‑уточненным именем `$JS.<domain>.API.>`. Разумеется, имена доменов должны быть уникальными.

Есть причины подключать системные аккаунты по обе стороны leaf‑подключения. Вероятно, вы не хотите соединять системные аккаунты облака и edge‑устройств, но можете сделать это, когда единственное препятствие для super‑cluster — правила firewall.

Преимущества:

* мониторинг всех подключенных nats‑server
* nats‑account‑resolver работает по всей сети
* расширенный кластер JetStream

Когда `domain` задан, JetStream‑трафик на системном аккаунте подавляется. Именно поэтому JetStream не расширяется.

Кроме того, подавляется трафик на `$JS.API.>`. Это заставляет клиентов использовать локальный JetStream, доступный на серверах NATS, к которым они подключены. Чтобы обратиться к другому JetStream, нужно указать доменно‑специфичный префикс `$JS.<domain>.API`.

Учтите, что каждый домен — независимое пространство имен. Это означает, что внутри одного аккаунта допустимо использовать одинаковые имена потоков в разных доменах.

Также обычный поток сообщений не ограничивается. Поэтому, если один и тот же subject подписан разными потоками в одном аккаунте в разных доменах, при условии, что leaf‑подключение было активно, каждый поток сохранит сообщение. Это можно решить, используя в каждом домене разные subject, или разные аккаунты в каждом домене, или [изоляцию аккаунтов](https://youtu.be/0MkS_S7lyHk?t=1151) для leaf‑nodes.

> _Известная проблема_: если у вас больше одного leaf‑node с включенным JetStream в другом кластере, кластер, к которому вы подключаетесь, также должен иметь включенный JetStream и заданный домен.
>
> _Известная проблема_: если вы хотите расширять центральный JetStream, не задавая домен в leaf‑nodes, этот центральный JetStream должен быть в кластерном режиме.

## Конфигурация

Ниже приведена конфигурация для соединения двух серверов с включенным JetStream через leaf‑подключение. В примере системные аккаунты соединены для демонстрации (это не обязательно).

### `accounts.conf`, импортируемый обоими серверами

```text
accounts {
    SYS: {
        users: [{user: admin, password: admin}]
    },
    ACC: {
        users: [{user: acc, password: acc}],
        jetstream: enabled
    }
}
system_account: SYS
```

### `hub.conf`

Запускать с `nats-server -c hub.conf`:

```text
port: 4222
server_name: hub-server
jetstream {
    store_dir="./store_server"
    domain=hub
}
leafnodes {
    port: 7422
}
include ./accounts.conf
```

### `leaf.conf`

Запускать с `nats-server -c leaf.conf`:

```text
port: 4111
server_name: leaf-server
jetstream {
    store_dir="./store_leaf"
    domain=leaf
}
leafnodes {
    remotes = [
        {
            urls: ["nats://admin:admin@0.0.0.0:7422"]
            account: "SYS"
        },
        {
            urls: ["nats://acc:acc@0.0.0.0:7422"]
            account: "ACC"
        }
    ]
}
include ./accounts.conf
```

## Использование

Так как системный аккаунт подключен, можно получить отчет JetStream с обоих серверов.

```bash
nats  --server nats://admin:admin@localhost:4222 server report jetstream
```
```text
╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                JetStream Summary                                                │
├─────────────┬─────────────┬────────┬─────────┬───────────┬──────────┬───────┬────────┬──────┬─────────┬─────────┤
│ Server      │ Cluster     │ Domain │ Streams │ Consumers │ Messages │ Bytes │ Memory │ File │ API Req │ API Err │
├─────────────┼─────────────┼────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│ leaf-server │ leaf-server │ leaf   │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
│ hub-server  │             │ hub    │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
├─────────────┼─────────────┼────────┼─────────┼───────────┼──────────┼───────┼────────┼──────┼─────────┼─────────┤
│             │             │        │ 0       │ 0         │ 0        │ 0 B   │ 0 B    │ 0 B  │ 0       │ 0       │
╰─────────────┴─────────────┴────────┴─────────┴───────────┴──────────┴───────┴────────┴──────┴─────────┴─────────╯
```

Создайте поток с именем `test`, подписанный на subject `test` в JetStream‑домене, к которому подключена программа. В результате поток будет создан в домене hub — домене сервера, слушающего `localhost:4222`.

```bash
nats  --server nats://acc:acc@localhost:4222 stream add
```
```text
? Stream Name test
? Subjects to consume test
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Per Subject Messages Limit -1
? Message size limit -1
? Maximum message age limit -1
? Maximum individual message size -1
? Duplicate tracking time window 2m
? Replicas 1
Stream test was created

Information for Stream test created 2021-06-28T12:52:29-04:00

Configuration:

             Subjects: test
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 0.00s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

Чтобы создать поток в другом домене, оставаясь подключенным к тому же серверу, просто укажите аргумент `js-domain`. Теперь поток создается в `leaf`.

```bash
nats  --server nats://acc:acc@localhost:4222 stream add --js-domain leaf
```
```text
? Stream Name test
? Subjects to consume test
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Per Subject Messages Limit -1
? Message size limit -1
? Maximum message age limit -1
? Maximum individual message size -1
? Duplicate tracking time window 2m
? Replicas 1
Stream test was created

Information for Stream test created 2021-06-28T12:59:18-04:00

Configuration:

             Subjects: test
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 0.00s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

Опубликуйте сообщение, чтобы было что получать.

```shell
nats  --server nats://acc:acc@localhost:4222 pub test "hello world"
```

Так как оба потока подписаны на один subject, каждый из них теперь сообщает об одном сообщении. Это сделано для демонстрации проблемы. Если хотите этого избежать, используйте разные subject, разные аккаунты или изолируйте аккаунт.

```bash
nats  --server nats://acc:acc@localhost:4222 stream report --js-domain leaf
```
```text
Obtaining Stream stats

╭─────────────────────────────────────────────────────────────────────────────╮
│                                Stream Report                                │
├────────┬─────────┬───────────┬──────────┬───────┬──────┬─────────┬──────────┤
│ Stream │ Storage │ Consumers │ Messages │ Bytes │ Lost │ Deleted │ Replicas │
├────────┼─────────┼───────────┼──────────┼───────┼──────┼─────────┼──────────┤
│ test   │ File    │ 0         │ 1        │ 45 B  │ 0    │ 0       │          │
╰────────┴─────────┴───────────┴──────────┴───────┴──────┴─────────┴──────────╯
```

```bash
nats  --server nats://acc:acc@localhost:4222 stream report --js-domain hub
```
Вывод
```text
Obtaining Stream stats

╭─────────────────────────────────────────────────────────────────────────────╮
│                                Stream Report                                │
├────────┬─────────┬───────────┬──────────┬───────┬──────┬─────────┬──────────┤
│ Stream │ Storage │ Consumers │ Messages │ Bytes │ Lost │ Deleted │ Replicas │
├────────┼─────────┼───────────┼──────────┼───────┼──────┼─────────┼──────────┤
│ test   │ File    │ 0         │ 1        │ 45 B  │ 0    │ 0       │          │
╰────────┴─────────┴───────────┴──────────┴───────┴──────┴─────────┴──────────╯
```

### Копирование между доменами через `source` или `mirror`

Чтобы скопировать поток из одного домена в другой, укажите домен JetStream при создании `mirror`. Если вы хотите подключить leaf к hub и получать команды даже при офлайн‑состоянии leaf‑подключения, правильный путь — зеркалирование потока, расположенного в hub.

```bash
nats  --server nats://acc:acc@localhost:4222 stream add --js-domain hub --mirror test
```
```text
? Stream Name backup-test-leaf
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Message size limit -1
? Maximum message age limit -1
? Maximum individual message size -1
? Replicas 1
? Adjust mirror start No
? Import mirror from a different JetStream domain Yes
? Foreign JetStream domain name leaf
? Delivery prefix
Stream backup-test-leaf was created

Information for Stream backup-test-leaf created 2021-06-28T14:00:43-04:00

Configuration:

     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 0.00s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited
               Mirror: test, API Prefix: $JS.leaf.API, Delivery Prefix:


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

Аналогично, если хотите агрегировать потоки, расположенные в любом количестве leaf‑nodes, используйте `source`. Если потоки на каждом leaf используются для одних и тех же целей, рекомендуется агрегировать их в hub для обработки через `source`.

```bash
nats  --server nats://acc:acc@localhost:4222 stream add --js-domain hub --source test
```
```text
? Stream Name aggregate-test-leaf
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Message size limit -1
? Maximum message age limit -1
? Maximum individual message size -1
? Duplicate tracking time window 2m
? Replicas 1
? Adjust source "test" start No
? Import "test" from a different JetStream domain Yes
? test Source foreign JetStream domain name leaf
? test Source foreign JetStream domain delivery prefix
Stream aggregate-test-leaf was created

Information for Stream aggregate-test-leaf created 2021-06-28T14:02:36-04:00

Configuration:

     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 0.00s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited
              Sources: test, API Prefix: $JS.leaf.API, Delivery Prefix:


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

`source`, как и `mirror`, делают копию сообщений. После копирования доступ к данным не зависит от того, онлайн ли leaf‑подключение. Такой способ копирования также избавляет от необходимости писать собственную программу. Это рекомендуемый способ обмена персистентными данными между доменами.

```bash
nats  --server nats://acc:acc@localhost:4222 stream report --js-domain hub
```
```text
Obtaining Stream stats

╭──────────────────────────────────────────────────────────────────────────────────────────╮
│                                      Stream Report                                       │
├─────────────────────┬─────────┬───────────┬──────────┬───────┬──────┬─────────┬──────────┤
│ Stream              │ Storage │ Consumers │ Messages │ Bytes │ Lost │ Deleted │ Replicas │
├─────────────────────┼─────────┼───────────┼──────────┼───────┼──────┼─────────┼──────────┤
│ backup-test-leaf    │ File    │ 0         │ 1        │ 45 B  │ 0    │ 0       │          │
│ test                │ File    │ 0         │ 1        │ 45 B  │ 0    │ 0       │          │
│ aggregate-test-leaf │ File    │ 0         │ 1        │ 98 B  │ 0    │ 0       │          │
╰─────────────────────┴─────────┴───────────┴──────────┴───────┴──────┴─────────┴──────────╯

╭────────────────────────────────────────────────────────────────────────────────────╮
│                                 Replication Report                                 │
├─────────────────────┬────────┬──────────────┬───────────────┬────────┬─────┬───────┤
│ Stream              │ Kind   │ API Prefix   │ Source Stream │ Active │ Lag │ Error │
├─────────────────────┼────────┼──────────────┼───────────────┼────────┼─────┼───────┤
│ backup-test-leaf    │ Mirror │ $JS.leaf.API │ test          │ 0.21s  │ 0   │       │
│ aggregate-test-leaf │ Source │ $JS.leaf.API │ test          │ 1.23s  │ 0   │       │
╰─────────────────────┴────────┴──────────────┴───────────────┴────────┴─────┴───────╯
```

### Кросс‑аккаунтный и кросс‑доменный импорт

Все выше происходило в одном аккаунте. Чтобы разделить доступ к доменам между аккаунтами, `account.conf` из примера выше нужно изменить и перезапустить или перезагрузить сервер. В этом примере экспортируются consumer и API `FC`, а также subject доставки, который используется внутренним push‑consumer, создаваемым `source` и `mirror`.

Для поддержки другого примера — совместного использования durable pull consumer для клиентского доступа между доменами и аккаунтами — также экспортируются API `NEXT` и `ACK`.

> _Известная проблема_: сейчас push‑consumer между аккаунтами не поддерживаются.

При импорте префикс JetStream API `$JS.hub.API` переименовывается в `JS.test@hub.API`. Это нужно, чтобы снова различать, с каким JetStream хочет работать клиент в импортирующем аккаунте. При использовании доменов общая рекомендация — экспортировать доменно‑специфичный API `$JS.<domain>.API`, так как это позволяет привязать экспорт к конкретному домену.

Кроме того, subject доставки расширяется при импорте. Это облегчает экспорт в несколько аккаунтов.

Этот пример также экспортирует абсолютный минимум необходимого. Можно дать доступ ко всему consumer API `$JS.hub.API.CONSUMER.>` или ко всему API домена `$JS.hub.API.>` или всему API `$JS.API.>` независимо от того, куда подключается импортирующий клиент.

```text
accounts {
    SYS: {
        users: [{user: admin, password: admin}]
    },
    ACC: {
        users: [{user: acc, password: acc}],
        jetstream: enabled
        exports: [
            # минимум экспорта, чтобы source/mirror могли создавать consumer «на лету»
            {service: "$JS.hub.API.CONSUMER.CREATE.*", response_type: "stream"}
            # минимум экспорта для push‑consumer. Сюда входят source и mirror!
            {stream: "deliver.acc.hub.>"}
            # минимум экспорта для durable pull consumer `dur` в потоке `aggregate-test-leaf`. (только клиенты — source/mirror не используют)
            {service: "$JS.hub.API.CONSUMER.MSG.NEXT.aggregate-test-leaf.dur", response_type: "stream"}
            # минимум экспорта для ack сообщений для durable consumer `dur` в потоке `aggregate-test-leaf`. (только клиенты — source/mirror не используют)
            {service: "$JS.ACK.aggregate-test-leaf.dur.>"}
            # минимум экспорта для flow control source/mirror
            {service: "$JS.FC.aggregate-test-leaf.dur.>"}
        ]
    }
    IMPORT_MIRROR: {
        users: [{user: import_mirror, password: import_mirror}],
        jetstream: enabled
        imports: [
            {service: {account: ACC, subject: "$JS.hub.API.CONSUMER.CREATE.*"}, to: "JS.acc@hub.API.CONSUMER.CREATE.*" }
            {service: {account: ACC, subject: "$JS.FC.aggregate-test-leaf.dur.>"}}
            {stream: {account: ACC, subject: deliver.acc.hub.import_mirror.>}}
        ]
    }
    # На данный момент между аккаунтами поддерживаются только pull‑consumer.
    IMPORT_CLIENT: {
        users: [{user: import_client, password: import_client}],
        jetstream: enabled
        imports: [
            {service: {account: ACC, subject: "$JS.hub.API.CONSUMER.MSG.NEXT.aggregate-test-leaf.dur"}, to: "JS.acc@hub.API.CONSUMER.MSG.NEXT.aggregate-test-leaf.dur" }
            {service: {account: ACC, subject: "$JS.ACK.aggregate-test-leaf.dur.>"}}
        ]
    }
}
system_account: SYS
```

#### Копирование через `source` и `mirror`

После перезапуска или перезагрузки серверов можно создать `mirror` следующим образом (то же относится к `source`): при импорте из другого аккаунта используется переименованный префикс `JS.acc@hub.API`. Кроме того, имя subject доставки расширяется так, чтобы включать импортирующий домен и поток. Это делает его уникальным для конкретного импорта. Если каждый delivery prefix следует шаблону `<static type>.<exporting account>.<exporting domain>.<importing account>.<importing domain>.<importing stream name>`, пересечения от множественных импортов исключаются.

```bash
nats  --server nats://import_mirror:import_mirror@localhost:4222 stream add --js-domain hub --mirror aggregate-test-leaf
```
```text
? Stream Name aggregate-test-leaf-from-acc
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Message size limit -1
? Maximum message age limit -1
? Maximum individual message size -1
? Replicas 1
? Adjust mirror start No
? Import mirror from a different JetStream domain No
? Import mirror from a different account Yes
? Foreign account API prefix JS.acc@hub.API
? Foreign account delivery prefix deliver.acc.hub.import_mirror.hub.aggregate-test-leaf-from-acc
Stream aggregate-test-leaf-from-acc was created

Information for Stream aggregate-test-leaf-from-acc created 2021-06-28T16:59:15-04:00

Configuration:

     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 0.00s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited
               Mirror: aggregate-test-leaf, API Prefix: JS.acc@hub.API, Delivery Prefix: deliver.acc.hub.import_mirror.hub.aggregate-test-leaf-from-acc


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

Последующая проверка показывает, что одно сообщение, сохраненное в агрегирующем потоке в аккаунте `ACC`, было скопировано в новый поток аккаунта `IMPORTER`.

```bash
nats  --server nats://import_mirror:import_mirror@localhost:4222 stream report --js-domain hub
```
```text
Obtaining Stream stats

╭───────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                           Stream Report                                           │
├──────────────────────────────┬─────────┬───────────┬──────────┬───────┬──────┬─────────┬──────────┤
│ Stream                       │ Storage │ Consumers │ Messages │ Bytes │ Lost │ Deleted │ Replicas │
├──────────────────────────────┼─────────┼───────────┼──────────┼───────┼──────┼─────────┼──────────┤
│ aggregate-test-leaf-from-acc │ File    │ 0         │ 1        │ 98 B  │ 0    │ 0       │          │
╰──────────────────────────────┴─────────┴───────────┴──────────┴───────┴──────┴─────────┴──────────╯

╭─────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                         Replication Report                                          │
├──────────────────────────────┬────────┬────────────────┬─────────────────────┬────────┬─────┬───────┤
│ Stream                       │ Kind   │ API Prefix     │ Source Stream       │ Active │ Lag │ Error │
├──────────────────────────────┼────────┼────────────────┼─────────────────────┼────────┼─────┼───────┤
│ aggregate-test-leaf-from-acc │ Mirror │ JS.acc@hub.API │ aggregate-test-leaf │ 0.59s  │ 0   │       │
╰──────────────────────────────┴────────┴────────────────┴─────────────────────┴────────┴─────┴───────╯
```

#### Прямой доступ к durable pull consumer

Измененный `accounts.conf` также включает отдельный импорт для существующего pull consumer. Создадим consumer с именем `dur` в потоке `aggregate-test-leaf` в аккаунте `acc`.

```bash
nats  --server nats://acc:acc@localhost:4222 consumer add  --js-domain hub
```
```text
? Consumer name dur
? Delivery target (empty for Pull Consumers)
? Start policy (all, new, last, 1h, msg sequence) all
? Replay policy instant
? Filter Stream by subject (blank for all)
? Maximum Allowed Deliveries -1
? Maximum Acknowledgements Pending 0
? Select a Stream aggregate-test-leaf
Information for Consumer aggregate-test-leaf > dur created 2021-06-28T17:16:51-04:00

Configuration:

        Durable Name: dur
           Pull Mode: true
         Deliver All: true
          Ack Policy: Explicit
            Ack Wait: 30s
       Replay Policy: Instant
     Max Ack Pending: 20,000
   Max Waiting Pulls: 512

State:

   Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
     Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
         Outstanding Acks: 0 out of maximum 20000
     Redelivered Messages: 0
     Unprocessed Messages: 1
            Waiting Pulls: 0 of maximum 512
```
```shell
nats  --server nats://acc:acc@localhost:4222 stream report --js-domain hub
```
```text
Obtaining Stream stats

╭──────────────────────────────────────────────────────────────────────────────────────────╮
│                                      Stream Report                                       │
├─────────────────────┬─────────┬───────────┬──────────┬───────┬──────┬─────────┬──────────┤
│ Stream              │ Storage │ Consumers │ Messages │ Bytes │ Lost │ Deleted │ Replicas │
├─────────────────────┼─────────┼───────────┼──────────┼───────┼──────┼─────────┼──────────┤
│ backup-test-leaf    │ File    │ 0         │ 1        │ 45 B  │ 0    │ 0       │          │
│ test                │ File    │ 0         │ 1        │ 45 B  │ 0    │ 0       │          │
│ aggregate-test-leaf │ File    │ 1         │ 1        │ 98 B  │ 0    │ 0       │          │
╰─────────────────────┴─────────┴───────────┴──────────┴───────┴──────┴─────────┴──────────╯

╭────────────────────────────────────────────────────────────────────────────────────╮
│                                 Replication Report                                 │
├─────────────────────┬────────┬──────────────┬───────────────┬────────┬─────┬───────┤
│ Stream              │ Kind   │ API Prefix   │ Source Stream │ Active │ Lag │ Error │
├─────────────────────┼────────┼──────────────┼───────────────┼────────┼─────┼───────┤
│ backup-test-leaf    │ Mirror │ $JS.leaf.API │ test          │ 1.85s  │ 0   │       │
│ aggregate-test-leaf │ Source │ $JS.leaf.API │ test          │ 1.85s  │ 0   │       │
╰─────────────────────┴────────┴──────────────┴───────────────┴────────┴─────┴───────╯
```

```bash
nats  --server nats://acc:acc@localhost:4222 consumer report --js-domain hub
```
Вывод
```text
? Select a Stream aggregate-test-leaf
╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                          Consumer report for aggregate-test-leaf with 1 consumers                           │
├──────────┬──────┬────────────┬──────────┬─────────────┬─────────────┬─────────────┬───────────┬─────────────┤
│ Consumer │ Mode │ Ack Policy │ Ack Wait │ Ack Pending │ Redelivered │ Unprocessed │ Ack Floor │ Cluster     │
├──────────┼──────┼────────────┼──────────┼─────────────┼─────────────┼─────────────┼───────────┼─────────────┤
│ dur      │ Pull │ Explicit   │ 30.00s   │ 0           │ 0           │ 1 / 100%    │ 0         │ hub-server* │
╰──────────┴──────┴────────────┴──────────┴─────────────┴─────────────┴─────────────┴───────────┴─────────────╯
```

Чтобы получить сообщения, сохраненные в домене `hub`, используя `nats` и будучи подключенным к leaf‑node, укажите правильные имена потока и durable, а также API‑префикс `JS.acc@hub.API`.

```shell
nats --server nats://import_client:import_client@localhost:4111 consumer next aggregate-test-leaf dur --js-api-prefix JS.acc@hub.API
```
```text
[17:44:16] subj: test / tries: 1 / cons seq: 1 / str seq: 1 / pending: 0

Headers:

  Nats-Stream-Source: test:mSx7q4yJ 1

Data:


hello world

Acknowledged message
```

```shell
nats  --server nats://acc:acc@localhost:4222 consumer report --js-domain hub
```
```text
? Select a Stream aggregate-test-leaf
╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                          Consumer report for aggregate-test-leaf with 1 consumers                           │
├──────────┬──────┬────────────┬──────────┬─────────────┬─────────────┬─────────────┬───────────┬─────────────┤
│ Consumer │ Mode │ Ack Policy │ Ack Wait │ Ack Pending │ Redelivered │ Unprocessed │ Ack Floor │ Cluster     │
├──────────┼──────┼────────────┼──────────┼─────────────┼─────────────┼─────────────┼───────────┼─────────────┤
│ dur      │ Pull │ Explicit   │ 30.00s   │ 0           │ 0           │ 0           │ 1         │ hub-server* │
╰──────────┴──────┴────────────┴──────────┴─────────────┴─────────────┴─────────────┴───────────┴─────────────╯
```

Это работает аналогично при написании собственного клиента. Чтобы не ждать таймаут ack, отправьте новое сообщение на `test`, откуда оно копируется в `aggregate-test-leaf`.

```bash
nats  --server nats://acc:acc@localhost:4222 pub test "hello world 2"
```

Клиент подключен к leaf‑node и получает только что отправленное сообщение.

```shell
./main nats://import_client:import_client@localhost:4111
```
```text
starting
&{Sequence:{Consumer:3 Stream:3} NumDelivered:1 NumPending:0 Timestamp:2021-06-28 17:51:05.186878 -0400 EDT Stream:aggregate-test-leaf Consumer:dur}
hello world 2
nats: timeout
^Cnats: timeout
```

Здесь API‑префикс задается опцией `nats.APIPrefix("JS.acc@hub.API")` при получении объекта JetStream. Так как доступ к API ограничен, вызов subscribe использует опцию `nats.Bind("aggregate-test-leaf", "dur")`, которая предотвращает вызовы для вывода имени потока и durable.

```go
package main

import (
    "fmt"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/nats-io/nats.go"
)

func main() {
    nc, err := nats.Connect(os.Args[1], nats.Name("JS test"))
    defer nc.Close()
    if err != nil {
        fmt.Printf("nats connect: %v\n", err)
        return
    }
    js, err := nc.JetStream(nats.APIPrefix("JS.acc@hub.API"))
    if err != nil {
        fmt.Printf("JetStream: %v\n", err)
        if js == nil {
            return
        }
    }
    s, err := js.PullSubscribe("", "dur", nats.Bind("aggregate-test-leaf", "dur"))
    if err != nil {
        fmt.Printf("PullSubscribe: %v\n", err)
        return
    }

    shutdown := make(chan os.Signal, 1)
    signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

    fmt.Printf("starting\n")
    for {
        select {
        case <-shutdown:
            return
        default:
            if m, err := s.Fetch(1, nats.MaxWait(time.Second)); err != nil {
                fmt.Println(err)
            } else {

                if meta, err := m[0].Metadata(); err == nil {
                    fmt.Printf("%+v\n", meta)
                }
                fmt.Println(string(m[0].Data))

                if err := m[0].Ack(); err != nil {
                    fmt.Printf("ack error: %+v\n", err)
                }
            }
        }
    }
}
```

Push‑подписчику потребуется похожая настройка. Ему потребуется subject `ACK`. Однако вместо экспорта/импорта subject `NEXT` нужно использовать subject доставки, показанный для source/mirror.

# См. также

[JetStream Leaf Nodes demo](https://github.com/nats-io/jetstream-leaf-nodes-demo) и его [видео‑запись](https://www.youtube.com/watch?v=0MkS_S7lyHk).
