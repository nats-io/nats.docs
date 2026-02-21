# Подробное руководство по JWT

Этот документ — пошаговый глубокий разбор использования JWT в NATS. Начав с связанных концепций, он познакомит с JWT и тем, как их можно использовать в NATS. Здесь НЕ будут перечислены все опции JWT/nsc — мы сосредоточимся на важных опциях и концепциях.

* [Концепции](jwt.md#concepts)
  * [Что такое Accounts?](jwt.md#what-are-accounts)
    * [Ключевые выводы](jwt.md#key-takeaways)
  * [Что такое NKEYs?](jwt.md#what-are-nkeys)
    * [Ключевые выводы](jwt.md#key-takeaways-1)
* [JSON Web Tokens (JWT)](jwt.md#json-web-tokens-jwt)
  * [Зачем нужен JWT](jwt.md#motivation-for-jwt)
    * [Ключевые выводы](jwt.md#key-takeaways-2)
  * [Децентрализованная аутентификация/авторизация с JWT](jwt.md#decentralized-authentication-authorization-using-jwt)
    * [Ключевые выводы](jwt.md#key-takeaways-3)
  * [Иерархия JWT в NATS](jwt.md#nats-jwt-hierarchy)
    * [Децентрализованная цепочка доверия](jwt.md#decentralized-chain-of-trust)
      * [Получение JWT аккаунта](jwt.md#obtain-an-account-jwt)
      * [JWT и проверка цепочки доверия](jwt.md#jwt-and-chain-of-trust-verification)
      * [Получение JWT пользователя — подключение клиента](jwt.md#obtain-a-user-jwt-client-connect)
    * [Ключевые выводы](jwt.md#key-takeaways-4)
  * [Модели развертывания, возможные благодаря цепочке доверия](jwt.md#deployment-models-enabled-by-chain-of-trust)
    * [Ключевые выводы](jwt.md#key-takeaways-5)
* [Повторно об Accounts](jwt.md#accounts-re-visited)
  * [Ключевые выводы](jwt.md#key-takeaways-6)
* [Инструменты и управление ключами](jwt.md#tooling-and-key-management)
  * [nsc](jwt.md#nsc)
    * [Окружение](jwt.md#environment)
      * [Резервное копирование](jwt.md#backup)
        * [Каталог хранилища NKEYS](jwt.md#nkeys-store-directory)
        * [Каталог хранилища JWT](jwt.md#jwt-store-directory)
      * [Имена в JWT](jwt.md#names-in-jwt)
    * [Настройка оператора](jwt.md#setup-an-operator)
      * [Создание/редактирование оператора — операторское окружение — все режимы развертывания](jwt.md#create-edit-operator)
      * [Импорт оператора — не‑операторское/админское окружение — децентрализованные/самообслуживание](jwt.md#import-operator-nonoperator)
      * [Импорт оператора — окружения самообслуживания](jwt.md#import-operator-self-service)
    * [Настройка аккаунта](jwt.md#setup-an-account)
      * [Создание/редактирование аккаунта — все окружения — все режимы развертывания](jwt.md#create-edit-account)
      * [Экспорт аккаунта — не‑операторское/админское окружение — децентрализованные режимы развертывания](jwt.md#export-account-decentralized-deployment-modes)
      * [Экспорт аккаунта — не‑операторское/админское окружение — режимы самообслуживания](jwt.md#export-account-non-operator-administrator-environment-self-service-deployment-modes)
    * [Публикация аккаунта через Push — операторское окружение/окружение с правами push — все режимы](jwt.md#publicize-an-account-with-push)
      * [Пример настройки nats-resolver и push — операторское окружение/окружение с правами push — все режимы](jwt.md#nats-resolver-setup-and-push-example)
    * [Настройка пользователя](jwt.md#setup-user)
      * [Создание/редактирование аккаунта — все окружения — все режимы развертывания](jwt.md#create-edit-account-all-environments)
  * [Автоматизированные сервисы регистрации — библиотеки JWT и NKEY](jwt.md#automated-sign-up-services-jwt-and-nkey-libraries)
    * [Простое создание пользователя](jwt.md#simple-user-creation)
      * [Создание пользовательского NKEY](jwt.md#create-user-nkey)
      * [Создание пользовательского JWT](jwt.md#create-user-jwt)
      * [Распределенное создание пользователей](jwt.md#distributed-user-creation)
    * [Создание пользователей через NATS](jwt.md#user-creation-using-nats)
      * [Простая настройка](jwt.md#straight-forward-setup)
      * [Настройка на базе аккаунта](jwt.md#account-based-setup)
    * [Штамповка JWT на языках, отличных от Go](jwt.md#stamping-jwt-in-languages-other-than-go)
  * [Системный аккаунт](jwt.md#system-account)
    * [Event Subjects](jwt.md#event-subjects)
    * [Service Subjects](jwt.md#service-subjects)
      * [Subjects, доступные всегда](jwt.md#subjects-always-available)
      * [Subjects, доступные при использовании NATS‑based resolver](jwt.md#subjects-available-when-using-nats-based-resolver)
      * [Старые Subjects](jwt.md#old-subjects)
    * [Leaf Node соединения — исходящие](jwt.md#leaf-node-connections-outgoing)
      * [Non-Operator режим](jwt.md#non-operator-mode)
      * [Operator режим](jwt.md#operator-mode)
  * [Соединение аккаунтов](jwt.md#connecting-accounts)
    * [Exports](jwt.md#exports)
    * [Imports](jwt.md#imports)
      * [Import Subjects](jwt.md#import-subjects)
      * [Import Remapping](jwt.md#import-remapping)
      * [Визуализация отношений Export/Import](jwt.md#visualizing-export-import-relationships)
  * [Управление ключами](jwt.md#managing-keys)
    * [Защита identity‑NKEY](jwt.md#protect-identity-nkeys)
    * [Переиздание identity‑NKEY](jwt.md#reissue-identity-nkeys)
      * [Оператор](jwt.md#operator)
      * [Аккаунт](jwt.md#account)
    * [Отзыв (revocations)](jwt.md#revocations)
      * [Пользователь](jwt.md#user)
      * [Активации](jwt.md#activations)
      * [Аккаунты](jwt.md#accounts)
      * [Signing keys](jwt.md#signing-keys)

Чтобы выполнить перечисленные примеры, установите следующее:

* nats-server: [https://github.com/nats-io/nats-server](https://github.com/nats-io/nats-server)
* nats (cli): [https://github.com/nats-io/natscli](https://github.com/nats-io/natscli)
* nk (cli & library): [https://github.com/nats-io/nkeys](https://github.com/nats-io/nkeys)
* nsc (cli): [https://github.com/nats-io/nsc](https://github.com/nats-io/nsc)
* jwt (library): [https://github.com/nats-io/jwt](https://github.com/nats-io/jwt)

> Чтобы установить `nats-server`, `nats`, `nk`, `nsc`:
> ```shell
> export GO111MODULE=on
> go install github.com/nats-io/nats-server/v2@latest
> go install github.com/nats-io/natscli/nats@latest
> go install github.com/nats-io/nkeys/nk@latest
> go install github.com/nats-io/nsc/v2@latest
> ```
> Чтобы потренироваться на примерах ниже:
>
> Сохраните конфигурацию ниже в файле, например `server.conf`, и запустите nats server так:
>
> ```shell
> nats-server -c server.conf
> ```
>
> После запуска, когда вы измените конфигурацию, можно сделать reload так:
>
> ```shell
> nats-server --signal reload
> ```
>


<a id="concepts"></a>
## Концепции

<a id="what-are-accounts"></a>
### Что такое Accounts?

Accounts — это контекст изоляции в NATS.

```
accounts: {
    A: {
        users: [{user: a, password: a}]
    },
    B: {
        users: [{user: b, password: b}]
    },
}
```

Сообщения, опубликованные в одном аккаунте, не будут получены в другом.

Подпишитесь на любые сообщения в аккаунте `a`:

```shell
nats -s nats://a:a@localhost:4222 sub ">"
```

Опубликуйте сообщение из аккаунта `b`:

```shell
nats -s nats://b:b@localhost:4222 pub "foo" "user b"
```

Заметьте, что ваш подписчик не получает это сообщение.

Теперь опубликуйте сообщение из аккаунта `a`:

```shell
nats -s nats://a:a@localhost:4222 pub "foo" "user a"
```

На этот раз сообщение получит подписчик:

```
17:57:06 [#1] Received on "foo"
user a
```

Пример выше показывает, что между пользователем `a`, связанным с аккаунтом `A`, и пользователем `b` в аккаунте `B` нет потока сообщений. Сообщения доставляются только внутри одного аккаунта — если только вы явно не определили иначе.

Ниже похожий пример, но с сообщениями, пересекающими явные границы аккаунтов.

```
accounts: {
    A: {
        users: [{user: a, password: a}]
        imports: [{stream: {account: B, subject: "foo"}}]
    },
    B: {
        users: [{user: b, password: b}]
        exports: [{stream: "foo"}]
    },
}
```

> Измените `server.conf` и выполните `nats-server --signal reload`

Подпишитесь на все сообщения как пользователь 'a'

```shell
nats -s nats://a:a@localhost:4222 sub ">"
```

Опубликуйте на 'foo' как пользователь 'b':

```shell
nats -s nats://b:b@localhost:4222 pub "foo" "user b"
```

На этот раз сообщение получит подписчик:

```
18:28:25 [#1] Received on "foo"
user b
```

Accounts гораздо мощнее, чем показано здесь. Посмотрите полную документацию по [accounts](../configuration/securing_nats/accounts.md#accounts) и [users](/running-a-nats-service/configuration/securing_nats/auth_intro), связанным с ними. Все это находится в обычном конфиг‑файле NATS. (Скопируйте конфиг выше и попробуйте: `nats-server -c <filename>`) Чтобы внести любые изменения, нужно обновить конфиги всех участвующих nats-server в одном домене безопасности. Обычно этой конфигурацией управляет одна организация или администратор.

<a id="key-takeaways"></a>
#### Ключевые выводы

* Accounts изолированы друг от друга.
* Accounts можно выборочно объединять.
* Нужно менять конфиг‑файл, чтобы добавлять/удалять/изменять accounts и
  users.
* Конфиг применяется через `nats-server
  --signal reload`.

<a id="what-are-nkeys"></a>
### Что такое NKEYs?

NKEYs — это «декорированные», Base32‑закодированные ключи Ed25519 с контрольной суммой CRC16.

Ed25519 — это:

* система цифровой подписи на публичных ключах (может подписывать и проверять подписи)
* устойчива к атакам по побочным каналам (нет условных переходов в алгоритме)

NATS server можно настроить на использование публичных NKEY в качестве пользователей (идентичностей). При подключении клиента nats-server отправляет challenge, который клиент подписывает, чтобы доказать владение соответствующим приватным ключом. Затем nats-server проверяет подпись. В отличие от схемы с паролем, секрет никогда не покидает клиента.

Чтобы было понятно, какой тип ключа вы видите в конфиге или логах, ключи «декорируются» следующим образом:

* Публичные ключи имеют префикс в один байт: `O`, `A`, `U` для различных
  типов: `O` — operator, `A` — account, `U` — user.
* Приватные ключи имеют префикс в два байта `SO`, `SA`, `SU`. `S` означает
  seed. Оставшиеся (`O`, `A`, `U`) имеют тот же смысл, что и у публичных ключей.

NKEY генерируются так:

```shell
nk -gen user -pubout > a.nk
```

Посмотреть ключ:

```shell
cat a.nk
```
```
SUAAEZYNLTEA2MDTG7L5X7QODZXYHPOI2LT2KH5I4GD6YVP24SE766EGPA
UC435ZYS52HF72E2VMQF4GO6CUJOCHDUUPEBU7XDXW5AQLIC6JZ46PO5
```

Создайте еще один ключ:

```shell
nk -gen user -pubout > b.nk
```

Посмотреть ключ:

```shell
cat b.nk
```
```
SUANS4XLL5NWBTM57GSVHLN4TMFW55WGGWNI5YXXSIOYFJQYFVNHJK5GFY
UARZVI6JAV7YMJTPRANXANOOW4K3ZCD45NYP6S7C7XKCBHPVN2TFZ7ZC
```

Замена user/password на NKEY в примере конфигурации аккаунтов:

```
accounts: {
    A: {
        users: [{nkey:UC435ZYS52HF72E2VMQF4GO6CUJOCHDUUPEBU7XDXW5AQLIC6JZ46PO5}]
        imports: [{stream: {account: B, subject: "foo"}}]
    },
    B: {
        users: [{nkey:UARZVI6JAV7YMJTPRANXANOOW4K3ZCD45NYP6S7C7XKCBHPVN2TFZ7ZC}]
        exports: [{stream: "foo"}]
    },
}
```

Простой пример:

Подпишитесь с `nats -s nats://localhost:4222 sub --nkey=a.nk ">"`

Опубликуйте сообщение с помощью `nats -s nats://localhost:4222 pub --nkey=b.nk
foo nkey` — подписчик должен получить его.

Если nats-server был запущен с трассировкой `-V`, можно увидеть подпись в сообщении `CONNECT` (форматирование добавлено вручную):

```
[95184] 2020/10/26 12:15:44.350577 [TRC] [::1]:55551 - cid:2 - <<- [CONNECT {
    "echo": true,
    "headers": true,
    "lang": "go",
    "name": "NATS CLI",
    "nkey": "UC435ZYS52HF72E2VMQF4GO6CUJOCHDUUPEBU7XDXW5AQLIC6JZ46PO5",
    "no_responders": true,
    "pedantic": false,
    "protocol": 1,
    "sig": "lopzgs98JBQYyRdw1zT_BoBpSFRDCfTvT4le5MYSKrt0IqGWZ2OXhPW1J_zo2_sBod8XaWgQc9oWohWBN0NdDg",
    "tls_required": false,
    "verbose": false,
    "version": "1.11.0"
}]
```

При подключении клиенту сразу отправляется nonce для подписи в составе сообщения `INFO` (форматирование добавлено вручную). Так как `telnet` не аутентифицируется, сервер закроет соединение после [таймаута авторизации](../configuration/securing_nats/authorization.md).

```
> telnet localhost 4222
Trying ::1...
Connected to localhost.
Escape character is '^]'.
INFO {
    "auth_required": true,
    "client_id": 3,
    "client_ip": "::1",
    "go": "go1.14.1",
    "headers": true,
    "host": "0.0.0.0",
    "max_payload": 1048576,
    "nonce": "-QPTE1Jsk8kI3rE",
    "port": 4222,
    "proto": 1,
    "server_id": "NBSHIXACRHUODC4FY2Z3OYXSZSRUBRH6VWIKQNGVPKOTA7H4YTXWJRTO",
    "server_name": "NBSHIXACRHUODC4FY2Z3OYXSZSRUBRH6VWIKQNGVPKOTA7H4YTXWJRTO",
    "version": "2.2.0-beta.26"
}
-ERR 'Authentication Timeout'
Connection closed by foreign host.
```

<a id="key-takeaways-1"></a>
#### Ключевые выводы

* NKEYS — безопасный способ аутентификации клиентов.
* Приватные ключи никогда не доступны и не хранятся на NATS server.
* Публичный ключ все равно нужно настроить в NATS server.

<a id="json-web-tokens-jwt"></a>
## Токены JSON Web (JWT)

<a id="motivation-for-jwt"></a>
### Зачем нужен JWT

В большой организации централизованный подход к конфигурации может приводить к меньшей гибкости и большему сопротивлению изменениям, если управление сосредоточено у одной сущности. Альтернативно, инфраструктуру можно разворачивать чаще (например, по командам), что усложняет отношения import/export, так как приходится связывать отдельные системы. Чтобы сделать accounts по‑настоящему мощными, их следует конфигурировать отдельно от инфраструктуры, ограничивая только лимитами. Аналогично и для пользователя. Аккаунт содержит пользователя, но эта связь также может быть ссылочной, так что изменения пользователя не меняют аккаунт. Пользователи одного аккаунта должны иметь возможность подключаться откуда угодно в той же инфраструктуре и обмениваться сообщениями, пока они в одном домене аутентификации.

<a id="key-takeaways-2"></a>
#### Ключевые выводы

* JWT разделяет конфигурацию nats-server на отдельные артефакты, управляемые разными сущностями.
* Управление Accounts, конфигурацией и Users разделяется.
* Accounts НЕ соответствуют инфраструктуре, они соответствуют командам или приложениям.
* Подключайтесь к любому кластеру в той же инфраструктуре и общайтесь со всеми пользователями вашего аккаунта.
* Инфраструктура и ее топология не связаны с Accounts и с тем, откуда подключается пользователь аккаунта.

<a id="decentralized-authentication-authorization-using-jwt"></a>
### Децентрализованная аутентификация/авторизация с JWT

Создание Account и User управляется как отдельные артефакты в децентрализованной модели с использованием NKEY. Это опирается на иерархическую цепочку доверия между тремя разными NKEY и соответствующими ролями:

1. Operator: соответствует оператору набора серверов NATS в одном домене аутентификации (вся топология, включая gateways и leaf nodes),
2. Account: соответствует набору конфигурации одного аккаунта,
3. User: соответствует конфигурации одного пользователя.

Каждый NKEY упоминается вместе с дополнительной конфигурацией в документе JWT. У каждого JWT есть поле subject, его значение — публичная часть NKEY, служащая идентичностью. Имена присутствуют в JWT, но пока используются только инструментами; `nats-server` не читает это значение. Роль указанного NKEY определяет содержимое JWT:

1. Operator JWT содержит серверную [конфигурацию](https://github.com/nats-io/jwt/blob/e11ce317263cef69619fc1ca743b195d02aa1d8a/operator_claims.go#L28),
   применимую ко всем управляемым серверам NATS,
2. Account JWT содержит специфичную для аккаунта [конфигурацию](https://github.com/nats-io/jwt/blob/e11ce317263cef69619fc1ca743b195d02aa1d8a/account_claims.go#L57),
   такую как exports, imports, limits и права по умолчанию для пользователей,
3. User JWT содержит специфичную для пользователя [конфигурацию](https://github.com/nats-io/jwt/blob/e11ce317263cef69619fc1ca743b195d02aa1d8a/user_claims.go#L25),
   такую как permissions и limits.

Кроме того, JWT могут содержать настройки, связанные с их децентрализованной природой, например истечение/отзыв/подписание. Ни в каком месте JWT не содержит приватную часть NKEY — только подписи, которые можно проверить публичными NKEY. Содержимое JWT можно считать публичным, хотя оно может раскрывать, какие subjects/limits/permissions существуют.

<a id="key-takeaways-3"></a>
#### Ключевые выводы

* JWT организованы иерархически: operator, account и user.
* Они несут соответствующую конфигурацию, которая адаптирована под децентрализованную модель использования NATS JWT.

<a id="nats-jwt-hierarchy"></a>
### Иерархия JWT в NATS

<a id="decentralized-chain-of-trust"></a>
#### Децентрализованная цепочка доверия

`nats-server` настраивается на доверие оператору. Это означает, что Operator JWT является частью конфигурации сервера и требует перезапуска или `nats-server --signal reload` после изменения конфигурации. Также сервер настраивается на получение Account JWT одним из трех способов (описаны ниже).

Клиенты предоставляют User JWT при подключении. Account JWT не используется клиентами при общении с `nats-server`. Клиенты также обладают приватным NKEY, соответствующим идентичности JWT, чтобы доказать свою личность, как описано [выше](jwt.md#what-are-nkeys).

Поле issuer в User JWT идентифицирует Account, и `nats-server` затем независимо получает текущий Account JWT из настроенного источника. Сервер проверяет, что подпись в User JWT была выпущена NKEY заявленного Account, а затем — что Account имеет issuer Operator и что NKEY Operator подписал Account JWT. Проверяется вся трехуровневая иерархия.

<a id="obtain-an-account-jwt"></a>
#### **Получение Account JWT**

Чтобы получить Account JWT, nats-server настраивается одним из трех типов [resolver](../configuration/securing_nats/jwt/resolver.md). Какой выбрать — зависит от ваших требований:

* [mem-resolver](../configuration/securing_nats/jwt/resolver.md#memory):
  Очень мало аккаунтов или они очень статичны
  * Вам комфортно менять конфиг сервера при изменении оператора или аккаунтов,
  * Вы можете программно генерировать пользователя с помощью NKEY и библиотеки JWT (подробнее позже),
  * Пользователи не обязаны быть известны nats-server.
* [url-resolver](../configuration/securing_nats/jwt/resolver.md#url-resolver):
  Очень большой объем аккаунтов
  * То же, что и `mem-resolver`, но не нужно изменять конфиги серверов при добавлении или изменении аккаунтов,
  * Изменения оператора все равно требуют перезагрузки сервера (это нужно лишь для нескольких операций),
  * Будет загружать Accounts с веб‑сервера
    * Позволяет легко публиковать Account JWT, программно генерируемые через NKEY и библиотеку JWT.
    * [`nats-account-server`](https://nats-io.gitbook.io/legacy-nats-docs/nats-account-server) — один из таких веб‑серверов. При правильной настройке он будет уведомлять `nats-server` об изменениях Account JWT.
  * В зависимости от конфигурации требуется доступ на чтение и/или запись в постоянное хранилище.
* `nats-resolver`: то же, что `url-resolver`, но использует NATS вместо http
  * Нет отдельного бинарника для запуска/настройки/мониторинга,
  * Более простая кластеризация по сравнению с `nats-account-server`. Со временем сойдется к объединению всех Account JWT, известных каждому участвующему `nats-server`,
  * Требует постоянного хранилища в виде каталога, в который `nats-server` пишет _исключительно_ сам (это может быть общий NFS, но сами каталоги не должны разделяться между серверами),
  * Опционально поддерживает прямое удаление Account JWT,
  * Между `nats-resolver` и `url-resolver`, `nats-resolver` — однозначная рекомендация.

JWT `nats-resolver` рекомендуется использовать в продакшене. С `nats-resolver` вы можете управлять большим количеством аккаунтов и пользователей без перезагрузки сервера. Но перед тем как использовать JWT `nats-resolver`, убедитесь, что вы правильно понимаете, как он работает. Можно использовать статические настройки аккаунтов (вероятно с NKEYs) и `memory-resolver` как необходимые шаги к полному пониманию `nats-resolver`.

<a id="jwt-and-chain-of-trust-verification"></a>
#### **JWT и проверка цепочки доверия**

Каждый документ JWT имеет subject (`sub`), который он представляет. Это публичная идентичность NKEY, представляемая документом JWT. Документы JWT содержат время подписи `issued at` (`iat`). Это время в секундах с Unix epoch. Оно также используется для определения, какой из двух JWT для одного subject более свежий. Кроме того, JWT имеют issuer — это может быть NKEY идентичности или выделенный signing‑NKEY элемента уровнем выше в цепочке доверия. Ключ является signing‑ключом, если он указан таковым в JWT (выше). Signing‑NKEY следуют тем же ролям, что и NKEY, и это дополнительные ключи, которые, в отличие от identity‑NKEY, могут меняться со временем. В иерархии signing‑ключи могут использоваться только для подписи JWT роли, расположенной прямо ниже. User JWT по этой причине не имеют signing‑ключей. Чтобы изменить набор signing‑ключей роли, нужно использовать identity‑NKEY.

Каждый JWT подписывается так:

```
jwt.sig = sign(hash(jwt.header + jwt.body), private-key(jwt.issuer))
(jwt.issuer is part of jwt.body)
```

Если JWT валиден, то валидируется и JWT уровнем выше. Если все они валидны, цепочка доверия проверяется сверху вниз так:

| Тип      | Правило доверия                                                                                                        | Получено               |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Operator | `jwt.issuer == jwt.subject (self signed)`                                                                              | настроено доверять     |
| Account  | `jwt.issuer == trusted issuing operator (signing/identity) key`                                                        | настроено получать     |
| User     | `jwt.issuer == trusted issuing account (signing/identity) key && jwt.issuedAt > issuing account revocations[jwt.subject]` | предоставлено при подключении |

Это концептуальный вид. Пока выполняются все эти проверки, результаты ранних вычислений могут кешироваться: если Operator/Account уже доверены и JWT не изменился, нет причин переоценивать их повторно.

Ниже примеры декодированных JWT (`iss` == `issuer`, `sub` == `subject`, `iat` == `issuedAt`):

```shell
nsc describe operator --json
```
```
{
 "iat": 1603473819,
 "iss": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
 "jti": "57BWRLW67I6JTVYMQAZQF54G2G37DJB5WG5IFIPVYI4PEYNX57ZQ",
 "name": "DEMO",
 "nats": {
  "account_server_url": "nats://localhost:4222",
  "system_account": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5"
 },
 "sub": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
 "type": "operator"
}
```

`nsc describe account -n demo-test --json`:
```
{
 "iat": 1603474600,
 "iss": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
 "jti": "CZDE4PM7MGFNYHRZSE6INTP6QDU4DSLACVHPQFA7XEYNJT6R6LLQ",
 "name": "demo-test",
 "nats": {
  "limits": {
   "conn": -1,
   "data": -1,
   "exports": -1,
   "imports": -1,
   "leaf": -1,
   "payload": -1,
   "subs": -1,
   "wildcards": true
  }
 },
 "sub": "ADKGAJU55CHYOIF5H432K2Z2ME3NPSJ5S3VY5Q42Q3OTYOCYRRG7WOWV",
 "type": "account"
}
```

`nsc describe user -a demo-test -n alpha --json`:
```
{
 "iat": 1603475001,
 "iss": "ADKGAJU55CHYOIF5H432K2Z2ME3NPSJ5S3VY5Q42Q3OTYOCYRRG7WOWV",
 "jti": "GOOPXCFDWVMEU3U6I6MT344Z56MGBYIS42GDXMUXDFA3NYDR2RUQ",
 "name": "alpha",
 "nats": {
  "pub": {},
  "sub": {}
 },
 "sub": "UC56LV5NNMP5FURQZ7HZTGWCRRTWSMHZNNELQMHDLH3DCYNGX57B2TN6",
 "type": "user"
}
>
```

<a id="obtain-a-user-jwt-client-connect"></a>
#### **Получение User JWT — подключение клиента**

При подключении клиента должны успешно выполниться шаги ниже. Используется следующая конфигурация nats-server (для простоты понимания используется url-resolver):

```
operator: ./trustedOperator.jwt
resolver: URL(http://localhost:9090/jwt/v1/accouts/)
```

1.  Клиент подключается, `nats-server` отвечает `INFO`
    ([идентично NKEYs](jwt.md#what-are-nkeys)) и содержит nonce.

    ```
     > telnet localhost 4222
     Trying 127.0.0.1...
     Connected to localhost.
     Escape character is '^]'.
     INFO {
         "auth_required": true,
         "client_id": 5,
         "client_ip": "127.0.0.1",
         "go": "go1.14.1",
         "headers": true,
         "host": "localhost",
         "max_payload": 1048576,
         "nonce": "aN9-ZtS7taDoAZk",
         "port": 4222,
         "proto": 1,
         "server_id": "NCIK6FX5MRIEPMEK22YL2ECLIWVJBH2SWFD5EQWSI5XRDQPKZXWKX3VP",
         "server_name": "NCIK6FX5MRIEPMEK22YL2ECLIWVJBH2SWFD5EQWSI5XRDQPKZXWKX3VP",
         "tls_required": true,
         "version": "2.2.0-beta.26"
     }
     Connection closed by foreign host.
    ```

    Для удобства NATS CLI использует creds‑файл, который является конкатенацией JWT и приватной пользовательской identity/NKEY.

    ```
     > cat user.creds
     -----BEGIN NATS USER JWT-----
     eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJXNkFYSFlSS1RHVTNFUklQM0dSRDdNV0FQTzQ2VzQ2Vzc3R1JNMk5SWFFIQ0VRQ0tCRjJRIiwiaWF0IjoxNjAzNDczNzg4LCJpc3MiOiJBQUFYQVVWU0dLN1RDUkhGSVJBUzRTWVhWSjc2RVdETU5YWk02QVJGR1hQN0JBU05ER0xLVTdBNSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVRE5ZMktLUFRJQVBQTk9OT0xBVE5SWlBHTVBMTkZXSFFQS1VYSjZBMllUQTQ3Tk41Vk5GSU80NSIsInR5cGUiOiJ1c2VyIiwibmF0cyI6eyJwdWIiOnt9LCJzdWIiOnt9fX0.ae3OvcapjQgbXhI2QbgIs32AWr3iBb2UFRZbXzIg0duFHNPQI5LsprR0OQoSlc2tic6e3sn8YM5x0Rt34FryDA
     ------END NATS USER JWT------

     ************************* IMPORTANT *************************
     NKEY Seed printed below can be used to sign and prove identity.
     NKEYs are sensitive and should be treated as secrets.

     -----BEGIN USER NKEY SEED-----
     SUAAZU5G7UOUR7VXQ7DBD5RQTBW54O2COGSXAVIYWVZE4GCZ5C7OCZ5JLY
     ------END USER NKEY SEED------

     *************************************************************
    ```

    ```
     > nats -s localhost:4222 "--creds=user.creds" pub "foo" "hello world"
    ```
2.  Клиент отвечает сообщением `CONNECT` (форматирование добавлено вручную), содержащим JWT и подписанный nonce. (вывод скопирован из `nats-server`, запущенного с `-V`)

    ```
     [98019] 2020/10/26 16:07:53.861612 [TRC] 127.0.0.1:56830 - cid:4 - <<- [CONNECT {
         "echo": true,
         "headers": true,
         "jwt": "eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJXNkFYSFlSS1RHVTNFUklQM0dSRDdNV0FQTzQ2VzQ2Vzc3R1JNMk5SWFFIQ0VRQ0tCRjJRIiwiaWF0IjoxNjAzNDczNzg4LCJpc3MiOiJBQUFYQVVWU0dLN1RDUkhGSVJBUzRTWVhWSjc2RVdETU5YWk02QVJGR1hQN0JBU05ER0xLVTdBNSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVRE5ZMktLUFRJQVBQTk9OT0xBVE5SWlBHTVBMTkZXSFFQS1VYSjZBMllUQTQ3Tk41Vk5GSU80NSIsInR5cGUiOiJ1c2VyIiwibmF0cyI6eyJwdWIiOnt9LCJzdWIiOnt9fX0.ae3OvcapjQgbXhI2QbgIs32AWr3iBb2UFRZbXzIg0duFHNPQI5LsprR0OQoSlc2tic6e3sn8YM5x0Rt34FryDA",
         "lang": "go",
         "name": "NATS CLI",
         "no_responders": true,
         "pedantic": false,
         "protocol": 1,
         "sig": "VirwM--xq5i2RI9VEQiFYv_6JBs-IR4oObypglR7qVxYtXDUtIKIr1qXW_M54iHFB6Afu698J_in5CfBRjuVBg",
         "tls_required": true,
         "verbose": false,
         "version": "1.11.0"
     }]
    ```
3. Сервер проверяет, что полученный JWT — это user JWT и он согласован: `sign(jwt.sig, jwt.issuer) == hash(jwt.header+jwt.body)` (issuer — часть body),
4. Сервер проверяет, что nonce соответствует JWT.subject, тем самым подтверждая владение клиентом приватным user NKEY,
5. Сервер либо знает указанный аккаунт, либо загружает его из `http://localhost:9090/jwt/v1/accouts/AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5`,
6. Сервер проверяет, что загруженный JWT — это account JWT и он согласован: `sign(jwt.sig, jwt.issuer) == hash(jwt.header+jwt.body)` (issuer — часть body),
7. Сервер проверяет, что issuer account JWT находится в списке доверенных ключей оператора (выведенных из operator JWT в конфигурации),
8. Сервер проверяет, что subject user JWT не находится в списке отозванных у аккаунта, или что поле jwt.issuedAt имеет более высокое значение,
9. Сервер проверяет, что issuer user JWT либо идентичен subject account JWT, либо входит в signing‑ключи account JWT,
10. Если все выше выполнено, вызов будет успешным только если user JWT не содержит permissions или limits, запрещающих операцию

    ```
    > nats -s localhost:4222 "--creds=user.creds" pub "foo" "hello world" 
    > 16:56:02 Published 11 bytes to "foo"
    ```
11. Вывод, если `user.creds` содержит JWT, где максимальный размер payload ограничен 5 байтами

    ```
    > nats -s localhost:4222 "--creds=user.creds" pub "foo" "hello world"
    nats: error: nats: Maximum Payload Violation, try --help
    >
    ```

<a id="key-takeaways-4"></a>
#### Ключевые выводы

* JWT безопасны,
* JWT несут конфигурацию, соответствующую их роли Operator/Account/User,
* JWT дают основу для работы одной инфраструктуры NATS, обслуживающей отдельные, но при необходимости соединенные сущности,
* Account resolver — это способ получать неизвестные Account JWT,
* При подключении клиент _предоставляет_ только **User** JWT и _использует_ NKEY из JWT для аутентификации,
* JWT можно выпускать программно.

<a id="deployment-models-enabled-by-chain-of-trust"></a>
### Модели развертывания, возможные благодаря цепочке доверия

В зависимости от того, у какой сущности есть доступ к приватным operator/account identity или signing NKEY, доступны разные модели развертывания. При выборе важно выбрать самую простую модель, которая дает нужное поведение. Все сверх этого — лишняя конфигурация и шаги.

1.  Централизованная конфигурация: один (набор) пользователь(ей) имеет доступ ко всем приватным operator и account NKEY,

    Администраторы, управляющие общей инфраструктурой, принимают все решения.
2.  Децентрализованная конфигурация (с несколькими окружениями `nsc`, объясняется позже):

    1. Администратор/Operator(ы) имеют доступ к приватным operator NKEY для подписания аккаунтов. Подписывая или не подписывая Account JWT, администраторы могут применять ограничения (например, лимиты).
    2. Другие группы пользователей (команды) имеют доступ к своим приватным account identity/signing NKEY и могут выпускать/подписывать user JWT.

    Это также может использоваться одной сущностью, чтобы не смешивать окружения nsc.
3.  Самообслуживание, децентрализованная конфигурация (общий dev‑кластер):

    Похоже на 2, но группы пользователей из 2.1 имеют доступ к приватному operator signing NKEY.

    Это позволяет командам добавлять/изменять собственные аккаунты.

    Поскольку администраторы отказываются от контроля над лимитами, должен быть хотя бы один организационный механизм, предотвращающий неконтролируемое использование.

    Администраторы могут добавлять/отзывать доступ, управляя набором operator signing keys.
4.  Комбинация вышеперечисленного — по мере необходимости: отдельные группы пользователей (с несколькими окружениями `nsc`).

    Для некоторых пользователей/команд администратор управляет всем.

Signing keys могут использоваться не только людьми в одном или нескольких окружениях `nsc`, но и программами, использующими библиотеки [JWT](https://github.com/nats-io/jwt) и [NKEY](https://github.com/nats-io/nkeys). Это позволяет реализовать сервисы регистрации.

* Account signing key позволяет "на лету":
  * генерировать пользователей (объясняется позже),
  * генерировать активации export (объясняется позже).
* Operator signing key позволяет "на лету" генерировать аккаунты.

<a id="key-takeaways-5"></a>
#### Ключевые выводы

* JWT и связанная цепочка доверия позволяют централизованную, децентрализованную или самообслуживаемую конфигурацию аккаунтов.
* Важно выбирать модель развертывания, которая соответствует вашим требованиям, а НЕ самую сложную.
* Распределение Operator/Account JWT NKEY между администраторами и командами делает эти модели возможными.
* Сервисы регистрации для Accounts/Users можно реализовать программами, владеющими signing‑ключами родительского типа.

<a id="accounts-re-visited"></a>
## Повторно об Accounts

Более глубокое понимание accounts поможет лучше настроить безопасность NATS на базе JWT.

* С какой сущностью должны соотноситься accounts:

  Наша официальная рекомендация — определять границы аккаунтов по приложению/сервису.

  Это очень детально и потребует некоторой конфигурации.

  Поэтому некоторые пользователи склоняются к аккаунтам по командам. Один аккаунт для всех приложений команды.

  Можно начать с менее гранулярных аккаунтов, а по мере роста важности или масштаба приложений сделать аккаунты более детальными.

* По сравнению с file‑based config, Imports и Exports немного меняются.

  Чтобы контролировать, кто может импортировать экспорт, вводятся activation tokens.

  Это JWT, которые импортирующая сторона может встраивать.

  Они подчиняются тем же правилам верификации, что и user JWT, что позволяет `nats-server` проверять явное согласие экспортирующего аккаунта.

  Благодаря токену JWT экспортирующего аккаунта не нужно менять для каждого импортирующего аккаунта.
* Обновления JWT применяются по мере того, как `nats-server` их обнаруживает
  * Как это происходит, зависит от resolver
    * `mem-resolver` требует `nats-server --signal reload`, чтобы перечитать все сконфигурированные Account JWT,
    * `url-resolver` и `nats-resolver` слушают специальный subject обновлений системного аккаунта и применяют изменения, если файл валиден,
    * `nats-resolver` также обновляет соответствующий JWT‑файл и компенсирует, если сообщение обновления было пропущено из‑за временного разрыва соединения.
  * User JWT зависят только от issuing Account NKEY, они НЕ зависят от конкретной версии Account JWT,
  * В зависимости от изменения, внутреннее представление Account будет обновлено, а существующие соединения переоценены.
* System Account — это аккаунт, под которым `nats-server` предоставляет (административные) сервисы и мониторинговые события.

<a id="key-takeaways-6"></a>
### Ключевые выводы

* Accounts можно произвольно ограничивать по масштабу — от приложения до команды.
* Account Exports можно ограничивать, требуя использование activation tokens.
* Получение более свежего Account JWT приводит к применению изменений nats-server и переоценке существующих соединений.

<a id="tooling-and-key-management"></a>
## Инструменты и управление ключами

Этот раздел познакомит с CLI `nsc` для генерации и управления operator/accounts/user. Даже если вы планируете в основном генерировать Accounts/User программно, скорее всего, вы не будете делать это для оператора или всех аккаунтов. Управление ключами и то, как это делать с помощью `nsc`, также будет частью этого раздела.

<a id="nsc"></a>
### Инструмент nsc

<a id="environment"></a>
#### Окружение

`nsc` — инструмент, использующий библиотеки [JWT](https://github.com/nats-io/jwt) и [NKEY](https://github.com/nats-io/nkeys), чтобы создавать NKEY (если требуется) и все типы JWT. Затем он сохраняет эти артефакты в отдельных каталогах.

Он запоминает последнего использованного оператора/аккаунт. Благодаря этому команды не обязаны ссылаться на operator/accounts, но могут делать это (рекомендуется для скриптов). Поддерживается интерактивный режим при `-i`. В этом режиме проще ссылаться на accounts/keys.

`nsc env` показывает, где хранятся NKEYS/JWT и какие значения используются по умолчанию. Для тестов может понадобиться переключаться между окружениями nsc: изменение каталога хранилища (JWT): `nsc env --store <другая папка>`. Изменение каталога хранилища (NKEY) через переменную окружения: `export NKEYS_PATH=<другая папка>`

Последующие разделы будут ссылаться на разные окружения в контексте разных [моделей развертывания](jwt.md#deployment-models-enabled-by-chain-of-trust). Поэтому вы можете пропустить упоминания режимов, которые вам не интересны. Смешанный режим развертывания не рассматривается и оставлен как упражнение читателю.

<a id="backup"></a>
### **Резервное копирование**

<a id="nkeys-store-directory"></a>
#### **Каталог хранилища NKEYS**

Владение NKEYS дает доступ к системе. Поэтому бэкапы лучше держать офлайн, а доступ к ним должен быть строго ограничен. В случаях, когда регенерация всех/части operator/accounts невозможна, следует использовать signing‑NKEY, а identity‑NKEY **следует архивировать и затем удалять** из исходного каталога хранения, чтобы в случае утечки можно было восстановиться без одномоментной смены всех идентичностей. Таким образом, в зависимости от сценария, релевантные identity‑NKEY должны существовать только в очень защищенных офлайн‑бэкапах.

<a id="jwt-store-directory"></a>
#### **Каталог хранилища JWT**

Каталог хранения содержит JWT для операторов, аккаунтов и пользователей. Он не содержит приватных ключей. Поэтому можно делать бэкап этих данных или даже хранить их в VCS, например git. Но учитывайте, что в зависимости от содержания JWT может раскрывать, какие permissions/subjects/public‑nkeys существуют. Знание содержания JWT не дает доступ; доступ дают только приватные ключи. Однако организациям может быть нежелательно делать эти данные публичными, поэтому необходимо обеспечить соответствующую защиту внешних систем.

При восстановлении более старой версии учитывайте:

* Все изменения с момента бэкапа будут потеряны; в частности, отзывы могут быть отменены.
* Прошло время, и JWT, которые были валидны во время бэкапа или коммита, сейчас могут быть истекшими. Возможно, их придется редактировать, чтобы снова соответствовать ожиданиям.
* NKEYS хранятся в отдельном каталоге, поэтому нельзя восстановить JWT, для которого NKEY был удален после:
  * Либо храните все ключи,
  * Либо восстанавливайте каталог NKEY параллельно.

<a id="names-in-jwt"></a>
#### **Имена в JWT**

JWT позволяют задавать имена. Но имена НЕ представляют идентичность — они используются только для удобства ссылок на идентичности в инструментах. Эти имена нигде не используются для ссылок друг на друга, для этого применяется публичный identity‑NKEY. `nats-server` их вообще не читает. Поскольку имена не связаны с идентичностью, они могут совпадать. Поэтому при использовании `nsc` эти имена нужно сохранять уникальными.

<a id="setup-an-operator"></a>
### Настройка оператора

#### **Создание/редактирование оператора — операторское окружение — все режимы развертывания** <a href="create-edit-operator" id="create-edit-operator"></a>

Создайте оператора с системным аккаунтом и пользователем системного аккаунта:

```shell
nsc add operator -n <operator-name> --sys
```

Команда `nsc edit operator [flags]` может использоваться для последующего изменения оператора. Например, если вы задаете URL сервера аккаунтов (используется `url-resolver` и `nats-resolver`), `nsc` не требует указывать его в последующих командах. `nsc edit operator --account-jwt-server-url "nats://localhost:4222"`

> Обратите внимание: если вы обновляете operator JWT, установленный на сервере, нужно вручную обновить operator JWT и перезагрузить сервер. Хотя `nsc` умеет обновлять аккаунты, он никогда не обновляет оператора.

Мы всегда рекомендуем использовать signing‑ключи для оператора. Сгенерируйте его для оператора (`-o`) и сохраните в каталоге ключей (`--store`). В выводе будет показана публичная часть signing‑ключа — используйте ее, чтобы назначить ключ оператору (`--sk O...`). `nsc generate nkey -o --store`, затем `nsc edit operator --sk OB742OV63OE2U55Z7UZHUB2DUVGQHRA5QVR4RZU6NXNOKBKJGKF6WRTZ`. Чтобы выбрать operator signing key для генерации аккаунтов, укажите опцию `-i` при соответствующей команде.

System account — это аккаунт, под которым `nats-server` предоставляет системные сервисы, как будет объяснено ниже в разделе [system-account](jwt.md#system-account). Чтобы получить доступ к этим сервисам, нужен пользователь с учетными данными системного аккаунта. Если этот пользователь не ограничен соответствующими permissions, он по сути является админом. Такие пользователи создаются как обычные пользователи.

_В случаях, когда signing‑ключи генерируются и сразу добавляются, `--sk generate` создаст NKEY «на лету» и назначит его как signing‑NKEY._

#### **Импорт оператора — окружение не‑оператора/администратора — децентрализованные/самообслуживаемые режимы** <a href="import-operator-nonoperator" id="import-operator-nonoperator"></a>

Чтобы импортировать Operator JWT (например, только что созданный) в отдельное окружение nsc, поддерживаемое другой сущностью/командой, нужно:

1. Получить operator JWT с помощью `nsc describe operator --raw` и сохранить вывод в файл `operator.jwt`. Опция `--raw` выводит «сырой» JWT.
2. Обменяться этим файлом или его содержимым любым способом — почта подходит (так как в JWT нет учетных данных).
3. Импортировать operator JWT во второе окружение: `nsc add operator -u operator.jwt`.

Если оператор был изменен и нужно обновление, просто повторите эти шаги, но добавьте опцию `--force` на последнем шаге. Это перезапишет сохраненный operator JWT.

#### **Импорт оператора — режимы самообслуживания** <a href="import-operator-self-service" id="import-operator-self-service"></a>

В дополнение к [предыдущему шагу](jwt.md#import-operator-nonoperator), режимы самообслуживания требуют operator signing‑ключ и пользователя системного аккаунта. Идеально иметь отдельный operator signing‑ключ на сущность, чтобы распределять signing‑ключи. Просто повторите команду, показанную [ранее](jwt.md#create-edit-operator), но:

1. Выполните `nsc generate nkey -o --store` в этом окружении,
2. Обменяйтесь публичным ключом с Администратором/Оператором способом, который гарантирует, что вы отправили свой ключ, а не чей‑то другой,
3. Выполните `nsc edit operator --sk` в операторском окружении,
4. Обновите operator JWT в этом окружении, выполнив [шаги импорта с `--force`](jwt.md#import-operator-nonoperator)

Чтобы импортировать пользователя системного аккаунта, необходимого для администрирования и мониторинга, выполните следующие шаги:
1. Выполните `nsc describe account -n SYS --raw` и сохраните вывод в файл `SYS.jwt`.

   Опция `-n` указывает (системный) аккаунт с именем `SYS`.
2. Обменяйтесь файлом,
3. Импортируйте аккаунт `nsc import account --file SYS.jwt`,
4. Выполните `nsc generate nkey -u --store` в этом окружении,
5. Обменяйтесь публичным ключом, выведенным командой, с Администратором/Оператором способом, который гарантирует, что вы отправили свой ключ, а не чей‑то другой,
6. Создайте пользователя системного аккаунта с именем (`-n`) как угодно (здесь `sys-non-op`), указав (`-k`) обменянный публичный ключ: `nsc add user -a SYS -n sys-non-op -k UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2` в операторском окружении. (`-a` указывает аккаунт `SYS`.)
7. При необходимости отредактируйте пользователя,
8. Экспортируйте пользователя `nsc describe user -a SYS -n sys-non-op --raw` из операторского окружения и сохраните в файл `sys.jwt`. (`-n` указывает пользователя `sys-non-op`),
9. Обменяйтесь файлом,
10. Импортируйте пользователя в этом окружении командой `nsc import user --file sys.jwt`

В результате этих операций ваше операторское окружение должно иметь следующие ключи и signing‑ключи:

```shell
nsc list keys --all
```
```
+------------------------------------------------------------------------------------------------+
|                                              Keys                                              |
+--------------+----------------------------------------------------------+-------------+--------+
| Entity       | Key                                                      | Signing Key | Stored |
+--------------+----------------------------------------------------------+-------------+--------+
| DEMO         | OD5FHU4LXGDSGDHO7UNRMLW6I36QX5VPJXRQHFHMRUIKSHOPEDSHVPBB |             | *      |
| DEMO         | OBYAIG4T4PVR6GVYDERN74RRW7VBKRWBTI7ULLMM6BRHUID4AAQL7SGA | *           |        |
|  ACC         | ADRB4JJYFDLWKIMX4DH6MX2DMKA3TENJWGMNVM5ILYLZTT6BN7QIF5ZX |             |        |
|  SYS         | AAYVLZJC2ULKSH5HNSKMIKFMCEHCNU5VOV5KG56IRL7ENHLBUGZ27CZT |             | *      |
|   sys        | UBVZYLLCAFMHBXBUDKKKFKH62T4AW7Q5MAAE3R3KKAIRCZNYITZPDQZ3 |             | *      |
|   sys-non-op | UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2 |             |        |
+--------------+----------------------------------------------------------+-------------+--------+
```

А ваш аккаунт должен иметь следующие ключи:

```shell
nsc list keys --all
```
```
+------------------------------------------------------------------------------------------------+
|                                              Keys                                              |
+--------------+----------------------------------------------------------+-------------+--------+
| Entity       | Key                                                      | Signing Key | Stored |
+--------------+----------------------------------------------------------+-------------+--------+
| DEMO         | OD5FHU4LXGDSGDHO7UNRMLW6I36QX5VPJXRQHFHMRUIKSHOPEDSHVPBB |             |        |
| DEMO         | OBYAIG4T4PVR6GVYDERN74RRW7VBKRWBTI7ULLMM6BRHUID4AAQL7SGA | *           | *      |
|  SYS         | AAYVLZJC2ULKSH5HNSKMIKFMCEHCNU5VOV5KG56IRL7ENHLBUGZ27CZT |             |        |
|   sys-non-op | UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2 |             | *      |
+--------------+----------------------------------------------------------+-------------+--------+
```

Сравните колонку `Stored` между двумя выводами.

Или, если администратор готов обменяться приватными ключами и обмен может быть выполнен безопасно, часть этих шагов отпадает. Signing‑ключ и пользователя системного аккаунта можно сгенерировать в операторском окружении администратора, опустив `--store`, чтобы избежать лишних копий ключей. Затем публичные/приватные signing‑NKEY обмениваются вместе с пользователем системного аккаунта в виде creds‑файла. Creds‑файл можно сгенерировать `nsc generate creds -a SYS -n sys-non-op` и импортировать в это окружение через `nsc import user --file sys.jwt`. Если signing‑ключ был сгенерирован до импорта оператора в это окружение, этап обновления оператора отпадает.

<a id="setup-an-account"></a>
### Настройка аккаунта

#### **Создание/редактирование аккаунта — все окружения — все режимы развертывания** <a href="create-edit-account" id="create-edit-account"></a>

Создайте аккаунт так:

```
nsc add account -n <account name> -i
```

Если у вас несколько operator signing keys, `-i` предложит выбрать один. `nsc edit account [flags]` можно использовать для последующего изменения аккаунта. (Редактирование также применимо к системному аккаунту)

Рекомендуются signing‑ключи, аналогично оператору. Сгенерируйте signing‑ключ для аккаунта (`-a`) и сохраните его в каталоге ключей nsc (`--store`). В выводе будет показана публичная часть signing‑ключа — используйте ее, чтобы назначить ключ аккаунту (`--sk A...`). `nsc generate nkey -a --store` затем `nsc edit account --sk ACW2QC262CIQUX4ACGOOS5XLKSZ2BY2QFBAAOF3VOP7AWAVI37E2OQZX`. Чтобы выбрать signing‑ключ для генерации пользователей, укажите опцию `-i` при соответствующей операции.

#### **Экспорт аккаунта — окружение не‑оператора/администратора — децентрализованные режимы развертывания** <a href="export-account-decentralized-deployment-modes" id="export-account-decentralized-deployment-modes"></a>

В этом режиме созданный аккаунт является self‑signed. Чтобы он был подписан оператором, выполните следующие шаги:
1. В этом окружении экспортируйте созданный аккаунт как JWT: `nsc describe account -n <account name> --raw`.

   Сохраните вывод в файл `import.jwt`.
2. Обменяйтесь файлом с Администратором/Оператором способом, который гарантирует, что это ваш JWT, а не чужой.
3. В операторском окружении импортируйте аккаунт: `nsc import account --file import.jwt`.

   Этот шаг также повторно подписывает JWT, чтобы он перестал быть self‑signed.
4. Администратор/оператор может теперь изменять аккаунт через `nsc edit account [flags]`.

Если аккаунт нужно изменить и требуется обновление, просто повторите эти шаги, но в последнем шаге добавьте опцию `--force`. Это перезапишет сохраненный account JWT.

#### **Экспорт аккаунта — окружение не‑оператора/администратора — режимы самообслуживания**

Это окружение настроено со signing‑ключом, поэтому аккаунт уже [создан корректно и подписан](jwt.md#create-edit-account). Единственный нужный шаг — отправить Account в сеть NATS. Однако это зависит от ваших прав. Если прав нет, нужно выполнить те же шаги, что и для [децентрализованного режима](jwt.md#export-account-decentralized-deployment-modes). Главное отличие — при импорте аккаунт не будет переподписан.

#### Публикация аккаунта через Push — операторское окружение/окружение с правами push — все режимы <a href="publicize-an-account-with-push" id="publicize-an-account-with-push"></a>

Как именно публиковать аккаунты, полностью зависит от используемого resolver:

* [mem-resolver](../configuration/securing_nats/jwt/resolver.md#memory):
  Оператор должен иметь импортированные все аккаунты и сгенерировать новый
  конфиг,
* [url-resolver](../configuration/securing_nats/jwt/resolver.md#url-resolver):
  `nsc push` отправит HTTP POST‑запрос на хостящий веб‑сервер
  или `nats-account-server`,
* `nats-resolver`: любое окружение с пользователем системного аккаунта,
  имеющим права отправлять корректно подписанные Account JWT в виде запросов на:
  * `$SYS.REQ.CLAIMS.UPDATE` — может загружать и обновлять все
    аккаунты. Сейчас `nsc push` использует этот subject.
  * `$SYS.REQ.ACCOUNT.*.CLAIMS.UPDATE` — может загружать и обновлять
    конкретные аккаунты.

`nsc generate config <resolver-type>` — утилита, которая генерирует соответствующий конфиг NATS. Где `<resolver-type>` может быть `--mem-resolver` или `--nats-resolver` для соответствующего resolver. Обычно сгенерированный вывод сохраняется в файл, который затем [подключается](/running-a-nats-service/configuration/README.md#include-directive) в основной конфигурации NATS. Каждый сервер в одном домене аутентификации должен быть настроен на использование этой конфигурации.

#### **Пример настройки nats-resolver и push — операторское окружение/окружение с правами push — все режимы** <a href="nats-resolver-setup-and-push-example" id="nats-resolver-setup-and-push-example"></a>

Это быстрый демо‑пример nats‑based resolver: от создания оператора до публикации сообщения. Учтите, что возможность push связана только с правами на это и не требует ключей аккаунта. Поэтому способ, которым аккаунты попадают в окружение (создание/импорт), не важен. Для простоты пример использует операторское окружение.

Настройка оператора:

```shell
nsc add operator -n DEMO --sys
```
```
[ OK ] generated and stored operator key "ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6"
[ OK ] added operator "DEMO"
[ OK ] created system_account: name:SYS id:AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27
[ OK ] created system account user: name:sys id:UABM73CE5F3ZYFNC3ZDODAF7GIB62W2WXV5DOLMYLGEW4MEHYBC46PN4
[ OK ] system account user creds file stored in `~/test/demo/env1/keys/creds/DEMO/SYS/sys.creds`
```

```shell
nsc edit operator --account-jwt-server-url nats://localhost:4222
```
```
[ OK ] set account jwt server url to "nats://localhost:4222"
[ OK ] edited operator "DEMO"
```

Проверим настройку:

```shell
nsc list keys --all
```
```
+------------------------------------------------------------------------------------------+
|                                           Keys                                           |
+--------+----------------------------------------------------------+-------------+--------+
| Entity | Key                                                      | Signing Key | Stored |
+--------+----------------------------------------------------------+-------------+--------+
| DEMO   | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |             | *      |
|  SYS   | AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27 |             | *      |
|   sys  | UABM73CE5F3ZYFNC3ZDODAF7GIB62W2WXV5DOLMYLGEW4MEHYBC46PN4 |             | *      |
+--------+----------------------------------------------------------+-------------+--------+
```

`nsc describe operator`:

```
+-------------------------------------------------------------------------------+
|                               Operator Details                                |
+--------------------+----------------------------------------------------------+
| Name               | DEMO                                                     |
| Operator ID        | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |
| Issuer ID          | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |
| Issued             | 2020-11-04 19:25:25 UTC                                  |
| Expires            |                                                          |
| Account JWT Server | nats://localhost:4222                                    |
| System Account     | AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27 |
+--------------------+----------------------------------------------------------+
```

`nsc describe account`:

```
+--------------------------------------------------------------------------------------+
|                                   Account Details                                    |
+---------------------------+----------------------------------------------------------+
| Name                      | SYS                                                      |
| Account ID                | AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27 |
| Issuer ID                 | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |
| Issued                    | 2020-11-04 19:24:41 UTC                                  |
| Expires                   |                                                          |
+---------------------------+----------------------------------------------------------+
| Max Connections           | Unlimited                                                |
| Max Leaf Node Connections | Unlimited                                                |
| Max Data                  | Unlimited                                                |
| Max Exports               | Unlimited                                                |
| Max Imports               | Unlimited                                                |
| Max Msg Payload           | Unlimited                                                |
| Max Subscriptions         | Unlimited                                                |
| Exports Allows Wildcards  | True                                                     |
+---------------------------+----------------------------------------------------------+
| Imports                   | None                                                     |
| Exports                   | None                                                     |
+---------------------------+----------------------------------------------------------+
```

Сгенерируйте конфигурацию и запустите сервер в фоне. Также посмотрите сгенерированный конфиг. Он содержит обязательного оператора и явно перечисляет системный аккаунт и соответствующий JWT:

```shell
nsc generate config --nats-resolver > nats-res.cfg
nats-server -c nats-res.cfg --addr localhost --port 4222 &
```
```
[2] 30129
[30129] 2020/11/04 14:30:14.062132 [INF] Starting nats-server version 2.2.0-beta.26
[30129] 2020/11/04 14:30:14.062215 [INF] Git commit [not set]
[30129] 2020/11/04 14:30:14.062219 [INF] Using configuration file: nats-res.cfg
[30129] 2020/11/04 14:30:14.062220 [INF] Trusted Operators
[30129] 2020/11/04 14:30:14.062224 [INF]   System  : ""
[30129] 2020/11/04 14:30:14.062226 [INF]   Operator: "DEMO"
[30129] 2020/11/04 14:30:14.062241 [INF]   Issued  : 2020-11-04 14:25:25 -0500 EST
[30129] 2020/11/04 14:30:14.062244 [INF]   Expires : 1969-12-31 19:00:00 -0500 EST
[30129] 2020/11/04 14:30:14.062652 [INF] Managing all jwt in exclusive directory /demo/env1/jwt
[30129] 2020/11/04 14:30:14.065888 [INF] Listening for client connections on localhost:4222
[30129] 2020/11/04 14:30:14.065896 [INF] Server id is NBQ6AG5YIRC6PRCUPCAUSVCSCQWAAWW2XQXIM6UPW5AFPGZBUKZJTRRS
[30129] 2020/11/04 14:30:14.065898 [INF] Server name is NBQ6AG5YIRC6PRCUPCAUSVCSCQWAAWW2XQXIM6UPW5AFPGZBUKZJTRRS
[30129] 2020/11/04 14:30:14.065900 [INF] Server is ready
>
```

Добавьте аккаунт и пользователя для теста:

```shell
nsc add account -n TEST
```
```
[ OK ] generated and stored account key "ADXDDDR2QJNNOSZZX44C2HYBPRUIPJSQ5J3YG2XOUOOEOPOBNMMFLAIU"
[ OK ] added account "TEST"
```

```shell
nsc add user -a TEST -n foo
```
```
[ OK ] generated and stored user key "UA62PGBNKKQQWDTILKP5U4LYUYF3B6NQHVPNHLS6IZIPPQH6A7XSRWE2"
[ OK ] generated user creds file `/DEMO/TEST/foo.creds`
[ OK ] added user "foo" to account "TEST"
```

Без push аккаунта пользователь еще не может быть использован.

```shell
nats -s nats://localhost:4222 pub --creds=/DEMO/TEST/foo.creds  "hello" "world"
```

Не работает

```
nats: error: read tcp 127.0.0.1:60061->127.0.0.1:4222: i/o timeout, try --help
[9174] 2020/11/05 16:49:34.331078 [WRN] Account [ADI4H2XRYMT5ENVBBS3UKYC2FBLGB3NF4VV5L57HUZIO4AMYROB4LMYF] fetch took 2.000142625s
[9174] 2020/11/05 16:49:34.331123 [WRN] Account fetch failed: fetching jwt timed out
[9174] 2020/11/05 16:49:34.331182 [ERR] 127.0.0.1:60061 - cid:5 - "v1.11.0:go:NATS CLI Version development" - authentication error
[9174] 2020/11/05 16:49:34.331258 [WRN] 127.0.0.1:60061 - cid:5 - "v1.11.0:go:NATS CLI Version development" - Readloop processing time: 2.000592801s
```

Сделайте push аккаунта или всех аккаунтов:

```shell
nsc push -a TEST
```
```
[ OK ] push to nats-server "nats://localhost:4222" using system account "SYS" user "sys":
       [ OK ] push TEST to nats-server with nats account resolver:
              [ OK ] pushed "TEST" to nats-server NBQ6AG5YIRC6PRCUPCAUSVCSCQWAAWW2XQXIM6UPW5AFPGZBUKZJTRRS: jwt updated
              [ OK ] pushed to a total of 1 nats-server
```

```shell
nsc push --all
```
```
[ OK ] push to nats-server "nats://localhost:4222" using system account "SYS" user "sys":
       [ OK ] push SYS to nats-server with nats account resolver:
              [ OK ] pushed "SYS" to nats-server NBENVYIBPNQGYVP32Y3P6WLGBOISORNAZYHA6SCW6LTBE42ORTIQMWHX: jwt updated
              [ OK ] pushed to a total of 1 nats-server
       [ OK ] push TEST to nats-server with nats account resolver:
              [ OK ] pushed "TEST" to nats-server NBENVYIBPNQGYVP32Y3P6WLGBOISORNAZYHA6SCW6LTBE42ORTIQMWHX: jwt updated
              [ OK ] pushed to a total of 1 nats-server
```

Для NATS resolver каждый ответивший `nats-server` будет перечислен. Если вы получили меньше ответов, чем у вас серверов, или сервер сообщил об ошибке, лучше устранить проблему и повторить. NATS resolver «распространяет» недостающие JWT в режиме eventual consistency. Серверы без копии будут делать lookup у серверов, у которых она есть. Если при первоначальном push ответил только один сервер, существует окно, когда этот сервер может упасть или, хуже, потерять диск. В это время отправленный аккаунт недоступен для всей сети. Поэтому важно убедиться, что на начальном этапе отвечает больше серверов, чем вы готовы потерять одновременно.

После push аккаунта его пользователь может быть использован:

```shell
nats -s nats://localhost:4222 pub --creds=/DEMO/TEST/foo.creds  "hello" "world"
```

<a id="setup-user"></a>
### Настройка пользователя

#### **Создание/редактирование аккаунта — все окружения — все режимы развертывания** <a href="create-edit-account-all-environments" id="create-edit-account-all-environments"></a>

Создайте пользователя так: `nsc add user --account <account name> --name <user name> -i`. `nsc edit user [flags]` можно использовать для последующего изменения пользователя. Если у вас несколько account signing keys, для любой команды `-i` предложит выбрать один.

Если вы генерируете пользователя от имени другой сущности, у которой нет окружения nsc, возможно, стоит не обмениваться NKEY. 1. Для этого пусть другая сторона сгенерирует пару user NKEY так: `nsc generate nkey -u` (`--store` опущен, чтобы не делать лишнюю копию ключа) 2. Обменяйтесь публичным ключом, гарантируя, что используется именно ваш ключ, а не чужой. 3. Создайте пользователя, указав (`-k`) обменянный публичный ключ: `nsc add user --account SYS -n sys-non-op -k UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2` в своем окружении. ([пример пользователя системного аккаунта](jwt.md#import-operator-self-service)) 4. При необходимости отредактируйте пользователя 5. Экспортируйте пользователя `nsc describe user --account SYS -n sys-non-op --raw` из своего окружения и сохраните вывод в JWT‑файл. 6. Обменяйтесь JWT‑файлом 7. Используйте JWT‑файл и пару NKEY в вашем приложении.

<a id="automated-sign-up-services-jwt-and-nkey-libraries"></a>
### Автоматизированные сервисы регистрации — библиотеки JWT и NKEY

`nsc` по сути использует библиотеки [NKEY](https://github.com/nats-io/nkeys) и [JWT](https://github.com/nats-io/jwt) для генерации operator/accounts/users. Вы можете использовать эти библиотеки и напрямую. Поскольку оператор один, генерировать его таким образом обычно не имеет смысла. Аккаунты — только если вам нужно создавать их динамически, например для каждого клиента. Динамическое создание пользователей и интеграция этого процесса с существующей инфраструктурой (например, LDAP) — самый частый кейс использования этих библиотек.

Следующие подразделы демонстрируют динамическую генерацию пользователей. Показанные механизмы применимы и к динамическому созданию аккаунтов. Для динамического создания пользователя/аккаунта настоятельно рекомендуются signing‑ключи.

**Генерируя пользователей или аккаунты динамически, вы несете ответственность за корректную аутентификацию входящих запросов для этих пользователей/аккаунтов**

**Для JWT, выпускаемых сервисом регистрации, ВСЕГДА устанавливайте МАКСИМАЛЬНО КОРОТКИЙ СРОК ИСТЕЧЕНИЯ**

<a id="simple-user-creation"></a>
### Простое создание пользователя

Этот пример иллюстрирует линейный поток алгоритма и использование сгенерированных артефактов. В реальном приложении вы захотите распределить этот алгоритм между несколькими процессами. Для простоты примеров ключи могут быть захардкожены, а обработка ошибок опущена.

<a id="create-user-nkey"></a>
#### **Создание user NKEY**

```go
func generateUserKey() (userPublicKey string, userSeed []byte, userKeyPair nkeys.KeyPair) {
    kp, err := nkeys.CreateUser()
    if err != nil {
        return "", nil, nil
    }
    if userSeed, err = kp.Seed(); err != nil {
        return "", nil, nil
    } else if userPublicKey, err = kp.PublicKey(); err != nil {
        return "", nil, nil
    }
    return
}
```

<a id="create-user-jwt"></a>
#### **Создание user JWT**

```go
func generateUserJWT(userPublicKey, accountPublicKey string, accountSigningKey nkeys.KeyPair) (userJWT string) {
    uc := jwt.NewUserClaims(userPublicKey)
    uc.Pub.Allow.Add("subject.foo") // only allow publishing to subject.foo
    uc.Expires = time.Now().Add(time.Hour).Unix() // expire in an hour
    uc.IssuerAccount = accountPublicKey
    vr := jwt.ValidationResults{}
    uc.Validate(&vr)
    if vr.IsBlocking(true) {
        panic("Generated user claim is invalid")
    }
    var err error
    userJWT, err = uc.Encode(accountSigningKey)
    if err != nil {
        return ""
    }
    return
}
```

Проверьте [user claim](https://github.com/nats-io/jwt/blob/main/v2/user_claims.go#L57), чтобы увидеть все доступные свойства/лимиты/разрешения. Если вместо этого использовать [account claim](https://github.com/nats-io/jwt/blob/057ba30017beca2abb0ba35e7db6442be3479c5d/account_claims.go#L107-L114), можно динамически генерировать аккаунты. Дополнительный шаг — отправить новый аккаунт через push, как описано [здесь](jwt.md#publicize-an-account-with-push). В зависимости от требований, может быть полезно обмениваться identity NKEY аккаунта аналогично тому, как обмениваться ключом пользователя в [следующем разделе](jwt.md#distributed-user-creation).

<a id="distributed-user-creation"></a>
#### **Распределенное создание пользователя**

Как упоминалось ранее, этот пример нужно распределять. Он использует каналы Go, чтобы выразить тот же алгоритм, использует closures для инкапсуляции функциональности и goroutines, чтобы показать существующие процессы. Отправка и получение через каналы иллюстрируют информационный поток. Для реализации можно выбрать `HTTP`, NATS и т. п. (Для простоты корректное закрытие каналов, обработка ошибок и ожидание завершения goroutines опущены.)

В примере выше механизмы аутентификации не требовались: `RequestUser` владел signing‑ключом. Как вы решите доверять входящему запросу — полностью на вашей стороне. Вот несколько вариантов:

* everyone
* username/password
* 3rd party authentication token

В этом примере логика инкапсулирована в placeholder‑closures `ObtainAuthorizationToken` и `IsTokenAuthorized`, которые ничего не делают.

```go
func ObtainAuthorizationToken() interface{} {
    // whatever you want, 3rd party token/username&password
    return ""
}

func IsTokenAuthorized(token interface{}) bool {
    // whatever logic to determine if the input authorizes the requester to obtain a user jwt
    return token.(string) == ""
}

// request struct to exchange data
type userRequest struct {
    UserJWTResponseChan chan string
    UserPublicKey       string
    AuthInfo            interface{}
}

func startUserProvisioningService(isAuthorizedCb func(token interface{}) bool) chan userRequest {
    userRequestChan := make(chan userRequest) // channel to send requests for jwt to
    go func() {
        accountSigningKey := GetAccountSigningKey() // Setup, obtain account signing key
        for {
            req := <-userRequestChan // receive request
            if !isAuthorizedCb(req.AuthInfo) {
                fmt.Printf("Request is not authorized to receive a JWT, timeout on purpose")
            } else if userJWT := generateUserJWT(req.UserPublicKey, accountSigningKey); userJWT != "" {
                req.UserJWTResponseChan <- userJWT // respond with jwt
            }
        }
    }()
    return userRequestChan
}

func startUserProcess(userRequestChan chan userRequest, obtainAuthorizationCb func() interface{}) {
    requestUser := func(userRequestChan chan userRequest, authInfo interface{}) (jwtAuthOption nats.Option) {
        userPublicKey, _, userKeyPair := generateUserKey()
        respChan := make(chan string)
        // request jwt
        userRequestChan <- userRequest{
            respChan,
            userPublicKey,
            authInfo,
        }
        userJWT := <-respChan // wait for response
        // userJWT and userKeyPair can be used in conjunction with this nats.Option
        jwtAuthOption = nats.UserJWT(func() (string, error) {
            return userJWT, nil
        },
            func(bytes []byte) ([]byte, error) {
                return userKeyPair.Sign(bytes)
            },
        )
        // Alternatively you can create a creds file and use it as nats.Option
        return
    }
    go func() {
        jwtAuthOption := requestUser(userRequestChan, obtainAuthorizationCb())
        nc, err := nats.Connect("nats://localhost:4222", jwtAuthOption)
        if err != nil {
            return
        }
        defer nc.Close()
        time.Sleep(time.Second) // simulate work one would want to do
    }()
}

func RequestUserDistributed() {
    reqChan := startUserProvisioningService(IsTokenAuthorized)
    defer close(reqChan)
    // start multiple user processes
    for i := 0; i < 4; i++ {
        startUserProcess(reqChan, ObtainAuthorizationToken)
    }
    time.Sleep(5 * time.Second)
}
```

В этом примере user NKEY генерируется запрашивающим процессом, а публичный ключ отправляется сервису регистрации. Так сервису не нужен приватный ключ и он его не отправляет. Более того, любой процесс, получающий исходный запрос или даже ответ, может получить user JWT, но не сможет доказать владение приватным NKEY. Однако вы можете настроить provisioning‑сервис на генерацию пары NKEY и ответ с парой NKEY и user JWT. Это менее безопасно, но позволяет более простой протокол при необходимости.

<a id="user-creation-using-nats"></a>
#### Создание пользователя через NATS

[Предыдущий пример](jwt.md#distributed-user-creation) использовал каналы Go, чтобы продемонстрировать потоки данных. Можно использовать любые протоколы для такой передачи данных и выбрать то, что лучше подходит вашей инфраструктуре. Однако можно использовать и NATS.

<a id="straight-forward-setup"></a>
#### **Простая настройка**

Вы можете заменить отправку и получение `<-` на публикацию и подписку NATS, либо — для большей отказоустойчивости сервиса регистрации — использовать очередь подписки. Для этого нужны подключения, которые позволяют сервису регистрации и запрашивающему обмениваться сообщениями. Сервис регистрации использует одно и то же соединение и (queue) подписывается на хорошо известный subject. Запрашивающий использует соединение и отправляет запрос на well‑known subject. После получения ответа первое соединение закрывается, а полученный JWT используется для установления нового соединения.

Здесь возникает проблема курицы и яйца: первое соединение для запроса JWT само требует учетных данных. Самый простой подход — поднять другой NATS сервер/кластер без аутентификации, сначала подключиться к кластеру 1 и запросить user JWT. После получения — отключиться от кластера 1 и подключиться к кластеру 2, используя полученный JWT.

<a id="account-based-setup"></a>
#### **Настройка на базе аккаунта**

[Предыдущую настройку](jwt.md#straight-forward-setup) можно упростить, используя accounts вместо отдельных серверов/кластеров. Но настройка на базе JWT/operator требует JWT‑аутентификации. Таким образом, подключения к другому кластеру заменяются подключениями к тому же кластеру, но с разными аккаунтами.

* Кластер 1 соответствует подключениям к аккаунту `signup`.
* Кластер 2 соответствует подключениям к аккаунтам, чьи signing‑ключи использовались для подписи user JWT. (Это также происходит в первом варианте)

Подключения к аккаунту `signup` используют два вида учетных данных. 1. Сервис(ы) регистрации используют учетные данные, сгенерированные для него/них. 2. Все запрашивающие используют один и тот же JWT и NKEY, которые не используются для фактической аутентификации.

* Этот JWT, вероятно, генерируется с помощью `nsc`.
* Не используйте этот JWT/NKEY ни для чего, кроме обращения к сервису регистрации.
* Разрешите публикацию только в well‑known subject.
* В зависимости от развертывания вам нужно бэкапить (signing) NKEY аккаунта, чтобы аккаунт можно было восстановить без инвалидирования развернутых запросчиков (которые могут быть трудно заменяемы).

<a id="stamping-jwt-in-languages-other-than-go"></a>
#### Штамповка JWT на языках, отличных от Go

Библиотека NKEY существует или включена во все языки, где NATS поддерживает NKEY. Библиотека NATS JWT, напротив, написана на Go. Это может быть не вашим языком. Кроме кодирования JWT, большая часть того, что делает библиотека, — это поддержка схемы NATS JWT. Если вы используете `nsc` для генерации пользователя как шаблона для сервиса регистрации и работаете от этого шаблона, вам не нужна JWT‑библиотека. Пример показывает, как программа, получающая account identity NKEY и account signing NKEY в качестве аргументов, выводит корректный creds‑файл.

```csharp
// dotnet add package NATS.NKeys --prerelease
// dotnet add package SimpleBase
using NATS.NKeys;
using System.Security.Cryptography;
using System.Text;

string creds = IssueUserCreds();
Console.WriteLine(creds);

static string IssueUserJwt(string userKeyPub)
{
    // Load account signing key and account identity for
    // the account you wish to issue users for
    const string accSeed = "SAANWFZ3JINNPERWT3ALE45U7GYT2ZDW6GJUIVPDKUF6GKAX6AISZJMAS4";
    const string accId = "ACV63DGCZGOIT3P5ZA7PQT3KYJ6UDFFHZ7KETHYMDMZ4N44KYAQ2ZZ5F";
    KeyPair accountSigningKey = KeyPair.FromSeed(accSeed);
    string accSigningKeyPub = accountSigningKey.GetPublicKey();

    // Use nsc to create a user any way you like.
    // Export the user as json using:
    // nsc describe user --name <user name> --account <account name> --json
    // Turn the output into a format string and replace values you want replaced.
    // Fields that need to be replaced are:
    // iat (issued at), iss (issuer), sub (subject) and jti (claim hash)
    const string claimFmt = @"{{
  "iat": {0},
  "iss": "{1}",
  "jti": "{2}",
  "name": "{3}",
  "nats": {{
    "data": -1,
    "issuer_account": "{4}",
    "payload": -1,
    "pub": {{}},
    "sub": {{}},
    "subs": -1,
    "type": "user",
    "version": 2
  }},
  "sub": "{3}"
}}";
    const string header = @"{
  "typ":"JWT",
  "alg":"ed25519-nkey"
}";

    // Issue At time is stored in unix seconds
    long issuedAt = DateTimeOffset.Now.ToUnixTimeSeconds();
    
    // Generate a claim without jti so we can compute jti off of it
    string claim = string.Format(
        claimFmt,
        issuedAt,
        accSigningKeyPub,
        "", /* blank jti */
        userKeyPub,
        accId);
    
    // Compute jti, a base32 encoded sha256 hash
    string jti = SimpleBase.Base32.Rfc4648.Encode(
        SHA256.Create().ComputeHash(Encoding.UTF8.GetBytes(claim)),
        false);
    
    // recreate full claim with jti set
    claim = string.Format(
        claimFmt,
        issuedAt,
        accSigningKeyPub,
        jti,
        userKeyPub,
        accId
    );
    
    // all three components (header/body/signature) are base64url encoded
    string encHeader = ToBase64Url(Encoding.UTF8.GetBytes(header));
    string encBody = ToBase64Url(Encoding.UTF8.GetBytes(claim));
    
    // compute the signature off of header + body (. included on purpose)
    byte[] sig = Encoding.UTF8.GetBytes($"{encHeader}.{encBody}");
    var signature = new byte[64];
    accountSigningKey.Sign(sig, signature);
    string encSig = ToBase64Url(signature);
    
    // append signature to header and body and return it
    return $"{encHeader}.{encBody}.{encSig}";
}

static string IssueUserCreds()
{
    // Generate a user NKEY for the new user.
    // The private portion of the NKEY is not needed when issuing the jwt.
    // Therefore generating the key can also be done separately from the JWT.
    // Say by the requester.
    KeyPair userSeed = KeyPair.CreatePair(PrefixByte.User);
    string userKeyPub = userSeed.GetPublicKey();
    string jwt = IssueUserJwt(userKeyPub);
    
    // return jwt and corresponding user seed as creds
    return $@"-----BEGIN NATS USER JWT-----
{jwt}
------END NATS USER JWT------

************************* IMPORTANT *************************
    NKEY Seed printed below can be used to sign and prove identity.
    NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
{userSeed.GetSeed()}
------END USER NKEY SEED------

*************************************************************";
}

static string ToBase64Url(byte[] input)
{
    var stringBuilder = new StringBuilder(Convert.ToBase64String(input).TrimEnd('='));
    stringBuilder.Replace('+', '-');
    stringBuilder.Replace('/', '_');
    return stringBuilder.ToString();
}
```

Если .NET — ваш язык, можно также использовать пакет [NATS.Jwt](https://www.nuget.org/packages/NATS.Jwt).

```csharp
// dotnet add package NATS.Jwt --prerelease
using NATS.Jwt;
using NATS.Jwt.Models;
using NATS.NKeys;

const string accSeed = "SAANWFZ3JINNPERWT3ALE45U7GYT2ZDW6GJUIVPDKUF6GKAX6AISZJMAS4";
const string accId = "ACV63DGCZGOIT3P5ZA7PQT3KYJ6UDFFHZ7KETHYMDMZ4N44KYAQ2ZZ5F";

var jwt = new NatsJwt();

// Load account signing key
KeyPair accountSigningKey = KeyPair.FromSeed(accSeed);

// Create a user keypair
KeyPair ukp = KeyPair.CreatePair(PrefixByte.User);
string upk = ukp.GetPublicKey();
NatsUserClaims uc = jwt.NewUserClaims(upk);

// Set to the public ID of the account
uc.User.IssuerAccount = accId;

// Sign the user claims with the account signing key
string userJwt = jwt.EncodeUserClaims(uc, accountSigningKey);

// The seed is a version of the keypair that is stored as text
// and it is considered sensitive information.
string userSeed = ukp.GetSeed();

// Generate a creds formatted file that can be used by a NATS client
string creds = jwt.FormatUserConfig(userJwt, userSeed);
Console.WriteLine(creds);
```

<a id="system-account"></a>
### Системный аккаунт

Системный аккаунт — это аккаунт, под которым nats-server предоставляет сервисы. Чтобы использовать его, operator JWT должен указать его, что происходит при `nsc init` или при передаче `--sys` в `nsc add operator`. Альтернативно можно закодировать его в конфигурации сервера, указав `system_account` с публичным NKEY аккаунта, который вы хотите сделать системным:

```
system_account: AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5
```

НЕ рекомендуется использовать этот аккаунт для связи между вашими приложениями. Его единственная цель — обеспечить коммуникацию с `nats-server` и между экземплярами `nats-server`.

<a id="event-subjects"></a>
#### Event Subjects

События публикуются по мере их возникновения. Но НЕЛЬЗЯ полагаться на конкретный порядок или на то, что события будут совпадать, из‑за возможных потерь. Например, `CONNECT` для клиента не всегда будет сопровождаться `DISCONNECT` для того же клиента. Ваш подписчик может просто быть отключен, когда происходит одно из событий. Некоторые сообщения несут агрегированные данные и периодически публикуются. Там пропуск сообщения по какой‑то причине компенсируется следующим.

| Subjects to subscribe on                     | Description                              | Repeats      |
| -------------------------------------------- | ---------------------------------------- | ------------ |
| `$SYS.SERVER.<server-id>.SHUTDOWN`           | Sent when a server shuts down            |              |
| `$SYS.SERVER.<server-id>.CLIENT.AUTH.ERR`    | Sent when client fails to authenticate   |              |
| `$SYS.SERVER.<server-id>.STATSZ`             | Basic server stats                       | Periodically |
| `$SYS.ACCOUNT.<account-id>.LEAFNODE.CONNECT` | Sent when Leafnode connected             |              |
| `$SYS.ACCOUNT.<account-id>.CONNECT`          | Sent when client connected               |              |
| `$SYS.ACCOUNT.<account-id>.DISCONNECT`       | Sent when Client disconnected            |              |
| `$SYS.ACCOUNT.<account-id>.SERVER.CONNS`     | Sent when an accounts connections change |              |

Subject `$SYS.SERVER.ACCOUNT.<account-id>.CONNS` все еще используется, но рекомендуется подписываться на его новое имя `$SYS.ACCOUNT.<account-id>.SERVER.CONNS`.

<a id="service-subjects"></a>
### Сервисные subject

<a id="subjects-always-available"></a>
#### **Subjects доступны всегда**

| Subjects to publish requests to        | Description                                                                             | Message Output        |
| -------------------------------------- | --------------------------------------------------------------------------------------- | --------------------- |
| `$SYS.REQ.SERVER.PING.STATZ`           | Exposes the `STATZ` HTTP monitoring endpoint, each server will respond with one message | Same as HTTP endpoint |
| `$SYS.REQ.SERVER.PING.VARZ`            | - same as above for - `VARZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.PING.SUBZ`            | - same as above for - `SUBZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.PING.CONNZ`           | - same as above for - `CONNZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.PING.ROUTEZ`          | - same as above for - `ROUTEZ`                                                          | - same as above -     |
| `$SYS.REQ.SERVER.PING.GATEWAYZ`        | - same as above for - `GATEWAYZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.PING.LEAFZ`           | - same as above for - `LEAFZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.PING.ACCOUNTZ`        | - same as above for - `ACCOUNTZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.PING.JSZ`             | - same as above for - `JSZ`                                                             | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.STATZ`    | Exposes the `STATZ` HTTP monitoring endpoint, only requested server responds            | Same as HTTP endpoint |
| `$SYS.REQ.SERVER.<server-id>.VARZ`     | - same as above for - `VARZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.SUBZ`     | - same as above for - `SUBZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.CONNZ`    | - same as above for - `CONNZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.ROUTEZ`   | - same as above for - `ROUTEZ`                                                          | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.GATEWAYZ` | - same as above for - `GATEWAYZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.LEAFZ`    | - same as above for - `LEAFZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.ACCOUNTZ` | - same as above for - `ACCOUNTZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.JSZ`      | - same as above for - `JSZ`                                                             | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.SUBSZ`  | Exposes the `SUBSZ` HTTP monitoring endpoint, filtered by account-id.                   | Same as HTTP endpoint |
| `$SYS.REQ.ACCOUNT.<account-id>.CONNZ`  | - same as above for `CONNZ` -                                                           | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.LEAFZ`  | - same as above for `LEAFZ` -                                                           | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.JSZ`    | - same as above for `JSZ` -                                                             | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.CONNS`  | Exposes the event `$SYS.ACCOUNT.<account-id>.SERVER.CONNS` as request                   | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.INFO`   | Exposes account specific information similar to `ACCOUNTZ`                              | Similar to `ACCOUNTZ` |

Каждый из subject можно использовать без входных данных. Однако для каждого типа запроса (`STATZ`, `VARZ`, `SUBSZ`, `CONNS`, `ROUTEZ`, `GATEWAYZ`, `LEAFZ`, `ACCOUNTZ`, `JSZ`) можно отправить JSON с тип‑специфичными опциями. Кроме того, все subject позволяют фильтровать, передавая такие значения в JSON:

| Option        | Effect                                               |
| ------------- | ---------------------------------------------------- |
| `server_name` | Only server with matching server name will respond.  |
| `cluster`     | Only server with matching cluster name will respond. |
| `host`        | Only server running on that host will respond.       |
| `tags`        | Filter responders by tags. All tags must match.      |

<a id="subjects-available-when-using-nats-based-resolver"></a>
#### **Subjects доступны при использовании NATS-based resolver**

| Subject                                       | Description                                                                              | Input                                                                                       | Output                                                                                         |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `$SYS.REQ.ACCOUNT.<account-id>.CLAIMS.UPDATE` | Update a particular account JWT (only possible if properly signed)                       | JWT body                                                                                    |                                                                                                |
| `$SYS.REQ.ACCOUNT.<account-id>.CLAIMS.LOOKUP` | Responds with requested JWT                                                              |                                                                                             | JWT body                                                                                       |
| `$SYS.REQ.CLAIMS.PACK`                        | Single responder compares input, sends all JWT if different.                             | xor of all sha256(stored-jwt). Send empty message to download all JWT.                      | If different, responds with all stored JWT (one message per JWT). Empty message to signify EOF |
| `$SYS.REQ.CLAIMS.LIST`                        | Each server responds with list of account ids it stores                                  |                                                                                             | list of account ids separated by newline                                                       |
| `$SYS.REQ.CLAIMS.UPDATE`                      | Exposes $SYS.REQ.ACCOUNT..CLAIMS.UPDATE without the need for `<account-id>`              | JWT body                                                                                    |                                                                                                |
| `$SYS.REQ.CLAIMS.DELETE`                      | When the resolver is configured with `allow_delete: true`, deleting accounts is enabled. | Generic operator signed JWT claim with a field `accounts` containing a list of account ids. |                                                                                                |

<a id="old-subjects"></a>
#### **Старые Subjects**

| Subject                                   | Alternative Mapping                           |
| ----------------------------------------- | --------------------------------------------- |
| `$SYS.REQ.SERVER.PING`                    | `$SYS.REQ.SERVER.PING.STATSZ`                 |
| `$SYS.ACCOUNT.<account-id>.CLAIMS.UPDATE` | `$SYS.REQ.ACCOUNT.<account-id>.CLAIMS.LOOKUP` |

<a id="leaf-node-connections-outgoing"></a>
### Соединения листовых узлов — исходящие

Важно понимать, что leaf nodes не мультиплексируют между аккаунтами. Каждый аккаунт, который вы хотите подключить через leaf node, должен быть явно указан. Таким образом, системный аккаунт не подключается автоматически, даже если обе стороны leaf node используют один и тот же системный аккаунт. Для leaf nodes, подключающихся к кластеру или супер‑кластеру, системный аккаунт нужно явно подключить как отдельный `remote` к тем же URL, что и другие аккаунты. Пользователь системного аккаунта, используемый через `credentials`, может быть сильно ограничен, например разрешать публикацию только на некоторые subject. Это также верно, даже если вы сами не используете системный аккаунт, но он нужен косвенно для NATS‑based account resolver или централизованного мониторинга.

Примеры ниже предполагают, что кластер, к которому подключаются, работает в operator mode.

<a id="non-operator-mode"></a>
#### **Non-Operator Mode**

Исходящее подключение не в Operator mode, поэтому системный аккаунт может отличаться от пользовательского аккаунта. Этот пример показывает, как настроить пользовательский аккаунт и системный аккаунт в leaf node. Файлы credentials должны содержать учетные данные, валидные для сервера/кластера, доступного по `url`. В примере аккаунты явно не конфигурируются, но упоминаются. Это аккаунт по умолчанию `$G` и системный аккаунт по умолчанию `$SYS`.

```
leafnodes {
    remotes = [
        {
          url: "nats://localhost:4222"
          credentials: "./your-account.creds"
        },
        {
          url: "nats://localhost:4222"
          account: "$SYS"
          credentials: "./system-account.creds"
        },
    ]
}
```

<a id="operator-mode"></a>
#### **Operator Mode**

Исходящее соединение также в operator mode. Этот пример предполагает использование того же оператора и, следовательно, системного аккаунта. Однако использование другого оператора выглядело бы почти так же. Отличались бы только credentials, выданные аккаунтами другого оператора.

```
operator: ./trustedOperator.jwt
system_account: AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5
leafnodes {
    remotes = [
        {
          url: "nats://localhost:4222"
          account: "ADKGAJU55CHYOIF5H432K2Z2ME3NPSJ5S3VY5Q42Q3OTYOCYRRG7WOWV"
          credentials: "./your-account.creds"
        },
        {
          url: "nats://localhost:4222"
          account: "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5"
          credentials: "./system-account.creds"
        },
    ]
}
```

<a id="connecting-accounts"></a>
### Соединение аккаунтов

Как показано в разделе [что такое accounts](jwt.md#what-are-accounts), их можно соединять через exports и imports. В конфигурационных файлах это делается просто, но при использовании JWT становится чуть сложнее. Частично это из‑за появления новых концепций, таких как public/private/activation tokens, которые не имеют смысла в контексте config‑based подхода.

<a id="exports"></a>
#### Exports

Добавьте export так: `nsc add export --name <export name> --subject <export subject>` Это экспортирует публичный stream, который может импортировать любой аккаунт. Чтобы сделать export сервисом, добавьте `--service`.

Чтобы контролировать, какой аккаунт может импортировать, укажите опцию `--private`. В этом случае только аккаунты, для которых вы сгенерировали токены, смогут добавить соответствующий import. Токен можно сгенерировать и сохранить в файл так: `nsc generate activation --account <account name> --subject <export subject> --output-file <token file> --target-account <account identity public NKEY>` Затем файл можно обменять с импортирующей стороной.

<a id="imports"></a>
#### Imports

Чтобы добавить import для публичного export, используйте `nsc add import --account <account name> --src-account <account identity public NKEY> --remote-subject <subject of export>`. Чтобы импортировать сервис, добавьте `--service`.

Чтобы добавить import для приватного export, используйте `nsc add import --account <account name> --token <token file or url>` _Если в вашем окружении nsc есть operator и account signing NKEY, `nsc add import -i` сгенерирует токен для встраивания на лету._

<a id="import-subjects"></a>
#### **Import Subjects**

Между export/import/activation tokens используется множество subject. Их взаимосвязь такова:

* Import subject идентичен или является подмножеством экспортируемого subject.
* Subject activation token идентичен или является подмножеством экспортируемого subject.
* Subject activation token также идентичен или является подмножеством import subject аккаунта, в который он встроен.

<a id="import-remapping"></a>
#### **Import Remapping**

Чтобы не зависеть от имен subject, выбранных экспортирующей стороной, импорт позволяет сделать remap импортируемого subject. Для этого укажите `--remote-subject <subject name>` в команде import.

Этот пример меняет локальное имя subject импортирующего аккаунта с выбранного экспортером `foo` на `bar`.

```shell
nsc add import --account test --src-account ACJ6G45BE7LLOFCVAZSZR3RY4XELXQ32BOQRI7KQMQLICXXXJRP4P45Q --remote-subject foo --local-subject bar
```
```
[ OK ] added stream import "blo"
```

<a id="visualizing-export-import-relationships"></a>
#### **Визуализация отношений Export/Import**

NSC может генерировать диаграммы межаккаунтных отношений с помощью: `nsc generate diagram component --output-file test.uml`. Сгенерированный файл содержит компонентную диаграмму [plantuml](https://plantuml.com) всех аккаунтов, соединенных через exports/imports. Чтобы преобразовать файл в .png, выполните: `plantuml -tpng test.uml`. Если диаграмма обрезается, увеличьте доступную память и лимит размера изображения опциями: `-Xmx2048m -DPLANTUML_LIMIT_SIZE=16384`

<a id="managing-keys"></a>
### Управление ключами

Identity‑ключи крайне важны, поэтому вы можете захотеть хранить их в безопасности, выдавая операторам более легко заменяемые signing‑ключи. Важность ключей обычно следует цепочке доверия: ключи operator важнее, чем ключи account. Кроме того, identity‑ключи важнее, чем signing‑ключи.

Есть ситуации, когда регенерация полностью нового identity‑ключа любого типа невозможна. Например, в очень больших развертываниях (IoT), где слишком велик организационный оверхед. В этом случае мы предлагаем безопасно хранить identity‑ключи офлайн и использовать заменяемые signing‑ключи. В зависимости от того, какой ключ был скомпрометирован, может потребоваться заменить signing‑ключи и переподписать все JWT, подписанные скомпрометированным ключом. Также скомпрометированный ключ может потребовать отзыва.

Независимо от того, планируете ли вы просто регенерировать новые NKEY/JWT или заменять signing‑NKEY и переподписывать JWT, вам нужно заранее подготовиться и отработать этот процесс, а не ждать, пока случится авария.

<a id="protect-identity-nkeys"></a>
#### Защита identity‑NKEY

Использование signing‑ключей для Operator и Account было показано в разделе [`nsc`](jwt.md#nsc). Это показывает, как убрать identity‑ключ офлайн. Identity‑NKEY оператора/аккаунта — единственный, кто может изменять соответствующий JWT и, соответственно, добавлять/удалять signing‑ключи. Поэтому initial signing‑ключи лучше создавать и назначать до удаления приватного identity‑NKEY.

Базовая стратегия: убрать их офлайн и удалить в каталоге NKEY [`nsc`](jwt.md#nsc).

Используйте `nsc env`, чтобы определить каталог NKEY. (Предполагаем `~/.nkeys` для примера) `nsc list keys --all` перечисляет все ключи оператора и показывает, сохранены ли они и являются ли они signing‑ключами.

Ключи для вашего Operator/Account находятся в `<nkyesdir>/keys/O/../<public-nkey>.nk` или `<nkyesdir>/keys/A/../<public-nkey>.nk`. Identity‑NKEY оператора ODMFND7EIJ2MBHNPO2JHCKOZIAY6NAK7OT4V2ZT2C5O6LEB3DPKYV3QL будет находиться в `~/.nkeys/keys/O/DM/ODMFND7EIJ2MBHNPO2JHCKOZIAY6NAK7OT4V2ZT2C5O6LEB3DPKYV3QL.nk`.

_Обратите внимание: хранение ключей шардировано по 2‑й и 3‑й букве ключа._

После бэкапа и удаления этих файлов `nsc list keys --all` покажет их как несохраненные. Вы можете продолжать обычную работу — `nsc` будет использовать signing‑ключи.

Поскольку вы обычно распространяете пользовательские ключи или creds‑файлы по приложениям, `nsc` не нужно хранить их у себя. Creds‑файлы — это конкатенация user JWT и соответствующего приватного ключа, поэтому не забудьте удалить и это.

Ключ и creds можно найти в `<nkyesdir>/keys/U/../<public-nkey>.nk` и `<nkyesdir>/creds/<operator-name>/<account-name>/<user-name>.creds`.

<a id="reissue-identity-nkeys"></a>
#### Переиздание identity‑NKEY

Если вы можете легко переразвернуть все необходимые ключи и JWT, просто регенерировав новый account/user (возможно, operator), это будет самым простым решением. Нужные шаги идентичны первоначальной настройке — поэтому это предпочтительно. Фактически, для user NKEY и JWT генерация и распространение новых ключей в затронутые приложения — лучший вариант.

Даже если регенерация аккаунта или оператора не ваш первый выбор, это может быть вашим последним вариантом. Ниже описаны шаги, которые для этого потребуются.

<a id="operator"></a>
#### **Оператор**

Чтобы переиздать identity‑NKEY оператора, используйте `nsc reissue operator`. Это сгенерирует новый identity‑NKEY и подпишет им оператора. `nsc` также переподпишет все аккаунты, подписанные исходным identity‑NKEY. Аккаунты, подписанные operator signing‑ключами, останутся нетронутыми.

Измененный operator JWT нужно развернуть на все затронутые `nats-server` (по одному). После того как все `nats-server` перезапущены с новым оператором, отправьте измененные аккаунты. В зависимости от модели развертывания, возможно, нужно распространить operator JWT и измененные account JWT во все другие окружения [`nsc`](jwt.md#nsc).

Этот процесс будет намного проще, если везде использовались operator signing‑ключи — тогда ни один аккаунт не будет переподписан. Если их не было, можно преобразовать старый identity‑NKEY в signing‑ключ через `nsc reissue operator --convert-to-signing-key`. Затем в удобное время удалите этот signing‑NKEY командой `nsc edit operator --rm-sk O..` и переразверните operator JWT на всех `nats-server`.

<a id="account"></a>
#### **Аккаунт**

В отличие от оператора, identity‑NKEY аккаунта нельзя изменить так же просто. User JWT явно ссылается на identity‑NKEY аккаунта, чтобы `nats-server` мог загрузить их через resolver. Это усложняет переиздание таких NKEY, поэтому мы настоятельно рекомендуем придерживаться signing‑ключей.

Базовый подход:

1. сгенерировать новый аккаунт с похожими настройками — включая signing‑NKEY,
2. переподписать всех пользователей, которые были подписаны старым identity‑NKEY,
3. сделать push аккаунта,
4. развернуть новый user JWT во всех программах, работающих внутри аккаунта.

Если использовались signing‑ключи, identity‑NKEY аккаунта нужен только для self‑sign account JWT при обмене с окружением [`nsc`](jwt.md#nsc) администраторов/операторов.

<a id="revocations"></a>
#### Отзывы (Revocations)

JWT для пользователей, активаций и аккаунтов могут быть явно отозваны. Кроме того, signing‑ключи могут быть удалены, что делает недействительными все JWT, подписанные удаленным NKEY.

<a id="user"></a>
#### **Пользователь**

Чтобы отозвать все JWT для пользователя в аккаунте, выполните `nsc revocations add-user --account <account name> --name <user name>`.

С аргументом `--at` можно указать время, отличное от текущего. Используйте `nsc revocations list-users --account <account name>` для проверки результата или `nsc revocations delete-user --account <account name> --name <user name>` для удаления отзыва.

```shell
nsc revocations add-user --account SYS --name sys
```
```
[ OK ] revoked user "UCL5YXXUKCEO4HDTTYUOHDMHP4JJ6MGE3SVQBDWFZUGJUMUKE24DEUCU"
```

```shell
nsc revocations list-users
```
```
+------------------------------------------------------------------------------------------+
|                                 Revoked Users for test5                                  |
+----------------------------------------------------------+-------------------------------+
| Public Key                                               | Revoke Credentials Before     |
+----------------------------------------------------------+-------------------------------+
| UAX7KQJJNL5NIRTSQSANKE3DNBHLLFUYKRXCD5QRKI75XBEHQOA4ZZGV | Wed, 10 Feb 2021 12:51:09 EST |
+----------------------------------------------------------+-------------------------------+
```

Обратите внимание: созданный отзыв относится только к JWT, выданным до указанного времени. Пользователи, созданные или обновленные после отзыва, будут валидны, так как находятся вне интервала отзыва. Также имейте в виду, что добавление отзыва изменяет аккаунт, поэтому его нужно отправить (push), чтобы опубликовать отзыв.

<a id="activations"></a>
#### **Активации**

Чтобы отозвать все активации export, определяемого `--account` и `--subject` (`--stream`, если export — stream), выданные для конкретного identity‑NKEY аккаунта, используйте:
```shell
nsc revocations add-activation --account <account name> --subject <export name>   --target-account <account identity public NKEY>
```

Используйте `nsc revocations list-activations --account SYS` для просмотра результата или:

```shell
nsc revocations delete_activation --account <account name>   --subject <export name> --target-account <account identity public NKEY>
```
чтобы удалить отзыв.

```shell
nsc revocations add-activation --account SYS --subject foo   --target-account AAUDEW26FB4TOJAQN3DYMDLCVXZMNIJWP2EMOAM5HGKLF6RGMO2PV7WP
```
```
[ OK ] revoked activation "foo" for account AAUDEW26FB4TOJAQN3DYMDLCVXZMNIJWP2EMOAM5HGKLF6RGMO2PV7WP
```

```shell
nsc revocations list-activations --account SYS
```
```
+------------------------------------------------------------------------------------------+
|                             Revoked Accounts for stream foo                              |
+----------------------------------------------------------+-------------------------------+
| Public Key                                               | Revoke Credentials Before     |
+----------------------------------------------------------+-------------------------------+
| AAUDEW26FB4TOJAQN3DYMDLCVXZMNIJWP2EMOAM5HGKLF6RGMO2PV7WP | Wed, 10 Feb 2021 13:22:11 EST |
+----------------------------------------------------------+-------------------------------+
```

Обратите внимание: созданный отзыв относится только к JWT, выданным до указанного времени. Активации, созданные или отредактированные после отзыва, будут валидны, так как находятся вне интервала отзыва. Также имейте в виду, что добавление отзыва изменяет аккаунт, поэтому его нужно отправить (push), чтобы опубликовать отзыв.

<a id="accounts"></a>
#### **Аккаунты**

Identity‑NKEY аккаунтов нельзя отзывать так же, как пользователей или активации. Вместо этого заблокируйте всех пользователей, установив число соединений в 0: `nsc edit account --name <account name> --conns 0`, и отправьте изменение: `nsc push --all`.

Альтернативно можно удалить аккаунт через `nsc delete account --name` и сделать так, чтобы resolver его не находил. Как это сделать, зависит от типа resolver:

* [mem-resolver](../configuration/securing_nats/jwt/resolver.md#memory):

   Удалите JWT из поля конфигурации `resolver_preload` и перезапустите все `nats-server`.
* [url-resolver](../configuration/securing_nats/jwt/resolver.md#url-resolver):

   Вручную удалите JWT из каталога хранилища `nats-account-server`.
* `nats-resolver`: удалите аккаунты командой `nsc push --all --prune`.

   Для этого resolver должен поддерживать удаление (`allow_delete: true`), и у вас должен быть operator signing‑ключ.

<a id="signing-keys"></a>
#### **Signing keys**

Accounts, Activations и Users можно массово отзывать, удалив соответствующий signing‑ключ.

Удаление operator signing‑ключа: `nsc edit operator --rm-sk <signing key>`. Поскольку это изменение оператора, чтобы оно вступило в силу, всем зависимым установкам [`nsc`](jwt.md#nsc) и `nats-server` нужна новая версия operator JWT.

Удаление account signing‑ключа: `nsc edit account --name <account name> --rm-sk <signing key>`. Чтобы изменение вступило в силу, его нужно отправить: `nsc push --all`.
