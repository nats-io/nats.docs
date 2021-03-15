# Terraform

Terraform is a Cloud configuration tool from Hashicorp found at [terraform.io](https://www.terraform.io/), we maintain a Provider for Terraform called [terraform-provider-jetstream](https://github.com/nats-io/terraform-provider-jetstream/) that can maintain JetStream using Terraform.

### Setup

Our provider is not hosted by Hashicorp so installation is a bit more complex than typical. Browse to the [Release Page](https://github.com/nats-io/terraform-provider-jetstream/releases) and download the release for your platform and extract it into your Terraform plugins directory.

```text
$ unzip -l terraform-provider-jetstream_0.0.2_darwin_amd64.zip
Archive:  terraform-provider-jetstream_0.0.2_darwin_amd64.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
    11357  03-09-2020 10:48   LICENSE
     1830  03-09-2020 12:53   README.md
 24574336  03-09-2020 12:54   terraform-provider-jetstream_v0.0.2
```

Place the `terraform-provider-jetstream_v0.0.2` file in `~/.terraform.d/plugins/terraform-provider-jetstream_v0.0.2`

In your project you can configure the Provider like this:

```text
provider "jetstream" {
  servers = "connect.ngs.global"
  credentials = "ngs_jetstream_admin.creds"
}
```

And start using it, here's an example that create the `ORDERS` example. Review the [Project README](https://github.com/nats-io/terraform-provider-jetstream#readme) for full details.

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

