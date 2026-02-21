# Основы

NSC позволяет управлять идентичностями. Идентичности представлены в виде _nkeys_. Nkeys — это система подписи на публичных ключах на базе Ed25519 для экосистемы NATS.

Идентичности nkey связаны с конфигурацией NATS через JSON Web Token (JWT). JWT подписывается приватным ключом эмитента, формируя цепочку доверия. Инструмент `nsc` создает и управляет этими идентичностями и позволяет развернуть их на JWT account server, который, в свою очередь, делает конфигурации доступными для nats-server.

Существует логическая иерархия сущностей:

* `Operators` отвечают за запуск nats-server и выпуск account JWT. Операторы задают лимиты аккаунта: число соединений, лимиты данных и т. п.
* `Accounts` отвечают за выпуск user JWT. Аккаунт определяет потоки и сервисы, которые можно экспортировать в другие аккаунты. Аналогично, аккаунты импортируют потоки и сервисы из других аккаунтов.
* `Users` выпускаются аккаунтом и кодируют лимиты использования и авторизации в пространстве subjects аккаунта.

NSC позволяет создавать, редактировать и удалять эти сущности и является центральным инструментом для всех конфигураций на базе аккаунтов.

В этом руководстве вы пройдете end‑to‑end через несколько сценариев конфигурации:

* Генерация NKey‑идентичностей и связанных JWT
* Публикация JWT для доступа nats-server
* Настройка nats-server на использование JWT

Пройдем процесс создания идентичностей и JWT.

## Создание Operator, Account и User

Создадим оператора `MyOperator`.

_Есть дополнительный флаг `--sys`, который настраивает системный аккаунт, необходимый для взаимодействия с NATS server. Вы можете создать и настроить системный аккаунт позже._

```bash
nsc add operator MyOperator
```
```text
[ OK ] generated and stored operator key "ODSWWTKZLRDFBPXNMNAY7XB2BIJ45SV756BHUT7GX6JQH6W7AHVAFX6C"
[ OK ] added operator "MyOperator"
[ OK ] When running your own nats-server, make sure they run at least version 2.2.0
```

Команда сгенерировала NKEY для оператора и безопасно сохранила приватный ключ в keystore.

Добавим service URL оператору. Service URL указывает, где слушает nats-server. Инструменты вроде `nsc` могут использовать эту конфигурацию:

```bash
nsc edit operator --service-url nats://localhost:4222
```
```text
[ OK ] added service url "nats://localhost:4222"
[ OK ] edited operator "MyOperator"
```

Создать аккаунт так же просто:

```bash
nsc add account MyAccount
```
```text
[ OK ] generated and stored account key "AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY"
[ OK ] added account "MyAccount"
```

Инструмент сгенерировал NKEY, представляющий аккаунт, и сохранил приватный ключ в keystore.

Наконец, создадим пользователя:

```bash
nsc add user MyUser
```
```text
[ OK ] generated and stored user key "UAWBXLSZVZHNDIURY52F6WETFCFZLXYUEFJAHRXDW7D2K4445IY4BVXP"
[ OK ] generated user creds file `~/.nkeys/creds/MyOperator/MyAccount/MyUser.creds`
[ OK ] added user "MyUser" to account "MyAccount"
```

Как и ожидалось, инструмент сгенерировал NKEY для пользователя и сохранил приватный ключ в keystore. Кроме того, был создан файл _credentials_. Он содержит JWT пользователя и приватный ключ пользователя. Credentials‑файлы используются клиентами NATS для идентификации в системе. Клиент извлекает и предъявляет JWT серверу NATS, а приватный ключ используется для подтверждения идентичности.

### Активы NSC

NSC управляет тремя директориями:

* Домашняя директория nsc, где хранится связанная с nsc информация. По умолчанию это `~/.nsc`, можно изменить через переменную окружения `$NSC_HOME`.
* Директория _nkeys_, где хранятся все приватные ключи. По умолчанию `~/.nkeys`, можно изменить через `$NKEYS_PATH`. Содержимое nkeys следует считать секретами.
* Директория _stores_, содержащая JWT разных сущностей. Она находится в `$NSC_HOME/nats` и может быть изменена командой `nsc env -s <dir>`. Директорию stores можно хранить в системе контроля версий. JWT сами по себе не содержат секретов.

#### Директория NSC Stores

Stores содержит набор директорий, каждая названа по оператору и включает все аккаунты и пользователей:

```bash
tree ~/.nsc/nats
```
```text
/Users/myusername/.nsc/nats
└── MyOperator
    ├── MyOperator.jwt
    └── accounts
        └── MyAccount
            ├── MyAccount.jwt
            └── users
                └── MyUser.jwt
```

Эти JWT — те же артефакты, которые серверы NATS используют для проверки валидности аккаунта, его лимитов и JWT, предъявляемых клиентами при подключении.

#### Директория NKEYS

Директория nkeys содержит все приватные ключи и credentials‑файлы. Как упоминалось выше, необходимо обеспечивать безопасность этих файлов.

Структура директории keys машинно‑дружелюбна. Все ключи шардируются по типу: `O` для операторов, `A` для аккаунтов, `U` для пользователей. Эти префиксы также являются частью публичного ключа. Вторая и третья буквы публичного ключа используются для создания директорий, где хранятся ключи с похожими именами.

```shell
tree ~/.nkeys
```
```text
/Users/myusername/.nkeys
├── creds
│   └── MyOperator
│       └── MyAccount
│           └── MyUser.creds
└── keys
    ├── A
    │   └── DE
    │       └── ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE.nk
    ├── O
    │   └── AF
    │       └── OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG.nk
    └── U
        └── DB
            └── UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7.nk
```

Файлы `nk` названы полным публичным ключом и содержат одну строку — приватный ключ:

```bash
cat ~/.nkeys/keys/U/DB/UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7.nk 
```
```text
SUAG35IAY2EF5DOZRV6MUSOFDGJ6O2BQCZHSRPLIK6J3GVCX366BFAYSNA
```

Приватные ключи закодированы строкой и всегда начинаются с `S` — _seed_. Вторая буква указывает тип ключа: `O` для операторов, `A` для аккаунтов, `U` для пользователей.

Кроме ключей, директория nkeys содержит директорию `creds`. Она организована удобно для человека и хранит credentials‑файлы пользователей. Credentials‑файл содержит копию JWT пользователя и приватный ключ пользователя. Эти файлы используются клиентами NATS при подключении к серверу:

```bash
cat ~/.nkeys/creds/MyOperator/MyAccount/MyUser.creds
```
```text
-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI0NUc3MkhIQUVCRFBQV05ZWktMTUhQNUFYWFRSSUVDQlNVQUI2VDZRUjdVM1JZUFZaM05BIiwiaWF0IjoxNjM1Mzc1NTYxLCJpc3MiOiJBRDJNMzRXQk5HUUZZSzM3SURYNTNEUFJHNzRSTExUN0ZGV0JPQk1CVVhNQVZCQ1ZBVTVWS1dJWSIsIm5hbWUiOiJNeVVzZXIiLCJzdWIiOiJVQVdCWExTWlZaSE5ESVVSWTUyRjZXRVRGQ0ZaTFhZVUVGSkFIUlhEVzdEMks0NDQ1SVk0QlZYUCIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fSwic3VicyI6LTEsImRhdGEiOi0xLCJwYXlsb2FkIjotMSwidHlwZSI6InVzZXIiLCJ2ZXJzaW9uIjoyfX0.CGymhGYHfdZyhUeucxNs9TthSjy_27LVZikqxvm-pPLili8KNe1xyOVnk_w-xPWdrCx_t3Se2lgXmoy3wBcVCw
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAP2AY6UAWHOXJBWDNRNKJ2DHNC5VA2DFJZTF6C6PMLKUCOS2H2E2BA2E
------END USER NKEY SEED------

*************************************************************
```

### Список ключей

Вы можете посмотреть текущие сущности так:

```bash
nsc list keys
```
```text
+----------------------------------------------------------------------------------------------+
|                                             Keys                                             |
+------------+----------------------------------------------------------+-------------+--------+
| Entity     | Key                                                      | Signing Key | Stored |
+------------+----------------------------------------------------------+-------------+--------+
| MyOperator | ODSWWTKZLRDFBPXNMNAY7XB2BIJ45SV756BHUT7GX6JQH6W7AHVAFX6C |             | *      |
|  MyAccount | AD2M34WBNGQFYK37IDX53DPRG74RLLT7FFWBOBMBUXMAVBCVAU5VKWIY |             | *      |
|   MyUser   | UAWBXLSZVZHNDIURY52F6WETFCFZLXYUEFJAHRXDW7D2K4445IY4BVXP |             | *      |
+------------+----------------------------------------------------------+-------------+--------+
```

Имена сущностей указаны вместе с их публичным ключом и признаком хранения. Stored keys — те, что находятся в директории nkeys.

В некоторых случаях может понадобиться посмотреть приватные ключи:

```shell
nsc list keys --show-seeds
```
```text
+---------------------------------------------------------------------------------------+
|                                      Seeds Keys                                       |
+------------+------------------------------------------------------------+-------------+
| Entity     | Private Key                                                | Signing Key |
+------------+------------------------------------------------------------+-------------+
| MyOperator | SOAJ3JDZBE6JKJO277CQP5RIAA7I7HBI44RDCMTIV3TQRYQX35OTXSMHAE |             |
|  MyAccount | SAAACXWSQIKJ4L2SEAUZJR3BCNSRCN32V5UJSABCSEP35Q7LQRPV6F4JPI |             |
|   MyUser   | SUAP2AY6UAWHOXJBWDNRNKJ2DHNC5VA2DFJZTF6C6PMLKUCOS2H2E2BA2E |             |
+------------+------------------------------------------------------------+-------------+
[ ! ] seed is not stored
[ERR] error reading seed
```
