# nats

Утилита командной строки для взаимодействия и управления NATS.

Эта утилита заменяет ряд старых инструментов вида `nats-sub` и `nats-pub`, добавляет новые возможности и поддерживает полноценное управление JetStream.

Подробности в репозитории: [github.com/nats-io/natscli](https://github.com/nats-io/natscli).

## Установка `nats`

См. [раздел установки в readme](https://github.com/nats-io/natscli?tab=readme-ov-file#installation).

О политиках выполнения можно прочитать [здесь](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies).

Бинарники также доступны в [GitHub Releases](https://github.com/nats-io/natscli/releases).

## Использование `nats`

### Получение помощи

* [README по NATS Command Line Interface](https://github.com/nats-io/natscli#readme)
* `nats help`
* `nats help [<command>...]` или `nats [<command>...] --help`
* Не забудьте про cheat sheets:
  * `nats cheat`
  * `nats cheat --sections`
  * `nats cheat <section>>`

### Взаимодействие с NATS

* `nats context`
* `nats account`
* `nats pub`
* `nats sub`
* `nats request`
* `nats reply`
* `nats bench`

### Мониторинг NATS

* `nats events`
* `nats rtt`
* `nats server`
* `nats latency`
* `nats governor`

### Управление и взаимодействие с потоками

* `nats stream`
* `nats consumer`
* `nats backup`
* `nats restore`

### Управление и взаимодействие с K/V Store

* `nats kv`

### Получение справочной информации

* `nats errors`
* `nats schema`

## Контексты конфигурации

CLI имеет набор настроек, которые можно передавать как аргументы командной строки или задавать через переменные окружения.

```shell
nats --help
```

Фрагмент вывода:

```
...
  -s, --server=URL              NATS server urls ($NATS_URL)
      --user=USER               Username or Token ($NATS_USER)
      --password=PASSWORD       Password ($NATS_PASSWORD)
      --creds=FILE              User credentials ($NATS_CREDS)
      --nkey=FILE               User NKEY ($NATS_NKEY)
      --tlscert=FILE            TLS public certificate ($NATS_CERT)
      --tlskey=FILE             TLS private key ($NATS_KEY)
      --tlsca=FILE              TLS certificate authority chain ($NATS_CA)
      --socks-proxy=PROXY       SOCKS5 proxy for connecting to NATS server
                                ($NATS_SOCKS_PROXY)
      --colors=SCHEME           Sets a color scheme to use ($NATS_COLOR)
      --timeout=DURATION        Time to wait on responses from NATS
                                ($NATS_TIMEOUT)
      --context=NAME            Configuration context ($NATS_CONTEXT)
...
```

URL сервера можно задать через флаг CLI `--server`, либо через переменную окружения `NATS_URL`, либо через [NATS Contexts](./#nats-contexts).

Пароль можно задать через флаг CLI `--password`, через переменную окружения `NATS_PASSWORD` или через [NATS Contexts](./#nats-contexts). Например, если вы хотите создать скрипт, который попросит у пользователя пароль системного пользователя (чтобы он не попадал в `ps` или `history` или не сохранялся в профиле), и затем выполнить одну или несколько команд `nats`, можно сделать так:

```shell
#!/bin/bash
echo "-n" "system user password: "
read -s NATS_PASSWORD
export NATS_PASSWORD
nats server report jetstream --user system
```

### NATS Contexts

Context — это именованная конфигурация, которая хранит все эти настройки. Можно назначить контекст по умолчанию и переключаться между контекстами.

Context можно создать командой `nats context create my_context_name` и затем изменить через `nats context edit my_context_name`:

```json
{
  "description": "",
  "url": "nats://127.0.0.1:4222",
  "token": "",
  "user": "",
  "password": "",
  "creds": "",
  "nkey": "",
  "cert": "",
  "key": "",
  "ca": "",
  "nsc": "",
  "jetstream_domain": "",
  "jetstream_api_prefix": "",
  "jetstream_event_prefix": "",
  "inbox_prefix": "",
  "user_jwt": ""
}
```

Этот context хранится в файле `~/.config/nats/context/my_context_name.json`.

Context также можно создать, указав настройки через `nats context save`.

```shell
nats context save example --server nats://nats.example.net:4222 --description 'Example.Net Server'
nats context save local --server nats://localhost:4222 --description 'Local Host' --select 
```

Список контекстов:

```shell
nats context ls
```

```
Known contexts:

   example             Example.Net Server
   local*              Local Host
```

Мы передали `--select` для `local`, значит он будет по умолчанию, если ничего не задано.

Выбрать контекст:

```shell
nats context select
```

Проверить round‑trip time до сервера (используя текущий контекст):

```shell
nats rtt
```

```
nats://localhost:4222:

   nats://127.0.0.1:4222: 245.115µs
       nats://[::1]:4222: 390.239µs
```

Можно указать контекст напрямую:

```shell
nats rtt --context example
```

```
nats://nats.example.net:4222:

   nats://192.0.2.10:4222: 41.560815ms
   nats://192.0.2.11:4222: 41.486609ms
   nats://192.0.2.12:4222: 41.178009ms
```

Все команды `nats` знают о контекстах, а команда `nats context` имеет команды для просмотра, редактирования и удаления контекстов.

URL серверов и пути к credentials могут быть получены через `nsc`, указав URL, например чтобы найти пользователя `new` в аккаунте `orders` оператора `acme`, можно использовать:

```shell
nats context save example --description 'Example.Net Server' --nsc nsc://acme/orders/new
```

Теперь список серверов и путь к credentials будут разрешаться через `nsc`. Если они явно заданы в context, конкретная конфигурация контекста имеет приоритет.

## Генерация bcrypted паролей

Сервер поддерживает хеширование паролей и токенов аутентификации с помощью `bcrypt`. Чтобы использовать это, замените plaintext‑пароль в конфигурации на его `bcrypt`‑хеш, и сервер автоматически использует `bcrypt` по мере необходимости. См. также: [Bcrypted Passwords](../../../running-a-nats-service/configuration/securing_nats/auth_intro/username\_password.md#bcrypted-passwords).
