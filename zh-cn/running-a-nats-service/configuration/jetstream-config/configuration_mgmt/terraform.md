# Terraform

[Terraform](https://www.terraform.io/) 是 Hashicorp 的云配置工具。我们为 Terraform 维护一个名为 [terraform-provider-jetstream](https://github.com/nats-io/terraform-provider-jetstream/) 的 Provider，以便使用 Terraform 维护 JetStream。

在 [Terraform 注册表](https://registry.terraform.io/providers/nats-io/jetstream/latest/docs) 中找到它。

## 设置

在你的项目中，你可以像这样配置 Provider：

```text
provider "jetstream" {
  servers = "connect.ngs.global"
  credentials = "ngs_jetstream_admin.creds"
}
```

以下示例代码创建 `ORDERS` 示例流。查看 [项目 README](https://github.com/nats-io/terraform-provider-jetstream#readme) 获取完整详细信息。

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