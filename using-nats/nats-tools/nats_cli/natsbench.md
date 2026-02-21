# nats bench

NATS быстрый и легковесный, с приоритетом на производительность. CLI‑инструмент `nats` можно использовать, среди прочего, для запуска бенчмарков и измерения производительности вашей инфраструктуры NATS. В этом руководстве вы узнаете, как бенчмаркать и настраивать NATS в ваших системах и среде.

Примечание: числа ниже — лишь примеры и получены на MacBook Pro M4 (ноябрь 2024) с `nats-server` версии 2.12.1:
```
 Model Name:	MacBook Pro
  Model Identifier:	Mac16,1
  Model Number:	MW2U3LL/A
  Chip:	Apple M4
  Total Number of Cores:	10 (4 performance and 6 efficiency)
  Memory:	16 GB
  System Firmware Version:	13822.1.2
  OS Loader Version:	13822.1.2
```

## Предварительные требования

* [Установить NATS CLI](./)
* [Установить NATS server](../../../running-a-nats-service/installation.md)

## Запуск NATS server с включенным мониторингом

```bash
nats-server -m 8222 -js
```

Убедитесь, что сервер NATS запустился успешно, а также запущен HTTP‑мониторинг:

```
[[2932] 2025/10/28 12:29:02.879297 [INF] Starting nats-server
[2932] 2025/10/28 12:29:02.879658 [INF]   Version:  2.12.1
[2932] 2025/10/28 12:29:02.879661 [INF]   Git:      [fab5f99]
[2932] 2025/10/28 12:29:02.879664 [INF]   Name:     NBIYCV5UNYPP2ZBZJZNGQ7UJNJILSQZCD6MK2CPWU6UY7PHYPKWOYYS4
[2932] 2025/10/28 12:29:02.879667 [INF]   Node:     YNleYaHo
[2932] 2025/10/28 12:29:02.879668 [INF]   ID:       NBIYCV5UNYPP2ZBZJZNGQ7UJNJILSQZCD6MK2CPWU6UY7PHYPKWOYYS4
[2932] 2025/10/28 12:29:02.880586 [INF] Starting http monitor on 0.0.0.0:8222
[2932] 2025/10/28 12:29:02.880696 [INF] Starting JetStream
[2932] 2025/10/28 12:29:02.880755 [WRN] Temporary storage directory used, data could be lost on system reboot
[2932] 2025/10/28 12:29:02.881014 [INF]     _ ___ _____ ___ _____ ___ ___   _   __  __
[2932] 2025/10/28 12:29:02.881018 [INF]  _ | | __|_   _/ __|_   _| _ \ __| /_\ |  \/  |
[2932] 2025/10/28 12:29:02.881019 [INF] | || | _|  | | \__ \ | | |   / _| / _ \| |\/| |
[2932] 2025/10/28 12:29:02.881020 [INF]  \__/|___| |_| |___/ |_| |_|_\___/_/ \_\_|  |_|
[2932] 2025/10/28 12:29:02.881020 [INF] 
[2932] 2025/10/28 12:29:02.881021 [INF]          https://docs.nats.io/jetstream
[2932] 2025/10/28 12:29:02.881022 [INF] 
[2932] 2025/10/28 12:29:02.881022 [INF] ---------------- JETSTREAM ----------------
[2932] 2025/10/28 12:29:02.881023 [INF]   Strict:          true
[2932] 2025/10/28 12:29:02.881026 [INF]   Max Memory:      12.00 GB
[2932] 2025/10/28 12:29:02.881027 [INF]   Max Storage:     233.86 GB
[2932] 2025/10/28 12:29:02.881027 [INF]   Store Directory: "/var/folders/cx/x13pjm0n3ds6w4q_4xhr_c0r0000gn/T/nats/jetstream"
[2932] 2025/10/28 12:29:02.881029 [INF]   API Level:       2
[2932] 2025/10/28 12:29:02.881030 [INF] -------------------------------------------
[2932] 2025/10/28 12:29:02.881335 [INF] Listening for client connections on 0.0.0.0:4222
[2932] 2025/10/28 12:29:02.881434 [INF] Server is ready
```

## Тест пропускной способности публикации

Давайте сначала посмотрим, насколько быстро один publisher может опубликовать один миллион сообщений по 16 байт на сервер NATS. Здесь должны получиться очень высокие числа, так как на subject нет подписчика.

```bash
nats bench pub foo --size 16 --msgs 1000000
```

Вывод показывает количество сообщений и количество байт payload, которые клиент смог опубликовать в секунду:

```
12:45:18 Starting Core NATS publisher benchmark [clients=1, msg-size=16 B, msgs=1,000,000, multi-subject=false, multi-subject-max=100,000, sleep=0s, subject=foo]
12:45:18 [1] Starting Core NATS publisher, publishing 1,000,000 messages
Finished      0s [================================================================] 100%

NATS Core NATS publisher stats: 14,786,683 msgs/sec ~ 226 MiB/sec ~ 0.07us
```

## Тест пропускной способности publish/subscribe

Хотя измерение выше интересно, это чисто академическая метрика: обычно у вас будет один или несколько подписчиков на публикуемые сообщения.

Посмотрим на throughput для одного издателя и одного подписчика. Для этого нужно запустить два экземпляра `nats bench` одновременно (например, в двух окнах терминала): один для подписки, другой для публикации.

Сначала запустите подписчика (он начнет измерение после получения первого сообщения от издателя):
```bash
nats bench sub foo --size 16 --msgs 1000000
```

Затем запустите издателя:
```bash
nats bench pub foo --size 16 --msgs 1000000
```

Вывод издателя:
```
13:15:53 Starting Core NATS publisher benchmark [clients=1, msg-size=16 B, msgs=1,000,000, multi-subject=false, multi-subject-max=100,000, sleep=0s, subject=foo]
13:15:53 [1] Starting Core NATS publisher, publishing 1,000,000 messages
Finished      0s [================================================================] 100%

NATS Core NATS publisher stats: 4,925,767 msgs/sec ~ 75 MiB/sec ~ 0.20us
```

Вывод подписчика:
```
13:15:50 Starting Core NATS subscriber benchmark [clients=1, msg-size=16 B, msgs=1,000,000, multi-subject=false, subject=foo]
13:15:50 [1] Starting Core NATS subscriber, expecting 1,000,000 messages
Finished      0s [============================================================] 100%

NATS Core NATS subscriber stats: 4,928,153 msgs/sec ~ 75 MiB/sec ~ 0.20us
```

Можно увеличить размер сообщений, используя `--size`, например:

Издатель:
```bash
nats bench pub foo --size 16kb
```
```
13:20:18 Starting Core NATS publisher benchmark [clients=1, msg-size=16 KiB, msgs=100,000, multi-subject=false, multi-subject-max=100,000, sleep=0s, subject=foo]
13:20:18 [1] Starting Core NATS publisher, publishing 100,000 messages
Finished      0s [================================================================] 100%

NATS Core NATS publisher stats: 230,800 msgs/sec ~ 3.5 GiB/sec ~ 4.33us
```

Подписчик:
```bash
nats bench sub foo --size 16kb
```
```
13:20:15 Starting Core NATS subscriber benchmark [clients=1, msg-size=16 KiB, msgs=100,000, multi-subject=false, subject=foo]
13:20:15 [1] Starting Core NATS subscriber, expecting 100,000 messages
Finished      0s [============================================================] 100%

NATS Core NATS subscriber stats: 226,091 msgs/sec ~ 3.4 GiB/sec ~ 4.42us
```

Как и ожидалось, хотя число сообщений в секунду уменьшается при больших сообщениях, общая пропускная способность, напротив, существенно растет.

## Тест 1:N

Можно измерить производительность при fan‑out, когда несколько подписчиков получают копию сообщения. Для этого используйте флаг `--client`: каждый client — это goroutine, которая делает собственное соединение с сервером и подписывается на subject.

При указании нескольких клиентов `nats bench` также выводит агрегированную статистику.

Например, для fan‑out 4:
```bash
nats bench sub foo --clients 4
```
и
```bash
nats bench pub foo
```

Вывод издателя:

```
13:34:26 Starting Core NATS publisher benchmark [clients=1, msg-size=128 B, msgs=100,000, multi-subject=false, multi-subject-max=100,000, sleep=0s, subject=foo]
13:34:26 [1] Starting Core NATS publisher, publishing 100,000 messages
Finished      0s [================================================================] 100%

NATS Core NATS publisher stats: 1,012,200 msgs/sec ~ 124 MiB/sec ~ 0.99us
```

Вывод подписчиков:
```
13:34:24 Starting Core NATS subscriber benchmark [clients=4, msg-size=128 B, msgs=100,000, multi-subject=false, subject=foo]
13:34:24 [1] Starting Core NATS subscriber, expecting 100,000 messages
13:34:24 [2] Starting Core NATS subscriber, expecting 100,000 messages
13:34:24 [3] Starting Core NATS subscriber, expecting 100,000 messages
13:34:24 [4] Starting Core NATS subscriber, expecting 100,000 messages
Finished      0s [============================================================] 100%
Finished      0s [============================================================] 100%
Finished      0s [============================================================] 100%
Finished      0s [============================================================] 100%

  [1] 1,013,938 msgs/sec ~ 124 MiB/sec ~ 0.99us (100,000 msgs)
  [2] 1,014,120 msgs/sec ~ 124 MiB/sec ~ 0.99us (100,000 msgs)
  [3] 1,007,242 msgs/sec ~ 123 MiB/sec ~ 0.99us (100,000 msgs)
  [4] 1,004,311 msgs/sec ~ 123 MiB/sec ~ 1.00us (100,000 msgs)

 NATS Core NATS subscriber aggregated stats: 4,015,923 msgs/sec ~ 490 MiB/sec
 message rates min 1,004,311 | avg 1,009,902 | max 1,014,120 | stddev 4,254 msgs
 avg latencies min 0.99us | avg 0.99us | max 1.00us | stddev 0.00us
```

## Тест N:M

Когда указано более одного издателя, `nats bench` равномерно распределяет общее число сообщений (`--msgs`) между издателями (`--clients`).

Увеличим число издателей и число сообщений, чтобы бенчмарк длился чуть дольше:

Подписчик:
```bash
nats bench sub foo --clients 4 --msgs 1000000
```

Издатель:
```bash
nats bench pub foo --clients 4 --msgs 1000000
```

Вывод издателя:
```
13:40:24 Starting Core NATS publisher benchmark [clients=4, msg-size=128 B, msgs=1,000,000, multi-subject=false, multi-subject-max=100,000, sleep=0s, subject=foo]
13:40:24 [1] Starting Core NATS publisher, publishing 250,000 messages
13:40:24 [2] Starting Core NATS publisher, publishing 250,000 messages
13:40:24 [3] Starting Core NATS publisher, publishing 250,000 messages
13:40:24 [4] Starting Core NATS publisher, publishing 250,000 messages
Finished      0s [================================================================] 100%
Finished      0s [================================================================] 100%
Finished      0s [================================================================] 100%
Finished      0s [================================================================] 100%

  [1] 272,785 msgs/sec ~ 33 MiB/sec ~ 3.67us (250,000 msgs)
  [2] 271,251 msgs/sec ~ 33 MiB/sec ~ 3.69us (250,000 msgs)
  [3] 270,340 msgs/sec ~ 33 MiB/sec ~ 3.70us (250,000 msgs)
  [4] 270,040 msgs/sec ~ 33 MiB/sec ~ 3.70us (250,000 msgs)

 NATS Core NATS publisher aggregated stats: 1,080,144 msgs/sec ~ 132 MiB/sec
 message rates min 270,040 | avg 271,104 | max 272,785 | stddev 1,068 msgs
 avg latencies min 3.67us | avg 3.69us | max 3.70us | stddev 0.01us
```

Вывод подписчика:
```
13:40:18 Starting Core NATS subscriber benchmark [clients=4, msg-size=128 B, msgs=1,000,000, multi-subject=false, subject=foo]
13:40:18 [1] Starting Core NATS subscriber, expecting 1,000,000 messages
13:40:18 [2] Starting Core NATS subscriber, expecting 1,000,000 messages
13:40:18 [3] Starting Core NATS subscriber, expecting 1,000,000 messages
13:40:18 [4] Starting Core NATS subscriber, expecting 1,000,000 messages
Finished      0s [============================================================] 100%
Finished      0s [============================================================] 100%
Finished      0s [============================================================] 100%
Finished      0s [============================================================] 100%

  [1] 1,080,830 msgs/sec ~ 132 MiB/sec ~ 0.93us (1,000,000 msgs)
  [2] 1,080,869 msgs/sec ~ 132 MiB/sec ~ 0.93us (1,000,000 msgs)
  [3] 1,080,849 msgs/sec ~ 132 MiB/sec ~ 0.93us (1,000,000 msgs)
  [4] 1,080,821 msgs/sec ~ 132 MiB/sec ~ 0.93us (1,000,000 msgs)

 NATS Core NATS subscriber aggregated stats: 4,323,201 msgs/sec ~ 528 MiB/sec
 message rates min 1,080,821 | avg 1,080,842 | max 1,080,869 | stddev 18 msgs
 avg latencies min 0.93us | avg 0.93us | max 0.93us | stddev 0.00us
```

## Тест задержки request‑reply

Можно также протестировать производительность request/reply, используя `nats bench service`.

В одном shell запустите `nats bench` как сервер и оставьте его работать:
```bash
nats bench service serve foo
```

В другом shell отправьте несколько запросов (каждый запрос отправляется синхронно, один за другим):
```bash
nats bench service request foo
```

```
13:46:43 Starting Core NATS service requester benchmark [clients=1, msg-size=128 B, msgs=100,000, sleep=0s, subject=foo]
13:46:43 [1] Starting Core NATS service requester, requesting 100,000 messages
Finished      5s [================================================================] 100%

NATS Core NATS service requester stats: 19,659 msgs/sec ~ 2.4 MiB/sec ~ 50.87us
```

В этом случае средняя задержка request‑reply между двумя процессами `nats bench` по NATS составила 50.87 микросекунд. Однако, поскольку запросы выполняются синхронно, throughput таким образом не измерить. Нужно создать большую нагрузку, запустив более одного клиента, делающего синхронные запросы параллельно, а также запустив более одной инстанции сервиса (как в продакшене), чтобы запросы балансировались между инстансами через queue group.

Запустите сервисы и оставьте их работать:
```bash
nats bench service serve foo --size 16 --clients 2
```

Клиенты, делающие запросы (так как мы используем много клиентов для нагрузки, прогресс‑бар не показываем):
```bash
nats bench service request foo --size 16 --clients 50 --no-progress
```
```
13:57:56 Starting Core NATS service requester benchmark [clients=50, msg-size=16 B, msgs=100,000, sleep=0s, subject=foo]
13:57:56 [1] Starting Core NATS service requester, requesting 2,000 messages
13:57:56 [2] Starting Core NATS service requester, requesting 2,000 messages
...
13:57:56 [49] Starting Core NATS service requester, requesting 2,000 messages
13:57:56 [50] Starting Core NATS service requester, requesting 2,000 messages

  [1] 2,735 msgs/sec ~ 43 KiB/sec ~ 365.62us (2,000 msgs)
  [2] 2,700 msgs/sec ~ 42 KiB/sec ~ 370.24us (2,000 msgs)
  ...
  [49] 2,651 msgs/sec ~ 41 KiB/sec ~ 377.14us (2,000 msgs)
  [50] 2,649 msgs/sec ~ 41 KiB/sec ~ 377.48us (2,000 msgs)

 NATS Core NATS service requester aggregated stats: 132,438 msgs/sec ~ 2.0 MiB/sec
 message rates min 2,649 | avg 2,673 | max 2,735 | stddev 17 msgs
 avg latencies min 365.62us | avg 373.93us | max 377.48us | stddev 2.43us
```

## Бенчмарки JetStream

Производительность JetStream можно измерять командами `nats bench js`.

### Измерение производительности публикаций JetStream

Можно измерять производительность публикации (сохранения) сообщений в поток через `nats bench js pub`, доступно 3 опции:
- `nats bench js pub sync` публикует сообщения синхронно одно за другим (подходит для измерения задержки, но не throughput).
- `nats bench js pub async` публикует батч сообщений асинхронно, ждет подтверждения всех публикаций и переходит к следующему батчу (хороший способ измерить throughput).
- `nats bench js pub batch` использует атомарную batch‑публикацию (пока батчинг реализован только для атомарности, но может улучшать throughput, особенно для маленьких сообщений).
-

`nats bench js pub` по умолчанию использует поток `benchstream`, а `--create` автоматически создает поток, если его еще нет. Можно также использовать `--purge` для предварительной очистки потока. Вы можете задавать атрибуты потока, например `--replicas 3` или `--storage memory`, или работать с любым существующим потоком через `--stream`.

Например, измерим задержку публикации в память:
```bash
nats bench js pub sync jsfoo --size 16 --create --storage memory
```
```
18:47:47 Starting JetStream synchronous publisher benchmark [batch=0, clients=1, dedup-window=2m0s, deduplication=false, max-bytes=1,073,741,824, msg-size=16 B, msgs=100,000, multi-subject=false, multi-subject-max=100,000, purge=false, replicas=1, sleep=0s, storage=memory, stream=benchstream, subject=jsfoo]
18:47:47 Using stream: benchstream
18:47:47 [1] Starting JetStream synchronous publisher, publishing 100,000 messages
Publishing    2s [================================================================] 100%

NATS JetStream synchronous publisher stats: 35,734 msgs/sec ~ 558 KiB/sec ~ 27.98us
```

Проверим throughput с batch‑публикацией:
```bash
nats bench js pub batch jsfoo --size 16 --batch 1000 --purge --storage memory
```
```
18:51:27 Starting JetStream batched publisher benchmark [batch=1,000, clients=1, msg-size=16 B, msgs=100,000, multi-subject=false, multi-subject-max=100,000, purge=true, sleep=0s, stream=benchstream, subject=jsfoo]
18:51:27 Using stream: benchstream
18:51:27 Purging the stream
18:51:27 [1] Starting JetStream batched publisher, publishing 100,000 messages
Finished      0s [================================================================] 100%

NATS JetStream batched publisher stats: 627,430 msgs/sec ~ 9.6 MiB/sec ~ 1.59us
```

Удалите поток и протестируйте файловое хранилище (по умолчанию):
```bash
nats stream rm -f benchstream
nats bench js pub async jsfoo --create
```
```
13:09:34 Starting JetStream asynchronous publisher benchmark [batch=500, clients=1, dedup-window=2m0s, deduplication=false, max-bytes=1,073,741,824, msg-size=128 B, msgs=100,000, multi-subject=false, multi-subject-max=100,000, purge=false, replicas=1, sleep=0s, storage=file, stream=benchstream, subject=jsfoo]
13:09:34 Using stream: benchstream
13:09:34 [1] Starting JetStream asynchronous publisher, publishing 100,000 messages
Finished      0s [================================================================] 100%

NATS JetStream asynchronous publisher stats: 403,828 msgs/sec ~ 49 MiB/sec ~ 2.48us
```

Можно даже измерить производительность публикации в поток с `--replicas 1` и асинхронной персистентностью через `--persistasync`, что дает throughput близкий к memory storage. По умолчанию JetStream синхронно flush‑ит записи на диск, поэтому даже если `nats-server` внезапно завершится, сообщения не потеряются — ОС уже держит их в буфере и сбросит на диск (можно настроить не только flush, но и sync после каждой записи, тогда сообщения не потеряются даже при падении хоста, но это увеличит latency).

### Измерение производительности потребления (replay) JetStream

После сохранения сообщений в поток можно измерить производительность воспроизведения несколькими способами:
- `nats bench js ordered` использует ordered *ephemeral* consumer для получения сообщений (каждый client получает свою копию сообщений).
- `nats bench js consume` использует функцию `Consume()` (callback) на *durable* consumer для получения сообщений.
- `nats bench js fetch` использует функцию `Fetch()` на *durable* consumer для получения сообщений батчами.
- `nats bench js get` получает сообщения напрямую по номеру последовательности (синхронно по одному или через «batched gets») *без использования consumer*.

Начнем с ordered consumer:
```bash
nats bench js ordered
```
```
13:33:48 Starting JetStream ordered ephemeral consumer benchmark [clients=1, msg-size=128 B, msgs=100,000, purge=false, sleep=0s, stream=benchstream]
13:33:48 [1] Starting JetStream ordered ephemeral consumer, expecting 100,000 messages
Finished      0s [================================================================] 100%

NATS JetStream ordered ephemeral consumer stats: 1,201,540 msgs/sec ~ 147 MiB/sec ~ 0.83us
```

Далее используем consume, чтобы распределить потребление сообщений между несколькими клиентами через durable consumer с явными подтверждениями:
```bash
nats bench js consume --clients 4 --no-progress
```
```
13:46:04 Starting JetStream durable consumer (callback) benchmark [acks=explicit, batch=500, clients=4, consumer=nats-bench, double-acked=false, msg-size=128 B, msgs=100,000, purge=false, sleep=0s, stream=benchstream]
13:46:04 [1] Starting JetStream durable consumer (callback), expecting 25,000 messages
13:46:04 [2] Starting JetStream durable consumer (callback), expecting 25,000 messages
13:46:04 [3] Starting JetStream durable consumer (callback), expecting 25,000 messages
13:46:04 [4] Starting JetStream durable consumer (callback), expecting 25,000 messages

  [1] 73,230 msgs/sec ~ 8.9 MiB/sec ~ 13.66us (25,000 msgs)
  [2] 72,921 msgs/sec ~ 8.9 MiB/sec ~ 13.71us (25,000 msgs)
  [3] 72,696 msgs/sec ~ 8.9 MiB/sec ~ 13.76us (25,000 msgs)
  [4] 72,687 msgs/sec ~ 8.9 MiB/sec ~ 13.76us (25,000 msgs)

 NATS JetStream durable consumer (callback) aggregated stats: 290,438 msgs/sec ~ 36 MiB/sec
 message rates min 72,687 | avg 72,883 | max 73,230 | stddev 220 msgs
 avg latencies min 13.66us | avg 13.72us | max 13.76us | stddev 0.04us
```

Используем fetch с двумя клиентами для получения батчей по 400 сообщений через durable consumer и без явных подтверждений:
```bash
nats bench js fetch --acks none --clients 2
```

```
14:09:10 Starting JetStream durable consumer (fetch) benchmark [acks=none, batch=500, clients=2, consumer=nats-bench, double-acked=false, msg-size=128 B, msgs=100,000, purge=false, sleep=0s, stream=benchstream]
14:09:10 [1] Starting JetStream durable consumer (fetch), expecting 50,000 messages
14:09:10 [2] Starting JetStream durable consumer (fetch), expecting 50,000 messages
Finished      0s [================================================================] 100%
Finished      0s [================================================================] 100%

  [1] 567,330 msgs/sec ~ 69 MiB/sec ~ 1.76us (50,000 msgs)
  [2] 567,067 msgs/sec ~ 69 MiB/sec ~ 1.76us (50,000 msgs)

 NATS JetStream durable consumer (fetch) aggregated stats: 1,128,932 msgs/sec ~ 138 MiB/sec
 message rates min 567,067 | avg 567,198 | max 567,330 | stddev 131 msgs
 avg latencies min 1.76us | avg 1.76us | max 1.76us | stddev 0.00us
```

Измерение задержки direct synchronous gets:
```bash
nats bench js get sync
```
```
14:13:30 Starting JetStream synchronous getter benchmark [clients=1, msg-size=128 B, msgs=100,000, sleep=0s, stream=benchstream]
14:13:30 [1] Starting JetStream synchronous getter, expecting 100,000 messages
Finished      3s [================================================================] 100%

NATS JetStream synchronous getter stats: 33,244 msgs/sec ~ 4.1 MiB/sec ~ 30.08us
```

И наконец измерим throughput с batched gets при fan‑out 2:
```bash
nats bench js get batch --clients 2
```
```
14:11:09 Starting JetStream batched direct getter benchmark [batch=500, clients=2, filter=>, msg-size=128 B, msgs=100,000, sleep=0s, stream=benchstream]
14:11:09 [1] Starting JetStream batched direct getter, expecting 100,000 messages
14:11:09 [2] Starting JetStream batched direct getter, expecting 100,000 messages
Finished      0s [================================================================] 100%
Finished      0s [================================================================] 100%

  [1] 509,387 msgs/sec ~ 62 MiB/sec ~ 1.96us (100,000 msgs)
  [2] 500,449 msgs/sec ~ 61 MiB/sec ~ 2.00us (100,000 msgs)

 NATS JetStream batched direct getter aggregated stats: 1,000,898 msgs/sec ~ 122 MiB/sec
 message rates min 500,449 | avg 504,918 | max 509,387 | stddev 4,469 msgs
 avg latencies min 1.96us | avg 1.98us | max 2.00us | stddev 0.02us
```

### Измерение публикации и потребления одновременно

Хотя измерения публикации и потребления по отдельности дают интересные метрики, в реальной работе consumers чаще всего онлайн и потребляют сообщения, пока они публикуются в поток.

Сначала очистите поток и запустите `nats bench` для потребления, например ordered consumer с 8 клиентами (fan‑out 8):
```bash
nats bench js ordered --purge --clients 8 --no-progress
```

Затем начните публиковать в поток, например 8 клиентов с асинхронной публикацией:
```bash
nats bench js pub async jsfoo --clients 8 --no-progress
```
```
15:23:08 Starting JetStream asynchronous publisher benchmark [batch=500, clients=8, msg-size=128 B, msgs=100,000, multi-subject=false, multi-subject-max=100,000, purge=false, sleep=0s, stream=benchstream, subject=jsfoo]
15:23:08 Using stream: benchstream
15:23:08 [1] Starting JetStream asynchronous publisher, publishing 12,500 messages
15:23:08 [2] Starting JetStream asynchronous publisher, publishing 12,500 messages
...
15:23:08 [7] Starting JetStream asynchronous publisher, publishing 12,500 messages
15:23:08 [8] Starting JetStream asynchronous publisher, publishing 12,500 messages

  [1] 33,289 msgs/sec ~ 4.1 MiB/sec ~ 30.04us (12,500 msgs)
  [2] 33,242 msgs/sec ~ 4.1 MiB/sec ~ 30.08us (12,500 msgs)
  ...
  [7] 31,947 msgs/sec ~ 3.9 MiB/sec ~ 31.30us (12,500 msgs)
  [8] 31,586 msgs/sec ~ 3.9 MiB/sec ~ 31.66us (12,500 msgs)

 NATS JetStream asynchronous publisher aggregated stats: 252,544 msgs/sec ~ 31 MiB/sec
 message rates min 31,586 | avg 32,614 | max 33,289 | stddev 638 msgs
 avg latencies min 30.04us | avg 30.67us | max 31.66us | stddev 0.60us 
```

Вывод consumer:
```
15:23:02 Starting JetStream ordered ephemeral consumer benchmark [clients=8, msg-size=128 B, msgs=100,000, purge=true, sleep=0s, stream=benchstream]
15:23:02 [1] Starting JetStream ordered ephemeral consumer, expecting 100,000 messages
15:23:02 [2] Starting JetStream ordered ephemeral consumer, expecting 100,000 messages
...
15:23:02 [7] Starting JetStream ordered ephemeral consumer, expecting 100,000 messages
15:23:02 [8] Starting JetStream ordered ephemeral consumer, expecting 100,000 messages

  [1] 111,627 msgs/sec ~ 14 MiB/sec ~ 8.96us (100,000 msgs)
  [2] 110,534 msgs/sec ~ 14 MiB/sec ~ 9.05us (100,000 msgs)
  ...
  [7] 109,849 msgs/sec ~ 13 MiB/sec ~ 9.10us (100,000 msgs)
  [8] 109,797 msgs/sec ~ 13 MiB/sec ~ 9.11us (100,000 msgs)

 NATS JetStream ordered ephemeral consumer aggregated stats: 878,326 msgs/sec ~ 107 MiB/sec
 message rates min 109,797 | avg 110,306 | max 111,627 | stddev 556 msgs
 avg latencies min 8.96us | avg 9.07us | max 9.11us | stddev 0.05us
```

### Измерение производительности KV

`nats bench kv` можно использовать для измерения производительности Key Value через синхронные операции put и get.

Сначала положим данные в KV:
```bash
nats bench kv put
```
```
14:26:04 Starting JetStream KV putter benchmark [bucket=benchbucket, clients=1, msg-size=128 B, msgs=100,000, purge=false, sleep=0s]
14:26:04 [1] Starting JetStream KV putter, publishing 100,000 messages
Putting       3s [================================================================] 100%

NATS JetStream KV putter stats: 30,067 msgs/sec ~ 3.7 MiB/sec ~ 33.26us
```

Затем имитируем множество клиентов, делающих get по случайным ключам:
```bash
nats bench kv get --clients 16 --randomize 100000 --no-progress
```
```
14:28:33 Starting JetStream KV getter benchmark [bucket=benchbucket, clients=16, msg-size=128 B, msgs=100,000, randomize=100,000, sleep=0s]
14:28:33 [1] Starting JetStream KV getter, trying to get 6,250 messages
14:28:33 [1] Starting JetStream KV getter, trying to get 6,250 messages
14:28:33 [2] Starting JetStream KV getter, trying to get 6,250 messages
...
14:28:33 [15] Starting JetStream KV getter, trying to get 6,250 messages
14:28:33 [16] Starting JetStream KV getter, trying to get 6,250 messages

  [1] 6,568 msgs/sec ~ 821 KiB/sec ~ 152.23us (6,250 msgs)
  [2] 6,579 msgs/sec ~ 822 KiB/sec ~ 151.98us (6,250 msgs)
  ...
  [15] 6,474 msgs/sec ~ 809 KiB/sec ~ 154.45us (6,250 msgs)
  [16] 6,451 msgs/sec ~ 806 KiB/sec ~ 155.01us (6,250 msgs)

 NATS JetStream KV getter aggregated stats: 102,844 msgs/sec ~ 13 MiB/sec
 message rates min 6,448 | avg 6,509 | max 6,579 | stddev 40 msgs
 avg latencies min 151.98us | avg 153.61us | max 155.08us | stddev 0.96us
```

### Поиграйте с настройками

Не бойтесь тестировать разные варианты хранения и репликации JetStream (при условии, что у вас есть кластер JetStream‑серверов, если хотите выйти за пределы `--replicas 1`), а также количество клиентов‑издателей/подписчиков и размеры batch/сообщений.

Вы также можете использовать `nats bench` для генерации трафика с постоянной скоростью, применяя флаг `--sleep`, чтобы добавить задержку между публикацией каждого сообщения (или batch‑сообщений). Этот же флаг можно использовать, чтобы имитировать время обработки при потреблении сообщений.

Примечание: если вы меняете атрибуты потока между запусками, поток нужно удалить (например, `nats stream rm benchstream`).

### Не оставляйте следов: очищайте ресурсы после завершения

После бенчмарков потоков помните, что если вы сохранили много сообщений в потоке (что делается очень быстро), поток может занять заметные ресурсы на инфраструктуре nats-server (память и файлы), которые вы можете захотеть освободить.

Вы можете использовать флаг `--purge` команды `nats bench`, чтобы очищать поток перед бенчмарком, или очистить поток вручную через `nats stream purge benchstream`, либо полностью удалить его командой `nats stream rm benchstream`.
