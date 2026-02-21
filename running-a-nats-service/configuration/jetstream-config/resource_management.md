# Настройка JetStream

### Включение JetStream для nats-server

Чтобы включить JetStream на сервере, нужно настроить его на верхнем уровне:

```
jetstream: enabled
```

Также можно использовать флаги командной строки `-js, --jetstream` и `-sd, --store_dir <dir>`.

## Мульти‑тенантность и управление ресурсами

JetStream совместим с мульти‑тенантностью NATS 2.0 через Accounts. Сервер с включенным JetStream поддерживает создание полностью изолированных сред JetStream для разных аккаунтов.

Среды JetStream в leaf‑nodes следует изолировать в собственном домене JetStream — см. [Leaf nodes](../leafnodes/)

JetStream будет динамически определять доступные ресурсы. Однако рекомендуется задавать конкретные лимиты:

```
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
    domain: acme
}
```

### Настройка лимитов ресурсов аккаунта

На этом этапе JetStream будет включен, и если на сервере нет включенных accounts, все пользователи на сервере получат доступ к JetStream.

```
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
}

accounts {
    HR: {
        jetstream: enabled
    }
}
```

Здесь аккаунт `HR` получил бы доступ ко всем ресурсам сервера. Мы можем ограничить его:

```
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
}

accounts {
    HR: {
        jetstream {
            max_mem: 512M
            max_file: 1G
            max_streams: 10
            max_consumers: 100
        }
    }
}
```

Теперь аккаунт `HR` ограничен по различным параметрам.

Если попытаться настроить JetStream для аккаунта, не включив его глобально, вы получите предупреждение, а аккаунт, назначенный как System, не может иметь JetStream включенным.

#### Настройка лимитов JetStream API и Max HA assets

Начиная с версии v2.10.21, у NATS JetStream API есть лимит 10K inflight‑запросов, после которого запросы начинают отбрасываться, чтобы защититься от роста памяти и перегрузки сервиса JetStream. Иногда нужно уменьшить этот лимит, чтобы снизить риск того, что рост JetStream‑трафика повлияет на сервис. Еще один важный лимит — `max_ha_assets`, который ограничивает максимальное число поддерживаемых R3 или R5 потоков и consumers на сервер:

Пример:

```
jetstream {
  request_queue_limit: 1000
    limits {
      max_ha_assets = 2000
    }
  }
```

Когда лимит запросов достигнут, все ожидающие запросы отбрасываются, поэтому в некоторых случаях стоит дополнительно уменьшить лимит, чтобы снизить влияние на приложения. В логах появится сообщение о том, что запросы были отброшены:

```
[WRN] JetStream API queue limit reached, dropping 1000 requests
```

Для приложения это означает, что операции будут завершаться ошибкой и потребуют повторных попыток. Также будет отправлено advisory на subject `$JS.EVENT.ADVISORY.API.LIMIT_REACHED` каждый раз, когда это происходит.

#### Лимиты ресурсов аккаунта в operator mode с помощью `nsc` CLI

Если ваша установка в operator mode, JetStream‑специфичная конфигурация аккаунта может храниться в JWT аккаунта. Ранее названный аккаунт HR можно настроить так:

```bash
nsc add account --name HR
nsc edit account --name HR --js-mem-storage 1G --js-disk-storage 512M  --js-streams 10 --js-consumer 100
```
