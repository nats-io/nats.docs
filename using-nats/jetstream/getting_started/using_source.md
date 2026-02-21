# Использование исходников

Одной из целей дизайна JetStream было быть «родным» для Core NATS, поэтому, хотя мы почти наверняка добавим синтаксический сахар в клиенты, чтобы сделать их более удобными, для этого tech preview мы будем использовать обычный NATS.

Вам понадобится локальная копия исходников nats-server и нужно находиться в ветке jetstream.

```shell
git clone https://github.com/nats-io/nats-server.git
cd nats-server
git checkout master
go build
ls -l nats-server
```

Запуская сервер, можно использовать флаг `-js`. Это настроит сервер на разумное использование памяти и диска. Ниже — пример запуска на моей машине. Сейчас JetStream по умолчанию использует 1 ТБ диска и 75% доступной памяти.

```shell
nats-server -js
```
```text
[16928] 2019/12/04 19:16:29.596968 [INF] Starting nats-server version 2.2.0
[16928] 2019/12/04 19:16:29.597056 [INF] Git commit [not set]
[16928] 2019/12/04 19:16:29.597072 [INF] Starting JetStream
[16928] 2019/12/04 19:16:29.597444 [INF] ----------- JETSTREAM (Beta) -----------
[16928] 2019/12/04 19:16:29.597451 [INF]   Max Memory:      96.00 GB
[16928] 2019/12/04 19:16:29.597454 [INF]   Max Storage:     1.00 TB
[16928] 2019/12/04 19:16:29.597461 [INF]   Store Directory: "/var/folders/m0/k03vs55n2b54kdg7jm66g27h0000gn/T/jetstream"
[16928] 2019/12/04 19:16:29.597469 [INF] ----------------------------------------
[16928] 2019/12/04 19:16:29.597732 [INF] Listening for client connections on 0.0.0.0:4222
[16928] 2019/12/04 19:16:29.597738 [INF] Server id is NAJ5GKP5OBVISP5MW3BFAD447LMTIOAHFEWMH2XYWLL5STVGN3MJHTXQ
[16928] 2019/12/04 19:16:29.597742 [INF] Server is ready
```

При необходимости можно переопределить каталог хранения.

```shell
nats-server -js -sd /tmp/test
```
```text
[16943] 2019/12/04 19:20:00.874148 [INF] Starting nats-server version 2.2.0
[16943] 2019/12/04 19:20:00.874247 [INF] Git commit [not set]
[16943] 2019/12/04 19:20:00.874273 [INF] Starting JetStream
[16943] 2019/12/04 19:20:00.874605 [INF] ----------- JETSTREAM (Beta) -----------
[16943] 2019/12/04 19:20:00.874613 [INF]   Max Memory:      96.00 GB
[16943] 2019/12/04 19:20:00.874615 [INF]   Max Storage:     1.00 TB
[16943] 2019/12/04 19:20:00.874620 [INF]   Store Directory: "/tmp/test/jetstream"
[16943] 2019/12/04 19:20:00.874625 [INF] ----------------------------------------
[16943] 2019/12/04 19:20:00.874868 [INF] Listening for client connections on 0.0.0.0:4222
[16943] 2019/12/04 19:20:00.874874 [INF] Server id is NCR6KDDGWUU2FXO23WAXFY66VQE6JNWVMA24ALF2MO5GKAYFIMQULKUO
[16943] 2019/12/04 19:20:00.874877 [INF] Server is ready
```

Эти опции также можно задать в конфигурационном файле:

```text
// enables jetstream, an empty block will enable and use defaults
jetstream {
    // jetstream data will be in /data/nats-server/jetstream
    store_dir: "/data/nats-server"

    // 1GB
    max_memory_store: 1073741824

    // 10GB
    max_file_store: 10737418240
}
```
