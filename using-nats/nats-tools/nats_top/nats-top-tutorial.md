# Руководство

Вы можете использовать [nats-top](https://github.com/nats-io/nats-top) для мониторинга в реальном времени соединений и статистики сообщений NATS server.

## Предварительные требования

* [Настройте окружение Go](https://golang.org/doc/install)
* [Установите NATS server](../../../running-a-nats-service/installation.md)

## 1. Установите nats-top

```bash
go install github.com/nats-io/nats-top@latest
```

Возможно, потребуется выполнить:

```bash
sudo -E go install github.com/nats-io/nats-top
```

## 2. Запустите NATS server с включенным мониторингом

```bash
nats-server -m 8222
```

## 3. Запустите nats-top

```bash
nats-top
```

Результат:

```text
nats-server version 0.6.6 (uptime: 2m2s)
Server:
  Load: CPU:  0.0%  Memory: 6.3M  Slow Consumers: 0
  In:   Msgs: 0  Bytes: 0  Msgs/Sec: 0.0  Bytes/Sec: 0
  Out:  Msgs: 0  Bytes: 0  Msgs/Sec: 0.0  Bytes/Sec: 0

Connections: 0
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION
```

## 4. Запустите NATS‑клиентские программы

Запустите несколько NATS клиентских программ и обменяйтесь сообщениями.

Для лучшего опыта запустите несколько подписчиков, как минимум 2 или 3. См. [примеры pub‑sub клиентов](../../../running-a-nats-service/clients.md).

## 5. Проверьте статистику в nats-top

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

## 6. Сортировка статистики nats-top

В nats-top введите команду `o` и опцию, например `bytes_to`. Вы увидите, что nats-top сортирует колонку BYTES_TO по возрастанию.

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

## 7. Используйте разные варианты сортировки

Попробуйте разные опции сортировки, например:

`cid`, `subs`, `pending`, `msgs_to`, `msgs_from`, `bytes_to`, `bytes_from`, `lang`, `version`

Можно также задать опцию сортировки в командной строке через флаг `-sort`. Например: `nats-top -sort bytes_to`.

## 8. Отображение зарегистрированных подписок

В nats-top введите команду `s`, чтобы переключить отображение подписок соединений. Включив, вы увидите subject подписки в таблице nats-top:

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

## 9. Выход из nats-top

Используйте команду `q`, чтобы выйти из nats-top.

## 10. Перезапуск nats-top с заданным запросом

Например, чтобы запросить соединение с наибольшим числом подписок:

```bash
nats-top -n 1 -sort subs
```

Результат: nats-top отображает только клиентское соединение с наибольшим числом подписок:

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
