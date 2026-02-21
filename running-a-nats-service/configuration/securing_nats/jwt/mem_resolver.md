# Руководство по Memory Resolver

Resolver `MEMORY` — встроенный в сервер resolver для JWT аккаунтов. Если аккаунтов немного или они меняются нечасто, это может быть более простой вариант, не требующий внешнего account resolver. Поддерживается перезагрузка конфигурации сервера, то есть preloads можно обновлять в конфигурации и перезагружать без рестарта сервера.

Базовая конфигурация сервера требует:

* operator JWT
* `resolver`, установленный в `MEMORY`
* `resolver_preload`, заданный объектом, где публичные ключи аккаунтов сопоставляются с JWT аккаунтов.

## Создание необходимых сущностей

Создадим подготовку:

```shell
nsc add operator -n memory
```
```
Generated operator key - private key stored "~/.nkeys/memory/memory.nk"
Success! - added operator "memory"
```

Добавим аккаунт 'A'

```shell
nsc add account --name A
```
```
Generated account key - private key stored "~/.nkeys/memory/accounts/A/A.nk"
Success! - added account "A"
```

Опишем аккаунт

```shell
nsc describe account -W
```
```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ACSU3Q6LTLBVLGAQUONAGXJHVNWGSKKAUA7IY5TB4Z7PLEKSR5O6JTGR │
│ Issuer ID                 │ ODWZJ2KAPF76WOWMPCJF6BY4QIPLTUIY4JIBLU4K3YDG3GHIWBVWBHUZ │
│ Issued                    │ 2019-04-30 20:21:34 UTC                                  │
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
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯
```

Создадим нового пользователя 'TA'

```shell
nsc add user --name TA
```
```
Generated user key - private key stored "~/.nkeys/memory/accounts/A/users/TA.nk"
Generated user creds file "~/.nkeys/memory/accounts/A/users/TA.creds"
Success! - added user "TA" to "A"
```

## Создание конфигурации сервера

Инструмент `nsc` может автоматически сгенерировать конфигурационный файл. Вы задаете путь к конфигу сервера, а `nsc` генерирует конфиг за вас:

```shell
nsc generate config --mem-resolver --config-file /tmp/server.conf
```

Если нужны дополнительные настройки, можно использовать [`include`](/running-a-nats-service/configuration/README.md#include-directive) в основной конфигурации, чтобы ссылаться на сгенерированные файлы. Иначе можно запустить сервер и сослаться на сгенерированную конфигурацию:

```shell
nats-server -c /tmp/server.conf
```

Далее можно [протестировать](mem_resolver.md#testing-the-configuration).

## Ручная конфигурация сервера

Хотя генерировать конфигурационный файл просто, вы можете захотеть собрать его вручную, чтобы понимать детали. При созданных сущностях и стандартном расположении каталога `.nsc` можно ссылаться на operator JWT и account JWT в конфигурации сервера или использовать строку JWT напрямую. Помните, что ваша конфигурация будет в `$NSC_HOME/nats/<operator_name>/<operator_name>.jwt` для оператора. JWT аккаунта будет в `$NSC_HOME/nats/<operator_name>/accounts/<account_name>/<account_name>.jwt`.

Для конфигурации потребуется:

* путь к operator JWT
* копия содержимого файла account JWT

Формат файла:

```
operator: <path to the operator jwt or jwt itself>
resolver: MEMORY
resolver_preload: {
    <public key for an account>: <contents of the account jwt>
    ### add as many accounts as you want
    ...
}
```

В этом примере это выглядит так:

```
operator: /Users/synadia/.nsc/nats/memory/memory.jwt
resolver: MEMORY
resolver_preload: {
ACSU3Q6LTLBVLGAQUONAGXJHVNWGSKKAUA7IY5TB4Z7PLEKSR5O6JTGR: eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJPRFhJSVI2Wlg1Q1AzMlFJTFczWFBENEtTSDYzUFNNSEZHUkpaT05DR1RLVVBISlRLQ0JBIiwiaWF0IjoxNTU2NjU1Njk0LCJpc3MiOiJPRFdaSjJLQVBGNzZXT1dNUENKRjZCWTRRSVBMVFVJWTRKSUJMVTRLM1lERzNHSElXQlZXQkhVWiIsIm5hbWUiOiJBIiwic3ViIjoiQUNTVTNRNkxUTEJWTEdBUVVPTkFHWEpIVk5XR1NLS0FVQTdJWTVUQjRaN1BMRUtTUjVPNkpUR1IiLCJ0eXBlIjoiYWNjb3VudCIsIm5hdHMiOnsibGltaXRzIjp7InN1YnMiOi0xLCJjb25uIjotMSwibGVhZiI6LTEsImltcG9ydHMiOi0xLCJleHBvcnRzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJ3aWxkY2FyZHMiOnRydWV9fX0._WW5C1triCh8a4jhyBxEZZP8RJ17pINS8qLzz-01o6zbz1uZfTOJGvwSTS6Yv2_849B9iUXSd-8kp1iMXHdoBA
}
```

Сохраните конфиг в server.conf и запустите сервер:

```shell
nats-server -c server.conf
```

Далее можно [протестировать](mem_resolver.md#testing-the-configuration).

<a id="testing-the-configuration"></a>
## Проверка конфигурации

Чтобы проверить конфигурацию, просто используйте один из стандартных инструментов:

```shell
nats pub --creds ~/.nkeys/creds/memory/A/TA.creds hello world
```
