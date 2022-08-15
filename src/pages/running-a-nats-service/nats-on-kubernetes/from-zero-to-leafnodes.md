# From Zero to K8S to Leafnodes using Helm

First, we need a number of Kubernetes clusters to be setup already. In this case we'll create a few in Digital Ocean using the `doctl` tool but you could use any K8S solution available:

```text
brew install doctl
doctl kubernetes cluster create nats-k8s-sfo2 --count 3 --region sfo2
doctl kubernetes cluster create nats-k8s-ams3 --count 3 --region ams3
```

Next, get your NGS credentials with leafnodes enabled. For this follow [these instructions](https://synadia.com/ngs/signup) and choose the `Developer` plan which is free and will allow you to create leafnode connections for a couple of clusters. Once you got the credentials, upload them as a secret to your K8S clusters:

```bash
for ctx in do-ams3-nats-k8s-ams3 do-sfo2-nats-k8s-sfo2; do
  kubectl --context $ctx create secret generic ngs-creds --from-file $HOME/.nkeys/creds/synadia/NGS/NGS.creds
done
```

Install Helm3 and add the NATS helm chart repo:

```text
brew install helm
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
```

Create the config that adds the leafnode connection to Synadia's NGS:

```text
# nats.yaml
leafnodes:
  enabled: true
  remotes:
    - url: tls://connect.ngs.global:7422
      credentials:
        secret:
          name: ngs-creds
          key: NGS.creds
natsbox:
  enabled: true
```

Deploy it to your K8S regions:

```bash
for ctx in do-ams3-nats-k8s-ams3 do-sfo2-nats-k8s-sfo2; do
  helm --kube-context $ctx install nats nats/nats -f nats.yaml
done
```

To test the multi-region connectivity by using the `nats-box` container that got deployed in each cluster:

```text
kubectl --context do-ams3-nats-k8s-ams3  exec -it nats-box -- nats sub -s nats hello
Listening on [hello]

while true; do
  kubectl --context do-sfo2-nats-k8s-sfo2  exec -it nats-box -- nats pub -s nats hello 'Hello World!'
done
```

Results from the subscribe session:

```text
[#1] Received on [hello]: 'Hello World!'
[#2] Received on [hello]: 'Hello World!'
[#3] Received on [hello]: 'Hello World!'
[#4] Received on [hello]: 'Hello World!'
[#5] Received on [hello]: 'Hello World!'
[#6] Received on [hello]: 'Hello World!'
[#7] Received on [hello]: 'Hello World!'
[#8] Received on [hello]: 'Hello World!'
[#9] Received on [hello]: 'Hello World!'
```

