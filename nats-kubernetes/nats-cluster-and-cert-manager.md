# NATS Cluster and Cert Manager

First we need to install the cert-manager component from [jetstack](https://github.com/jetstack/cert-manager):

```text
kubectl create namespace cert-manager
kubectl label namespace cert-manager certmanager.k8s.io/disable-validation=true
kubectl apply -f https://raw.githubusercontent.com/jetstack/cert-manager/release-0.7/deploy/manifests/cert-manager.yaml
```

```yaml
apiVersion: certmanager.k8s.io/v1alpha1
kind: ClusterIssuer
metadata:
  name: selfsigning
spec:
  selfSigned: {}
```

```text
clusterissuer.certmanager.k8s.io/selfsigning unchanged
```

Next, let's create the CA for the certs:

``` yaml
---
apiVersion: certmanager.k8s.io/v1alpha1
kind: Certificate
metadata:
  name: nats-ca
spec:
  secretName: nats-ca
  duration: 8736h # 1 year
  renewBefore: 240h # 10 days
  issuerRef:
    name: selfsigning
    kind: ClusterIssuer
  commonName: nats-ca
  organization:
  - Your organization
  isCA: true
---
apiVersion: certmanager.k8s.io/v1alpha1
kind: Issuer
metadata:
  name: nats-ca
spec:
  ca:
    secretName: nats-ca
```

Now create the certs that will match the DNS name used by the clients to connect, in this case traffic is within Kubernetes so we are using the name `nats` which is backed up by a headless service (here is an [example](https://github.com/nats-io/k8s/blob/master/nats-server/nats-server-plain.yml#L24-L47) of sample deployment)

``` yaml
---
apiVersion: certmanager.k8s.io/v1alpha1
kind: Certificate
metadata:
  name: nats-server-tls
spec:
  secretName: nats-server-tls
  duration: 2160h # 90 days
  renewBefore: 240h # 10 days
  issuerRef:
    name: nats-ca
    kind: Issuer
  organization:
  - Your organization
  commonName: nats.default.svc.cluster.local
  dnsNames:
  - nats.default.svc
```

In case of using the NATS operator, the Routes use a service named `$YOUR_CLUSTER-mgmt` (this may change in the future)

```yaml
---
apiVersion: certmanager.k8s.io/v1alpha1
kind: Certificate
metadata:
  name: nats-routes-tls
spec:
  secretName: nats-routes-tls
  duration: 2160h # 90 days
  renewBefore: 240h # 10 days
  issuerRef:
    name: nats-ca
    kind: Issuer
  organization:
  - Your organization
  commonName: "*.nats-mgmt.default.svc.cluster.local"
  dnsNames:
  - "*.nats-mgmt.default.svc"
```

Now let's create an example NATS cluster with the operator:

``` yaml 
apiVersion: "nats.io/v1alpha2"
kind: "NatsCluster"
metadata:
  name: "nats"
spec:
  # Number of nodes in the cluster
  size: 3
  version: "1.4.1"

  tls:
    # Certificates to secure the NATS client connections:
    serverSecret: "nats-server-tls"

    # Name of the CA in serverSecret
    serverSecretCAFileName: "ca.crt"

    # Name of the key in serverSecret
    serverSecretKeyFileName: "tls.key"

    # Name of the certificate in serverSecret
    serverSecretCertFileName: "tls.crt"

    # Certificates to secure the routes.
    routesSecret: "nats-routes-tls"

    # Name of the CA in routesSecret
    routesSecretCAFileName: "ca.crt"

    # Name of the key in routesSecret
    routesSecretKeyFileName: "tls.key"

    # Name of the certificate in routesSecret
    routesSecretCertFileName: "tls.crt"
```

Confirm that the pods were deployed:

``` sh
kubectl get pods -o wide
```

``` sh
NAME     READY   STATUS    RESTARTS   AGE   IP            NODE       NOMINATED NODE
nats-1   1/1     Running   0          4s    172.17.0.8    minikube   <none>
nats-2   1/1     Running   0          3s    172.17.0.9    minikube   <none>
nats-3   1/1     Running   0          2s    172.17.0.10   minikube   <none>
```

Follow the logs:

``` sh
kubectl logs nats-1
```

```text
[1] 2019/12/18 12:27:23.920417 [INF] Starting nats-server version 2.1.2
[1] 2019/12/18 12:27:23.920590 [INF] Git commit [not set]
[1] 2019/12/18 12:27:23.921024 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/12/18 12:27:23.921047 [INF] Server id is NDA6JC3TGEADLLBEPFAQ4BN4PM3WBN237KIXVTFCY3JSTDOSRRVOJCXN
[1] 2019/12/18 12:27:23.921055 [INF] Server is ready
```
