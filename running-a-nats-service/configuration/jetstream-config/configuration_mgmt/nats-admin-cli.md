# NATS Admin CLI

## nats Admin CLI

[`nats` CLI](https://github.com/nats-io/natscli?tab=readme-ov-file#installation) можно использовать для управления Streams и Consumers с помощью флага `--config`, например:

## Добавить новый Stream

Создает новый Stream на основе `orders.json`. Файл `orders.json` можно извлечь из существующего стрима с помощью `nats stream info ORDERS -j | jq .config`

```shell
nats str add ORDERS --config orders.json
```

## Редактировать существующий Stream

Редактирует существующий stream, приводя его в соответствие конфигурации `orders.json`

```shell
nats str edit ORDERS --config orders.json
```

## Добавить нового Consumer

Создает нового Consumer на основе `orders_new.json`. Файл `orders_new.json` можно извлечь из существующего consumer с помощью `nats con info ORDERS NEW -j | jq .config`

```shell
nats con add ORDERS NEW --config orders_new.json
```
