# OCSP Stapling

_Поддерживается начиная с NATS Server версии 2.3_

[OCSP Stapling](https://en.wikipedia.org/wiki/OCSP_stapling) поддерживается по умолчанию для сертификатов, у которых установлен флаг [status_request Must‑Staple](https://datatracker.ietf.org/doc/html/rfc6961).

Когда сертификат настроен с OCSP Must‑Staple, сервер NATS будет получать stapled‑ответы от настроенного OCSP‑ресponder URL, указанного в сертификате. Например, сертификат со следующей конфигурацией:

```text
[ ext_ca ]
...                                                                           
authorityInfoAccess = OCSP;URI:http://ocsp.example.net:80
tlsfeature = status_request
...
```

Сервер NATS отправит запрос OCSP‑responder, чтобы получить новый staple, который затем будет предоставлен всем TLS‑соединениям, принимаемым сервером во время TLS‑рукопожатия.

OCSP Stapling можно явно включить или выключить в NATS Server, задав следующий флаг в конфигурационном файле на верхнем уровне:

```text
ocsp: false
```

**Примечание:** Когда OCSP Stapling отключен, сервер NATS не будет запрашивать stapled‑ответы даже если в сертификате есть флаг Must‑Staple.

## Расширенная конфигурация

По умолчанию NATS Server работает в режиме OCSP `auto`. В этом режиме сервер будет получать stapled‑ответы только когда в сертификате настроен флаг Must‑Staple.

Есть и другие режимы OCSP, которые управляют тем, должен ли OCSP быть обязательным и должен ли сервер завершаться, если сертификат работает с отозванным staple:

| Режим | Описание | Сервер завершается при отзыве |
| :--- | :--- | :--- |
| auto | Включает OCSP Stapling, когда у сертификата есть флаг must staple/status_request | Нет |
| must | Включает OCSP Stapling, когда у сертификата есть флаг must staple/status_request | Да |
| always | Включает OCSP Stapling для всех сертификатов | Да |
| never | Отключает OCSP Stapling даже если есть must staple (то же, что `ocsp: false`) | Нет |

Например, в следующей OCSP‑конфигурации режим установлен в `must`. Это означает, что stapled‑ответы будут запрашиваться только для сертификатов с флагом Must‑Staple, но в случае отзыва сервер завершится, а не будет работать с отозванным staple.  
В этой конфигурации `url` также переопределит OCSP responder URL, который мог быть указан в сертификате.

```text
ocsp {
  mode: must
  url: "http://ocsp.example.net"
}
```

Если stapled‑ответы требуются всегда, независимо от конфигурации сертификата, можно принудительно включить поведение так:

```text
ocsp {
  mode: always
  url: "http://ocsp.example.net"
}
```

## Кэширование stapled‑ответов

Когда в NATS Server задан `store_dir`, этот каталог будет использоваться для кэширования stapled‑ответов на диск, чтобы сервер мог восстановиться после перезапуска без повторного запроса к OCSP responder, если staple еще действителен.

```text
ocsp: true

store_dir: "/path/to/store/dir"

tls {
    cert_file: "configs/certs/ocsp/server-status-request-url.pem"
    key_file: "configs/certs/ocsp/server-status-request-url-key.pem"
    ca_file: "configs/certs/ocsp/ca-cert.pem"
    timeout: 5
}
```

Если JetStream включен, то тот же `store_dir` будет переиспользован, и кэширование на диск будет включено автоматически.
