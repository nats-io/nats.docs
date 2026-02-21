# Системные события и руководство по децентрализованному JWT

## Включение системных событий при децентрализованной аутентификации/авторизации

Чтобы включить и получать системные события, нужно:

- Создать Operator, Account и User
- Запустить NATS Account Server (или Memory Resolver)

### Создать Operator, Account, User

Создадим оператора, системный аккаунт и пользователя системного аккаунта:

```shell
nsc add operator -n SAOP
```
```text
Generated operator key - private key stored "~/.nkeys/SAOP/SAOP.nk"
Success! - added operator "SAOP"
```

Добавим системный аккаунт

```shell
nsc add account -n SYS
```
```text
Generated account key - private key stored "~/.nkeys/SAOP/accounts/SYS/SYS.nk"
Success! - added account "SYS"
```

Добавим пользователя системного аккаунта

```shell
nsc add user -n SYSU
```
```text
Generated user key - private key stored "~/.nkeys/SAOP/accounts/SYS/users/SYSU.nk"
Generated user creds file "~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds"
Success! - added user "SYSU" to "SYS"
```

По умолчанию operator JWT можно найти в `~/.nsc/nats/<operator_name>/<operator.name>.jwt`.

### NATS Account Server

Чтобы выдавать учетные данные для `nats-server`, используем [nats-account-server](../../../legacy/nas/). Запустим nats-account-server для раздачи JWT‑учетных данных:

```shell
nats-account-server -nsc ~/.nsc/nats/SAOP
```

По умолчанию сервер будет выдавать JWT‑конфигурации по endpoint: `http(s)://<server_url>/jwt/v1/accounts/`.

### Конфигурация NATS Server

В конфигурации сервера нужно указать:

- operator JWT — (`~/.nsc/nats/<operator_name>/<operator.name>.jwt`)
- URL, по которому сервер может разрешать аккаунты — (`http://localhost:9090/jwt/v1/accounts/`)
- публичный ключ `system_account`

Единственное, чего у нас нет «под рукой», — публичный ключ системного аккаунта. Его легко получить:

```shell
nsc list accounts
```

```text
╭─────────────────────────────────────────────────────────────────╮
│                            Accounts                             │
├──────┬──────────────────────────────────────────────────────────┤
│ Name │ Public Key                                               │
├──────┼──────────────────────────────────────────────────────────┤
│ SYS  │ ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF │
╰──────┴──────────────────────────────────────────────────────────╯
```

Так как у сервера есть дополнительные реализации resolver, URL сервера нужно обрамлять как: `URL(<url>)`.

Создадим конфигурацию сервера со следующим содержимым и сохраним в `server.conf`:

```text
operator: /Users/synadia/.nsc/nats/SAOP/SAOP.jwt
system_account: ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

Запустим nats-server:

```shell
nats-server -c server.conf
```

## Просмотр событий сервера

Добавим подписчика на все события, публикуемые системным аккаунтом:

```shell
nats sub --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds ">"
```

Очень быстро мы начнем получать сообщения от сервера по мере их публикации. Как и ожидалось, это просто JSON, так что их легко смотреть даже простой командой `nats sub`.

Чтобы увидеть обновление аккаунта:

```shell
nats pub --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds foo bar
```

Подписчик выведет сообщения о подключении и отключении:

```json
{
  "server": {
    "host": "0.0.0.0",
    "id": "NBTGVY3OKDKEAJPUXRHZLKBCRH3LWCKZ6ZXTAJRS2RMYN3PMDRMUZWPR",
    "ver": "2.0.0-RC5",
    "seq": 32,
    "time": "2019-05-03T14:53:15.455266-05:00"
  },
  "acc": "ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF",
  "conns": 1,
  "total_conns": 1
}
{
  "server": {
    "host": "0.0.0.0",
    "id": "NBTGVY3OKDKEAJPUXRHZLKBCRH3LWCKZ6ZXTAJRS2RMYN3PMDRMUZWPR",
    "ver": "2.0.0-RC5",
    "seq": 33,
    "time": "2019-05-03T14:53:15.455304-05:00"
  },
  "client": {
    "start": "2019-05-03T14:53:15.453824-05:00",
    "host": "127.0.0.1",
    "id": 6,
    "acc": "ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF",
    "user": "UACPEXCAZEYWZK4O52MEGWGK4BH3OSGYM3P3C3F3LF2NGNZUS24IVG36",
    "name": "NATS Sample Publisher",
    "lang": "go",
    "ver": "1.7.0",
    "stop": "2019-05-03T14:53:15.45526-05:00"
  },
  "sent": {
    "msgs": 1,
    "bytes": 3
  },
  "received": {
    "msgs": 0,
    "bytes": 0
  },
  "reason": "Client Closed"
}
```

## Пользовательские сервисы

### `$SYS.REQ.USER.INFO` — запрос информации о подключенном пользователе

Для активного соединения можно получить базовую информацию о пользователе, включая имя аккаунта, права и срок действия (если применимо). Обратите внимание: это работает для любого подключенного пользователя, не только для пользователя системного аккаунта.

```shell
nats request --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds $SYS.REQ.USER.INFO ""
```

```text
Published [$SYS.REQ.USER.INFO] : ''
Received  [_INBOX.DQD44ugVt0O4Ur3pWIOOD1.WQOBevoq] : '{
  "user": "UACPEXCAZEYWZK4O52MEGWGK4BH3OSGYM3P3C3F3LF2NGNZUS24IVG36",
  "account": "ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF"
```

<a id="system-services"></a>
## Системные сервисы

### `$SYS.REQ.SERVER.PING.IDZ` — обнаружение серверов

Чтобы найти серверы в кластере и получить их ID и имя, опубликуйте запрос на `$SYS.REQ.SERVER.PING.IDZ`.

```shell
nats request --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds $SYS.REQ.SERVER.PING.IDZ ""
```

```text
Published [$SYS.REQ.SERVER.PING.IDZ] : ''
Received  [_INBOX.DQD44ugVt0O4Ur3pWIOOD1.WQOBevoq] : '{
  "host": "0.0.0.0",
  "id": "NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL",
  "name": "n1"
```

### `$SYS.REQ.SERVER.PING` — обнаружение серверов и статистика

Чтобы обнаружить серверы в кластере и получить краткую сводку состояния, опубликуйте запрос на `$SYS.REQ.SERVER.PING`. Обратите внимание: хотя ниже используется `nats-req`, будет выведен только первый ответ на запрос. Пример легко модифицировать, чтобы ждать отсутствие дополнительных ответов в течение заданного времени и таким образом собрать все ответы.

```shell
nats request --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds $SYS.REQ.SERVER.PING ""
```

```text
Published [$SYS.REQ.SERVER.PING] : ''
Received  [_INBOX.G5mbsf0k7l7nb4eWHa7GTT.omklmvnm] : '{
  "server": {
    "host": "0.0.0.0",
    "id": "NCZQDUX77OSSTGN2ESEOCP4X7GISMARX3H4DBGZBY34VLAI4TQEPK6P6",
    "ver": "2.0.0-RC9",
    "seq": 47,
    "time": "2019-05-02T14:02:46.402166-05:00"
  },
  "statsz": {
    "start": "2019-05-02T13:41:01.113179-05:00",
    "mem": 12922880,
    "cores": 20,
    "cpu": 0,
    "connections": 2,
    "total_connections": 2,
    "active_accounts": 1,
    "subscriptions": 10,
    "sent": {
      "msgs": 7,
      "bytes": 2761
    },
    "received": {
      "msgs": 0,
      "bytes": 0
    },
    "slow_consumers": 0
```

### `$SYS.REQ.SERVER.<id>.STATSZ` — запрос сводки статистики сервера

Если известен id конкретного сервера (например, из ответа на `$SYS.REQ.SERVER.PING`), можно запросить у него информацию о состоянии:

```shell
nats request --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds $SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.STATSZ ""
```

```text
Published [$SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.STATSZ] : ''
Received  [_INBOX.DQD44ugVt0O4Ur3pWIOOD1.WQOBevoq] : '{
  "server": {
    "host": "0.0.0.0",
    "id": "NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL",
    "ver": "2.0.0-RC5",
    "seq": 25,
    "time": "2019-05-03T14:34:02.066077-05:00"
  },
  "statsz": {
    "start": "2019-05-03T14:32:19.969037-05:00",
    "mem": 11874304,
    "cores": 20,
    "cpu": 0,
    "connections": 2,
    "total_connections": 4,
    "active_accounts": 1,
    "subscriptions": 10,
    "sent": {
      "msgs": 26,
      "bytes": 9096
    },
    "received": {
      "msgs": 2,
      "bytes": 0
    },
    "slow_consumers": 0
```

### `$SYS.REQ.SERVER.<id>.PROFILEZ` — запрос профилировочной информации

Если профилирование включено для сервера, этот сервис позволяет запрашивать его. В payload запроса нужно указать имя профиля и опциональный уровень debug, например:

- `allocs` - 0, 1
- `block` - 0
- `goroutine` - 0, 1, 2
- `heap` - 0, 1
- `mutex` - 0
- `threadcount` - 0

```shell
nats request --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds $SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.PROFILEZ '{"name": "heap", "debug": 1}'
```

```text
Published [$SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.PROFILEZ] : '{
  "name": "heap",
  "debug": 1
}'
Received  [_INBOX.DQD44ugVt0O4Ur3pWIOOD1.WQOBevoq] : '{
  "profile": "<base64-encoded profile output>"
}'
```

### `$SYS.REQ.SERVER.<id>.RELOAD` — горячая перезагрузка конфигурации

Отправка запроса к этому сервису попытается выполнить горячую перезагрузку конфигурации сервера, аналогично `nats-server --signal reload`. Если в новой конфигурации есть ошибки, они вернутся в поле `error` ответа.

```shell
nats request --creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds $SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.RELOAD ''
```

```text
Published [$SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.RELOAD] : ''
Received  [_INBOX.DQD44ugVt0O4Ur3pWIOOD1.WQOBevoq] : '{
  "server": {
    "host": "0.0.0.0",
    "id": "NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL",
    "ver": "2.10.0-RC5",
    "seq": 25,
    "time": "2023-09-19T14:34:02.066077-04:00"
  }
}'
```
