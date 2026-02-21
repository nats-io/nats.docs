# Запуск leaf‑node Synadia Cloud (NGS) в Docker

Этот мини‑туториал показывает, как запустить 2 сервера NATS в локальных контейнерах Docker, соединенных через [Synadia Cloud Platform](https://cloud.synadia.com?utm_source=nats_docs&utm_medium=nats).
NGS — это глобальная управляемая сеть NATS, и локальные контейнеры будут подключаться к ней как leaf‑nodes.

Начните с создания бесплатного аккаунта на [https://cloud.synadia.com/](https://cloud.synadia.com?utm_source=nats_docs&utm_medium=nats).

После входа перейдите в аккаунт `default` (внутри вашего аккаунта Synadia Cloud можно управлять несколькими изолированными аккаунтами NGS).

В `Settings` > `Limits` увеличьте `Leaf Nodes` до 2. Сохраните изменение.
(В бесплатном аккаунте доступно до 2 leaf‑подключений, но изначально он настроен максимум на 1).

Теперь перейдите в раздел `Users` вашего аккаунта `default` и создайте 2 пользователей: `red` и `blue`.
(Пользователи — это еще один способ изолировать части ваших систем, настраивая права, доступ к данным, лимиты и прочее.)

Для каждого из двух пользователей выберите `Get Connected` и `Download Credentials`.

Теперь на вашем компьютере должны быть 2 файла: `default-red.creds` и `default-blue.creds`.

Создайте минимальный конфигурационный файл сервера NATS `leafnode.conf`, он подойдет для обоих leaf‑nodes:

```
leafnodes {
    remotes = [
        {
          url: "tls://connect.ngs.global"
          credentials: "ngs.creds"
        },
    ]
}
```

Запустим первый leafnode (для пользователя `red`) командой:

```shell
docker run  -p 4222:4222 -v leafnode.conf:/leafnode.conf -v /etc/ssl/cert.pem:/etc/ssl/cert.pem -v default-red.creds:/ngs.creds  nats:latest -c /leafnode.conf
```

`-p 4222:4222` пробрасывает порт 4222 из контейнера на локальный порт 4222.
`-v leafnode.conf:/leafnode.conf` монтирует созданный выше конфигурационный файл в `/leafnode.conf` внутри контейнера.
`-v /etc/ssl/cert.pem:/etc/ssl/cert.pem` устанавливает корневые сертификаты в контейнер, так как образ `nats` их не содержит, а они нужны для проверки TLS‑сертификата NGS.
`-v default-red.creds:/ngs.creds` устанавливает учетные данные пользователя `red` в `/ngs.creds` внутри контейнера.
`-c /leafnode.conf` — аргументы, передаваемые entrypoint контейнера (`nats-server`).

При запуске контейнера вы увидите успешный старт сервера NATS:
```
[1] 2024/06/14 18:03:51.810719 [INF] Server is ready
[1] 2024/06/14 18:03:52.075951 [INF] 34.159.142.0:7422 - lid:5 - Leafnode connection created for account: $G
[1] 2024/06/14 18:03:52.331354 [INF] 34.159.142.0:7422 - lid:5 - JetStream using domains: local "", remote "ngs"
```

Теперь запустим второй leaf‑node с двумя небольшими изменениями в команде:
```
docker run  -p 4333:4222 -v leafnode.conf:/leafnode.conf -v /etc/ssl/cert.pem:/etc/ssl/cert.pem -v default-blue.creds:/ngs.creds  nats:latest -c /leafnode.conf
```

Обратите внимание: мы привязываемся к локальному порту `4333` (так как `4222` занят), и монтируем учетные данные `blue`.

Поздравляем, у вас есть 2 leaf‑nodes, подключенные к глобальной сети NGS.
Несмотря на то, что это общая глобальная среда, ваш аккаунт полностью изолирован от остального трафика, и наоборот.

Теперь давайте заставим 2 клиента, подключенных к 2 leaf‑nodes, обмениваться сообщениями.

Запустим простой сервис на leaf‑node пользователя `red`:
```shell
nats -s localhost:4222 reply docker-leaf-test "At {{Time}}, I received your request: {{Request}}"
```

Используя leaf‑node пользователя `blue`, отправим запрос:
```shell
$ nats -s localhost:4333 request docker-leaf-test "Hello World"

At 8:15PM, I received your request: Hello World
```

Поздравляем, вы подключили 2 leaf‑nodes к глобальной сети NGS и использовали их, чтобы отправить запрос и получить ответ.

Ваши сообщения прозрачно маршрутизировались вместе с миллионами других, но не были видны никому за пределами вашего аккаунта Synadia Cloud.


### Связанное и полезное:
 * Официальный [Docker‑образ сервера NATS на GitHub](https://github.com/nats-io/nats-docker) и [issues](https://github.com/nats-io/nats-docker/issues)
 * [`nats` образы на DockerHub](https://hub.docker.com/_/nats)
 * [CLI‑инструмент `nats`](/using-nats/nats-tools/nats_cli/) и [`nats bench`](/using-nats/nats-tools/nats_cli/natsbench)
 * [Конфигурация leaf‑nodes](/running-a-nats-service/configuration/leafnodes)
