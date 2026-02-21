# Подробный разбор модели JetStream

## Лимиты stream, retention и политики

Streams хранят данные на диске, но хранить всё вечно невозможно, поэтому нужны способы автоматически контролировать их размер.

Есть 3 механизма, которые определяют, как долго stream хранит данные.

`Retention Policy` описывает, по каким критериям набор будет удалять сообщения из хранилища:

| Retention Policy  | Описание |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LimitsPolicy`    | Задают лимиты на количество сообщений, размер хранилища и возраст сообщений. |
| `WorkQueuePolicy` | Сообщения хранятся до тех пор, пока не будут потреблены: то есть доставлены (_единственному_ consumer'у, фильтрующему по subject сообщения (в этом режиме нельзя иметь пересекающихся consumers на stream — каждый subject, захваченный stream, может иметь только одного consumer'а одновременно)) подписанному приложению и явно подтверждены этим приложением. |
| `InterestPolicy`  | Сообщения хранятся, пока на stream есть Consumers (соответствующие subject сообщения, если это фильтруемые consumers), для которых сообщение ещё не было ACK'нуто. После того как все текущие consumers получили явное подтверждение от подписанного приложения, сообщение удаляется из stream. |

Во всех retention‑политиках базовые лимиты применяются как верхние границы: `MaxMsgs` — сколько сообщений хранится всего, `MaxBytes` — общий размер, `MaxAge` — максимальный возраст сообщения. Эти лимиты — единственные, действующие при `LimitsPolicy`.

Можно определить дополнительные способы удаления сообщения из stream раньше этих лимитов. В `WorkQueuePolicy` сообщения удаляются, как только _consumer_ получил Acknowledgement. В `InterestPolicy` сообщения удаляются, как только _все_ consumers stream для данного subject получили Acknowledgement за сообщение.

В `WorkQueuePolicy` и `InterestPolicy` ограничения по возрасту, размеру и количеству всё равно действуют как верхние границы.

Последний контроль — максимальный размер одного сообщения. В NATS есть собственный лимит максимального размера (по умолчанию 1 МиБ), но можно сказать, что stream принимает сообщения только до 1024 байт с помощью `MaxMsgSize`.

`Discard Policy` задаёт, как отбрасываются сообщения при достижении лимитов `LimitsPolicy`. Опция `DiscardOld` удаляет старые сообщения, освобождая место для новых, а `DiscardNew` отклоняет новые сообщения.

Режим `WorkQueuePolicy` — специализированный режим, где сообщение после потребления и подтверждения удаляется из stream.

## Дедупликация сообщений

JetStream поддерживает идемпотентные записи сообщений, игнорируя дубликаты, обозначенные заголовком `Nats-Msg-Id`.

```shell
nats req -H Nats-Msg-Id:1 ORDERS.new hello1
nats req -H Nats-Msg-Id:1 ORDERS.new hello2
nats req -H Nats-Msg-Id:1 ORDERS.new hello3
nats req -H Nats-Msg-Id:1 ORDERS.new hello4
```

Здесь мы устанавливаем заголовок `Nats-Msg-Id:1`, который говорит JetStream обеспечить отсутствие дубликатов этого сообщения — учитывается только ID сообщения, а не тело.

```shell
nats stream info ORDERS
```

В выводе видно, что дубли публикаций обнаружены, и в stream хранится только одно сообщение (первое).

```
....
State:

            Messages: 1
               Bytes: 67 B
```

Окно по умолчанию для отслеживания дублей — 2 минуты, его можно задать в командной строке через `--dupe-window` при создании stream, хотя большие окна мы не рекомендуем.

## Модели подтверждений

Streams поддерживают подтверждение получения сообщения: если вы отправляете `Request()` на subject, покрытый конфигурацией Stream, сервис ответит после сохранения сообщения. Если вы просто публикуете — нет. В конфигурации Stream можно отключить подтверждения, установив `NoAck` в `true`.

Consumers имеют 3 режима подтверждений:

| Режим          | Описание |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AckExplicit` | Требует явного подтверждения каждого сообщения; единственный поддерживаемый вариант для pull‑based Consumers |
| `AckAll`      | Подтверждение сообщения `100` также подтверждает сообщения `1`–`99`; хорошо для обработки батчей и снижения накладных расходов на ack |
| `AckNone`     | Подтверждения не поддерживаются |

Чтобы понять, как Consumers отслеживают сообщения, начнём с чистого Stream `ORDERS` и Consumer `DISPATCH`.

```shell
nats str info ORDERS
```

```
...
Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 0
             LastSeq: 0
    Active Consumers: 1
```

Набор полностью пуст.

```shell
nats con info ORDERS DISPATCH
```

```
...
State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 1
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
        Pending Messages: 0
    Redelivered Messages: 0
```

Consumer не имеет незавершённых сообщений и никогда их не имел (Consumer sequence равен 1).

Публикуем одно сообщение в Stream и видим, что Stream его получил:

```shell
nats pub ORDERS.processed "order 4"
```

```
Published 7 bytes to ORDERS.processed
$ nats str info ORDERS
...
Statistics:

            Messages: 1
               Bytes: 53 B
            FirstSeq: 1
             LastSeq: 1
    Active Consumers: 1
```

Так как Consumer pull‑based, мы можем получить сообщение, ack'нуть его и проверить состояние Consumer:

```shell
nats con next ORDERS DISPATCH
```

```
--- received on ORDERS.processed
order 4

Acknowledged message

$ nats con info ORDERS DISPATCH
...
State:

  Last Delivered Message: Consumer sequence: 2 Stream sequence: 2
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 0
    Redelivered Messages: 0
```

Сообщение доставлено и подтверждено — `Acknowledgement floor` равен `1` и `1`, последовательность Consumer равна `2`, то есть прошло только одно сообщение и было подтверждено. Поскольку оно ack'нуто, ничего не ожидает и не переотправляется.

Публикуем ещё одно сообщение, получаем его, но на этот раз не ack'аем и смотрим статус:

```shell
nats pub ORDERS.processed "order 5"
```

```
Published 7 bytes to ORDERS.processed
```

Получаем следующее сообщение у consumer (но не подтверждаем его)

```shell
nats consumer next ORDERS DISPATCH --no-ack
```

```
--- received on ORDERS.processed
order 5
```

Показываем информацию о consumer

```shell
nats consumer info ORDERS DISPATCH
```

```
State:

  Last Delivered Message: Consumer sequence: 3 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 1
    Redelivered Messages: 0
```

Теперь видно, что Consumer обработал 2 сообщения (obs sequence равен 3, следующее сообщение будет 3), но Ack floor всё ещё 1 — значит одно сообщение ожидает подтверждения. Это подтверждается `Pending messages`.

Если получить его снова и опять не ack'нуть:

```shell
nats consumer next ORDERS DISPATCH --no-ack
```

```
--- received on ORDERS.processed
order 5
```

Показать информацию о consumer ещё раз:

```shell
nats consumer info ORDERS DISPATCH
```

```
State:

  Last Delivered Message: Consumer sequence: 4 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 1
    Redelivered Messages: 1
```

Последовательность Consumer растёт — каждая попытка доставки увеличивает sequence — и счётчик повторной доставки тоже растёт.

Наконец, если снова получить сообщение и теперь ack'нуть:

```shell
nats consumer next ORDERS DISPATCH 
```

```
--- received on ORDERS.processed
order 5

Acknowledged message
```

Показать информацию о consumer

```shell
nats consumer info ORDERS DISPATCH
```

```
State:

  Last Delivered Message: Consumer sequence: 5 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 0
    Redelivered Messages: 0
```

Теперь, когда сообщение ack'нуто, ожидающих больше нет.

Кроме того, есть несколько типов подтверждений:

| Тип          | Bytes       | Описание                                                                                                                        |
| ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `AckAck`      | nil, `+ACK` | Подтверждает, что сообщение полностью обработано                                                                                      |
| `AckNak`      | `-NAK`      | Сигнализирует, что сообщение сейчас не будет обработано, и обработка может перейти к следующему; NAK‑сообщение будет повторно доставлено    |
| `AckProgress` | `+WPI`      | Если отправлено до истечения AckWait, означает, что работа продолжается и период следует продлить ещё на `AckWait` |
| `AckNext`     | `+NXT`      | Подтверждает обработку сообщения и запрашивает доставку следующего сообщения на reply subject. Применимо только к pull‑режиму.    |
| `AckTerm`     | `+TERM`     | Инструктирует сервер прекратить повторную доставку сообщения, не считая его успешно обработанным                            |

До сих пор все примеры использовали подтверждение типа `AckAck`. Отвечая на Ack телом, указанным в `Bytes`, вы можете выбрать нужный режим. Обратите внимание: это описание внутреннего протокола JetStream. Клиентские библиотеки предоставляют API для всех этих подтверждений, не заставляя вас разбираться во внутреннем payload протокола.

Все эти режимы подтверждений, кроме `AckNext`, поддерживают двойное подтверждение — если вы зададите reply subject при подтверждении, сервер в ответ подтвердит получение вашего ACK.

Подтверждение `+NXT` имеет несколько форматов: `+NXT 10` запрашивает 10 сообщений, а `+NXT {"no_wait": true}` — это те же данные, которые можно отправить в Pull Request.

## Семантика Exactly Once

JetStream поддерживает публикацию и потребление «ровно один раз», комбинируя дедупликацию сообщений и двойные подтверждения.

На стороне публикации можно избежать повторного приема сообщений, используя [Message Deduplication](model_deep_dive.md#message-deduplication).

Consumers могут быть на 100% уверены, что сообщение корректно обработано, запросив у сервера подтверждение получения вашего подтверждения (иногда это называют double‑acking), вызывая `AckSync()` у сообщения (а не `Ack()`), что задаёт reply subject на Ack и ждёт ответа от сервера о получении и обработке подтверждения. Если полученный ответ указывает на успех, можно быть уверенным, что сообщение больше никогда не будет повторно доставлено consumer'ом (из‑за потери подтверждения).

## Стартовая позиция consumer

При настройке Consumer можно определить точку начала; система поддерживает следующие значения `DeliverPolicy`:

| Политика              | Описание                                                                |
| ------------------- | -------------------------------------------------------------------------- |
| `all`               | Доставляет все доступные сообщения                                   |
| `last`              | Доставляет последнее сообщение, как `tail -n 1 -f`                         |
| `new`               | Доставляет только новые сообщения, пришедшие после подписки                |
| `by_start_time`     | Доставляет с заданного времени. Требуется установить `OptStartTime`    |
| `by_start_sequence` | Доставляет с заданной последовательности stream. Требуется установить `OptStartSeq` | 

Независимо от выбранного режима это только стартовая точка. После старта consumer всегда отдаёт то, чего вы ещё не видели или не подтвердили. Это просто способ выбрать самое первое сообщение.

Рассмотрим каждый вариант: сначала создадим новый Stream `ORDERS` и добавим 100 сообщений.

Теперь создадим pull‑based Consumer `DeliverAll`:

```shell
nats consumer add ORDERS ALL --pull --filter ORDERS.processed --ack none --replay instant --deliver all 
nats consumer next ORDERS ALL
```

```
--- received on ORDERS.processed
order 1

Acknowledged message
```

Теперь создадим pull‑based Consumer `DeliverLast`:

```shell
nats consumer add ORDERS LAST --pull --filter ORDERS.processed --ack none --replay instant --deliver last
nats consumer next ORDERS LAST
```

```
--- received on ORDERS.processed
order 100

Acknowledged message
```

Теперь создадим pull‑based Consumer `MsgSetSeq`:

```shell
nats consumer add ORDERS TEN --pull --filter ORDERS.processed --ack none --replay instant --deliver 10
nats consumer next ORDERS TEN
```

```
--- received on ORDERS.processed
order 10

Acknowledged message
```

И, наконец, consumer на основе времени. Добавим сообщения с интервалом в минуту:

```shell
nats stream purge ORDERS
for i in 1 2 3
do
  nats pub ORDERS.processed "order ${i}"
  sleep 60
done
```

Затем создадим consumer, начинающийся 2 минуты назад:

```shell
nats consumer add ORDERS 2MIN --pull --filter ORDERS.processed --ack none --replay instant --deliver 2m
nats consumer next ORDERS 2MIN
```

```
--- received on ORDERS.processed
order 2

Acknowledged message
```

## Ephemeral consumers

До этого все consumers были durable — они существуют даже после отключения от JetStream. В нашем сценарии ORDERS consumer `MONITOR` мог бы быть краткоживущим, когда оператор отлаживает систему; нет необходимости помнить последнюю позицию, если вы просто хотите наблюдать текущее состояние в реальном времени.

В этом случае можно сделать Ephemeral Consumer: сначала подписаться на delivery subject, затем создать consumer без durable имени. Ephemeral Consumer существует, пока активна какая-либо подписка на его delivery subject. Он автоматически удаляется после короткого «grace period» для обработки перезапусков, когда подписчиков больше нет.

Terminal 1:

```shell
nats sub my.monitor
```

Terminal 2:

```shell
nats consumer add ORDERS --filter '' --ack none --target 'my.monitor' --deliver last --replay instant --ephemeral
```

Опция `--ephemeral` сообщает системе создать Ephemeral Consumer.

## Скорость доставки сообщений consumer'ом

Обычно вы хотите, чтобы при создании нового consumer выбранные сообщения доставлялись максимально быстро. Но иногда вы хотите воспроизводить сообщения с той же скоростью, с какой они приходили. Например, если сообщения изначально приходили раз в минуту, то новый consumer тоже будет получать их раз в минуту.

Это полезно в сценариях нагрузочного тестирования и т. п. Это называется `ReplayPolicy` и имеет значения `ReplayInstant` и `ReplayOriginal`.

`ReplayPolicy` можно задать только для push‑based Consumers.

```shell
nats consumer add ORDERS REPLAY --target out.original --filter ORDERS.processed --ack none --deliver all --sample 100 --replay original
```

```
...
     Replay Policy: original
...
```

Теперь опубликуем сообщения в Set с интервалом 10 секунд:

```shell
for i in 1 2 3                                                                                                                                                      <15:15:35
do
  nats pub ORDERS.processed "order ${i}"
  sleep 10
done
```

```
Published [ORDERS.processed] : 'order 1'
Published [ORDERS.processed] : 'order 2'
Published [ORDERS.processed] : 'order 3'
```

И при потреблении они будут приходить каждые 10 секунд:

```shell
nats sub -t out.original
```

```
Listening on [out.original]
2020/01/03 15:17:26 [#1] Received on [ORDERS.processed]: 'order 1'
2020/01/03 15:17:36 [#2] Received on [ORDERS.processed]: 'order 2'
2020/01/03 15:17:46 [#3] Received on [ORDERS.processed]: 'order 3'
^C
```

## Сэмплирование Ack

В предыдущих разделах мы видели, что сэмплы отправляются в систему мониторинга. Рассмотрим это подробно: как работает система мониторинга и что в ней содержится.

Проходя через Consumer, сообщения могут повторно доставляться, и может быть важно знать, сколько раз и как часто они повторно доставляются, а также сколько времени занимает подтверждение сообщений.

Consumers могут сэмплировать ack'нутые сообщения и публиковать сэмплы, чтобы ваша система мониторинга могла наблюдать здоровье Consumer. Мы добавим поддержку этого в [NATS Surveyor](https://github.com/nats-io/nats-surveyor).

### Конфигурация

Вы можете настроить сэмплирование Consumer'а, передав опцию `--sample 80` в `nats consumer add`, что означает выборку 80% подтверждений.

При просмотре информации о Consumer можно увидеть, включено ли сэмплирование:

```shell
nats consumer info ORDERS NEW
```

Вывод содержит

```
...
     Sampling Rate: 100
...
```

## Накладные расходы хранения

Файловое хранилище JetStream очень эффективно и хранит минимум дополнительной информации о сообщении.

Мы сохраняем некоторые данные с каждым сообщением:

* Заголовки сообщения
* Subject, на который оно было получено
* Время получения
* Payload сообщения
* Хеш сообщения
* Sequence сообщения
* Несколько дополнительных битов, таких как длина subject и длина заголовков

Без заголовков размер:

```
length of the message record (4bytes) + seq(8) + ts(8) + subj_len(2) + subj + msg + hash(8)
```

Сообщение `hello` длиной 5 байт без заголовков занимает 39 байт.

С заголовками:

```
length of the message record (4bytes) + seq(8) + ts(8) + subj_len(2) + subj + hdr_len(4) + hdr + msg + hash(8)
```

Если вы публикуете много маленьких сообщений, накладные расходы будут относительно большими, но для крупных сообщений они очень малы. Если публикуете много маленьких сообщений, имеет смысл оптимизировать длину subject.
