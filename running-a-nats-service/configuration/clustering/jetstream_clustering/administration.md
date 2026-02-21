# Администрирование

Когда кластер JetStream работает, взаимодействие с CLI и с `nats` CLI такое же, как и раньше. Для примеров предположим, что у нас есть кластер из 5 серверов, n1‑n5, в кластере с именем C1.

## Уровень аккаунта

Внутри аккаунта есть операции и отчеты, показывающие, где размещаются данные пользователей, и позволяющие базовое взаимодействие с системой RAFT.

## Создание кластеризованных стримов

При добавлении стрима через `nats` CLI спрашивается число реплик. Если выбрать больше 1 (мы рекомендуем 1, 3 или 5), данные будут храниться на нескольких узлах кластера с использованием RAFT.

```shell
nats stream add ORDERS --replicas 3
```
Пример фрагмента вывода:
```text
....
Information for Stream ORDERS created 2021-02-05T12:07:34+01:00
....
Configuration:
....
             Replicas: 3

Cluster Information:

                 Name: C1
               Leader: n1-c1
              Replica: n4-c1, current, seen 0.07s ago
              Replica: n3-c1, current, seen 0.07s ago
```

Выше видно, что информация о кластере показывается во всех случаях, когда выводится информация о Stream, например после добавления или при `nats stream info`.

Здесь у нас стрим в кластере NATS `C1`, его текущий лидер — `n1-c1`, и у него два follower’а — `n4-c1` и `n3-c1`.

`current` означает, что followers актуальны и имеют все сообщения. Здесь оба peer’а были замечены совсем недавно.

Количество реплик можно редактировать после настройки.

### Просмотр размещения и статистики стримов

Пользователи могут получать общую статистику по стримам и видеть, где эти стримы размещены:

```shell
nats stream report
```
```text
Obtaining Stream stats
+----------+-----------+----------+--------+---------+------+---------+----------------------+
| Stream   | Consumers | Messages | Bytes  | Storage | Lost | Deleted | Cluster              |
+----------+-----------+----------+--------+---------+------+---------+----------------------+
| ORDERS   | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1*, n2-c1, n3-c1 |
| ORDERS_3 | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1*, n2-c1, n3-c1 |
| ORDERS_4 | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1*, n2-c1, n3-c1 |
| ORDERS_5 | 4         | 0        | 0 B    | File    | 0    | 0       | n1-c1, n2-c1, n3-c1* |
| ORDERS_2 | 4         | 1,385    | 13 MiB | File    | 0    | 1       | n1-c1, n2-c1, n3-c1* |
| ORDERS_0 | 4         | 1,561    | 14 MiB | File    | 0    | 0       | n1-c1, n2-c1*, n3-c1 |
+----------+-----------+----------+--------+---------+------+---------+----------------------+
```

#### Принудительная смена лидера Stream и Consumer

У каждой RAFT‑группы есть лидер, избираемый группой при необходимости. Обычно вмешиваться в этот процесс не нужно, но вы можете захотеть инициировать смену лидера в удобное время. Выборы лидера сопровождаются краткими прерываниями потока, поэтому если вы знаете, что будете работать с узлом позже, имеет смысл заранее снять с него лидерство.

Перемещение лидерства с узла не удаляет его из кластера и не препятствует тому, чтобы он снова стал лидером — это лишь инициированные выборы.

```shell
nats stream cluster step-down ORDERS
```
```text
14:32:17 Requesting leader step down of "n1-c1" in a 3 peer RAFT group
14:32:18 New leader elected "n4-c1"

Information for Stream ORDERS created 2021-02-05T12:07:34+01:00
...
Cluster Information:

                 Name: c1
               Leader: n4-c1
              Replica: n1-c1, current, seen 0.12s ago
              Replica: n3-c1, current, seen 0.12s ago
```

Аналогично для consumers: `nats consumer cluster step-down ORDERS NEW`.

## Уровень системы

Системные пользователи могут просматривать состояние Meta Group, но не отдельных Stream или Consumer.

### Просмотр состояния кластера

Есть высокоуровневый отчет по состоянию кластера:

```shell
nats server report jetstream --user admin --password s3cr3t!
```
```text
+--------------------------------------------------------------------------------------------------+
|                                        JetStream Summary                                         |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
| Server | Cluster | Streams | Consumers | Messages | Bytes  | Memory | File   | API Req | API Err |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
| n3-c2  | c2      | 0       | 0         | 0        | 0 B    | 0 B    | 0 B    | 1       | 0       |
| n3-c1  | c1      | 6       | 24        | 2,946    | 27 MiB | 0 B    | 27 MiB | 3       | 0       |
| n2-c2  | c2      | 0       | 0         | 0        | 0 B    | 0 B    | 0 B    | 3       | 0       |
| n1-c2  | c2      | 0       | 0         | 0        | 0 B    | 0 B    | 0 B    | 14      | 2       |
| n2-c1  | c1      | 6       | 24        | 2,946    | 27 MiB | 0 B    | 27 MiB | 15      | 0       |
| n1-c1* | c1      | 6       | 24        | 2,946    | 27 MiB | 0 B    | 27 MiB | 31      | 0       |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
|        |         | 18      | 72        | 8,838    | 80 MiB | 0 B    | 80 MiB | 67      | 2       |
+--------+---------+---------+-----------+----------+--------+--------+--------+---------+---------+
+---------------------------------------------------+
|            RAFT Meta Group Information            |
+-------+--------+---------+---------+--------+-----+
| Name  | Leader | Current | Offline | Active | Lag |
+-------+--------+---------+---------+--------+-----+
| n1-c1 | yes    | true    | false   | 0.00s  | 0   |
| n1-c2 |        | true    | false   | 0.05s  | 0   |
| n2-c1 |        | false   | true    | 9.00s  | 2   |
| n2-c2 |        | true    | false   | 0.05s  | 0   |
| n3-c1 |        | true    | false   | 0.05s  | 0   |
| n3-c2 |        | true    | false   | 0.05s  | 0   |
+-------+--------+---------+---------+--------+-----+
```

Это полный отчет по всему кластеру. Отчет можно ограничить конкретным аккаунтом через `--account`.

Здесь видно распределение стримов, сообщений, API‑вызовов и т. д. между 2 супер‑кластерами и обзор RAFT Meta Group.

В отчете Meta Group сервер `n2-c1` не является current и не наблюдался 9 секунд, он также отстает на 2 операции RAFT.

Этот отчет строится на сыром наборе данных, который можно получить с порта мониторинга по `/jsz`, или через NATS:

```shell
nats server req jetstream --user admin --password s3cr3t! --help
```
```text
usage: nats server request jetstream [<flags>] [<wait>]

Show JetStream details

Flags:
  -h, --help                    Show context-sensitive help (also try --help-long and --help-man).
      --version                 Show application version.
  -s, --server=NATS_URL         NATS server urls
      --user=NATS_USER          Username or Token
      --password=NATS_PASSWORD  Password
      --creds=NATS_CREDS        User credentials
      --nkey=NATS_NKEY          User NKEY
      --tlscert=NATS_CERT       TLS public certificate
      --tlskey=NATS_KEY         TLS private key
      --tlsca=NATS_CA           TLS certificate authority chain
      --timeout=NATS_TIMEOUT    Time to wait on responses from NATS
      --js-api-prefix=PREFIX    Subject prefix for access to JetStream API
      --js-event-prefix=PREFIX  Subject prefix for access to JetStream Advisories
      --js-domain=DOMAIN        JetStream domain to access
      --context=CONTEXT         Configuration context
      --trace                   Trace API interactions
      --limit=2048              Limit the responses to a certain amount of records
      --offset=0                Start at a certain record
      --name=NAME               Limit to servers matching a server name
      --host=HOST               Limit to servers matching a server host name
      --cluster=CLUSTER         Limit to servers matching a cluster name
      --tags=TAGS ...           Limit to servers with these configured tags
      --account=ACCOUNT         Show statistics scoped to a specific account
      --accounts                Include details about accounts
      --streams                 Include details about Streams
      --consumer                Include details about Consumers
      --config                  Include details about configuration
      --leader                  Request a response from the Meta-group leader only
      --all                     Include accounts, streams, consumers and configuration

Args:
  [<wait>]  Wait for a certain number of responses
```

```shell
nats server req jetstream --user admin --password s3cr3t! --leader
```

Это даст большой объем сырой информации о текущем состоянии кластера — здесь запрос только к лидеру.

#### Принудительная смена лидера Meta Group

Как и для Stream и Consumer выше, Meta Group допускает принудительный leader step‑down. Meta Group работает на уровне кластера и охватывает все аккаунты, поэтому для управления meta group нужно использовать пользователя `SYSTEM`.

```shell
nats server cluster step-down --user admin --password s3cr3t!
```
```text
17:44:24 Current leader: n2-c2
17:44:24 New leader: n1-c2
```

### Исключение peer из кластера

Обычно при остановке NATS, включая Lame Duck Mode, кластер замечает это и продолжает работать.

Однако может быть случай, когда вы знаете, что узел никогда не вернется, и хотите сообщить JetStream, что узел не вернется. `peer-remove` удалит этот узел из соответствующего Stream и всех его Consumers.

После удаления узла кластер заметит, что коэффициент репликации стрима больше не соблюдается, и немедленно выберет новый узел и начнет репликацию данных на него. Новый узел будет выбран по тем же правилам размещения, что и существующий стрим.

```shell
nats server cluster peer-remove n4-c1 --user admin --password s3cr3t!
```
```text
? Really remove offline peer n4-c1 (y/N)
```

{% hint style="danger" %}
Peer‑remove — разрушительная операция, уменьшающая размер кластера.
Сервер, который удаляется, в идеале должен уже быть офлайн. Операцию можно выполнить и для онлайн‑узлов, но в этом случае JetStream будет отключен на этих узлах. Сервер следует остановить и не перезапускать, либо если перезапускать — JetStream должен быть отключен.
Сервер не сможет вернуться под тем же `server_name`, если он был peer‑removed и его диск очищен. Это означает, что настроенный `server_name` нужно изменить на новый перед перезапуском.
{% endhint %}

В качестве альтернативы, если вы хотите оставить узел и лишь перенести стрим с конкретного узла, можно выполнить peer‑remove на уровне стрима.

```shell
nats stream cluster peer-remove ORDERS
```
```text
? Select a Peer n4-c1
14:38:50 Removing peer "n4-c1"
14:38:50 Requested removal of peer "n4-c1"
```

На этом этапе стрим и все consumers удалят `n4-c1` из группы. Будет выбран новый узел и данные будут реплицированы на него. В этом случае в качестве нового peer выбран `n2-c1`.

```shell
$ nats stream info ORDERS
```
```text
....
Cluster Information:

                 Name: c1
               Leader: n3-c1
              Replica: n1-c1, current, seen 0.02s ago
              Replica: n2-c1, outdated, seen 0.42s ago
```

Мы видим, что выбрана новая реплика, стрим вернулся к уровню репликации 3, и `n4-c1` больше не активен ни в этом Stream, ни в его Consumers.
