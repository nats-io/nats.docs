# Пошаговое руководство по Object Store

Если вы запускаете локальный `nats-server`, остановите его и перезапустите с включенным JetStream, используя `nats-server -js` (если это еще не сделано).

Затем проверьте, что JetStream включен:

```shell
nats account info
```

Вы должны увидеть примерно следующее:

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

Если вместо этого вы видите следующее, то JetStream _не_ включен:

```
JetStream Account Information:

   JetStream is not supported in this account
```

## Создание bucket для Object Store

Так же как потоки нужно создать перед использованием, сначала нужно создать Object Store bucket:

```shell
nats object add myobjbucket
```

что выведет:

```
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: false
                Size: 0 B
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## Загрузка файла в bucket

```shell
nats object put myobjbucket ~/Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Object information for myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov

               Size: 1.5 GiB
  Modification Time: 14 Apr 22 00:34 +0000
             Chunks: 12,656
             Digest: sha-256 8ee0679dd1462de393d81a3032d71f43d2bc89c0c8a557687cfe2787e926
```

## Загрузка файла с указанием имени

По умолчанию полный путь файла используется как ключ. Укажите ключ явно (например, относительный путь) с помощью `--name`.

```shell
nats object put --name /Movies/NATS-logo.mov myobjbucket ~/Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Object information for myobjbucket > /Movies/NATS-logo.mov

               Size: 1.5 GiB
  Modification Time: 14 Apr 22 00:34 +0000
             Chunks: 12,656
             Digest: sha-256 8ee0679dd1462de393d81a3032d71f43d2bc89c0c8a557687cfe2787e926
```

## Список объектов в bucket

```shell
nats object ls myobjbucket
```

```
╭───────────────────────────────────────────────────────────────────────────╮
│                              Bucket Contents                              │
├─────────────────────────────────────┬─────────┬───────────────────────────┤
│ Name                                │ Size    │ Time                      │
├─────────────────────────────────────┼─────────┼───────────────────────────┤
│ /Users/jnmoyne/Movies/NATS-logo.mov │ 1.5 GiB │ 2022-04-13T17:34:55-07:00 │
│ /Movies/NATS-logo.mov               │ 1.5 GiB │ 2022-04-13T17:35:41-07:00 │
╰─────────────────────────────────────┴─────────┴───────────────────────────╯
```

## Получение объекта из bucket

```shell
nats object get myobjbucket ~/Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Wrote: 1.5 GiB to /Users/jnmoyne/NATS-logo.mov in 5.68s average 279 MiB/s
```

## Получение объекта с указанием пути вывода

По умолчанию файл сохраняется относительно локального пути под своим именем (без полного пути). Чтобы указать путь вывода, используйте `--output`.

```shell
nats object get myobjbucket --output /temp/Movies/NATS-logo.mov /Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Wrote: 1.5 GiB to /temp/Movies/NATS-logo.mov in 5.68s average 279 MiB/s
```

## Удаление объекта из bucket

```shell
nats object rm myobjbucket ~/Movies/NATS-logo.mov
```

```
? Delete 1.5 GiB byte file myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov? Yes
Removed myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: false
                Size: 16 MiB
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## Информация о bucket

```shell
nats object info myobjbucket
```

```
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: false
                Size: 1.6 GiB
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## Наблюдение за изменениями bucket

```shell
nats object watch myobjbucket
```

```
[2022-04-13 17:51:28] PUT myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov: 1.5 GiB bytes in 12,656 chunks
[2022-04-13 17:53:27] DEL myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov
```

### Запечатывание bucket

Можно запечатать bucket, то есть запретить любые дальнейшие изменения.

```shell
nats object seal myobjbucket
```

```
? Really seal Bucket myobjbucket, sealed buckets can not be unsealed or modified Yes
myobjbucket has been sealed
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: true
                Size: 1.6 GiB
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## Удаление bucket

Команда `nats object rm myobjbucket` удалит bucket и все файлы, хранящиеся в нем.
