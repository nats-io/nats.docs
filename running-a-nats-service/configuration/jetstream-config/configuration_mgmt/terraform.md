# Terraform

[Terraform](https://www.terraform.io/) — инструмент конфигурации облака от Hashicorp. Мы поддерживаем provider для Terraform под названием [terraform-provider-jetstream](https://github.com/nats-io/terraform-provider-jetstream/), который умеет управлять JetStream через Terraform.

См. в [Terraform registry](https://registry.terraform.io/providers/nats-io/jetstream/latest/docs).

## Настройка

В проекте можно настроить provider так:

```text
provider "jetstream" {
  servers = "connect.ngs.global"
  credentials = "ngs_jetstream_admin.creds"
}
```

Ниже пример кода, создающего пример `ORDERS`. Полные детали см. в [Project README](https://github.com/nats-io/terraform-provider-jetstream#readme).

```text
resource "jetstream_stream" "ORDERS" {
  name     = "ORDERS"
  subjects = ["ORDERS.*"]
  storage  = "file"
  max_age  = 60 * 60 * 24 * 365
}

resource "jetstream_consumer" "ORDERS_NEW" {
  stream_id      = jetstream_stream.ORDERS.id
  durable_name   = "NEW"
  deliver_all    = true
  filter_subject = "ORDERS.received"
  sample_freq    = 100
}

resource "jetstream_consumer" "ORDERS_DISPATCH" {
  stream_id      = jetstream_stream.ORDERS.id
  durable_name   = "DISPATCH"
  deliver_all    = true
  filter_subject = "ORDERS.processed"
  sample_freq    = 100
}

resource "jetstream_consumer" "ORDERS_MONITOR" {
  stream_id        = jetstream_stream.ORDERS.id
  durable_name     = "MONITOR"
  deliver_last     = true
  ack_policy       = "none"
  delivery_subject = "monitor.ORDERS"
}

output "ORDERS_SUBJECTS" {
  value = jetstream_stream.ORDERS.subjects
}
```
