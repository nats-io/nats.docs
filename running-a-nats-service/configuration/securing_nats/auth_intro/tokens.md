# Tokens

Токен‑аутентификация — это строка, которая при передаче клиентом позволяет подключиться. Это самый простой способ аутентификации, предоставляемый сервером NATS.

Чтобы использовать токен‑аутентификацию, укажите раздел `authorization` со свойством `token`:

```text
authorization {
    token: "s3cr3t"
}
```

Токен‑аутентификацию можно использовать в разделе authorization для клиентов и кластеров.

Или запустите сервер с флагом `--auth`:

```shell
nats-server --auth s3cr3t
```

Клиент может подключиться, указав URL сервера:

```shell
nats sub -s nats://s3cr3t@localhost:4222 ">"
```

## Bcrypted Tokens

Токены можно bcrypt‑ить, добавляя дополнительный уровень безопасности, так как открытая версия токена не будет храниться в конфигурационном файле сервера.

Bcrypted токены и пароли можно генерировать с помощью инструмента [`nats`](../../../../using-nats/nats-tools/nats_cli/):

```shell
nats server passwd
```
```text
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$PWIFAL8RsWyGI3jVZtO9Nu8.6jOxzxfZo7c/W0eLk017hjgUKWrhy
```

Простой конфигурационный файл:

```text
authorization {
    token: "$2a$11$PWIFAL8RsWyGI3jVZtO9Nu8.6jOxzxfZo7c/W0eLk017hjgUKWrhy"
}
```

Клиенту все равно нужен токен в открытом виде для подключения:

```shell
nats sub -s nats://dag0HTXl4RGg7dXdaJwbC8@localhost:4222 ">"
```
