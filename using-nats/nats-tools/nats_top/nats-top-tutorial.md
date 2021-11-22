# Tutorial

You can use [nats-top](https://github.com/nats-io/nats-top) to monitor in realtime NATS server connections and message statistics.

## Prerequisites

* [Set up your Go environment](https://golang.org/doc/install)
* [Installed the NATS server](../../../running-a-nats-service/installation.md)

## 1. Install nats-top

```bash
go get github.com/nats-io/nats-top
```

You may need to run the following instead:

```bash
sudo -E go get github.com/nats-io/nats-top
```

## 2. Start the NATS server with monitoring enabled

```bash
nats-server -m 8222
```

## 3. Start nats-top

```bash
nats-top
```

Result:

```text
nats-server version 0.6.6 (uptime: 2m2s)
Server:
  Load: CPU:  0.0%  Memory: 6.3M  Slow Consumers: 0
  In:   Msgs: 0  Bytes: 0  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 0  Bytes: 0  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 0
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
```

## 4. Run NATS client programs

Run some NATS client programs and exchange messages.

For the best experience, you will want to run multiple subscribers, at least 2 or 3. Refer to the [example pub-sub clients](../../../running-a-nats-service/clients.md).

## 5. Check nats-top for statistics

```text
nats-server version 0.6.6 (uptime: 30m51s)
Server:
  Load: CPU:  0.0%  Memory: 10.3M  Slow Consumers: 0
  In:   Msgs: 56  Bytes: 302  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 98  Bytes: 512  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
  ::1:58651            6        1       0           52          0           260         0           go       1.1.0
  ::1:58922            38       1       0           21          0           105         0           go       1.1.0
  ::1:58953            39       1       0           21          0           105         0           go       1.1.0
```

## 6. Sort nats-top statistics

In nats-top, enter the command `o` followed by the option, such as `bytes_to`. You see that nats-top sorts the BYTES_TO column in ascending order.

```text
nats-server version 0.6.6 (uptime: 45m40s)
Server:
  Load: CPU:  0.0%  Memory: 10.4M  Slow Consumers: 0
  In:   Msgs: 81  Bytes: 427  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 154  Bytes: 792  Msgs/Sec: 0.0  Bytes/Sec: 0
sort by [bytes_to]:
Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
  ::1:59259            83       1       0           4           0           20          0           go       1.1.0
  ::1:59349            91       1       0           2           0           10          0           go       1.1.0
  ::1:59342            90       1       0           0           0           0           0           go       1.1.0
```

## 7. Use different sort options

Use some different sort options to explore nats-top, such as:

`cid`, `subs`, `pending`, `msgs_to`, `msgs_from`, `bytes_to`, `bytes_from`, `lang`, `version`

You can also set the sort option on the command line using the `-sort` flag. For example: `nats-top -sort bytes_to`.

## 8. Display the registered subscriptions.

In nats-top, enter the command `s` to toggle displaying connection subscriptions. When enabled, you see the subscription subject in nats-top table:

```text
nats-server version 0.6.6 (uptime: 1h2m23s)
Server:
  Load: CPU:  0.0%  Memory: 10.4M  Slow Consumers: 0
  In:   Msgs: 108  Bytes: 643  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 185  Bytes: 1.0K  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION SUBSCRIPTIONS
  ::1:59708            115      1       0           6           0           48          0           go       1.1.0   foo.bar
  ::1:59758            122      1       0           1           0           8           0           go       1.1.0   foo
  ::1:59817            124      1       0           0           0           0           0           go       1.1.0   foo
```

## 9. Quit nats-top

Use the `q` command to quit nats-top.

## 10. Restart nats-top with a specified query

For example, to query for the connection with largest number of subscriptions:

```bash
nats-top -n 1 -sort subs
```

Result: nats-top displays only the client connection with the largest number of subscriptions:

```text
nats-server version 0.6.6 (uptime: 1h7m0s)
Server:
  Load: CPU:  0.0%  Memory: 10.4M  Slow Consumers: 0
  In:   Msgs: 109  Bytes: 651  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 187  Bytes: 1.0K  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 3
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
  ::1:59708            115      1       0           6           0           48          0           go       1.1.0
```

