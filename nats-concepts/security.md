# Безопасность

В NATS есть множество функций безопасности:

* Соединения могут быть [_зашифрованы_ с TLS](/running-a-nats-service/configuration/securing_nats/tls.md)
* Клиентские подключения могут быть [_аутентифицированы_](../running-a-nats-service/configuration/securing_nats/auth_intro/) разными способами:
  * [Аутентификация по токену](../running-a-nats-service/configuration/securing_nats/auth_intro/tokens.md)
  * [Учетные данные имя пользователя/пароль](../running-a-nats-service/configuration/securing_nats/auth_intro/username_password.md)
  * [TLS‑сертификат](../running-a-nats-service/configuration/securing_nats/auth_intro/tls_mutual_auth.md)
  * [NKEY с challenge](../running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth.md)
  * [Децентрализованная аутентификация/авторизация JWT](../running-a-nats-service/configuration/securing_nats/jwt/)
  * Вы также можете интегрировать NATS с вашей существующей системой аутентификации/авторизации или создать собственную аутентификацию с помощью [Auth callout](../running-a-nats-service/configuration/securing_nats/auth_callout.md)
* Аутентифицированные клиенты идентифицируются как пользователи и имеют набор [_прав_](../running-a-nats-service/configuration/securing_nats/authorization.md)

Вы можете использовать [accounts](../running-a-nats-service/configuration/securing_nats/accounts.md) для мультиарендности: каждый аккаунт имеет собственное независимое «пространство имен subjects», и вы контролируете импорт/экспорт как потоков сообщений, так и сервисов между аккаунтами, а также любое количество пользователей, под которыми могут аутентифицироваться клиентские приложения. Subjects или wildcard‑subjects, на которые пользователь может публиковать и/или подписываться, можно контролировать либо через конфигурацию сервера, либо как часть подписанных JWT.

Администрирование JWT‑аутентификации/авторизации децентрализовано: каждый владелец приватного ключа аккаунта может управлять своими пользователями и их правами самостоятельно, без необходимости менять конфигурацию серверов NATS, выпуская собственные JWT и распределяя их пользователям. Серверу NATS не нужно хранить приватные ключи пользователей, так как ему достаточно проверять цепочку доверия подписей, содержащуюся в JWT пользователя, который предъявляет клиентское приложение, чтобы убедиться в наличии корректного публичного ключа пользователя.

Слой персистентности JetStream также предоставляет [шифрование данных на диске](../running-a-nats-service/nats_admin/jetstream_admin/encryption_at_rest.md).
