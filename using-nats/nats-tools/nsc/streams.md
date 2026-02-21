# Потоки

Чтобы делиться сообщениями, которые вы публикуете, с другими аккаунтами, нужно _экспортировать_ _Stream_. _Экспорты_ связаны с аккаунтом, выполняющим экспорт, и объявляются в JWT экспортирующего аккаунта.

### Добавление публичного экспорта Stream

Чтобы добавить stream в аккаунт:

```shell
nsc add export --name abc --subject "a.b.c.>"
```

```
  [ OK ] added public stream export "abc"
```

> Обратите внимание: мы экспортировали stream с subject, содержащим wildcard. Любой subject, совпадающий с шаблоном, будет экспортирован.

Чтобы посмотреть экспорт stream:

```shell
nsc describe account
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 13:35:42 UTC                                  │
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

╭───────────────────────────────────────────────────────────╮
│                          Exports                          │
├──────┬────────┬─────────┬────────┬─────────────┬──────────┤
│ Name │ Type   │ Subject │ Public │ Revocations │ Tracking │
├──────┼────────┼─────────┼────────┼─────────────┼──────────┤
│ abc  │ Stream │ a.b.c.> │ Yes    │ 0           │ N/A      │
╰──────┴────────┴─────────┴────────┴─────────────┴──────────╯
```

Сообщения этого аккаунта, опубликованные на `a.b.c.>`, будут пересылаться во все аккаунты, которые импортируют этот stream.

### Импорт Stream

Импорт stream позволяет получать сообщения, опубликованные другим _Account_. Чтобы импортировать Stream, нужно создать _Import_. Для создания _Import_ необходимо знать:

* Публичный ключ экспортирующего аккаунта
* Subject, на котором публикуется stream
* Можно замаппить subject stream на другой subject
* Самоимпорт не допускается; можно импортировать stream только из других аккаунтов

Имея необходимую информацию, добавим импорт публичного stream.

```bash
nsc add account B
```

```
[ OK ] generated and stored account key "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] added account "B"
```

```shell
nsc add import --src-account ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE --remote-subject "a.b.c.>"
```

```
[ OK ] added stream import "a.b.c.>"
```

> Обратите внимание: сообщения, опубликованные удаленным аккаунтом, будут получены на том же subject, что и изначально. Иногда хочется добавить префикс к сообщениям, получаемым из stream. Для этого укажите `--local-subject`. Подписчики в нашем аккаунте могут слушать `abc.>`. Например, если `--local-subject abc`, сообщение будет получено как `abc.a.b.c.>`.

И проверим:

```shell
nsc describe account
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 13:39:55 UTC                                  │
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

╭─────────────────────────────────────────────────────────────────────────────╮
│                                   Imports                                   │
├─────────┬────────┬─────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name    │ Type   │ Remote  │ Local/Prefix │ Expires │ From Account │ Public │
├─────────┼────────┼─────────┼──────────────┼─────────┼──────────────┼────────┤
│ a.b.c.> │ Stream │ a.b.c.> │              │         │ A            │ Yes    │
╰─────────┴────────┴─────────┴──────────────┴─────────┴──────────────┴────────╯
```

Добавим пользователя, чтобы делать запросы к сервису:

```bash
nsc add user b
```

```
[ OK ] generated and stored user key "UDKNTNEL5YD66U2FZZ2B3WX2PLJFKEFHAPJ3NWJBFF44PT76Y2RAVFVE"
[ OK ] generated user creds file "~/.nkeys/creds/O/B/b.creds"
[ OK ] added user "b" to account "B"
```

### Публикация изменений на NATS servers

Если ваши NATS servers настроены на использование встроенного resolver NATS, не забудьте «пушить» изменения аккаунтов, сделанные локально через `nsc add`, чтобы они вступили в силу.

Например: `nsc push -i` или `nsc push -a B -u nats://localhost`

### Тестирование Stream

```bash
nsc sub --account B --user b "a.b.c.>"
```

затем

```shell
nsc pub --account A --user U a.b.c.hello world
```

## Защита Streams

Если вы хотите создать stream, доступный только указанным аккаунтам, можно создать _private_ stream. Экспорт будет виден в вашем аккаунте, но _подписывающимся_ аккаунтам потребуется токен авторизации, который вы создаете сами и генерируете специально для подписывающегося аккаунта.

Токен авторизации — это JWT, подписанный вашим аккаунтом, где вы разрешаете клиентскому аккаунту импортировать ваш экспорт.

### Создание private stream export

```shell
nsc add export --subject "private.abc.*" --private --account A
```

Это похоже на определение экспорта, но на этот раз мы добавили флаг `--private`. Также обратите внимание, что subject содержит wildcard. Это позволяет аккаунту маппить конкретные subjects на конкретно авторизованные аккаунты.

```shell
nsc describe account A
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 14:24:02 UTC                                  │
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

╭──────────────────────────────────────────────────────────────────────────╮
│                                 Exports                                  │
├───────────────┬────────┬───────────────┬────────┬─────────────┬──────────┤
│ Name          │ Type   │ Subject       │ Public │ Revocations │ Tracking │
├───────────────┼────────┼───────────────┼────────┼─────────────┼──────────┤
│ abc           │ Stream │ a.b.c.>       │ Yes    │ 0           │ N/A      │
│ abc           │ Stream │ a.b.c.>       │ Yes    │ 0           │ N/A      │
│ private.abc.* │ Stream │ private.abc.* │ No     │ 0           │ N/A      │
╰───────────────┴────────┴───────────────┴────────┴─────────────┴──────────╯
```

### Генерация activation token

Чтобы внешний аккаунт мог _импортировать_ приватный stream, нужно сгенерировать activation token. Помимо выдачи прав аккаунту, activation token также позволяет ограничить subject экспортируемого stream.

Для генерации токена нужен публичный ключ аккаунта, который импортирует сервис. Публичный ключ аккаунта B можно узнать так:

```bash
nsc list keys --account B
```

```
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

```bash
nsc generate activation --account A --target-account AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H --subject private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H -o /tmp/activation.jwt
```

```
[ OK ] generated "private.abc.*" activation for account "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] wrote account description to "/tmp/activation.jwt"
```

Команда использовала аккаунт с экспортом ('A'), публичный ключ аккаунта B и subject, на который stream будет публиковать для аккаунта B.

Для полноты, содержимое JWT‑файла:

```shell
cat /tmp/activation.jwt
```

```
-----BEGIN NATS ACTIVATION JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJIS1FPQU9aQkVKS1JYNFJRUVhXS0xYSVBVTlNOSkRRTkxXUFBTSTQ3NkhCVVNYT0paVFFRIiwiaWF0IjoxNTc1NTU1OTczLCJpc3MiOiJBREVUUFQzNldCSUJVS00zSUJDVk00QTVZVVNEWEZFSlBXNE02R0dWQllDQlc3UlJORlRWNU5HRSIsIm5hbWUiOiJwcml2YXRlLmFiYy5BQU00NkUzWUY1V09aU0U1V05ZV0hOM1lZSVNWWk9TSTZYSFRGMlE2NEVDUFhTRlFaUk9KTVAySCIsInN1YiI6IkFBTTQ2RTNZRjVXT1pTRTVXTllXSE4zWVlJU1ZaT1NJNlhIVEYyUTY0RUNQWFNGUVpST0pNUDJIIiwidHlwZSI6ImFjdGl2YXRpb24iLCJuYXRzIjp7InN1YmplY3QiOiJwcml2YXRlLmFiYy5BQU00NkUzWUY1V09aU0U1V05ZV0hOM1lZSVNWWk9TSTZYSFRGMlE2NEVDUFhTRlFaUk9KTVAySCIsInR5cGUiOiJzdHJlYW0ifX0.yD2HWhRQYUFy5aQ7zNV0YjXzLIMoTKnnsBB_NsZNXP-Qr5fz7nowyz9IhoP7UszkN58m__ovjIaDKI9ml0l9DA
------END NATS ACTIVATION JWT------
```

В декодированном виде:

```shell
nsc describe jwt -f /tmp/activation.jwt 
```

```
╭────────────────────────────────────────────────────────────────────────────────────────╮
│                                       Activation                                       │
├─────────────────┬──────────────────────────────────────────────────────────────────────┤
│ Name            │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Account ID      │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H             │
│ Issuer ID       │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE             │
│ Issued          │ 2019-12-05 14:26:13 UTC                                              │
│ Expires         │                                                                      │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Hash ID         │ GWIS5YCSET4EXEOBXVMQKXAR4CLY4IIXFV4MEMRUXPSQ7L4YTZ4Q====             │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Import Type     │ Stream                                                               │
│ Import Subject  │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Max Messages    │ Unlimited                                                            │
│ Max Msg Payload │ Unlimited                                                            │
│ Network Src     │ Any                                                                  │
│ Time            │ Any                                                                  │
╰─────────────────┴──────────────────────────────────────────────────────────────────────╯
```

Токен можно передать напрямую клиентскому аккаунту.

> Если вы управляете большим количеством токенов для разных аккаунтов, можно разместить activation tokens на web‑сервере и поделиться URL. Плюс такого подхода — любые обновления токена будут доступны импортирующему аккаунту при обновлении его аккаунта, если URL остается стабильным.

## Импорт private stream

Импорт private stream более естественный, чем public, так как activation token уже содержит все необходимые детали. Обратите внимание, что токен может быть как путем к файлу, так и удаленным URL.

```shell
nsc add import --account B --token /tmp/activation.jwt
```

```
[ OK ] added stream import "private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
```

Описание аккаунта B:

```shell
nsc describe account B
```

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 14:29:16 UTC                                  │
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

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                Imports                                                                                                │
├──────────────────────────────────────────────────────────────────────┬────────┬──────────────────────────────────────────────────────────────────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name                                                                 │ Type   │ Remote                                                               │ Local/Prefix │ Expires │ From Account │ Public │
├──────────────────────────────────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────────────────┼──────────────┼─────────┼──────────────┼────────┤
│ a.b.c.>                                                              │ Stream │ a.b.c.>                                                              │              │         │ A            │ Yes    │
│ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │ Stream │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │              │         │ A            │ No     │
╰──────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────┴──────────────┴─────────┴──────────────┴────────╯
```

### Тестирование private stream

Тестирование private stream ничем не отличается от public:

```bash
nsc tools sub --account B --user b private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H
```

затем

```shell
nsc tools pub --account A --user U private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H hello
```
