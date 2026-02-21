# Справочник API NATS

Обычный способ использовать JetStream — через клиентские библиотеки NATS, которые предоставляют набор функций JetStream для использования в программах. Но это не единственный способ программного взаимодействия с инфраструктурой JetStream. Так же как Core NATS имеет wire‑протокол поверх TCP, nats-server'ы с JetStream предоставляют набор сервисов поверх Core NATS.

## Справочник

Все эти subject указаны как константы в исходниках NATS Server, например subject `$JS.API.STREAM.LIST` представлен константой `api.JSApiStreamList` в исходниках nats-server. В таблицах ниже будут использоваться эти константы и структуры данных для payload.

Учтите: если ресурсы, к которым вы обращаетесь, имеют JetStream [domain](https://docs.nats.io/running-a-nats-service/configuration/leafnodes/jetstream_leafnodes#leaf-nodes), то префикс subject будет `$JS.{domain}.API`, а не `$JS.API`.

## Обработка ошибок

API, используемые административными инструментами, отвечают стандартизированным JSON, который включает ошибки.

```shell
nats req '$JS.API.STREAM.INFO.nonexisting' ''
```
```text
Published 11 bytes to $JS.API.STREAM.INFO.nonexisting
Received  [_INBOX.lcWgjX2WgJLxqepU0K9pNf.mpBW9tHK] : {
  "type": "io.nats.jetstream.api.v1.stream_info_response",
  "error": {
    "code": 404,
    "description": "stream not found"
  }
}
```

```shell
nats req '$JS.STREAM.INFO.ORDERS' ''
```
```text
Published 6 bytes to $JS.STREAM.INFO.ORDERS
Received  [_INBOX.fwqdpoWtG8XFXHKfqhQDVA.vBecyWmF] : '{
  "type": "io.nats.jetstream.api.v1.stream_info_response",
  "config": {
    "name": "ORDERS",
  ...
}
```

Здесь ответы содержат `type`, который можно использовать, чтобы найти JSON Schema для каждого ответа.

Неадминистративные API — например, добавление сообщения в stream — отвечают `-ERR` или `+OK` с опциональной причиной.

## Admin API

Все административные действия, которые может выполнять `nats` CLI, приведены в разделах ниже. Структура API хранится в пакете `api` репозитория `jsm.go`.

Subjects, оканчивающиеся на `T`, такие как `api.JSApiConsumerCreateT`, являются форматами и требуют подстановки имени Stream и в некоторых случаях имени Consumer. Например, `t := fmt.Sprintf(api.JSApiConsumerCreateT, streamName)` даёт итоговый subject.

Команда `nats events` покажет аудит‑лог всех событий доступа к API, включая полный контент каждого административного запроса — используйте это для просмотра структуры сообщений, которые отправляет команда `nats`.

API использует JSON для входов и выходов; все ответы типизированы полем `type`, которое указывает их Schema. Репозиторий JSON Schema находится в `nats-io/jsm.go/schemas`.

### Общая информация

| Subject | Constant | Description | Request Payload | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `$JS.API.INFO` | `api.JSApiAccountInfo` | Возвращает статистику и лимиты вашего аккаунта | пустой payload | `api.JetStreamAccountStats` |

### Streams

| Subject | Constant | Description | Request Payload | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `$JS.API.STREAM.LIST` | `api.JSApiStreamList` | Постраничный список известных Streams со всей текущей информацией | `api.JSApiStreamListRequest` | `api.JSApiStreamListResponse` |
| `$JS.API.STREAM.NAMES` | `api.JSApiStreamNames` | Постраничный список Streams | `api.JSApiStreamNamesRequest` | `api.JSApiStreamNamesResponse` |
| `$JS.API.STREAM.CREATE.*` | `api.JSApiStreamCreateT` | Создаёт новый Stream | `api.StreamConfig` | `api.JSApiStreamCreateResponse` |
| `$JS.API.STREAM.UPDATE.*` | `api.JSApiStreamUpdateT` | Обновляет существующий Stream новой конфигурацией | `api.StreamConfig` | `api.JSApiStreamUpdateResponse` |
| `$JS.API.STREAM.INFO.*` | `api.JSApiStreamInfoT` | Информация о конфигурации и состоянии Stream | пустой payload, имя Stream в subject | `api.JSApiStreamInfoResponse` |
| `$JS.API.STREAM.DELETE.*` | `api.JSApiStreamDeleteT` | Удаляет Stream и все его данные | пустой payload, имя Stream в subject | `api.JSApiStreamDeleteResponse` |
| `$JS.API.STREAM.PURGE.*` | `api.JSApiStreamPurgeT` | Очищает все данные Stream, сам Stream остаётся | пустой payload, имя Stream в subject | `api.JSApiStreamPurgeResponse` |
| `$JS.API.STREAM.MSG.DELETE.*` | `api.JSApiMsgDeleteT` | Удаляет конкретное сообщение в Stream по sequence, полезно для соответствия GDPR | `api.JSApiMsgDeleteRequest` | `api.JSApiMsgDeleteResponse` |
| `$JS.API.STREAM.MSG.GET.*` | `api.JSApiMsgGetT` | Получает конкретное сообщение из stream | `api.JSApiMsgGetRequest` | `api.JSApiMsgGetResponse` |
| `$JS.API.STREAM.SNAPSHOT.*` | `api.JSApiStreamSnapshotT` | Инициирует потоковую резервную копию данных stream | `api.JSApiStreamSnapshotRequest` | `api.JSApiStreamSnapshotResponse` |
| `$JS.API.STREAM.RESTORE.*` | `api.JSApiStreamRestoreT` | Инициирует потоковое восстановление stream | `{}` | `api.JSApiStreamRestoreResponse` |

### Consumers

| Subject                               | Constant | Description                                                                     | Request Payload | Response Payload |
|:--------------------------------------| :--- |:--------------------------------------------------------------------------------| :--- | :--- |
| `$JS.API.CONSUMER.CREATE.<stream>`           | `api.JSApiConsumerCreateT` | Создаёт ephemeral consumer                                                    | `api.ConsumerConfig` | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.DURABLE.CREATE.<stream>.<consumer>` | `api.JSApiDurableCreateT` | Создаёт consumer                                                              | `api.ConsumerConfig` | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.CREATE.<stream>.<consumer>.<filter>` | `api.JSApiConsumerCreateExT` | Создаёт consumer (server 2.9+) | `api.CreateConsumerRequest` | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.LIST.<stream>`             | `api.JSApiConsumerListT` | Постраничный список известных consumers с текущей информацией для заданного stream | `api.JSApiConsumerListRequest` | `api.JSApiConsumerListResponse` |
| `$JS.API.CONSUMER.NAMES.<stream>`            | `api.JSApiConsumerNamesT` | Постраничный список имён consumers для заданного stream | `api.JSApiConsumerNamesRequest` | `api.JSApiConsumerNamesResponse` |
| `$JS.API.CONSUMER.INFO.<stream>.<consumer>`           | `api.JSApiConsumerInfoT` | Информация о конкретном consumer по имени | пустой payload | `api.JSApiConsumerInfoResponse` |
| `$JS.API.CONSUMER.DELETE.<stream>.<consumer>` | `api.JSApiConsumerDeleteT` | Удаляет Consumer                                                             | пустой payload | `api.JSApiConsumerDeleteResponse` |
| `$JS.FC.<stream>.>` | N/A | Ответы flow‑control от consumer к подписчику для `PUSH` consumer. Также используется для sourcing и mirroring, которые реализованы как `PUSH` consumers. Если этот subject не пробрасывается, consumer может зависнуть под высокой нагрузкой.| пустой payload |  N/A |
| `$JSC.R.<uid>` | N/A | Reply subject, используемый запросом создания source/mirror consumer | Consumer info |  N/A |
| `$JS.S.<uid>` | N/A | Subject доставки по умолчанию для sourced streams. Может быть переопределён атрибутом `deliver` в конфигурации source. | Данные сообщений |  N/A |
| `$JS.M.<uid>` | N/A | Subject доставки по умолчанию для mirrored streams. Может быть переопределён атрибутом `deliver` в конфигурации mirror. | Данные сообщений |  N/A |
| `$JS.ACK.<stream>.>` | N/A | Подтверждения для `PULL` consumers. Когда этот subject не проброшен, `PULL` consumers в режимах ack `all` или `explicit` будут работать некорректно. | пустой payload |  reply subject |


### Stream Source и Mirror

Sourcing и mirroring streams используют 3 входящих и 2 исходящих subject для установления и управления потоком данных. При настройке прав или создании соглашений export/import нужно учитывать все 5 subject.

Примечания:
* Есть два варианта subject для создания consumer в зависимости от числа фильтров.
* В некоторых установках может присутствовать префикс домена, например `$JS.<domain>.API.CONSUMER.CREATE.<stream>.>`


| Subject                               | Direction | Description   | Reply | 
|:--------------------------------------| :--- |:--------------------------------------------------------------------------------| :--- | 
| `$JS.API.CONSUMER.CREATE.<stream>.>`  and/or  `$JS.API.CONSUMER.CREATE.<stream>`     | outbound | Создаёт ephemeral consumer для доставки ожидающих сообщений. Обратите внимание, что этот subject может иметь префикс домена JetStream `$JS.<domain>.API.CONSUMER.CREATE.<stream>.<consumer>`. <br>Создание consumer имеет 2 варианта в зависимости от числа filter subject:<br>* `$JS.API.CONSUMER.CREATE.<stream>` — когда фильтра нет или их несколько.<br> * `$JS.API.CONSUMER.CREATE.<stream>.<consumer>.<filter subject>` — когда фильтр ровно один                              | service request с `$JSC.R.<uid>` как reply subject |
|`$JS.FC.<stream>.>`  | outbound | Сообщения flow‑control. Будут при медленных маршрутах или когда цель не успевает за потоком сообщений.   | service request с `$JSC.R.<uid>` как reply subject |
|`$JSC.R.<uid>`           | inbound | Ответ на запрос создания consumer  | reply message на service request |
|`$JS.S.<uid>` (source) OR `$JS.M.<uid>` (mirror) OR `<custom deliver subject>`          | inbound | Данные сообщений и heartbeat'ы  | message stream|

#### Heartbeats и повторные попытки
Stream, из которого данные source/mirror, МОЖЕТ быть недоступен. Он может ещё не быть создан, ИЛИ маршрут может быть недоступен. Это не мешает созданию соглашения source/mirror.
* Целевой stream будет пытаться создавать consumer каждые 10–60 секунд. (Значение может измениться в будущем или быть настраиваемым.) Поэтому доставка может возобновиться только после небольшой задержки.
* Для активных consumers heartbeats отправляются с частотой 1/с.


#### Ограничения
* Не удаляйте и не пересоздавайте исходный stream! Вместо этого используйте flush/purge. Целевой stream помнит последний sequence ID для доставки. Удаление сбросит sequence ID.
* `$JS.FC.<stream>.>` — subject flow‑control НЕ имеет префикса домена JetStream. Это создаёт ограничение, при котором одинаково названные streams в разных доменах не могут надёжно source/mirror'иться в один аккаунт. Создавайте уникальные имена streams, чтобы избежать этой проблемы.

### ACL

При использовании ACL на основе subject обратите внимание на шаблоны subject, сгруппированные по назначению ниже.

Общая информация

```text
$JS.API.INFO
```

Stream Admin
```text
$JS.API.STREAM.CREATE.<stream>
$JS.API.STREAM.UPDATE.<stream>
$JS.API.STREAM.DELETE.<stream>
$JS.API.STREAM.INFO.<stream>
$JS.API.STREAM.PURGE.<stream>
$JS.API.STREAM.LIST
$JS.API.STREAM.NAMES
$JS.API.STREAM.MSG.DELETE.<stream>
$JS.API.STREAM.MSG.GET.<stream>
$JS.API.STREAM.SNAPSHOT.<stream>
$JS.API.STREAM.RESTORE.<stream>
```
Consumer Admin
```text
$JS.API.CONSUMER.CREATE.<stream>
$JS.API.CONSUMER.DURABLE.CREATE.<stream>.<consumer>
$JS.API.CONSUMER.DELETE.<stream>.<consumer>
$JS.API.CONSUMER.INFO.<stream>.<consumer>
$JS.API.CONSUMER.LIST.<stream>
$JS.API.CONSUMER.NAMES.<stream>
```

Поток сообщений consumer

```text
$JS.API.CONSUMER.MSG.NEXT.<stream>.<consumer>
$JS.SNAPSHOT.RESTORE.<stream>.<msg id>
$JS.ACK.<stream>.<consumer>.x.x.x
$JS.SNAPSHOT.ACK.<stream>.<msg id>
$JS.FC.<stream>.>
```

Опциональные события и advisories:

```text
$JS.EVENT.METRIC.CONSUMER_ACK.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.MSG_TERMINATED.<stream>.<consumer>
$JS.EVENT.ADVISORY.STREAM.CREATED.<stream>
$JS.EVENT.ADVISORY.STREAM.DELETED.<stream>
$JS.EVENT.ADVISORY.STREAM.UPDATED.<stream>
$JS.EVENT.ADVISORY.CONSUMER.CREATED.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.DELETED.<stream>.<consumer>
$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_CREATE.<stream>
$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_COMPLETE.<stream>
$JS.EVENT.ADVISORY.STREAM.RESTORE_CREATE.<stream>
$JS.EVENT.ADVISORY.STREAM.RESTORE_COMPLETE.<stream>
$JS.EVENT.ADVISORY.STREAM.LEADER_ELECTED.<stream>
$JS.EVENT.ADVISORY.STREAM.QUORUM_LOST.<stream>
$JS.EVENT.ADVISORY.CONSUMER.LEADER_ELECTED.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.QUORUM_LOST.<stream>.<consumer>
$JS.EVENT.ADVISORY.API
```

Этот дизайн позволяет легко создавать правила ACL, которые ограничивают пользователей конкретным Stream или Consumer и конкретными административными действиями. Чтобы обеспечить, что только получатель сообщения может его Ack'нуть, у нас есть права на ответ, позволяющие публиковать только в Response subject сообщений, которые вы получили.

## Подтверждение сообщений

Сообщения, требующие подтверждения, имеют reply subject, например `$JS.ACK.ORDERS.test.1.2.2`. Это префикс, определённый в `api.JetStreamAckPre`, далее идёт `<stream>.<consumer>.<delivered count>.<stream sequence>.<consumer sequence>.<timestamp>.<pending messages>`.

JetStream и consumer (включая sourced и mirrored streams) могут обмениваться сообщениями flow‑control. Сообщение с заголовком `NATS/1.0 100 FlowControl Request` должно получить ответ, иначе consumer может зависнуть. Reply subject выглядит так: `$JS.FC.orders.6i5h0GiQ.ep3Y`.

Во всех API, поддерживаемых Synadia, можно просто вызвать `msg.Respond(nil)` (или эквивалент в языке), чтобы отправить nil на reply subject.

## Получение следующего сообщения из pull‑based consumer

Если у вас pull‑based Consumer, можно отправить обычный NATS Request на `$JS.API.CONSUMER.MSG.NEXT.<stream>.<consumer>`. Формат определён в `api.JetStreamRequestNextT` и требует заполнения через `fmt.Sprintf()`.
