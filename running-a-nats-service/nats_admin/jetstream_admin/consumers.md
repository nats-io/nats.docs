# Потребители

Сообщения читаются или потребляются из Stream через Consumers. Мы поддерживаем pull‑ и push‑based Consumers, и в примере есть оба — пройдемся по нему.

## Создание pull‑based Consumers

Consumers `NEW` и `DISPATCH` — pull‑based, то есть сервисы, потребляющие данные, должны запрашивать у системы следующее доступное сообщение. Это позволяет легко масштабировать сервисы, добавляя больше воркеров — сообщения будут распределяться между воркерами по их доступности.

Pull‑based Consumers создаются так же, как push‑based, просто не указывайте цель доставки.

```shell
nats con ls ORDERS
```
```text
No Consumers defined
```

Consumers нет, добавим `NEW`:

Я задаю опцию `--sample` в CLI, так как она сейчас не запрашивается интерактивно; все остальное запрашивается. Помощь в CLI объясняет каждый пункт:

```shell
nats con add --sample 100
```
```text
? Select a Stream ORDERS
? Consumer name NEW
? Delivery target
? Start policy (all, last, 1h, msg sequence) all
? Filter Stream by subject (blank for all) ORDERS.received
? Maximum Allowed Deliveries 20
Information for Consumer ORDERS > NEW

Configuration:

        Durable Name: NEW
           Pull Mode: true
             Subject: ORDERS.received
         Deliver All: true
        Deliver Last: false
          Ack Policy: explicit
            Ack Wait: 30s
       Replay Policy: instant
  Maximum Deliveries: 20
       Sampling Rate: 100

State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 1
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
        Pending Messages: 0
    Redelivered Messages: 0
```

Это pull‑based Consumer (пустой Delivery Target), он получает сообщения, начиная с первого доступного, и требует явного ack каждого сообщения.

Он получает только те сообщения, которые изначально попали в Stream по subject `ORDERS.received`. Помните, что Stream подписывается на `ORDERS.*`, это позволяет выбрать подмножество сообщений из Stream.

Задан лимит максимальных доставок 20 — если сообщение не подтверждено, оно будет повторяться, но не более этого общего числа доставок.

Все это можно сделать одной CLI‑командой — создадим `DISPATCH`:

```shell
nats con add ORDERS DISPATCH --filter ORDERS.processed --ack explicit --pull --deliver all --sample 100 --max-deliver 20
```

Также можно сохранить конфигурацию в JSON‑файле; формат такой же, как в `$ nats con info ORDERS DISPATCH -j | jq .config`:

```shell
nats con add ORDERS MONITOR --config monitor.json
```

## Создание push‑based Consumers

Consumer `MONITOR` — push‑based, без ack, получает только новые сообщения и не сэмплируется:

```shell
nats con add
```
```text
? Select a Stream ORDERS
? Consumer name MONITOR
? Delivery target monitor.ORDERS
? Start policy (all, last, 1h, msg sequence) last
? Acknowledgement policy none
? Replay policy instant
? Filter Stream by subject (blank for all)
? Maximum Allowed Deliveries -1
Information for Consumer ORDERS > MONITOR

Configuration:

      Durable Name: MONITOR
  Delivery Subject: monitor.ORDERS
       Deliver All: false
      Deliver Last: true
        Ack Policy: none
     Replay Policy: instant

State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 2
        Pending Messages: 0
    Redelivered Messages: 0
```

Опять же, можно сделать это одной неинтерактивной командой:

```shell
nats con add ORDERS MONITOR --ack none --target monitor.ORDERS --deliver last --replay instant --filter ''
```

Также можно сохранить конфигурацию в JSON‑файле; формат такой же, как в `$ nats con info ORDERS MONITOR -j | jq .config`:

```shell
nats con add ORDERS --config monitor.json
```

## Список

Можно быстро получить список всех Consumers для конкретного Stream:

```shell
nats con ls ORDERS
```
```text
Consumers for Stream ORDERS:

        DISPATCH
        MONITOR
        NEW
```

## Запрос информации

Все детали Consumer можно запросить, сначала посмотрим pull‑based Consumer:

```text
$ nats con info ORDERS DISPATCH
Information for Consumer ORDERS > DISPATCH

Configuration:

      Durable Name: DISPATCH
         Pull Mode: true
           Subject: ORDERS.processed
       Deliver All: true
      Deliver Last: false
        Ack Policy: explicit
          Ack Wait: 30s
     Replay Policy: instant
     Sampling Rate: 100

State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 1
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
        Pending Messages: 0
    Redelivered Messages: 0
```

Более подробно о разделе `State` будет позже, когда будем обсуждать модели ack.

### Номера последовательностей Stream и Consumer

Эти два номера напрямую не связаны: номер последовательности Stream — это указатель на конкретное сообщение, а номер последовательности Consumer — постоянно увеличивающийся счетчик действий потребителя.

Например, если в stream 1 сообщение, то stream sequence будет 1, но если consumer попытался доставить это сообщение 10 раз, consumer sequence будет 10 или 11.

## Потребление pull‑based Consumers

Pull‑based Consumers требуют явно запрашивать сообщения и отправлять ack; обычно это делается через `Request()` в клиентской библиотеке, но у `nats` есть удобная команда:

Сначала убедимся, что есть сообщения:

```shell
nats pub ORDERS.processed "order 1"
nats pub ORDERS.processed "order 2"
nats pub ORDERS.processed "order 3"
```

Теперь читаем их через `nats`:

```shell
nats con next ORDERS DISPATCH
```
```text
--- received on ORDERS.processed
order 1

Acknowledged message
```
Еще один:
```shell
nats con next ORDERS DISPATCH
```
```text
--- received on ORDERS.processed
order 2

Acknowledged message
```

ACK можно отключить, добавив `--no-ack`.

Чтобы сделать это из кода, нужно отправить `Request()` на `$JS.API.CONSUMER.MSG.NEXT.ORDERS.DISPATCH`:

```shell
nats req '$JS.API.CONSUMER.MSG.NEXT.ORDERS.DISPATCH' ''
```
```text
Published [$JS.API.CONSUMER.MSG.NEXT.ORDERS.DISPATCH] : ''
Received [ORDERS.processed] : 'order 3'
```

Здесь `nats req` не может отправить ack, но в коде вы бы ответили на полученное сообщение пустым payload как Ack для JetStream.

## Потребление push‑based Consumers

Push‑based Consumers публикуют сообщения на subject, и любой подписчик получит их. Они поддерживают разные модели ack, рассмотрим позже, но здесь для Consumer `MONITOR` ack нет.

```shell
nats con info ORDERS MONITOR
```
Фрагмент вывода
```text
...
  Delivery Subject: monitor.ORDERS
...
```

Consumer публикует на этот subject, поэтому слушаем его:

```shell
nats sub monitor.ORDERS
```
```text
Listening on [monitor.ORDERS]
[#3] Received on [ORDERS.processed]: 'order 3'
[#4] Received on [ORDERS.processed]: 'order 4'
```

Обратите внимание: subject полученного сообщения отображается как `ORDERS.processed` — это помогает понять, что именно вы видите в stream, покрывающем wildcard или несколько subjects.

Этому consumer не нужен ack, поэтому любые новые сообщения в системе ORDERS будут появляться здесь в реальном времени.
