# NATS Admin CLI

## nats Admin CLI

The `nats` CLI can be used to manage Streams and Consumers easily using it's `--config` flag, for example:

## Add a new Stream

This creates a new Stream based on `orders.json`. The `orders.json` file can be extracted from an existing stream using `nats stream info ORDERS -j | jq .config`

```shell
nats str add ORDERS --config orders.json
```

## Edit an existing Stream

This edits an existing stream ensuring it complies with the configuration in `orders.json`

```shell
nats str edit ORDERS --config orders.json
```

## Add a New Consumer

This creates a new Consumer based on `orders_new.json`. The `orders_new.json` file can be extracted from an existing stream using `nats con info ORDERS NEW -j | jq .config`

```shell
nats con add ORDERS NEW --config orders_new.json
```

