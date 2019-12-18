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

``` yaml
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
```

```text
certificate.certmanager.k8s.io/nats-ca configured
```

``` yaml
apiVersion: certmanager.k8s.io/v1alpha1
kind: Issuer
metadata:
  name: nats-ca
spec:
  ca:
    secretName: nats-ca
```

```text
issuer.certmanager.k8s.io/nats-ca created
```

``` yaml
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

```text
certificate.certmanager.k8s.io/nats-server-tls created
```

``` yaml
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

```
certificate.certmanager.k8s.io/nats-routes-tls configured
```

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

```text
natscluster.nats.io/nats created
```

``` sh
kubectl get pods -o wide
```

``` sh
NAME     READY   STATUS    RESTARTS   AGE   IP            NODE       NOMINATED NODE
nats-1   1/1     Running   0          4s    172.17.0.8    minikube   <none>
nats-2   1/1     Running   0          3s    172.17.0.9    minikube   <none>
nats-3   1/1     Running   0          2s    172.17.0.10   minikube   <none>
```

``` sh
kubectl logs nats-1
```
```text
: [1] 2019/05/08 22:35:11.192781 [INF] Starting nats-server version 1.4.1
: [1] 2019/05/08 22:35:11.192819 [INF] Git commit [3e64f0b]
: [1] 2019/05/08 22:35:11.192952 [INF] Starting http monitor on 0.0.0.0:8222
: [1] 2019/05/08 22:35:11.192981 [INF] Listening for client connections on 0.0.0.0:4222
: [1] 2019/05/08 22:35:11.192987 [INF] TLS required for client connections
: [1] 2019/05/08 22:35:11.192989 [INF] Server is ready
: [1] 2019/05/08 22:35:11.193123 [INF] Listening for route connections on 0.0.0.0:6222
: [1] 2019/05/08 22:35:12.487758 [INF] 172.17.0.9:49444 - rid:1 - Route connection created
: [1] 2019/05/08 22:35:13.450067 [INF] 172.17.0.10:46286 - rid:2 - Route connection created
```