# Репликация данных

Репликация позволяет перемещать данные между streams либо в режиме 1:1 mirror, либо мультиплексируя несколько исходных streams в новый stream. В будущих версиях это позволит реплицировать данные и между аккаунтами — удобно, например, для отправки данных из leafnode в центральное хранилище.

![](../../../.gitbook/assets/replication.png)

Здесь у нас есть 2 основных stream — _ORDERS_ и _RETURNS_ — эти streams кластеризованы на 3 узла. У этих streams короткие периоды retention и хранение в памяти.

Мы создаем stream _ARCHIVE_ с двумя _sources_, _ARCHIVE_ будет подтягивать данные из источников. Этот stream имеет очень длительный период retention, файловое хранение и репликацию на 3 узла. Дополнительные сообщения можно добавлять в ARCHIVE, отправляя их напрямую.

Наконец, мы создаем stream _REPORT_, зеркалирующий _ARCHIVE_, который не кластеризован и хранит данные месяц. Stream _REPORT_ не слушает входящие сообщения — он может только потреблять данные из _ARCHIVE_.

## Зеркала

_Mirror_ копирует данные из одного другого stream; насколько возможно, IDs и порядок будут совпадать с источником. _Mirror_ не слушает subject для добавления данных. _Mirror_ может фильтровать по subject, также можно задать Start Sequence и Start Time. Stream может иметь только один _mirror_, и если он является mirror, то не может иметь _source_.

## Источники

_Source_ — это stream, из которого копируются данные. Один stream может иметь несколько sources и будет читать данные из всех. Stream также будет слушать сообщения на своем собственном subject. Поэтому абсолютный порядок не сохраняется: данные каждого отдельного source будут упорядочены корректно, но будут перемешаны с другими streams. Также возможно смешение более старых и более новых timestamps из разных streams.

Stream с sources может слушать subjects, но может и не иметь слушаемых subjects. При создании sourced‑stream через CLI `nats` используйте `--subjects`, чтобы задать subjects для прослушивания.

Source может иметь Start Time или Start Sequence и может фильтровать по subject.

## Конфигурация

Streams ORDERS и RETURNS — обычные, как создавать их, здесь не показываю.

```shell
nats s report
```
```text
Obtaining Stream stats

+---------+---------+-----------+----------+-------+------+---------+----------------------+
| Stream  | Storage | Consumers | Messages | Bytes | Lost | Deleted | Cluster              |
+---------+---------+-----------+----------+-------+------+---------+----------------------+
| ORDERS  | Memory  | 0         | 0        | 0 B   | 0    | 0       | n1-c2, n2-c2*, n3-c2 |
| RETURNS | Memory  | 0         | 0        | 0 B   | 0    | 0       | n1-c2*, n2-c2, n3-c2 |
+---------+---------+-----------+----------+-------+------+---------+----------------------+
```

Теперь добавим ARCHIVE:

```shell
nats s add ARCHIVE --source ORDERS --source RETURNS
```
```text
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Message size limit -1
? Maximum message age limit -1
? Maximum individual message size -1
? Duplicate tracking time window 2m0s
? Allow message Roll-ups No
? Allow message deletion Yes
? Allow purging subjects or the entire stream Yes
? Replicas 1
? Adjust source "ORDERS" start Yes
? ORDERS Source Start Sequence 0
? ORDERS Source UTC Time Stamp (YYYY:MM:DD HH:MM:SS)
? ORDERS Source Filter source by subject
? Import "ORDERS" from a different JetStream domain No
? Import "ORDERS" from a different account No
? Adjust source "RETURNS" start No
? Import "RETURNS" from a different JetStream domain No
? Import "RETURNS" from a different account No
Stream ARCHIVE was created

Information for Stream ARCHIVE created 2022-01-21T11:49:52-08:00

Configuration:

     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
    Allows Msg Delete: true
         Allows Purge: true
       Allows Rollups: false
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: unlimited
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited
              Sources: ORDERS
                       RETURNS


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

И добавим REPORT:

```shell
nats s add REPORT --mirror ARCHIVE
```
```text
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Message size limit -1
? Maximum message age limit -1
? Maximum individual message size -1
? Allow message Roll-ups No
? Allow message deletion Yes
? Allow purging subjects or the entire stream Yes
? Replicas 1
? Adjust mirror start No
? Import mirror from a different JetStream domain No
? Import mirror from a different account No
Stream REPORT was created

Information for Stream REPORT created 2022-01-21T11:50:55-08:00

Configuration:

     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
    Allows Msg Delete: true
         Allows Purge: true
       Allows Rollups: false
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: unlimited
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited
               Mirror: ARCHIVE


State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

После настройки мы увидим дополнительную информацию в выводе `nats stream info`:

```shell
nats stream info ARCHIVE
``` 
Фрагмент вывода
```text
...
Source Information:

          Stream Name: ORDERS
                  Lag: 0
            Last Seen: 2m23s

          Stream Name: RETURNS
                  Lag: 0
            Last Seen: 2m15s
...

$ nats stream info REPORT
...
Mirror Information:

          Stream Name: ARCHIVE
                  Lag: 0
            Last Seen: 2m35s
...
```

Здесь `Lag` — это насколько мы отставали, когда в последний раз видели сообщение.

Подтвердить всю настройку можно через `nats stream report`:

```shell
nats s report
```
```text
+--------------------------------------------------------------------------------------------------------+
|                                            Stream Report                                               |
+---------+---------+-------------+-----------+----------+-------+------+---------+----------------------+
| Stream  | Storage | Replication | Consumers | Messages | Bytes | Lost | Deleted | Cluster              |
+---------+---------+-------------+-----------+----------+-------+------+---------+----------------------+
| ARCHIVE | File    | Sourced     | 1         | 0        | 0 B   | 0    | 0       | n1-c2*, n2-c2, n3-c2 |
| ORDERS  | Memory  |             | 1         | 0        | 0 B   | 0    | 0       | n1-c2, n2-c2*, n3-c2 |
| REPORT  | File    | Mirror      | 0         | 0        | 0 B   | 0    | 0       | n1-c2*               |
| RETURNS | Memory  |             | 1         | 0        | 0 B   | 0    | 0       | n1-c2, n2-c2, n3-c2* |
+---------+---------+-------------+-----------+----------+-------+------+---------+----------------------+
