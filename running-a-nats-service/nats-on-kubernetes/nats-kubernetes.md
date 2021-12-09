# Introduction

In this section, you can find several examples of how to deploy NATS, NATS Streaming and other tools from the NATS ecosystem on Kubernetes.

* [Getting Started](nats-kubernetes.md#getting-started)
* [Basic NATS Setup on k8s](minimal-setup.md)
* [Deploying NATS with Helm](helm-charts.md)
* [Creating a NATS Streaming Cluster in k8s with FT mode](../../legacy/stan/nats-streaming-server/kubernetes/stan-ft-k8s-aws.md)
* [NATS + Cert Manager in k8s](nats-cluster-and-cert-manager.md)
* [Securing a NATS Cluster using cfssl](operator-tls-setup-with-cfssl.md)

## Running NATS on K8S

### Getting started

The fastest and easiest way to get started is with just one shell command:

```bash
curl -sSL https://nats-io.github.io/k8s/setup.sh | sh
```

_In case you don't have a cluster already, you can find some notes on how to create a small cluster using one of the hosted Kubernetes providers_ [_here_](create-k8s-cluster.md)_._

This will run a `nats-setup` container with the [required policy](https://github.com/nats-io/k8s/blob/master/setup/bootstrap-policy.yml) and deploy a NATS cluster on Kubernetes with external access, TLS and decentralized authorization.

[![asciicast](https://asciinema.org/a/282135.svg)](https://asciinema.org/a/282135)

By default, the installer will deploy the [Prometheus Operator](https://github.com/coreos/prometheus-operator) and the [Cert Manager](https://github.com/jetstack/cert-manager) for metrics and TLS support, and the NATS instances will also bind the 4222 host port for external access.

You can customize the installer to install without TLS or without Auth to have a simpler setup as follows:

Disable TLS
```bash
curl -sSL https://nats-io.github.io/k8s/setup.sh | sh -s -- --without-tls
```

Disable Auth and TLS (also disables NATS surveyor and NATS Streaming)

```shell
curl -sSL https://nats-io.github.io/k8s/setup.sh | sh -s -- --without-tls --without-auth
```

**Note**: Since [NATS Streaming](https://github.com/nats-io/nats-streaming-server) will be running as a [leafnode](../running-a-nats-service/configuration/leafnodes/) to NATS \(under the STAN account\) and that [NATS Surveyor](https://github.com/nats-io/nats-surveyor) requires the [system account](../running-a-nats-service/configuration/sys_accounts/) to monitor events, disabling auth also means that NATS Streaming and NATS Surveyor based monitoring will be disabled.

The monitoring dashboard setup using NATS Surveyor can be accessed by using port-forward:

```shell
kubectl port-forward deployments/nats-surveyor-grafana 3000:3000
```

Next, open the following URL in your browser:

```text
http://127.0.0.1:3000/d/nats/nats-surveyor?refresh=5s&orgId=1
```

![surveyor](https://user-images.githubusercontent.com/26195/69106844-79fdd480-0a24-11ea-8e0c-213f251fad90.gif)

