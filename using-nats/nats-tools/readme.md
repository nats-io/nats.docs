# NATS Command Line Tooling

## Using NATS from client application
The most common form of connecting to the NATS messaging system will be through an application built with any of the [40+ client libraries](../developing-with-nats/developer.md) available for NATS. 

The client application will connect to an instance of the NATS server, be it a single server, a cluster of servers or even a global super-cluster such as [Synadia Cloud](https://www.synadia.com/cloud), sending and receiving messages via a range of subscribers contracts. If the application is written in GoLang the NATS server can even be [embedded into a Go](https://dev.to/karanpratapsingh/embedding-nats-in-go-19o) application.

Client APIs will also allow access to almost all server configuration tasks when using an account with sufficient permissions.

## Command Line Tooling
Besides using the client API to manage NATS servers, the NATS ecosystem also has many tools to interact with other applications and services over NATS and streams, support server configuration, enhance monitoring or tune performance such as:

* General interaction and management
  * [nats](nats_cli/readme.md) - The `nats` Command Line Tool is the easiest way to interact with, test and manage NATS and JetStream from a terminal or from scripts. It's list of features are ever growing, so please download the [latest version](https://github.com/nats-io/natscli/releases). 
* Security
  * [nk](nk.md) - Generate NKeys for use with JSon Web Tokens (JWT) used with nsc
  * [nsc](nsc/) - Configure Operators, Accounts, Users and permission offline to later push them to a production server. This is the preferred tools to create security configuration unless you are using [Synadia Control Plane](https://docs.synadia.com/platform/control-plane) 
  * [nats account server](https://nats-io.gitbook.io/legacy-nats-docs/nats-account-server) -  (**legacy, replaced by the built-in NATS resolver**) a custom security server. NAS can still be used as a reference implementation for you tailor-made security integration.
* Monitoring
  * [nats top](nats_top/) - Monitor NATS Servers
  * [prometheus-nats-exporter](https://github.com/nats-io/prometheus-nats-exporter) - Export NATS server metrics to [Prometheus](https://prometheus.io/) and a [Grafana](https://grafana.com) dashboard.
* Benchmarking
  * see [nats bench](nats_cli/natsbench.md) subcommand of the [nats](nats_cli/readme.md) tool
