# Пошаговое руководство по Key/Value Store

Key/Value Store — это функция JetStream, поэтому нужно убедиться, что JetStream включен:

```shell
nats account info
```
что может вернуть

```
JetStream Account Information:

   JetStream is not supported in this account
```

В этом случае включите JetStream.

## Предусловие: включение JetStream

Если вы запускаете локальный `nats-server`, остановите его и перезапустите с включенным JetStream, используя `nats-server -js` (если это еще не сделано).

Затем проверьте, что JetStream включен:

```shell
nats account info
```

```
Connection Information:

               Client ID: 6
               Client IP: 127.0.0.1
                     RTT: 64.996µs
       Headers Supported: true
         Maximum Payload: 1.0 MiB
           Connected URL: nats://127.0.0.1:4222
       Connected Address: 127.0.0.1:4222
     Connected Server ID: ND2XVDA4Q363JOIFKJTPZW3ZKZCANH7NJI4EJMFSSPTRXDBFG4M4C34K

JetStream Account Information:

           Memory: 0 B of Unlimited
          Storage: 0 B of Unlimited
          Streams: 0 of Unlimited
        Consumers: 0 of Unlimited 
```

## Создание KV bucket

KV bucket похож на поток; его нужно создать перед использованием, например `nats kv add <KV Bucket Name>`:

```shell
nats kv add my-kv
```

```
my_kv Key-Value Store Status

         Bucket Name: my-kv
         History Kept: 1
        Values Stored: 0
           Compressed: false
   Backing Store Kind: JetStream
          Bucket Size: 0 B
  Maximum Bucket Size: unlimited
   Maximum Value Size: unlimited
          Maximum Age: unlimited
     JetStream Stream: KV_my-kv
              Storage: File
```

## Сохранение значения

Теперь, когда у нас есть bucket, можно присвоить (put) значение конкретному ключу:

```shell
nats kv put my-kv Key1 Value1
```

В ответ должно вернуться значение ключа `Value1`.

## Получение значения

Можно получить (get) значение для ключа "Key1":

```shell
nats kv get my-kv Key1
```

```
my-kv > Key1 created @ 12 Oct 21 20:08 UTC

Value1
```

## Удаление значения

Вы всегда можете удалить ключ и его значение, используя:

```shell
nats kv del my-kv Key1
```

Удаление несуществующего ключа безопасно.

## Атомарные операции

K/V Stores также можно использовать в конкурентных шаблонах, например семафорах, через атомарные операции `create` и `update`.

Например, клиент, которому нужен эксклюзивный доступ к файлу, может заблокировать его, создав ключ со значением имени файла с помощью `create`, а по завершении удалить этот ключ. Устойчивость к сбоям можно повысить, установив тайм‑аут для `bucket`, содержащего этот ключ. Клиент может использовать `update` с номером ревизии, чтобы поддерживать «живучесть» `bucket`.

Обновления также используются для более тонкого контроля конкурентности, иногда называемого `optimistic locking`, когда несколько клиентов пытаются выполнить задачу, но успешно завершить может только один.

### Create (aka exclusive locking)

Создайте блокировку/семафор с помощью операции `create`.

```shell
nats kv create my-sem Semaphore1 Value1
```

Успешной может быть только одна операция `create`. Кто первым пришел, тот и получил. Все параллельные попытки приведут к ошибке, пока ключ не будет удален.

```shell
nats kv create my-sem Semaphore1 Value1
nats: error: nats: wrong last sequence: 1: key exists
```

### Update с CAS (aka optimistic locking)

Можно атомарно выполнить `update` — операцию CAS (compare and swap) — для ключа с дополнительным параметром `revision`.

```shell
nats kv update my-sem Semaphore1 Value2 13
```

Вторая попытка с той же ревизией 13 завершится ошибкой:

```shell
nats kv update my-sem Semaphore1 Value2 13
nats: error: nats: wrong last sequence: 14
```

## Наблюдение за K/V Store

Необычная возможность K/V Store — «наблюдать» за bucket или конкретным ключом в нем и получать обновления в реальном времени.

Для примера выше запустите `nats kv watch my-kv`. Это запустит watcher для bucket, созданного ранее. По умолчанию у KV bucket история равна одному, поэтому он помнит только последнее изменение. В нашем случае watcher должен увидеть удаление значения, связанного с ключом "Key1":

```shell
nats kv watch my-kv
```

```
[2021-10-12 13:15:03] DEL my-kv > Key1
```

Если теперь изменить значение в 'my-kv':

```shell
nats kv put my-kv Key1 Value2
```

Watcher увидит это изменение:

```shell
[2021-10-12 13:25:14] PUT my-kv > Key1: Value2
```

## Очистка

Когда закончите работу с bucket, можно удалить bucket и его ресурсы командой `rm`:

```shell
nats kv rm my-kv
```
