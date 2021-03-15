# Configuration Management

In many cases managing the configuration in your application code is the best model, many teams though wish to pre-create Streams and Consumers.

We support a number of tools to assist with this:

* `nats` CLI with configuration files 
* [Terraform](https://www.terraform.io/)
* [GitHub Actions](https://github.com/features/actions)
* [Kubernetes JetStream Controller](https://github.com/nats-io/nack#jetstream-controller) 

## nats Admin CLI

The `nats` CLI can be used to manage Streams and Consumers easily using it's `--config` flag, for example:

## Add a new Stream

This creates a new Stream based on `orders.json`. The `orders.json` file can be extracted from an existing stream using `nats stream info ORDERS -j | jq .config`

```text
$ nats str add ORDERS --config orders.json
```

## Edit an existing Stream

This edits an existing stream ensuring it complies with the configuration in `orders.json`

```text
$ nats str edit ORDERS --config orders.json
```

## Add a New Consumer

This creates a new Consumer based on `orders_new.json`. The `orders_new.json` file can be extracted from an existing stream using `nats con info ORDERS NEW -j | jq .config`

```text
$ nats con add ORDERS NEW --config orders_new.json
```

## Terraform

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

