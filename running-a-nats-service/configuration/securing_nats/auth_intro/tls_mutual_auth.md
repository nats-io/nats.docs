# TLS‑аутентификация

Сервер может требовать TLS‑сертификаты от клиента. При необходимости сертификаты можно использовать, чтобы:

* Проверить, что клиентский сертификат соответствует известному или доверенному CA
* Извлечь информацию из доверенного сертификата для аутентификации

> Примечание: чтобы упростить распространенный сценарий, когда мейнтейнеры смотрят мониторинг, `verify` и `verify_and_map` не применяются к порту мониторинга.

Примеры в следующих разделах используют сертификаты, которые вы [сгенерировали](/running-a-nats-service/configuration/securing_nats/tls.md#self-signed-certificates-for-testing) локально.

## Проверка клиентского сертификата

Сервер может проверять клиентский сертификат с помощью CA‑сертификата. Чтобы требовать проверку, добавьте опцию `verify` в раздел TLS‑конфигурации:

```
tls {
  cert_file: "server-cert.pem"
  key_file:  "server-key.pem"
  ca_file:   "rootCA.pem"
  verify:    true
}
```

Или через командную строку:

```bash
nats-server --tlsverify --tlscert=server-cert.pem --tlskey=server-key.pem --tlscacert=rootCA.pem
```

Эта опция проверяет, что сертификат клиента подписан CA, указанным в `ca_file`. Если `ca_file` отсутствует, используется системное хранилище доверия. Также проверяется, что клиент предоставляет сертификат с extended key usage `TLS Web Client Authentication`.

## Маппинг клиентских сертификатов на пользователя

Помимо проверки того, что указанный CA выдал сертификат клиента, можно использовать информацию из сертификата для аутентификации клиента. Клиенту не нужно будет предоставлять или хранить username/password.

Чтобы TLS Mutual Authentication маппила атрибуты сертификата на идентичность пользователя, используйте `verify_and_map`:

```
tls {
  cert_file: "server-cert.pem"
  key_file:  "server-key.pem"
  ca_file:   "rootCA.pem"
  # Require a client certificate and map user id from certificate
  verify_and_map: true
}
```

> Обратите внимание, что `verify` заменяется на `verify_and_map`.

Если задано, сервер проверит, соответствует ли Subject Alternative Name (SAN) пользователю. Сначала ищет email‑адреса, затем DNS‑имена. Если пользователь не найден, сервер попробует subject сертификата.

> Примечание: этот механизм выбирает первого найденного пользователя. Нет конфигурации, чтобы это ограничить.

```shell
openssl x509 -noout -text -in  client-cert.pem
```
```
Certificate:
...
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:localhost, IP Address:0:0:0:0:0:0:0:1, email:email@localhost
            X509v3 Extended Key Usage:
                TLS Web Client Authentication
...
```

Конфигурация для авторизации этого пользователя будет такой:

```
authorization {
  users = [
    {user: "email@localhost"}
  ]
}
```

Используйте синтаксис [RFC 2253 Distinguished Names](https://tools.ietf.org/html/rfc2253), чтобы указать пользователя, соответствующего subject сертификата:

```shell
openssl x509 -noout -text -in client-cert.pem
```
```
Certificate:
    Data:
...
        Subject: O=mkcert development certificate, OU=testuser@MacBook-Pro.local (Test User)
...
```

> Примечание: чтобы этот пример работал, нужно изменить пользователя так, чтобы он соответствовал subject вашего сертификата. При этом учитывайте порядок атрибутов!

Конфигурация для авторизации этого пользователя будет такой:

```
authorization {
  users = [
    {user: "OU=testuser@MacBook-Pro.local (Test User),O=mkcert development certificate"}
  ]
}
```

## Таймаут TLS

[Таймаут TLS](/running-a-nats-service/configuration/securing_nats/tls.md#tls-timeout) описан здесь.
