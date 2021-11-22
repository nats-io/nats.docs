# Basic NATS Setup

## Minimal NATS Setup

To try NATS with the minimal number of components, you can start with the following:

```bash
# Single server NATS
kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-server/single-server-nats.yml
```

This will setup:

* A statefulset with a single NATS server \(no auth nor TLS\)
* A `nats` headless service to which you can connect

Next, try using [`nats`](/using-nats/nats-tools/nats%20CLI/readme.md) CLI Tool to connect to the nats service to confirm that you have setup your NATS servers correctly.

In one window listen on the subject 'nats'
```bash
# Send message to NATS
nats sub nats hello
```
In another window publish a message on the subject 'nats'

```bash
nats pub -s nats hello world
```

You should receive that message on the `nats sub` window
## HA Setup Using StatefulSets

In order to have higher availability you can setup NATS servers to run in clustering mode. The following commands will setup a 3 node NATS cluster. Note, you will need more than one node available in your Kubernetes cluster in order for this to work, so in case of deploying onto minikube or docker desktop, please try the single node installer instead.

```bash
# Create NATS cluster
kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-server/simple-nats.yml
```

## Using Helm Charts

Using Helm Charts is now the recommended way to deploy NATS servers over Kubernetes

Location of the officially supported Helm:

* [NATS Helm Chart](https://github.com/nats-io/k8s/tree/master/helm/charts/nats)
