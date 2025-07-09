# Introduction

The recommended way to deploy NATS on Kubernetes is using [Helm](https://helm.sh/) with the official NATS Helm Chart.

## Helm repo

To register the NATS Helm chart run:

```sh
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
```

## Config values

The default configuration values of the chart will deploy a single NATS server as a `StatefulSet` and a single replica [nats-box](https://github.com/nats-io/nats-box) `Deployment`.

The [ArtifactHub page](https://artifacthub.io/packages/helm/nats/nats) provides the list of Helm configuration values and examples for the current release.

_For tracking the development version, refer to the [source repo](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#nats-server)._

Once the desired configuration is created, install the chart:

```sh
helm install nats nats/nats
```

## Validate connectivity

Once the pods are up, validate by accessing the `nats-box` container and running a CLI command.

```sh
kubectl exec -it deployment/nats-box -- nats pub test hi
```

The output should indicate a successful publish to NATS.

```
16:17:00 Published 2 bytes to "test"
```

## Commercial Options

Synadia offers [Deploy for Kubernetes](https://www.synadia.com/deploy-for-kubernetes/), a self-service, bring-your-own Kubernetes deployment option that includes NATS and additional components.
