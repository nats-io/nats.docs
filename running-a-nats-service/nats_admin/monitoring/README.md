# Мониторинг

## Мониторинг NATS

Для мониторинга системы сообщений NATS `nats-server` предоставляет легковесный HTTP‑сервер на выделенном порту мониторинга. Сервер мониторинга предоставляет несколько endpoint, возвращающих статистику и другую информацию о следующем:

* [Общая информация о сервере (`/varz`)](#general-information-varz)
* [Соединения (`/connz`)](#connection-information-connz)
* [Маршрутизация (`/routez`)](#route-information-routez)
* [Gateway (`/gatewayz`)](#gateway-information-gatewayz)
* [Leaf Nodes (`/leafz`)](#leaf-node-information-leafz)
* [Маршрутизация подписок (`/subsz`)](#subscription-routing-information-subsz)
* [Информация об аккаунтах (`/accountz`)](#account-information-accountz)
* [Статистика аккаунтов (`/accstatz`)](#account-statistics-accstatz)
* [Информация JetStream (`/jsz`)](#jetstream-information-jsz)
* [Health (`/healthz`)](#health-healthz)

Все endpoint возвращают JSON‑объект.

Обратите внимание: информация из этих endpoint также доступна через [System services](../../configuration/sys_accounts#system-account)

Endpoint мониторинга NATS поддерживают [JSONP](https://en.wikipedia.org/wiki/JSONP) и [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works), что упрощает создание одностраничных веб‑приложений мониторинга. В экосистеме NATS есть инструмент [nats-top](../../../using-nats/nats-tools/nats_top/), который визуализирует данные из этих endpoint в командной строке.

{% hint style="warning" %}
`nats-server` не имеет аутентификации/авторизации для endpoint мониторинга. Если вы планируете открыть `nats-server` в интернет, убедитесь, что порт мониторинга также не экспонируется. По умолчанию мониторинг привязывается ко всем интерфейсам `0.0.0.0`, поэтому рассмотрите настройку мониторинга на `localhost` или соответствующие правила firewall.
{% endhint %}

### Включение мониторинга

Мониторинг можно включить в [конфигурации сервера](../../configuration/#monitoring-and-tracing) или как [опцию командной строки](../../running/flags.md#server-options). Стандартный порт — `8222`.

В конфигурации сервера:

```yaml
http_port: 8222
```

Как опция командной строки:

```bash
nats-server -m 8222
```

После запуска сервера одним из двух способов перейдите на <http://localhost:8222>, чтобы просмотреть доступные endpoint, описанные ниже.

Или, если включен System account, endpoint мониторинга доступны как ["System services"](https://docs.nats.io/running-a-nats-service/configuration/sys_accounts#system-account)

## Точки мониторинга

<a id="general-information-varz"></a>
### Общая информация `(/varz)`

Endpoint `/varz` возвращает общую информацию о состоянии и конфигурации сервера.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

N/A

#### Пример

[https://demo.nats.io:8222/varz](https://demo.nats.io:8222/varz)

#### Ответ

```json
{
  "server_id": "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
  "version": "2.0.0",
  "proto": 1,
  "go": "go1.12",
  "host": "0.0.0.0",
  "port": 4222,
  "max_connections": 65536,
  "ping_interval": 120000000000,
  "ping_max": 2,
  "http_host": "0.0.0.0",
  "http_port": 8222,
  "https_port": 0,
  "auth_timeout": 1,
  "max_control_line": 4096,
  "max_payload": 1048576,
  "max_pending": 67108864,
  "cluster": {},
  "gateway": {},
  "leaf": {},
  "tls_timeout": 0.5,
  "write_deadline": 2000000000,
  "start": "2019-06-24T14:24:43.928582-07:00",
  "now": "2019-06-24T14:24:46.894852-07:00",
  "uptime": "2s",
  "mem": 9617408,
  "cores": 4,
  "gomaxprocs": 4,
  "cpu": 0,
  "connections": 0,
  "total_connections": 0,
  "routes": 0,
  "remotes": 0,
  "leafnodes": 0,
  "in_msgs": 0,
  "out_msgs": 0,
  "in_bytes": 0,
  "out_bytes": 0,
  "slow_consumers": 2,
  "subscriptions": 0,
  "http_req_stats": {
    "/": 0,
    "/connz": 0,
    "/gatewayz": 0,
    "/routez": 0,
    "/subsz": 0,
    "/varz": 1
  },
  "config_load_time": "2019-06-24T14:24:43.928582-07:00",
  "slow_consumer_stats": {
    "clients": 1,
    "routes": 1,
    "gateways": 0,
    "leafs": 0
  }
}
```

<a id="connection-information-connz"></a>
### Информация о соединениях (`/connz`)

Endpoint `/connz` сообщает более подробную информацию о текущих и недавно закрытых соединениях. Он использует paging‑механизм, по умолчанию на 1024 соединения.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент     | Значения                      | Описание                                                                                                                           |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| sort         | (_см. опции сортировки_)      | Сортирует результаты. По умолчанию — connection ID.                                                                               |
| auth         | true, 1, false, 0             | Включить имя пользователя. По умолчанию — false.                                                                                  |
| subs         | true, 1, false, 0 или `detail` | Включить подписки. По умолчанию — false. При `detail` вернется список с более подробной информацией о подписках.                  |
| offset       | number > 0                    | Смещение пагинации. По умолчанию — 0.                                                                                             |
| limit        | number > 0                    | Количество результатов. По умолчанию — 1024.                                                                                      |
| cid          | number, valid id              | Вернуть соединение по его id                                                                                                      |
| state        | open, \*closed, any           | Вернуть соединения заданного состояния. По умолчанию — open.                                                                     |
| mqtt_client  | string                        | Фильтровать соединение по этому MQTT client ID.                                                                                   |

_Сервер по умолчанию хранит последние 10 000 закрытых соединений._

**Опции сортировки**

| Опция       | Сортировка по                                      |
| ----------- | -------------------------------------------------- |
| cid         | ID соединения                                      |
| start       | Время начала соединения, как CID                   |
| subs        | Число подписок                                     |
| pending     | Объем данных (байт), ожидающих отправки клиенту    |
| msgs_to     | Число отправленных сообщений                       |
| msgs_from   | Число полученных сообщений                         |
| bytes_to    | Число отправленных байт                            |
| bytes_from  | Число полученных байт                              |
| last        | Последняя активность                               |
| idle        | Время бездействия                                  |
| uptime      | Время жизни соединения                             |
| stop        | Время остановки закрытого соединения               |
| reason      | Причина закрытия соединения                        |
| rtt         | Round trip time                                    |

#### Примеры

Получить до 1024 соединений: [https://demo.nats.io:8222/connz](https://demo.nats.io:8222/connz)

Управление limit и offset: [https://demo.nats.io:8222/connz?limit=16&offset=128](https://demo.nats.io:8222/connz?limit=16&offset=128).

Получить информацию о закрытых соединениях: [https://demo.nats.io:8222/connz?state=closed](https://demo.nats.io:8222/connz?state=closed).

Также можно получить подробную информацию о подписках для каждого соединения с subs=1. Например: [https://demo.nats.io:8222/connz?limit=1&offset=1&subs=1](https://demo.nats.io:8222/connz?limit=1&offset=1&subs=1).

#### Ответ

```json
{
  "server_id": "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
  "now": "2019-06-24T14:28:16.520365-07:00",
  "num_connections": 2,
  "total": 2,
  "offset": 0,
  "limit": 1024,
  "connections": [
    {
      "cid": 5,
      "kind": "Client",
      "type": "nats",
      "ip": "127.0.0.1",
      "port": 62714,
      "start": "2021-09-09T23:16:43.040862Z",
      "last_activity": "2021-09-09T23:16:43.042364Z",
      "rtt": "95µs",
      "uptime": "5s",
      "idle": "5s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "name": "NATS Benchmark",
      "lang": "go",
      "version": "1.12.1"
    },
    {
      "cid": 6,
      "kind": "Client",
      "type": "nats",
      "ip": "127.0.0.1",
      "port": 62715,
      "start": "2021-09-09T23:16:43.042557Z",
      "last_activity": "2021-09-09T23:16:43.042811Z",
      "rtt": "100µs",
      "uptime": "5s",
      "idle": "5s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "name": "NATS Benchmark",
      "lang": "go",
      "version": "1.12.1"
    },
    {
      "cid": 7,
      "kind": "Client",
      "type": "mqtt",
      "ip": "::1",
      "port": 62718,
      "start": "2021-09-09T23:16:45.391459Z",
      "last_activity": "2021-09-09T23:16:45.395869Z",
      "rtt": "0s",
      "uptime": "2s",
      "idle": "2s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 2,
      "mqtt_client": "mqtt_sub"
    }
  ]
}
```

<a id="route-information-routez"></a>
### Информация о маршрутах (`/routez`)

Endpoint `/routez` сообщает информацию об активных маршрутах кластера. Маршрутов обычно немного, поэтому этот endpoint не использует пагинацию.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент | Значения                      | Описание                                                                                                                           |
| -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| subs     | true, 1, false, 0 или `detail` | Включить подписки. По умолчанию — false. При `detail` вернется список с более подробной информацией о подписках.                  |

Как отмечено выше, endpoint `routez` поддерживает аргумент `subs` из endpoint `/connz`. Например: [https://demo.nats.io:8222/routez?subs=1](https://demo.nats.io:8222/routez?subs=1)

#### Пример

* Получить информацию о маршрутах: [https://demo.nats.io:8222/routez?subs=1](https://demo.nats.io:8222/routez?subs=1)

#### Ответ

```json
{
  "server_id": "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
  "now": "2019-06-24T14:29:16.046656-07:00",
  "num_routes": 1,
  "routes": [
    {
      "rid": 1,
      "remote_id": "de475c0041418afc799bccf0fdd61b47",
      "did_solicit": true,
      "ip": "127.0.0.1",
      "port": 61791,
      "pending_size": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 0
    }
  ]
}
```

<a id="gateway-information-gatewayz"></a>
### Информация о Gateway (`/gatewayz`)

Endpoint `/gatewayz` сообщает информацию о gateways, используемых для создания NATS supercluster. Как и маршрутов, gateways обычно немного, поэтому этот endpoint не использует пагинацию.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент  | Значения          | Описание                                         |
| --------- | ----------------- | ------------------------------------------------ |
| accs      | true, 1, false, 0 | Включить информацию об аккаунтах. По умолчанию — false. |
| gw_name   | string            | Вернуть только удаленные gateways с этим именем. |
| acc_name  | string            | Ограничить список аккаунтов этим именем.         |

#### Примеры

* Получить информацию о Gateway: [https://demo.nats.io:8222/gatewayz](https://demo.nats.io:8222/gatewayz)

#### Ответ

```json
{
  "server_id": "NANVBOU62MDUWTXWRQ5KH3PSMYNCHCEUHQV3TW3YH7WZLS7FMJE6END6",
  "now": "2019-07-24T18:02:55.597398-06:00",
  "name": "region1",
  "host": "2601:283:4601:1350:1895:efda:2010:95a1",
  "port": 4501,
  "outbound_gateways": {
    "region2": {
      "configured": true,
      "connection": {
        "cid": 7,
        "ip": "127.0.0.1",
        "port": 5500,
        "start": "2019-07-24T18:02:48.765621-06:00",
        "last_activity": "2019-07-24T18:02:48.765621-06:00",
        "uptime": "6s",
        "idle": "6s",
        "pending_bytes": 0,
        "in_msgs": 0,
        "out_msgs": 0,
        "in_bytes": 0,
        "out_bytes": 0,
        "subscriptions": 0,
        "name": "NCXBIYWT7MV7OAQTCR4QTKBN3X3HDFGSFWTURTCQ22ZZB6NKKJPO7MN4"
      }
    },
    "region3": {
      "configured": true,
      "connection": {
        "cid": 5,
        "ip": "::1",
        "port": 6500,
        "start": "2019-07-24T18:02:48.764685-06:00",
        "last_activity": "2019-07-24T18:02:48.764685-06:00",
        "uptime": "6s",
        "idle": "6s",
        "pending_bytes": 0,
        "in_msgs": 0,
        "out_msgs": 0,
        "in_bytes": 0,
        "out_bytes": 0,
        "subscriptions": 0,
        "name": "NCVS7Q65WX3FGIL2YQRLI77CE6MQRWO2Y453HYVLNMBMTVLOKMPW7R6K"
      }
    }
  },
  "inbound_gateways": {
    "region2": [
      {
        "configured": false,
        "connection": {
          "cid": 9,
          "ip": "::1",
          "port": 52029,
          "start": "2019-07-24T18:02:48.76677-06:00",
          "last_activity": "2019-07-24T18:02:48.767096-06:00",
          "uptime": "6s",
          "idle": "6s",
          "pending_bytes": 0,
          "in_msgs": 0,
          "out_msgs": 0,
          "in_bytes": 0,
          "out_bytes": 0,
          "subscriptions": 0,
          "name": "NCXBIYWT7MV7OAQTCR4QTKBN3X3HDFGSFWTURTCQ22ZZB6NKKJPO7MN4"
        }
      }
    ],
    "region3": [
      {
        "configured": false,
        "connection": {
          "cid": 4,
          "ip": "::1",
          "port": 52025,
          "start": "2019-07-24T18:02:48.764577-06:00",
          "last_activity": "2019-07-24T18:02:48.764994-06:00",
          "uptime": "6s",
          "idle": "6s",
          "pending_bytes": 0,
          "in_msgs": 0,
          "out_msgs": 0,
          "in_bytes": 0,
          "out_bytes": 0,
          "subscriptions": 0,
          "name": "NCVS7Q65WX3FGIL2YQRLI77CE6MQRWO2Y453HYVLNMBMTVLOKMPW7R6K"
        }
      },
      {
        "configured": false,
        "connection": {
          "cid": 8,
          "ip": "127.0.0.1",
          "port": 52026,
          "start": "2019-07-24T18:02:48.766173-06:00",
          "last_activity": "2019-07-24T18:02:48.766999-06:00",
          "uptime": "6s",
          "idle": "6s",
          "pending_bytes": 0,
          "in_msgs": 0,
          "out_msgs": 0,
          "in_bytes": 0,
          "out_bytes": 0,
          "subscriptions": 0,
          "name": "NCKCYK5LE3VVGOJQ66F65KA27UFPCLBPX4N4YOPOXO3KHGMW24USPCKN"
        }
      }
    ]
  }
}
```

<a id="leaf-node-information-leafz"></a>
### Информация о Leaf Nodes (`/leafz`)

Endpoint `/leafz` сообщает подробную информацию о соединениях leaf node.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент | Значения          | Описание                                       |
| -------- | ----------------- | --------------------------------------------- |
| subs     | true, 1, false, 0 | Включить внутренние подписки. По умолчанию — false. |

Как отмечено выше, endpoint `leafz` поддерживает аргумент `subs` из endpoint `/connz`. Например: [https://demo.nats.io:8222/leafz?subs=1](https://demo.nats.io:8222/leafz?subs=1)

#### Пример

* Получить информацию о leaf nodes: [https://demo.nats.io:8222/leafz?subs=1](https://demo.nats.io:8222/leafz?subs=1)

#### Ответ

```json
{
  "server_id": "NC2FJCRMPBE5RI5OSRN7TKUCWQONCKNXHKJXCJIDVSAZ6727M7MQFVT3",
  "now": "2019-08-27T09:07:05.841132-06:00",
  "leafnodes": 1,
  "leafs": [
    {
      "account": "$G",
      "ip": "127.0.0.1",
      "port": 6223,
      "rtt": "200µs",
      "in_msgs": 0,
      "out_msgs": 10000,
      "in_bytes": 0,
      "out_bytes": 1280000,
      "subscriptions": 1,
      "subscriptions_list": ["foo"]
    }
  ]
}
```

<a id="subscription-routing-information-subsz"></a>
### Информация о маршрутизации подписок (`/subsz`)

Endpoint `/subsz` сообщает подробную информацию о текущих подписках и структуре маршрутизации. Обычно не используется.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент | Значения          | Описание                                   |
| -------- | ----------------- | ------------------------------------------- |
| subs     | true, 1, false, 0 | Включить подписки. По умолчанию — false.     |
| offset   | integer > 0       | Смещение пагинации. По умолчанию — 0.        |
| limit    | integer > 0       | Количество результатов. По умолчанию — 1024. |
| test     | subject           | Проверить, существует ли подписка.           |

#### Пример

* Получить информацию о маршрутизации подписок: [https://demo.nats.io:8222/subsz](https://demo.nats.io:8222/subsz)

#### Ответ

```json
{
  "num_subscriptions": 2,
  "num_cache": 0,
  "num_inserts": 2,
  "num_removes": 0,
  "num_matches": 0,
  "cache_hit_rate": 0,
  "max_fanout": 0,
  "avg_fanout": 0
}
```

<a id="account-information-accountz"></a>
### Информация об аккаунтах (`/accountz`)

Endpoint `/accountz` сообщает информацию об активных аккаунтах сервера. По умолчанию возвращает список всех аккаунтов, известных серверу.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

| Аргумент | Значение     | Описание                                                                                                     |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| acc      | имя аккаунта | Включить метрики для указанного аккаунта. По умолчанию пусто. Если не задано, включается список всех аккаунтов. |

#### Пример

* Получить список всех аккаунтов: [https://demo.nats.io:8222/accountz](https://demo.nats.io:8222/accountz)
* Получить детали для конкретного аккаунта `$G`: [https://demo.nats.io:8222/accountz?acc=$G](https://demo.nats.io:8222/accountz?acc=$G)

#### Ответ

Поведение по умолчанию:

```json
{
  "server_id": "NAB2EEQ3DLS2BHU4K2YMXMPIOOOAOFOAQAC5NQRIEUI4BHZKFBI4ZU4A",
  "now": "2021-02-08T17:31:29.551146-05:00",
  "system_account": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
  "accounts": ["AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5", "$G"]
}
```

Получение конкретного аккаунта:

```json
{
  "server_id": "NAB2EEQ3DLS2BHU4K2YMXMPIOOOAOFOAQAC5NQRIEUI4BHZKFBI4ZU4A",
  "now": "2021-02-08T17:37:55.80856-05:00",
  "system_account": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
  "account_detail": {
    "account_name": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
    "update_time": "2021-02-08T17:31:22.390334-05:00",
    "is_system": true,
    "expired": false,
    "complete": true,
    "jetstream_enabled": false,
    "leafnode_connections": 0,
    "client_connections": 0,
    "subscriptions": 42,
    "exports": [
      {
        "subject": "$SYS.DEBUG.SUBSCRIBERS",
        "type": "service",
        "response_type": "Singleton"
      }
    ],
    "jwt": "eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJVVlU2VEpXRU8zS0hYWTZVMkgzM0RCVklET1A3U05DTkJPMlM0M1dPNUM2T1RTTDNVSUxBIiwiaWF0IjoxNjAzNDczNzg4LCJpc3MiOiJPQlU1TzVGSjMyNFVEUFJCSVZSR0Y3Q05FT0hHTFBTN0VZUEJUVlFaS1NCSElJWklCNkhENjZKRiIsIm5hbWUiOiJTWVMiLCJzdWIiOiJBQUFYQVVWU0dLN1RDUkhGSVJBUzRTWVhWSjc2RVdETU5YWk02QVJGR1hQN0JBU05ER0xLVTdBNSIsInR5cGUiOiJhY2NvdW50IiwibmF0cyI6eyJsaW1pdHMiOnsic3VicyI6LTEsImNvbm4iOi0xLCJsZWFmIjotMSwiaW1wb3J0cyI6LTEsImV4cG9ydHMiOi0xLCJkYXRhIjotMSwicGF5bG9hZCI6LTEsIndpbGRjYXJkcyI6dHJ1ZX19fQ.CeGo16i5oD0b1uBJ8UdGmLH-l9dL8yNqXHggkAt2T5c88fM7k4G08wLguMAnlvzrdlYvdZvOx_5tHLuDZmGgCg",
    "issuer_key": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
    "name_tag": "SYS",
    "decoded_jwt": {
      "jti": "UVU6TJWEO3KHXY6U2H33DBVIDOP7SNCNBO2S43WO5C6OTSL3UILA",
      "iat": 1603473788,
      "iss": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
      "name": "SYS",
      "sub": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
      "nats": {
        "limits": {
          "subs": -1,
          "data": -1,
          "payload": -1,
          "imports": -1,
          "exports": -1,
          "wildcards": true,
          "conn": -1,
          "leaf": -1
        },
        "default_permissions": {
          "pub": {},
          "sub": {}
        },
        "type": "account",
        "version": 1
      }
    },
    "sublist_stats": {
      "num_subscriptions": 42,
      "num_cache": 6,
      "num_inserts": 42,
      "num_removes": 0,
      "num_matches": 6,
      "cache_hit_rate": 0,
      "max_fanout": 1,
      "avg_fanout": 0.8333333333333334
    }
  }
}
```

<a id="account-statistics-accstatz"></a>
### Статистика аккаунтов (`/accstatz`)

Endpoint `/accstatz` возвращает статистику по аккаунтам: число соединений, сообщения/байты in/out и т. п.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент | Значения          | Описание                                                                                 |
| -------- | ----------------- | ---------------------------------------------------------------------------------------- |
| unused   | true, 1, false, 0 | Если true, включать аккаунты без текущих соединений. По умолчанию — false.              |

#### Примеры

* Аккаунты с активными соединениями — <https://demo.nats.io:8222/accstatz>
* Включить аккаунты без соединений (в этом примере `$SYS`) — <https://demo.nats.io:8222/accstatz?unused=1>

#### Ответ

```json
{
  "server_id": "NDJ5M4F5WAIBUA26NJ3QMH532AQPN7QNTJP3Y4SBHSHL4Y7QUAKNJEAF",
  "now": "2022-10-19T17:16:20.881296749Z",
  "account_statz": [
    {
      "acc": "default",
      "conns": 31,
      "leafnodes": 2,
      "total_conns": 33,
      "num_subscriptions": 45,
      "sent": {
        "msgs": 1876970,
        "bytes": 246705616
      },
      "received": {
        "msgs": 1347454,
        "bytes": 219438308
      },
      "slow_consumers": 29
    },
    {
      "acc": "$G",
      "conns": 1,
      "leafnodes": 0,
      "total_conns": 1,
      "num_subscriptions": 3,
      "sent": {
        "msgs": 0,
        "bytes": 0
      },
      "received": {
        "msgs": 107,
        "bytes": 1094
      },
      "slow_consumers": 0
    }
  ]
}
```

<a id="jetstream-information-jsz"></a>
### Информация JetStream (`/jsz`)

Endpoint `/jsz` возвращает более подробную информацию о JetStream. Для аккаунтов используется paging‑механизм, по умолчанию на 1024 соединения.

> **Примечание:** если вы в кластерной среде, рекомендуется получать информацию от лидера stream, чтобы данные были наиболее точными и актуальными.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент    | Значения          | Описание                                                                                      |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| acc         | имя аккаунта      | Включить метрики для указанного аккаунта. По умолчанию не задан.                              |
| accounts    | true, 1, false, 0 | Включить специфичную для аккаунтов информацию JetStream. По умолчанию — false.                 |
| streams     | true, 1, false, 0 | Включить streams. При true подразумевается `accounts=true`. По умолчанию — false.             |
| consumers   | true, 1, false, 0 | Включить consumers. При true подразумевается `streams=true`. По умолчанию — false.            |
| config      | true, 1, false, 0 | При запросе stream или consumer включать их конфигурацию. По умолчанию — false.               |
| leader-only | true, 1, false, 0 | Отвечает только лидер. По умолчанию — false.                                                   |
| offset      | number > 0        | Смещение пагинации. По умолчанию — 0.                                                          |
| limit       | number > 0        | Количество результатов. По умолчанию — 1024.                                                   |
| raft        | true, 1, false, 0 | Включить детали о группе Raft. По умолчанию — false.                                           |

#### Примеры

Получить базовую информацию JetStream: [https://demo.nats.io:8222/jsz](https://demo.nats.io:8222/jsz)

Запросить аккаунты и управлять limit/offset: [https://demo.nats.io:8222/jsz?accounts=true&limit=16&offset=128](https://demo.nats.io:8222/jsz?accounts=true&limit=16&offset=128).

Также можно получать подробную информацию о consumer для каждого соединения с consumers=true. Например: [https://demo.nats.io:8222/jsz?consumers=true](https://demo.nats.io:8222/jsz?consumers=true).

#### Ответ

```json
{
  "server_id": "NCVIDODSZ45C5OD67ZD7EJUIJPQDP6CM74SJX6TJIF2G7NLYS5LCVYHS",
  "now": "2021-02-08T19:08:30.555533-05:00",
  "config": {
    "max_memory": 10485760,
    "max_storage": 10485760,
    "store_dir": "/var/folders/9h/6g_c9l6n6bb8gp331d_9y0_w0000gn/T/srv_7500251552558",
    "unique_tag": "az"
  },
  "memory": 0,
  "storage": 66,
  "api": {
    "total": 5,
    "errors": 0
  },
  "total_streams": 1,
  "total_consumers": 1,
  "total_messages": 1,
  "total_message_bytes": 33,
  "meta_cluster": {
    "name": "cluster_name",
    "replicas": [
      {
        "name": "server_5500",
        "current": false,
        "active": 2932926000
      }
    ]
  },
  "account_details": [
    {
      "name": "BCC_TO_HAVE_ONE_EXTRA",
      "id": "BCC_TO_HAVE_ONE_EXTRA",
      "memory": 0,
      "storage": 0,
      "api": {
        "total": 0,
        "errors": 0
      }
    },
    {
      "name": "ACC",
      "id": "ACC",
      "memory": 0,
      "storage": 66,
      "api": {
        "total": 5,
        "errors": 0
      },
      "stream_detail": [
        {
          "name": "my-stream-replicated",
          "cluster": {
            "name": "cluster_name",
            "replicas": [
              {
                "name": "server_5500",
                "current": false,
                "active": 2931517000
              }
            ]
          },
          "state": {
            "messages": 1,
            "bytes": 33,
            "first_seq": 1,
            "first_ts": "2021-02-09T00:08:27.623735Z",
            "last_seq": 1,
            "last_ts": "2021-02-09T00:08:27.623735Z",
            "consumer_count": 1
          },
          "consumer_detail": [
            {
              "stream_name": "my-stream-replicated",
              "name": "my-consumer-replicated",
              "created": "2021-02-09T00:08:27.427631Z",
              "delivered": {
                "consumer_seq": 0,
                "stream_seq": 0
              },
              "ack_floor": {
                "consumer_seq": 0,
                "stream_seq": 0
              },
              "num_ack_pending": 0,
              "num_redelivered": 0,
              "num_waiting": 0,
              "num_pending": 1,
              "cluster": {
                "name": "cluster_name",
                "replicas": [
                  {
                    "name": "server_5500",
                    "current": false,
                    "active": 2933232000
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

<a id="health-healthz"></a>
### Состояние (`/healthz`)

Endpoint `/healthz` возвращает OK, если сервер способен принимать соединения.

| Result  | Return Code       |
| ------- | ----------------- |
| Success | 200 (OK)          |
| Error   | 400 (Bad Request) |

#### Аргументы

| Аргумент        | Значения | Описание                                                                                      |
| --------------- | ------- | --------------------------------------------------------------------------------------------- |
| js-enabled-only | true, 1 | Возвращает ошибку, если JetStream выключен.                                                    |
| js-server-only  | true, 1 | Пропустить проверку здоровья аккаунтов, streams и consumers.                                   |
| js-enabled      | true, 1 | Возвращает ошибку, если JetStream выключен. (**Deprecated**: используйте `js-enabled-only`).  |

#### Пример

* По умолчанию — <https://demo.nats.io:8222/healthz>
* Ожидать JetStream — <https://demo.nats.io:8222/healthz?js-enabled-only=true>

#### Ответ

```json
{ "status": "ok" }
```

## Создание приложений мониторинга

Endpoint мониторинга NATS поддерживают [JSONP](https://en.wikipedia.org/wiki/JSONP) и [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works). Можно легко создать одностраничные веб‑приложения мониторинга. Для этого достаточно передать query‑параметр `callback` в любой endpoint.

Например:

```
https://demo.nats.io:8222/connz?callback=cb
```

Вот пример реализации на JQuery:

```javascript
$.getJSON("https://demo.nats.io:8222/connz?callback=?", function (data) {
  console.log(data);
});
```

## Инструменты мониторинга

Помимо написания собственных инструментов, вы можете мониторить nats-server в Prometheus. [Prometheus NATS Exporter](https://github.com/nats-io/prometheus-nats-exporter) позволяет настроить метрики, которые нужно наблюдать и сохранять в Prometheus, а для визуализации метрик сервера доступны дашборды Grafana.

Подробнее см. [Walkthrough of Monitoring NATS with Prometheus and Grafana](https://github.com/nats-io/prometheus-nats-exporter/tree/main/walkthrough).
