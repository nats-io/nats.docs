# Introduction

In this section, you can find several examples of how to deploy NATS and other tools from the NATS ecosystem on Kubernetes.

* [Getting Started](nats-kubernetes.md#getting-started)
* [Advanced Helm chart examples](helm-charts.md)
* [NATS + Cert Manager in k8s](nats-cluster-and-cert-manager.md)
* [Securing a NATS Cluster using cfssl](operator-tls-setup-with-cfssl.md)

## Running NATS on K8S

### Getting started

The fastest and easiest way to get started is to use [NATS Helm Charts](https://github.com/nats-io/k8s/tree/main/helm/charts/nats).

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install my-nats nats/nats

```

This will install NATS Server in basic setup with NATS box utility container that can be used as a simple way to interact with the server using `nats` and `nsc` CLI tools preinstalled.


_In case you don't have a cluster already, you can find some notes on how to create a small cluster using one of the hosted Kubernetes providers_ [_here_](create-k8s-cluster.md)_._

To check if NATS is reacheable from within the cluster connect to NATS box

```bash
kubectl exec -n default -it deployment/my-nats-box -- /bin/sh -l
```

and try subscribing and publishing

```bash
nats-box:~# nats sub test &
nats-box:~# nats pub test hi
```

If you're seeing the messages, all went well and you have successfully installed NATS.

Now, let's discover some more advanced options.

### NATS HA setup

To setup your cluster in HA manner, you need to customize NATS Helm charts.
Fortunately, `values.yaml` have most of the features available as easy values customization and there should be no need to manually tweak the templates.

One way to do it is to create your own `.yaml` file with changed only values:

```yaml
cluster:
  enabled: true
  replicas: 3
```

and run

```bash
helm install nats nats/nats --values ha.yaml
```

### JetStream

Similarly to HA, enabling JetStream requires changing few values:

```yaml
nats:
  jetstream:
    enabled: true

    memStorage:
      enabled: true
      size: 2Gi

    fileStorage:
      enabled: true
      size: 1Gi
      storageDirectory: /data/
```

For more examples, including TLS, Auth, external access, leaf nodes and gateways please check [Advanced Helm chart examples](helm-charts.md)
