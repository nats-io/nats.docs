# Поиск аккаунта через Resolver

Параметр конфигурации `resolver` используется совместно с [JWT‑аутентификацией NATS](./) и [nsc](../../../../using-nats/nats-tools/nsc/). Опция `resolver` задает URL, по которому `nats-server` может получить JWT аккаунта. Есть 3 реализации resolver:

* [NATS Based Resolver](resolver.md#nats-based-resolver) — предпочтительный вариант и рекомендуемый выбор по умолчанию.
* [`MEMORY`](resolver.md#memory) — если вы хотите статически задать аккаунты в конфигурации сервера.
* [`URL`](resolver.md#url-resolver) — если вы хотите построить собственный сервис аккаунтов, обычно для интеграции безопасности NATS с внешней системой.

> Если в operator JWT, заданном в `operator`, уже указан URL resolver для аккаунтов, `resolver` нужно задавать только чтобы переопределить значение по умолчанию.

<a id="nats-based-resolver"></a>
## NATS Based Resolver

NATS‑based resolver — предпочтительный и самый простой способ включить поиск аккаунтов для серверов NATS. Он встроен в `nats-server` и хранит JWT аккаунтов в локальном (не разделяемом) каталоге, к которому имеет доступ сервер (то есть нельзя использовать один и тот же каталог для нескольких `nats-server`). Все серверы в кластере или супер‑кластере должны быть настроены на его использование, и они реализуют механизм «eventually consistent» через NATS и системный аккаунт для синхронизации (или поиска) данных аккаунтов между собой.

Чтобы не хранить все JWT аккаунтов на каждом `nats-server` (например, если аккаунтов _очень_ много), у этого resolver есть два подтипа: `full` и `cache`.

В этом режиме администраторы обычно используют CLI‑инструмент [`nsc`](../../../../using-nats/nats-tools/nsc/) для локального создания/управления JWT и выполняют `nsc push`, чтобы отправлять новые JWT во встроенные resolver сервера, `nsc pull`, чтобы обновлять локальные копии JWT аккаунтов, и `nsc revocations`, чтобы отзывать их.

### Full

Full resolver означает, что `nats-server` хранит все JWT и обменивается ими с другими resolver того же типа в режиме eventual consistency.

```yaml
resolver: {
    type: full
    # Каталог, в котором будут храниться jwt аккаунтов
    dir: './jwt'
    # Для поддержки удаления jwt установите true
    # Если тип resolver — full, удаление переименует jwt.
    # Это позволяет вручную восстановить на случай случайного удаления.
    # Чтобы восстановить jwt, удалите добавленный суффикс .delete и перезапустите
    # или отправьте сигнал перезагрузки.
    # Чтобы освободить место, удалите файлы с суффиксом .delete вручную.
    allow_delete: false
    # Интервал, с которым nats-server с nats‑based account resolver будет сравнивать
    # свое состояние с одним случайным nats‑based account resolver в кластере и при необходимости
    # обмениваться jwt и сходиться к одному набору jwt.
    interval: "2m"
    # Ограничение на число хранимых jwt; новые jwt будут отклоняться после достижения лимита.
    limit: 1000
}
```

Этот тип resolver также поддерживает `resolver_preload`. Когда он задан, JWT перечисляются и сохраняются в resolver. Там они могут обновляться. Перезапуски `nats-server` будут сохранять эти более новые версии.

Не каждому серверу в кластере нужно быть настроенным как `full`. Должно быть достаточно таких серверов, чтобы обслуживать нагрузку, даже если часть узлов офлайн.

<a id="cache"></a>
### Cache

Cache resolver означает, что `nats-server` хранит только подмножество JWT и вытесняет другие по схеме LRU.
Cache опирается на один или несколько `full` NATS‑based resolver, чтобы получать аккаунты, отсутствующие в кэше. Cache resolver НЕ принимает push‑сообщения аккаунтов от `nsc`, поэтому не подходит для самостоятельной работы без наличия full‑resolver.

```yaml
resolver: {
    type: cache
    # Каталог, в котором будут храниться jwt аккаунтов
    dir: "./"
    # Ограничение на число хранимых jwt; старые jwt будут вытесняться после достижения лимита.
    limit: 1000
    # Сколько времени держать jwt перед удалением.
    ttl: "2m"
}
```

<a id="nats-based-resolver---integration"></a>
### NATS‑Based Resolver — интеграция

NATS‑based resolver использует системный аккаунт для поиска и загрузки JWT аккаунтов. Если требуется более тесная интеграция, можно использовать эти subject для собственных интеграций.

Чтобы загрузить или обновить любой сгенерированный JWT аккаунта без [`nsc`](../../../../using-nats/nats-tools/nsc/), отправьте его как запрос на `$SYS.REQ.CLAIMS.UPDATE`. Каждый участвующий `full` NATS‑based account resolver ответит сообщением об успехе или ошибке.

Чтобы обслуживать запрошенный JWT аккаунта самостоятельно и фактически реализовать account server, подпишитесь на `$SYS.REQ.ACCOUNT.*.CLAIMS.LOOKUP` и отвечайте JWT аккаунта, соответствующим запрошенному id аккаунта (wildcard).

<a id="migrating-account-data"></a>
### Миграция данных аккаунтов

Чтобы мигрировать данные аккаунтов при переходе со standalone (REST) account server на встроенный NATS account resolver (или между средами NATS или account server), можно использовать `nsc`:

1. Выполните `nsc pull`, чтобы убедиться, что у вас есть копия всех данных аккаунтов с сервера на локальной машине.
2. Переконфигурируйте серверы, чтобы использовать nats resolver вместо URL resolver.
3. Измените параметр "account server URL" в операторе на nats URL из старого REST URL: то есть просто скопируйте nats URL из параметра "service URLs" оператора в account server URL. `nsc edit operator --account-jwt-server-url <nats://...>`
4. Выполните `nsc push -A`, чтобы отправить данные аккаунтов на nats‑servers с использованием встроенного nats account resolver.

Также можно передавать account server URL напрямую флагом командам `nsc pull` и `nsc push`.

<a id="memory"></a>
## MEMORY

Resolver `MEMORY` статически настраивается в конфигурационном файле сервера. Этот режим используется, если вы предпочитаете управлять разрешением аккаунтов «вручную» через конфиги `nats-server`. Memory resolver использует директиву `resolver_preload`, которая задает map публичных ключей на JWT аккаунтов:

```yaml
resolver: MEMORY
resolver_preload: {
ACSU3Q6LTLBVLGAQUONAGXJHVNWGSKKAUA7IY5TB4Z7PLEKSR5O6JTGR: eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJPRFhJSVI2Wlg1Q1AzMlFJTFczWFBENEtTSDYzUFNNSEZHUkpaT05DR1RLVVBISlRLQ0JBIiwiaWF0IjoxNTU2NjU1Njk0LCJpc3MiOiJPRFdaSjJLQVBGNzZXT1dNUENKRjZCWTRRSVBMVFVJWTRKSUJMVTRLM1lERzNHSElXQlZXQkhVWiIsIm5hbWUiOiJBIiwic3ViIjoiQUNTVTNRNkxUTEJWTEdBUVVPTkFHWEpIVk5XR1NLS0FVQTdJWTVUQjRaN1BMRUtTUjVPNkpUR1IiLCJ0eXBlIjoiYWNjb3VudCIsIm5hdHMiOnsibGltaXRzIjp7InN1YnMiOi0xLCJjb25uIjotMSwibGVhZiI6LTEsImltcG9ydHMiOi0xLCJleHBvcnRzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJ3aWxkY2FyZHMiOnRydWV9fX0._WW5C1triCh8a4jhyBxEZZP8RJ17pINS8qLzz-01o6zbz1uZfTOJGvwSTS6Yv2_849B9iUXSd-8kp1iMXHdoBA
```

Resolver `MEMORY` рекомендуется, когда на сервере небольшое число аккаунтов, которые нечасто меняются.

Подробнее о настройке memory resolver — в [этом руководстве](mem_resolver.md).

<a id="url-resolver"></a>
## URL Resolver

**ПРИМЕЧАНИЕ:** [Standalone NATS Account JWT Server](https://nats-io.gitbook.io/legacy-nats-docs/nats-account-server) теперь считается _legacy_; используйте [NATS Based Resolver](resolver.md#nats-based-resolver). Однако опция URL resolver все еще доступна, если вы хотите реализовать собственную версию account resolver.

`URL` resolver задает URL, к которому сервер может дописывать публичный ключ аккаунта, чтобы получить JWT этого аккаунта. Соглашение для standalone NATS Account JWT Server — отдавать JWT по адресу: `http://localhost:9090/jwt/v1/accounts/`. Для такой конфигурации resolver задается так:

```yaml
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

> Обратите внимание: если вы не используете nats-account-server, URL может быть любым, при условии что при добавлении публичного ключа аккаунта возвращается соответствующий JWT.

Если используемый сервер требует клиентскую аутентификацию или вы хотите указать, какому CA доверять при поиске информации об аккаунте, задайте `resolver_tls`. Эта [карта конфигурации `tls`](../tls.md) позволяет дополнительно ограничить TLS для resolver.
