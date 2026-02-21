# Запуск JetStream в Docker

Этот мини‑туториал показывает, как запустить сервер NATS с включенным JetStream в локальном контейнере Docker.
Это позволяет быстро и без последствий экспериментировать с множеством возможностей JetStream.

Используя официальный образ `nats`, запустите сервер.
Опция `-js` передается серверу для включения JetStream. Опция `-p` пробрасывает ваш локальный порт 4222 на сервер внутри контейнера; 4222 — порт клиентских подключений по умолчанию.

```shell
docker run -p 4222:4222 nats -js
```

Чтобы сохранять данные JetStream на volume, используйте опцию `-v` вместе с `-sd`:

```shell
docker run -p 4222:4222 -v nats:/data nats -js -sd /data
```

Когда сервер запущен, используйте `nats bench`, чтобы создать поток и опубликовать в него сообщения.

```shell
nats bench -s localhost:4222 benchsubject --js --pub 1 --msgs=100000
```

JetStream сохраняет сообщения (по умолчанию на диск).
Теперь потребляйте их:

```shell
nats bench -s localhost:4222 benchsubject --js --sub 3 --msgs=100000
```

Вы можете использовать `nats`, чтобы посмотреть различные аспекты потока, например:

```shell
nats -s localhost:4222 stream list
╭────────────────────────────────────────────────────────────────────────────────────╮
│                                       Streams                                      │
├─────────────┬─────────────┬─────────────────────┬──────────┬────────┬──────────────┤
│ Name        │ Description │ Created             │ Messages │ Size   │ Last Message │
├─────────────┼─────────────┼─────────────────────┼──────────┼────────┼──────────────┤
│ benchstream │             │ 2024-06-07 20:26:38 │ 100,000  │ 16 MiB │ 35s          │
╰─────────────┴─────────────┴─────────────────────┴──────────┴────────┴──────────────╯
```

### Связанное и полезное:
 * Официальный [Docker‑образ сервера NATS на GitHub](https://github.com/nats-io/nats-docker) и [issues](https://github.com/nats-io/nats-docker/issues)
 * [`nats` образы на DockerHub](https://hub.docker.com/_/nats)
 * [CLI‑инструмент `nats`](/using-nats/nats-tools/nats_cli/) и [`nats bench`](/using-nats/nats-tools/nats_cli/natsbench)
 * [Администрирование JetStream](/nats_admin/jetstream_admin/)
