# Устранение неполадок

Диагностика проблем в кластерах NATS JetStream требует:

* знания [концепций JetStream](../../../../nats-concepts/jetstream/)
* знания [NATS Command Line Interface (CLI)](https://github.com/nats-io/natscli#the-nats-command-line-interface)

Следующие советы и команды (не исчерпывающий список) могут быть полезны при диагностике проблем в кластерах NATS JetStream:

## Советы по устранению неполадок

1. Посмотрите логи [nats-server](https://github.com/nats-io/nats-server). По умолчанию выводятся только предупреждения и ошибки, но debug и trace можно включить из командной строки с помощью `-D` и `-DV` соответственно. Альтернатива — включить `debug` или `trace` в [конфигурации сервера](https://docs.nats.io/running-a-nats-service/configuration#monitoring-and-tracing).
2. Убедитесь, что в [конфигурации NATS JetStream](./#configuration) в этом разделе задан хотя бы один системный пользователь: `{ $SYS { users } }`.

### Команды `nats account`

| Команда                                                                 | Описание                                      |
| ----------------------------------------------------------------------- | -------------------------------------------- |
| [`nats account info`](../../../nats_admin/jetstream_admin/account.md) | Проверить, что JetStream включен для аккаунта |

### Базовые команды `nats server`

| Команда                                                       | Описание                              |
| ------------------------------------------------------------- | ------------------------------------ |
| `nats server ls`                                              | Список известных серверов             |
| `nats server ping`                                            | Ping всех серверов                    |
| `nats server info`                                            | Показать информацию об одном сервере |
| [`nats server check`](../../../clients.md#testing-your-setup) | Проверка здоровья NATS‑серверов       |

### Команды `nats server report`

| Команда                                                                       | Описание                    |
| ----------------------------------------------------------------------------- | -------------------------- |
| `nats server report connections`                                              | Отчет по соединениям       |
| `nats server report accounts`                                                 | Отчет по активности аккаунта |
| [`nats server report jetstream`](administration.md#viewing-the-cluster-state) | Отчет по активности JetStream |

### Команды `nats server request`

| Команда                                                                        | Описание                         |
| ------------------------------------------------------------------------------ | -------------------------------- |
| [`nats server request jetstream`](administration.md#viewing-the-cluster-state) | Показать детали JetStream        |
| `nats server request subscriptions`                                            | Показать информацию о подписках  |
| `nats server request variables`                                                | Показать runtime‑переменные      |
| `nats server request connections`                                              | Показать детали соединений       |
| `nats server request routes`                                                   | Показать детали маршрутов        |
| `nats server request gateways`                                                 | Показать детали gateways         |
| `nats server request leafnodes`                                                | Показать детали leafnodes        |
| `nats server request accounts`                                                 | Показать детали аккаунтов        |

### Команды `nats server cluster`

| Команда                                                                                          | Описание                                                         |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [`nats server cluster step-down`](administration.md#forcing-stream-and-consumer-leader-election) | Принудительно выбрать нового лидера, сняв текущего meta‑лидера   |
| [`nats server cluster peer-remove`](administration.md#evicting-a-peer)                           | Удаляет сервер из кластера JetStream                             |

### Экспериментальные команды

| Команда                                                                                | Описание                                       |
| -------------------------------------------------------------------------------------- | --------------------------------------------- |
| [`nats traffic`](https://github.com/nats-io/natscli/blob/main/cli/traffic_command.go) | Мониторинг NATS‑трафика. (**Экспериментальная команда**) |

## Дополнительные ссылки по устранению неполадок

* [Проверка установки](../../../clients.md#testing-your-setup)
