# Маппинг и преобразования subjects

Subject mapping и transforms — мощная функция сервера NATS. Преобразования (будем использовать mapping и transform как взаимозаменяемые термины) применяются в разных ситуациях, когда сообщения генерируются и поступают, действуя как трансляции и в некоторых сценариях — как фильтры.

{% hint style="warning" %}
Mapping и transforms — продвинутая тема. Прежде чем продолжить, убедитесь, что вы понимаете такие концепции NATS, как кластеры, аккаунты и потоки.
{% endhint %}

**Transforms можно определять (подробности ниже):**
* На корневом уровне конфигурационного файла (применяется к аккаунту по умолчанию $G). Применяется ко всем совпадающим сообщениям, входящим через клиентское или leaf node подключение в этот аккаунт. Несовпадающие subjects остаются без изменений.
* На уровне отдельных аккаунтов по тем же правилам.
* На subjects, импортируемых в аккаунт.
* В контексте [JetStream](#subject-mapping-and-transforms-in-streams):
    * На сообщениях, импортируемых потоками
    * На сообщениях, перепубликуемых JetStream
    * На сообщениях, копируемых в поток через source или mirror. Для этой цели transform действует как фильтр.

**Transforms могут использоваться для:**
* Перевода между пространствами имен. Например, при маппинге между аккаунтами, а также когда кластеры и leaf nodes используют разную семантику для одного subject.
* Подавления subjects. Например, временно для тестирования.
* Обратной совместимости после изменения иерархии именования subjects.
* Слияния subjects.
* [Дизамбигуации и изоляции в супер‑кластерах или leaf nodes](#cluster-scoped-mappings) с использованием разных transforms в разных кластерах и leaf nodes.
* Тестирования. Например, временного объединения тестового subject с production subject или перенаправления production subject от production consumer.
* [Партиционирования subjects](#deterministic-subject-token-partitioning) и потоков JetStream
* [Фильтрации](#subject-mapping-and-transforms-in-streams) сообщений, копируемых (sourced/mirrored) в поток JetStream
* [Chaos‑тестирования и семплирования. Mappings могут быть взвешенными](#weighted-mappings). Это позволяет перенаправлять определенный процент сообщений, симулируя потерю, сбои и т. п.
* ...

**Приоритет и последовательность операций**

* Transforms применяются сразу при входе сообщения в область, где определен transform (кластер, аккаунт, leaf node, поток), независимо от того, как сообщение попало (публикация клиентом, прохождение через gateway, импорт потока, source/mirror потока). И до применения маршрутизации или интереса подписок. Сообщение будет выглядеть так, как будто оно было опубликовано с преобразованного subject во всех случаях.

* Transforms **не применяются рекурсивно** в одной и той же области. Это необходимо, чтобы избежать тривиальных циклов. В примере ниже применяется только первое совпадающее правило.

```shell
mappings: {
	transform.order target.order
	target.order transform.order
}
```

* Transforms **применяются последовательно** при прохождении через разные области. Например:
    1. Subject преобразуется при публикации
    2. Маршрутизируется в leaf node и преобразуется при получении на leaf node
    3. Импортируется в поток и сохраняется под преобразованным именем
    4. Перепубликуется из потока в Core NATS под финальным целевым subject

В центральном кластере:
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
	orders.* orders.central.{{wildcard(1)}}
}
```
ИЛИ
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
	orders.> orders.central.>}
}
```

В leaf‑кластере
```
server_name: "store1"
cluster: { name: "store1" }
mappings: {
	orders.central.* orders.local.{{wildcard(1)}}
}
```

Конфигурация потока на leaf‑кластере
```
{
  "name": "orders",
  "subjects": [ "orders.local.*"],
  "subject_transform":{"src":"orders.local.*","dest":"orders.{{wildcard(1)}}"},
  "retention": "limits",
  ...
  "republish": {
    "src": "orders.*",
    "dest": "orders.trace.{{wildcard(1)}}"
  },
```

**Безопасность**

При использовании **управления аккаунтами через конфигурационные файлы** (без JWT‑безопасности) вы можете определять transforms на уровне аккаунта Core NATS в конфигурации сервера и просто перезагружать конфигурацию при изменениях.

При использовании **operator JWT security** (распределенная безопасность) со встроенным resolver вы определяете transforms и import/exports в JWT аккаунта. После изменения они вступят в силу сразу после того, как обновленный JWT будет отправлен на серверы.

**Тестирование и отладка**

{% hint style="info" %}
Вы можете легко тестировать отдельные правила subject transform с помощью команды CLI [`nats`](../using-nats/nats-tools/nats\_cli/) `nats server mapping`. См. примеры ниже.
{% endhint %}

{% hint style="info" %}
Начиная с NATS server 2.11 (и последующих версий) обработку subjects, включая mappings, можно наблюдать через `nats trace`.

В примере ниже сообщение сначала дизамбигуируется из `orders.device1.order1` -> `orders.hub.device1.order1`, затем импортируется в поток и хранится под исходным именем.

```shell
nats trace orders.device1.order1

Tracing message route to subject orders.device1.order1

Client "NATS CLI Version development" cid:16 cluster:"hub" server:"hub" version:"2.11.0-dev"
    Mapping subject:"orders.hub.device1.order1"
--J JetStream action:"stored" stream:"orders" subject:"orders.device1.order1"
--X No active interest

Legend: Client: --C Router: --> Gateway: ==> Leafnode: ~~> JetStream: --J Error: --X

Egress Count:

  JetStream: 1
````
{% endhint %}

## Simple mappings

Пример `foo:bar` прост. Все сообщения, полученные сервером на subject `foo`, будут перемаплены, и их смогут получать клиенты, подписанные на `bar`.

```
nats server mapping foo bar foo
> bar
```
Когда subject не указан, команда работает в интерактивном режиме:

```
nats server mapping foo bar
> Enter subjects to test, empty subject terminates.
>
> ? Subject foo
> bar

> ? Subject test
> Error: no matching transforms available
```

Пример конфигурации сервера. Обратите внимание, что mappings ниже применяются только к аккаунту $G по умолчанию.
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
    orders.flush  orders.central.flush 
	orders.* orders.central.{{wildcard(1)}}
}
```

Mapping с полным wildcard
```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
    orders.>  orders.central.> 
}
```

С аккаунтами. Этот mapping применяется к конкретному аккаунту.

```
server_name: "hub"
cluster: { name: "hub" }

accounts {
    accountA: { 
        mappings: {
            orders.flush  orders.central.flush 
        	orders.* orders.central.{{wildcard(1)}}
        }
    }
}
```

## Mapping с полным wildcard '>'

Полный wildcard‑токен можно использовать ОДИН раз в исходном выражении, и он должен присутствовать в целевом выражении тоже ровно один раз.

Пример: добавление префикса к subject:
```
nats server mapping ">"  "baz.>" bar.a.b
> baz.bar.b.a
```

## Перестановка токенов subject

Wildcard‑токены можно ссылочно использовать по номеру позиции в mapping назначения (только для версий `nats-server` 2.8.0 и выше). Синтаксис: `{{wildcard(position)}}`. Например, `{{wildcard(1)}}` ссылается на первый wildcard‑токен, `{{wildcard(2)}}` — на второй и т. д.

Пример: при transform‑правиле `"bar.*.*" : "baz.{{wildcard(2)}}.{{wildcard(1)}}"` сообщения, опубликованные в `bar.a.b`, будут перемаплены в `baz.b.a`. Сообщения, поступающие на сервер по `bar.one.two`, будут маппиться в `baz.two.one` и т. д. Попробуйте сами с `nats server mapping`.

```
nats server mapping "bar.*.*"  "baz.{{wildcard(2)}}.{{wildcard(1)}}" bar.a.b
> baz.b.a
```

{% hint style="info" %}
В других примерах может встречаться устаревший синтаксис mapping с `$1`.`$2` вместо `{{wildcard(1)}}.{{wildcard(2)}}`.
{% endhint %}

## Удаление токенов subject

Вы можете удалять токены из subject, не используя все wildcard‑токены в destination transform, за исключением mappings, определенных как часть import/export между аккаунтами, где _все_ wildcard‑токены должны использоваться в destination transform.

```
nats server mapping "orders.*.*" "foo.{{wildcard(2)}}" orders.local.order1
> orders.order1
```

{% hint style="info" %}
Mapping import/export должен быть двунаправленным и однозначным.
{% endhint %}

## Разделение токенов

Есть два способа разделить токены:

### Разделение по разделителю

Можно разделить токен по каждому вхождению строки‑разделителя, используя функцию transform `split(separator)`.

Примеры:

* Разделение по '-': `nats server mapping "*" "{{split(1,-)}}" foo-bar` возвращает `foo.bar`.
* Разделение по '--': `nats server mapping "*" "{{split(1,--)}}" foo--bar` возвращает `foo.bar`.

### Разделение по смещению

Можно разделить токен на две части в конкретной позиции от начала или конца токена, используя функции `SplitFromLeft(wildcard index, offset)` и `SplitFromRight(wildcard index, offset)` (обратите внимание, верхний CamelCase необязателен — можно использовать и нижний регистр).

Примеры:

* Разделить токен на позиции 4 слева: `nats server mapping "*" "{{splitfromleft(1,4)}}" 1234567` возвращает `1234.567`.
* Разделить токен на позиции 4 справа: `nats server mapping "*" "{{splitfromright(1,4)}}" 1234567` возвращает `123.4567`.

## Нарезка токенов

Можно нарезать токены на несколько частей через заданный интервал от начала или конца, используя функции `SliceFromLeft(wildcard index, number of characters)` и `SliceFromRight(wildcard index, number of characters)`.

Примеры:

* Разбить каждые 2 символа слева: `nats server mapping "*" "{{slicefromleft(1,2)}}" 1234567` возвращает `12.34.56.7`.
* Разбить каждые 2 символа справа: `nats server mapping "*" "{{slicefromright(1,2)}}" 1234567` возвращает `1.23.45.67`.

## Детерминированное партиционирование токенов subject

Детерминированное партиционирование позволяет использовать адресацию на основе subjects для детерминированного разделения (partition) потока сообщений, где один или несколько токенов subject преобразуются в ключ партиции. Детерминированно означает, что одни и те же токены всегда мапятся в один и тот же ключ. Маппинг выглядит случайным и может быть не «честным» при малом количестве subjects.

Например, новые заказы публикуются на `neworders.<customer id>`. Можно распределить эти сообщения по 3 партициям (bucket) с помощью функции `partition(number of partitions, wildcard token positions...)`, которая возвращает номер партиции (от 0 до number of partitions-1), используя mapping `"neworders.*" : "neworders.{{wildcard(1)}}.{{partition(3,1)}}"`.

```
nats server mapping "neworders.*" "neworders.{{wildcard(1)}}.{{partition(3,1)}}" neworders.customerid1
> neworders.customerid1.0
```

{% hint style="info" %}
Можно указывать несколько позиций токенов, чтобы сформировать _составной ключ партиции_. Например, subject `foo.*.*` может иметь transform `foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(5,1,2)}}`, который даст пять партиций вида `foo.*.*.<n>`, используя хеш двух wildcard‑токенов при вычислении номера партиции.

```
nats server mapping "foo.*.*" "foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(5,1,2)}}" foo.us.customerid 
> foo.us.customerid.0
```
{% endhint %}

Этот transform означает, что любое сообщение, опубликованное на `neworders.<customer id>`, будет мапиться в `neworders.<customer id>.<номер партиции 0, 1 или 2>`, т. е.:

| Published on          | Mapped to               |
| --------------------- | ----------------------- |
| neworders.customerid1 | neworders.customerid1.0 |
| neworders.customerid2 | neworders.customerid2.2 |
| neworders.customerid3 | neworders.customerid3.1 |
| neworders.customerid4 | neworders.customerid4.2 |
| neworders.customerid5 | neworders.customerid5.1 |
| neworders.customerid6 | neworders.customerid6.0 |

Transform детерминированный, потому что (пока число партиций равно 3) 'customerid1' всегда будет мапиться в один и тот же номер партиции. Маппинг основан на хеше; распределение случайное, но стремится к «идеально сбалансированному» (то есть чем больше ключей, тем сильнее количество ключей в каждой партиции стремится к одинаковому).

Можно партиционировать по нескольким wildcard‑токенам одновременно, например: `{{partition(10,1,2)}}` распределяет объединение токенов 1 и 2 по 10 партициям.

| Published on | Mapped to |
| ------------ | --------- |
| foo.1.a      | foo.1.a.1 |
| foo.1.b      | foo.1.b.0 |
| foo.2.b      | foo.2.b.9 |
| foo.2.a      | foo.2.a.2 |

Данный детерминированный partition transform позволяет распределить сообщения, на которые подписываются через одного подписчика (на `neworders.*`), на трех отдельных подписчиков (соответственно `neworders.*.0`, `neworders.*.1` и `neworders.*.2`), которые могут работать параллельно.

```
nats server mapping "foo.*.*" "foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(3,1,2)}}"
```

### Когда детерминированное партиционирование полезно

Core NATS queue‑groups и JetStream durable consumers распределяют сообщения между подписчиками без партиций и недетерминированно, то есть нет гарантии, что два последовательных сообщения, опубликованные на одном subject, попадут к одному и тому же подписчику. Во многих сценариях динамическое распределение по спросу — то, что нужно, но это происходит ценой гарантий порядка: два последовательных сообщения могут быть доставлены двум разным подписчикам, которые обработают их с разной скоростью (или потребуется повторная доставка, или сеть медленная и т. п.), что может привести к доставке «не по порядку».

Это означает, что если приложению требуется строго упорядоченная обработка, нужно ограничить распределение сообщений «по одному за раз» (на consumer/queue‑group, то есть через настройку `max acks pending`), что снижает масштабируемость, потому что независимо от числа воркеров одновременно работает только один.

Возможность равномерно разделять (партиционировать) subjects детерминированно (то есть все сообщения по конкретному subject всегда попадают в одну партицию) позволяет распределять и масштабировать обработку сообщений в потоке subject, сохраняя строгий порядок по subject. Например, вставляя номер партиции как токен в subject сообщения в определении потока и затем используя фильтры subjects для создания consumer на каждую партицию (или набор партиций).

Еще один сценарий, где детерминированное партиционирование полезно, — экстремальные скорости публикаций, когда вы упираетесь в пропускную способность приема сообщений в поток, который захватывает сообщения через wildcard subject. Этот предел может наступить при очень высокой скорости, потому что один процесс nats-server выступает RAFT‑лидером (координатором) для данного потока и может стать узким местом. В этом случае можно распределить (партиционировать) поток на несколько меньших потоков (каждый со своим RAFT‑лидером, распределенным по JetStream‑сервером кластера, а не на одном), чтобы масштабироваться.

Еще один случай — если вы хотите использовать локальное кэширование данных (контекст или, например, тяжелые исторические данные), к которым подписчик должен обращаться при обработке сообщений.

## Weighted mappings

Трафик можно разделять по процентам от одного subject transform на несколько transforms.

### Для A/B тестирования или canary‑релизов

Пример для canary‑развертываний, начиная с версии 1 сервиса.

Приложения делают запросы к сервису на `myservice.requests`. Ответчики сервиса подписываются на `myservice.requests.v1`. Конфигурация будет такой:

```
  myservice.requests: [
    { destination: myservice.requests.v1, weight: 100% }
  ]
```

Все запросы на `myservice.requests` пойдут в версию 1.

Когда появляется версия 2, вы хотите протестировать её canary‑развертыванием. Версия 2 подписывается на `myservice.requests.v2`. Запустите экземпляры сервиса.

Обновите конфигурацию, чтобы перенаправить часть запросов на версию 2.

Например, конфигурация ниже означает, что 98% запросов будут отправлены в версию 1 и 2% — в версию 2.

```
    myservice.requests: [
        { destination: myservice.requests.v1, weight: 98% },
        { destination: myservice.requests.v2, weight: 2% }
    ]
```

Когда вы убедитесь, что версия 2 стабильна, можно переключить 100% трафика на неё и выключить экземпляры версии 1.

### Для traffic shaping в тестировании

Traffic shaping полезен при тестировании. Например, у вас есть сервис в QA, который симулирует сценарии отказов и должен получать 20% трафика, чтобы тестировать requester.

`myservice.requests.*: [{ destination: myservice.requests.{{wildcard(1)}}, weight: 80% }, { destination: myservice.requests.fail.{{wildcard(1)}}, weight: 20% }]`

### Для искусственных потерь

Можно добавить потери для chaos‑тестирования, направив процент трафика на тот же subject. В этом радикальном примере 50% трафика, опубликованного на `foo.loss.a`, будет искусственно отброшено сервером.

`foo.loss.>: [ { destination: foo.loss.>, weight: 50% } ]`

Можно одновременно делить и вводить потери. Здесь 90% запросов пойдут на ваш сервис, 8% — на сервис, симулирующий условия отказов, а оставшиеся 2% будут «потеряны».

`myservice.requests: [{ destination: myservice.requests.v3, weight: 90% }, { destination: myservice.requests.v3.fail, weight: 8% }]` — оставшиеся 2% «теряются».

## Cluster scoped mappings

Если вы запускаете супер‑кластер, можно определить transforms, которые применяются только к сообщениям, публикуемым из конкретного кластера.

Например, если у вас 3 кластера `east`, `central` и `west`, и вы хотите маппить сообщения, опубликованные на `foo` в кластере `east`, в `foo.east`, опубликованные в `central` — в `foo.central` и т. д. для `west`, вы можете использовать ключевое слово `cluster` в источнике и назначении mapping.

```
mappings = {
        "foo":[
               {destination:"foo.west", weight: 100%, cluster: "west"},
               {destination:"foo.central", weight: 100%, cluster: "central"},
               {destination:"foo.east", weight: 100%, cluster: "east"}
        ]
}
```

Это означает, что приложение становится переносимым по развертыванию и не нуждается в конфигурации имени кластера, к которому оно подключено, чтобы составлять subject: оно просто публикует в `foo`, а сервер сам маппит в нужный subject на основе кластера, в котором работает.

## Subject mapping and transforms in streams

Вы можете определять transforms как часть конфигурации потока.

Transforms можно применять в нескольких местах в конфигурации потока:

* можно применять subject mapping transform как часть зеркала потока
* можно применять subject mapping transform как часть источника потока
* можно применять общий ingress subject mapping transform, который применяется ко всем совпадающим сообщениям независимо от того, как они попали в поток
* также можно применять subject mapping transform как часть перепубликации сообщений

Обратите внимание: при использовании в Mirror, Sources или Republish transforms выступают как фильтры с опциональным преобразованием, тогда как при использовании на уровне Stream они только преобразуют subjects совпадающих сообщений и не действуют как фильтры.

```
{
  "name": "orders",
  "subjects": [ "orders.local.*"],
  "subject_transform":{"src":"orders.local.*","dest":"orders.{{wildcard(1)}}"},
  "retention": "limits",
  ...
  "sources": [
    {
      "name": "other_orders",
      "subject_transforms": [
        {
          "src": "orders.online.*",
          "dest": "orders.{{wildcard(1)}}"
        }
      ]
    }
  ],
  "republish": {
    "src": "orders.*",
    "dest": "orders.trace.{{wildcard(1)}}"
  }
    
}
```
{% hint style="info" %}
Для transforms `sources` и `republish` выражение `src` действует как фильтр. Несовпадающие subjects игнорируются.

Для stream‑уровня `subject_transform` несовпадающие subjects остаются без изменений.
{% endhint %}

![](../assets/images/stream-transform.png)
