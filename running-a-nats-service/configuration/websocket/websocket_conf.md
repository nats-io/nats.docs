---
description: WebSocket Configuration Example
---

# Конфигурация

Чтобы включить поддержку WebSocket на сервере, добавьте блок `websocket` в конфигурационный файл сервера, например так:

```text
websocket {
    # Укажите host и порт, на котором слушать websocket‑подключения
    #
    # listen: "host:port"

    # Можно также настроить отдельными параметрами,
    # а именно host и port.
    #
    # host: "hostname"
    port: 443

    # Необязательно указывает host:port для websocket‑подключений,
    # которые будут объявляться в кластере.
    #
    # advertise: "host:port"

    # TLS‑конфигурация требуется по умолчанию
    #
    tls {
      cert_file: "/path/to/cert.pem"
      key_file: "/path/to/key.pem"
    }

    # Для тестовых окружений можно отключить необходимость TLS,
    # явно установив эту опцию в `true`
    #
    # no_tls: true

    # [Опция CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
    #
    # ВАЖНО! Эта опция используется только когда http‑запрос содержит
    # заголовок Origin, что характерно для браузеров. Если заголовок Origin
    # отсутствует, проверка не выполняется.
    #
    # Если `true`, то заголовок Origin должен совпадать с hostname запроса.
    # По умолчанию `false`.
    #
    # same_origin: true

    # [Опция CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
    #
    # ВАЖНО! Эта опция используется только когда http‑запрос содержит
    # заголовок Origin, что характерно для браузеров. Если заголовок Origin
    # отсутствует, проверка не выполняется.
    #
    # Список разрешенных origin. Когда список пуст и `same_origin` равно `false`,
    # клиентам разрешено подключаться с любого origin.
    # Этот список задает единственные допустимые значения заголовка Origin.
    # Должны совпадать схема, host и порт. По соглашению, отсутствие TCP‑порта
    # в URL означает порт 80 для схемы "http://" и 443 для "https://".
    #
    # allowed_origins [
    #    "http://www.example.com"
    #    "https://www.other-example.com"
    # ]

    # Включает поддержку сжатых websocket‑фреймов на сервере.
    # Чтобы сжатие использовалось, его должны поддерживать и сервер, и клиент.
    #
    # compression: true

    # Общее время, отведенное серверу на чтение запроса клиента
    # и запись ответа клиенту. Это включает время TLS‑рукопожатия.
    #
    # handshake_timeout: "2s"

    # Имя HTTP‑cookie, которое при наличии будет использоваться как JWT клиента.
    # Если клиент указывает JWT в протоколе CONNECT, эта опция игнорируется.
    # Cookie должен быть установлен HTTP‑сервером, как описано [здесь](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies).
    # Эта настройка полезна при генерации NATS `Bearer` JWT клиентов как
    # результата некоторого механизма аутентификации. HTTP‑сервер после
    # успешной аутентификации может выдать JWT пользователю, который
    # устанавливается безопасно и не доступен нежелательным скриптам.
    # Обратите внимание: это должны быть [NATS JWT](https://docs.nats.io/nats-server/configuration/securing_nats/jwt).
    #
    # jwt_cookie: "my_jwt_cookie_name"

    # Если при подключении websocket‑клиента не указано имя пользователя,
    # будет использовано это имя по умолчанию на этапе аутентификации.
    # Если задано, это значение для websocket‑клиентов переопределит любое
    # `no_auth_user`, определенное в основном конфиге.
    # Обратите внимание, что это несовместимо с operator mode.
    #
    # no_auth_user: "my_username_for_apps_not_providing_credentials"

    # См. ниже, как обычно ограничивать websocket‑клиентов конкретными пользователями.
    # Если в конфигурации не указаны пользователи, этот простой блок авторизации
    # позволяет переопределить значения, которые были бы настроены в эквивалентном
    # блоке основной секции.
    #
    # authorization {
    #     # Если указано, клиент должен предоставить то же имя пользователя
    #     # и пароль для подключения.
    #     # username: "my_user_name"
    #     # password: "my_password"
    #
    #     # Если указано, поле password в CONNECT должно совпадать с этим токеном.
    #     # token: "my_token"
    #
    #     # Переопределяет таймаут авторизации основной конфигурации. Для согласованности
    #     # с основным блоком авторизации это выражено в секундах.
    #     # timeout: 2.0
    #}
}
```

## Авторизация пользователей WebSocket

### Аутентификация

NATS поддерживает разные формы аутентификации для клиентов, подключающихся по WebSocket:

- username/password
- token
- NKEYS
- клиентские сертификаты
- JWT

Больше информации о том, как приложения, подключающиеся по WebSocket, могут использовать эти формы аутентификации, см. [здесь](https://github.com/nats-io/nats.ws#authentication)

### Ограничение типов подключений

Новое поле в конфигурации пользователей позволяет ограничить, какие типы соединений разрешены для конкретного пользователя.

Рассмотрим конфигурацию:

```text
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}}
  ]
}
```

Если WebSocket‑клиент подключится с именем пользователя `foo` и паролем `foopwd`, он будет принят. Теперь предположим, что вы хотите принимать WebSocket‑клиентов только при подключении с именем `bar` и паролем `barpwd`. Тогда используйте опцию `allowed_connection_types`, чтобы ограничить типы подключений, которые могут привязываться к этому пользователю.

```text
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}, allowed_connection_types: ["WEBSOCKET"]}
  ]
}
```

Опция `allowed_connection_types` (также может называться `connection_types` или `clients`), как видно, является списком и позволяет разрешать несколько типов клиентов. Допустим, вы хотите, чтобы пользователь `bar` принимал как стандартные NATS‑клиенты, так и WebSocket‑клиенты — тогда настройка будет такой:

```text
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}, allowed_connection_types: ["STANDARD", "WEBSOCKET"]}
  ]
}
```

Отсутствие `allowed_connection_types` означает, что разрешены все типы подключений (поведение по умолчанию).

Возможные значения сейчас:

* `STANDARD`
* `WEBSOCKET`
* `LEAFNODE`
* `MQTT`

## Подключения leaf‑nodes

Вы можете настроить удаленные подключения leaf‑node так, чтобы они подключались к порту Websocket вместо порта leaf‑node. См. раздел [Leafnode](../leafnodes/leafnode_conf.md#connecting-using-websocket-protocol).

## Docker

При запуске в Docker WebSocket по умолчанию отключен, поэтому нужно создать конфигурационный файл с минимальными настройками, например:

```text
websocket 
{
     port: 8080
     no_tls: true
}
```

Предположим, конфигурация сохранена в `/tmp/nats.conf`, тогда Docker можно запустить так:

```bash
docker run -it --rm  -v /tmp:/container -p 8080:8080 nats -c /container/nats.conf
```
