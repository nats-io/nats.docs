# Сервисы

Чтобы делиться сервисами, к которым другие аккаунты могут обращаться через request‑reply, нужно _экспортировать_ _Service_. _Services_ связаны с аккаунтом, выполняющим ответы, и объявляются в JWT экспортирующих аккаунтов.

## Добавление публичного экспорта Service

Чтобы добавить сервис в аккаунт:

```bash
nsc add export --name help --subject help --service
```
```text
[ OK ] added public service export "help"
```

Чтобы просмотреть экспорт сервиса:

```bash
nsc describe account
```
```text
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-04 18:20:42 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Imports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭────────────────────────────────────────────────────────────╮
│                          Exports                           │
├──────┬─────────┬─────────┬────────┬─────────────┬──────────┤
│ Name │ Type    │ Subject │ Public │ Revocations │ Tracking │
├──────┼─────────┼─────────┼────────┼─────────────┼──────────┤
│ help │ Service │ help    │ Yes    │ 0           │ -        │
╰──────┴─────────┴─────────┴────────┴─────────────┴──────────╯
```

## Импорт Service

Импорт сервиса позволяет отправлять запросы в удаленный _Account_. Чтобы импортировать Service, нужно создать _Import_. Для создания import нужно знать:

* Публичный ключ экспортирующего аккаунта
* Subject, на котором сервис слушает
* Можно замаппить subject сервиса на другой subject
* Самоимпорт не допускается; можно импортировать сервисы только из других аккаунтов

Как просмотреть JWT из account server — [см. статью](../../../legacy/nas/inspecting_jwts.md).

Сначала создадим второй аккаунт, в который будем импортировать сервис:

```bash
nsc add account B
```
```text
[ OK ] generated and stored account key "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] added account "B"
```

Добавим импорт subject `help`:

```shell
nsc add import --src-account ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE --remote-subject help --service
```
```text
[ OK ] added service import "help"
```

Проверим:

```bash
nsc describe account
```
```text
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-04 20:12:42 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────╮
│                                 Imports                                  │
├──────┬─────────┬────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name │ Type    │ Remote │ Local/Prefix │ Expires │ From Account │ Public │
├──────┼─────────┼────────┼──────────────┼─────────┼──────────────┼────────┤
│ help │ Service │ help   │ help         │         │ A            │ Yes    │
╰──────┴─────────┴────────┴──────────────┴─────────┴──────────────┴────────╯
```

Добавим пользователя, чтобы делать запросы к сервису:

```bash
nsc add user b
```
```text
[ OK ] generated and stored user key "UDKNTNEL5YD66U2FZZ2B3WX2PLJFKEFHAPJ3NWJBFF44PT76Y2RAVFVE"
[ OK ] generated user creds file "~/.nkeys/creds/O/B/b.creds"
[ OK ] added user "b" to account "B"
```

### Публикация изменений на nats servers

Если ваши nats servers настроены на использование встроенного NATS resolver, не забудьте «пушить» изменения аккаунтов, сделанные локально через `nsc add`, чтобы они вступили в силу.

Например: `nsc push -i` или `nsc push -a B -u nats://localhost`

### Тестирование сервиса

Для теста сервиса установим CLI‑инструмент ['nats'](/using-nats/nats-tools/nats_cli):

Запустим процесс, который будет обрабатывать запрос. Этот процесс будет работать из аккаунта 'A' с пользователем 'U':

```shell
nats reply --creds ~/.nkeys/creds/O/A/U.creds help "I will help"                
```

Помните, что можно также:
```shell
nsc reply --account A --user U help "I will help"
```

Отправим запрос:

```shell
nats request --creds ~/.nkeys/creds/O/B/b.creds help me
```

Сервис получает запрос:

```text
Received on [help]: 'me'
```

А ответ получает запрашивающий:

```text
Received  [_INBOX.v6KAX0v1bu87k49hbg3dgn.StIGJF0D] : 'I will help'
```

Или проще:

```bash
nsc reply --account A --user U help "I will help"
nsc req --account B --user b help me
```
```text
published request: [help] : 'me'
received reply: [_INBOX.GCJltVq1wRSb5FoJrJ6SE9.w8utbBXR] : 'I will help'
```

## Защита сервисов

Если вы хотите создать сервис, доступный только указанным аккаунтам, можно создать _private_ service. Экспорт будет виден в вашем аккаунте, но подписывающимся аккаунтам потребуется токен авторизации, который вы создаете сами и генерируете специально для запрашивающего аккаунта. Токен авторизации — это JWT, подписанный вашим аккаунтом, где вы разрешаете клиентскому аккаунту импортировать ваш сервис.

### Создание private service export

```shell
nsc add export --subject "private.help.*" --private --service --account A
```
```text
[ OK ] added private service export "private.help.*"
```

Как и раньше, мы объявили export, но теперь добавили флаг `--private`. Также обратите внимание, что subject содержит wildcard. Это позволяет аккаунту маппить конкретные subjects на конкретно авторизованные аккаунты.

```bash
nsc describe account A
```
```text
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-04 20:19:19 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Imports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────────────────────────╮
│                                   Exports                                   │
├────────────────┬─────────┬────────────────┬────────┬─────────────┬──────────┤
│ Name           │ Type    │ Subject        │ Public │ Revocations │ Tracking │
├────────────────┼─────────┼────────────────┼────────┼─────────────┼──────────┤
│ help           │ Service │ help           │ Yes    │ 0           │ -        │
│ private.help.* │ Service │ private.help.* │ No     │ 0           │ -        │
╰────────────────┴─────────┴────────────────┴────────┴─────────────┴──────────╯
```

### Генерация activation token

Чтобы внешний аккаунт мог _импортировать_ приватный сервис и отправлять запросы, нужно сгенерировать activation token. Токен, кроме выдачи прав аккаунту, позволяет ограничить subject сервиса:

Чтобы сгенерировать токен, нужен публичный ключ аккаунта, импортирующего сервис. Публичный ключ аккаунта B можно узнать так:

```bash
nsc list keys --account B
```
```text
╭──────────────────────────────────────────────────────────────────────────────────────────╮
│                                           Keys                                           │
├────────┬──────────────────────────────────────────────────────────┬─────────────┬────────┤
│ Entity │ Key                                                      │ Signing Key │ Stored │
├────────┼──────────────────────────────────────────────────────────┼─────────────┼────────┤
│ O      │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │             │ *      │
│  B     │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │             │ *      │
│   b    │ UDKNTNEL5YD66U2FZZ2B3WX2PLJFKEFHAPJ3NWJBFF44PT76Y2RAVFVE │             │ *      │
╰────────┴──────────────────────────────────────────────────────────┴─────────────┴────────╯
```

```shell
nsc generate activation --account A --target-account AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H --subject private.help.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H -o /tmp/activation.jwt
```
```text
[ OK ] generated "private.help.*" activation for account "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] wrote account description to "/tmp/activation.jwt"
```

Команда использовала аккаунт с экспортом ('A'), публичный ключ аккаунта B, subject, на который будут обрабатываться запросы от аккаунта B, и файл для сохранения токена. Subject экспорта позволяет сервису обрабатывать все запросы на private.help.*, но аккаунт B может запрашивать только конкретный subject.

Для полноты, содержимое JWT‑файла:

```bash
cat /tmp/activation.jwt
```
```text
-----BEGIN NATS ACTIVATION JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJUS01LNEFHT1pOVERDTERGUk9QTllNM0hHUVRDTEJTUktNQUxXWTVSUUhFVEVNNE1VTDdBIiwiaWF0IjoxNTc1NDkxNjEwLCJpc3MiOiJBREVUUFQzNldCSUJVS00zSUJDVk00QTVZVVNEWEZFSlBXNE02R0dWQllDQlc3UlJORlRWNU5HRSIsIm5hbWUiOiJwcml2YXRlLmhlbHAuQUFNNDZFM1lGNVdPWlNFNVdOWVdITjNZWUlTVlpPU0k2WEhURjJRNjRFQ1BYU0ZRWlJPSk1QMkgiLCJzdWIiOiJBQU00NkUzWUY1V09aU0U1V05ZV0hOM1lZSVNWWk9TSTZYSFRGMlE2NEVDUFhTRlFaUk9KTVAySCIsInR5cGUiOiJhY3RpdmF0aW9uIiwibmF0cyI6eyJzdWJqZWN0IjoicHJpdmF0ZS5oZWxwLkFBTTQ2RTNZRjVXT1pTRTVXTllXSE4zWVlJU1ZaT1NJNlhIVEYyUTY0RUNQWFNGUVpST0pNUDJIIiwidHlwZSI6InNlcnZpY2UifX0.4tFx_1UzPUwbV8wFNIJsQYu91K9hZaGRLE10nOphfHGetvMPv1384KC-1AiNdhApObSDFosdDcpjryD0QxaDCQ
------END NATS ACTIVATION JWT------
```

В декодированном виде:

```shell
nsc describe jwt -f /tmp/activation.jwt
```
```text
╭─────────────────────────────────────────────────────────────────────────────────────────╮
│                                       Activation                                        │
├─────────────────┬───────────────────────────────────────────────────────────────────────┤
│ Name            │ private.help.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Account ID      │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H              │
│ Issuer ID       │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE              │
│ Issued          │ 2019-12-04 20:33:30 UTC                                               │
│ Expires         │                                                                       │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Hash ID         │ DD6BZKI2LTQKAJYD5GTSI4OFUG72KD2BF74NFVLUNO47PR4OX64Q====              │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Import Type     │ Service                                                               │
│ Import Subject  │ private.help.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
├─────────────────┼───────────────────────────────────────────────────────────────────────┤
│ Max Messages    │ Unlimited                                                             │
│ Max Msg Payload │ Unlimited                                                             │
│ Network Src     │ Any                                                                   │
│ Time            │ Any                                                                   │
╰─────────────────┴───────────────────────────────────────────────────────────────────────╯
```

Токен можно передать напрямую клиентскому аккаунту.

> Если вы управляете большим количеством токенов для разных аккаунтов, можно разместить activation tokens на web‑сервере и поделиться URL. Плюс такого подхода — любые обновления токена будут доступны импортирующему аккаунту при обновлении его аккаунта, если URL остается стабильным. При использовании JWT account server токены можно хранить прямо на сервере и делиться URL, который выводится при генерации токена.

## Импорт private service

Импорт private service более естественный, чем public, потому что activation token содержит все необходимые детали. Токен может быть как путем к файлу, так и удаленным URL.

```shell
nsc add import --account B -u /tmp/activation.jwt --local-subject private.help --name private.help
```
```text
[ OK ] added service import "private.help.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
```

Описание аккаунта B:
```shell
nsc describe account B
```
```text
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-04 20:38:06 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                     Imports                                                                     │
├──────────────┬─────────┬───────────────────────────────────────────────────────────────────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name         │ Type    │ Remote                                                                │ Local/Prefix │ Expires │ From Account │ Public │
├──────────────┼─────────┼───────────────────────────────────────────────────────────────────────┼──────────────┼─────────┼──────────────┼────────┤
│ help         │ Service │ help                                                                  │ help         │         │ A            │ Yes    │
│ private.help │ Service │ private.help.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │ private.help │         │ A            │ No     │
╰──────────────┴─────────┴───────────────────────────────────────────────────────────────────────┴──────────────┴─────────┴──────────────┴────────╯
```

При импорте сервиса можно указать локальный subject, который вы будете использовать для запросов. В данном случае это `private.help`. Однако при пересылке запроса NATS отправляет его на удаленный subject.

### Тестирование private service

Тестирование private service ничем не отличается от public:

```bash
nsc reply --account A --user U "private.help.*" "help is here"
nsc req --account B --user b private.help help_me
```
```text
published request: [private.help] : 'help_me'
received reply: [_INBOX.3MhS0iCHfqO8wUl1x59bHB.jpE2jvEj] : 'help is here'
```
