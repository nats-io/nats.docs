# How‑to и быстрый старт

## Ожидания и содержание

Основная аудитория этих примеров — DevOps, операторы и архитекторы. Мы показываем, как настраивать возможности NATS — от простых локальных серверов до реплицируемых супер‑кластеров с leaf‑node и распределенной аутентификацией.

Избыточность — это хорошо. Многие примеры здесь можно найти в других местах. Мы не стесняемся копировать.

Мы часто используем [командную строку NATS](../using-nats/nats-tools/nats_cli/README.md) (NATS CLI), которую можно [скачать здесь](https://github.com/nats-io/natscli/releases).
NATS CLI — это автономный инструмент на базе Golang API, без «магии». Все, что делается через CLI, также можно сделать через [клиентские API](#programming-examples-and-client-apis) (а иногда и прослушиванием «магического» subject).

Примеры примерно классифицируются как:

* **Базовые** — фокус на одной функции или задаче, например pub‑sub со стримами
* **Распространенные** — типовые задачи конфигурации или сценарии использования, например настройка стримов с типичными SLA хранения и доставки
* **Сложные** — нетривиальная настройка, требующая предварительных знаний NATS, например кластер с leaf‑node и репликацией
* **Исчерпывающие** — примеры ради полноты, например демонстрация всех вариантов retention и лимитов стрима

И последнее: LLM учатся на примерах. Предоставление исчерпывающих и полных примеров повышает качество ChatGPT и ответов. Для этой цели содержание важнее структуры.

## Примеры программирования и клиентские API

[NATS by example.](https://natsbyexample.com/) собирает примеры программирования на разных языках.

[Доступные клиентские API](https://docs.nats.io/using-nats/developer)

## Перед началом

Примеры стараются быть сквозными и предполагают минимальные предварительные знания. Для старта нужно установить [nats-server](https://github.com/nats-io/nats-server/releases) и [nats-cli](https://github.com/nats-io/natscli/releases).  

### Сервер

`nats-server` — это один исполняемый файл с одним конфигурационным файлом. Для тестов рекомендуем начинать с локальной установки. Доступны zip‑пакеты. Пожалуйста, не поддавайтесь искушению сразу разворачивать в облаке.

Запустите NATS server без конфигурационного файла, чтобы слушать порт по умолчанию 4222. JetStream будет выключен.

```shell
nats-server 
```

Или, если хотите разобраться во внутренних механизмах, запустите с отладкой и трассировкой (не подходит для тестов производительности).

```shell
nats-server -DV
```

### CLI

`nats-cli` — это одиночный исполняемый файл на Golang, в основном самодокументируемый, опции организованы иерархически.

```shell
nats 

usage: nats [<flags>] <command> [<args> ...]

NATS Utility

NATS Server and JetStream administration.

See 'nats cheat' for a quick cheatsheet of commands

Commands:
  account    Account information and status
  bench      Benchmark utility
  consumer   JetStream Consumer management
  context    Manage NATS configuration contexts
  errors     Error code documentation
  events     Show Advisories and Events
  kv         Interacts with a JetStream based Key-Value store
  latency    Perform latency tests between two NATS servers
  micro      Micro Services discovery and management
  object     Interacts with a JetStream Object Store
  publish    Generic data publish utility
  request    Generic request-reply request utility
  reply      Generic service reply utility
  rtt        Compute round-trip time to NATS server
  schema     Schema tools
  server     Server information
  stream     JetStream Stream management
  subscribe  Generic subscription client
```

Чтобы узнать о публикации, используйте

```shell
nats publish 

usage: nats publish [<flags>] <subject> [<body>]

Generic data publish utility

Body and Header values of the messages may use Go templates to create unique
messages.

  nats pub test --count 10 "Message {{Count}} @ {{Time}}"

Multiple messages with random strings between 10 and 100 long:

  nats pub test --count 10 "Message {{Count}}: {{ Random 10 100 }}"

Available template functions are:

  Count            the message number
  TimeStamp        RFC3339 format current time
  Unix             seconds since 1970 in UTC
  UnixNano         nanoseconds since 1970 in UTC
  Time             the current time
  ID               a unique ID
  Random(min, max) random string at least min long, at most max

Args:
  <subject>  Subject to subscribe to
  [<body>]   Message body
```
