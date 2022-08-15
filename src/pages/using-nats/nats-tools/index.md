# Using NATS

You use NATS when you run applications ('client' applications from NATS' point of view) that leverage NATS to communicate with other applications, receive data streams and invoke services.

These applications leverage any of the 40+ client libraries available for NATS and connect to an instance of the NATS service that can can be either a single server, a cluster of servers or even a global super-cluster such as Synadia's [NGS](https://synadia.com/ngs). And, if the application is written in Go, it can even embed its own server.

Beside those client applications, the NATS Ecosystem also has many tools to interact with other applications and services over nats and streams, support server configuration, enhance monitoring or tune performance such as:

* General interaction and management
  * [nats](nats_cli/readme.md) - The `nats` Command Line Tool is the best way to interact with, test and manage NATS and JetStream from a terminal or from scripts
* Security
  * [nk](nk.md) - Generate NKeys
  * [nsc](nsc/) - Configure Operators, Accounts and Users
  * [nats account server](/using-nats/nats-tools/nats-tools/nas/README.md) - Serve Account JWTs
* Monitoring
  * [nats top](nats_top/) - Monitor NATS Server
  * [prometheus-nats-exporter](https://github.com/nats-io/prometheus-nats-exporter) - Export NATS server metrics to [Prometheus](https://prometheus.io/) and a [Grafana](https://grafana.com) dashboard.
* Benchmarking
  * see [nats](nats_cli/readme.md)

