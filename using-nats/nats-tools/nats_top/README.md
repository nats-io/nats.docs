# nats-top

[nats-top](https://github.com/nats-io/nats-top) — инструмент в стиле [top](http://man7.org/linux/man-pages/man1/top.1.html) для мониторинга серверов nats-server.

{% hint style="info" %}
Функциональность `nats-top` теперь доступна в CLI‑инструменте [`nats`](../using-nats/nats-tools/nats\_cli/) через команду `nats top`.
{% endhint %}

nats-top предоставляет динамический просмотр состояния NATS сервера в реальном времени. Он может показывать различную сводную информацию о сервере NATS — количество подписок, ожидающие байты, число сообщений и другое — в реальном времени. Например:

```bash
nats-top
```
```text
nats-server version 0.6.4 (uptime: 31m42s)
Server:
  Load: CPU: 0.8%   Memory: 5.9M  Slow Consumers: 0
  In:   Msgs: 34.2K  Bytes: 3.0M  Msgs/Sec: 37.9  Bytes/Sec: 3389.7
  Out:  Msgs: 68.3K  Bytes: 6.0M  Msgs/Sec: 75.8  Bytes/Sec: 6779.4

Connections: 4
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION SUBSCRIPTIONS
  127.0.0.1:56134      2        5       0           11.6K       11.6K       1.1M        905.1K      go       1.1.0   foo, hello
  127.0.1.1:56138      3        1       0           34.2K       0           3.0M        0           go       1.1.0    _INBOX.a96f3f6853616154d23d1b5072
  127.0.0.1:56144      4        5       0           11.2K       11.1K       873.5K      1.1M        go       1.1.0   foo, hello
  127.0.0.1:56151      5        8       0           11.4K       11.5K       1014.6K     1.0M        go       1.1.0   foo, hello
```

## Установка

nats-top можно установить через `go install`. Например:

```bash
go install github.com/nats-io/nats-top
```

В новых версиях Go нужно использовать `go install github.com/nats-io/nats-top@latest`.

ПРИМЕЧАНИЕ: возможно, вам придется запускать команду от `sudo` в зависимости от вашей конфигурации. Если вы получаете ошибку, что нельзя установить nats-top из‑за неустановленного $GOPATH, хотя он задан, используйте `sudo -E go get github.com/nats-io/nats-top` для установки. Флаг `-E` указывает sudo сохранить текущие переменные окружения пользователя.

## Использование

После установки nats-top запускается командой `nats-top` с опциональными аргументами.

```bash
nats-top [-s server] [-m monitor] [-n num_connections] [-d delay_in_secs] [-sort by]
```

## Параметры

Опциональные аргументы включают:

| Option | Description |
| :--- | :--- |
| `-m monitor` | HTTP‑порт мониторинга nats-server. |
| `-n num_connections` | Ограничить число соединений, запрашиваемых у сервера (по умолчанию 1024). |
| `-d delay_in_secs` | Интервал обновления экрана (по умолчанию 1 секунда). |
| `-sort by` | Поле для сортировки соединений (см. ниже). |

## Команды

В режиме nats-top доступны следующие команды.

### option

Команда `o<option>` задает ключ сортировки по `<option>`. Возможные значения: `cid`, `subs`, `pending`, `msgs_to`, `msgs_from`, `bytes_to`, `bytes_from`, `lang`, `version`.

Сортировку также можно задать в командной строке через флаг `-sort`. Например: `nats-top -sort bytes_to`.

### limit

Команда `n<limit>` задает выборку количества соединений, запрашиваемых у сервера.

Это также можно указать в командной строке через `-n num_connections`. Например: `nats-top -n 1`.

Обратите внимание: если `n<limit>` используется вместе с `-sort`, сервер учитывает обе опции, позволяя делать запросы вида: выбрать соединение с наибольшим числом подписок: `nats-top -n 1 -sort subs`.

### Команды s, ? и q

Команда `s` переключает отображение подписок соединения.

Команда `?` показывает справку с опциями.

Команда `q` выходит из nats-top.

### Руководство

Пошаговое руководство по `nats-top` см. в [tutorial](nats-top-tutorial.md).
