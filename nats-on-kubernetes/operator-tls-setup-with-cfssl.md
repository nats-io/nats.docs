# Securing a NATS Cluster with cfssl

## Secure NATS Cluster in Kubernetes using the NATS Operator

### Features

* Clients TLS setup
* TLS based auth certs via secret
  * Reloading supported by only updating secret
* Routes TLS setup
* Advertising public IP per NATS server for external access

### Creating the Certificates

### Generating the Root CA Certs

```javascript
{
    "CN": "nats.io",
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "OU": "nats.io"
        }
    ]
}
```

```bash
(
  cd certs

  # CA certs
  cfssl gencert -initca ca-csr.json | cfssljson -bare ca -
)
```

Setup the profiles for the Root CA, we will have 3 main profiles: one for the clients connecting, one for the servers, and another one for the full mesh routing connections between the servers.

```bash
{
    "signing": {
        "default": {
            "expiry": "43800h"
        },
        "profiles": {
            "server": {
                "expiry": "43800h",
                "usages": [
                    "signing",
                    "key encipherment",
                    "server auth",
                    "client auth"
                ]
            },
            "client": {
                "expiry": "43800h",
                "usages": [
                    "signing",
                    "key encipherment",
                    "client auth"
                ]
            },
            "route": {
                "expiry": "43800h",
                "usages": [
                    "signing",
                    "key encipherment",
                    "server auth",
                    "client auth"
                ]
            }
        }
    }
}
```

### Generating the NATS server certs

First we generate the certificates for the server.

```text
{
    "CN": "nats.io",
    "hosts": [
        "localhost",
        "*.nats-cluster.default.svc",
        "*.nats-cluster-mgmt.default.svc",
        "nats-cluster",
        "nats-cluster-mgmt",
        "nats-cluster.default.svc",
        "nats-cluster-mgmt.default.svc",
        "nats-cluster.default.svc.cluster.local",
        "nats-cluster-mgmt.default.svc.cluster.local",
        "*.nats-cluster.default.svc.cluster.local",
        "*.nats-cluster-mgmt.default.svc.cluster.local"
    ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "OU": "Operator"
        }
    ]
}
```

```bash
(
  # Generating the peer certificates
  cd certs
  cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=server server.json | cfssljson -bare server
)
```

### Generating the NATS server routes certs

We will also be setting up TLS for the full mesh routes.

```json
{
    "CN": "nats.io",
    "hosts": [
        "localhost",
        "*.nats-cluster.default.svc",
        "*.nats-cluster-mgmt.default.svc",
        "nats-cluster",
        "nats-cluster-mgmt",
        "nats-cluster.default.svc",
        "nats-cluster-mgmt.default.svc",
        "nats-cluster.default.svc.cluster.local",
        "nats-cluster-mgmt.default.svc.cluster.local",
        "*.nats-cluster.default.svc.cluster.local",
        "*.nats-cluster-mgmt.default.svc.cluster.local"
    ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "OU": "Operator"
        }
    ]
}
```

```bash
# Generating the peer certificates
(
  cd certs
  cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=route route.json | cfssljson -bare route
)
```

### Generating the certs for the clients \(CNCF && ACME\)

```json
{
    "CN": "nats.io",
    "hosts": [""],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "OU": "CNCF"
        }
    ]
}
```

```bash
(
  cd certs
  # Generating NATS client certs
  cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=client client.json | cfssljson -bare client
)
```

### Kubectl Create

```text
cd certs kubectl create secret generic nats-tls-example --from-file=ca.pem --from-file=server-key.pem --from-file=server.pem kubectl create secret generic nats-tls-routes-example --from-file=ca.pem --from-file=route-key.pem --from-file=route.pem kubectl create secret generic nats-tls-client-example --from-file=ca.pem --from-file=client-key.pem --from-file=client.pem
```

### Create the Auth secret

```json
{
  "users": [
    { "username": "CN=nats.io,OU=ACME" },
    { "username": "CN=nats.io,OU=CNCF",
      "permissions": {
    "publish": ["hello.*"],
    "subscribe": ["hello.world"]
      }
    }
  ],
  "default_permissions": {
    "publish": ["SANDBOX.*"],
    "subscribe": ["PUBLIC.>"]
  }
}
```

```bash
kubectl create secret generic nats-tls-users --from-file=users.json
```

#### Create a cluster with TLS

```bash
echo '
apiVersion: "nats.io/v1alpha2"
kind: "NatsCluster"
metadata:
  name: "nats-cluster"
spec:
  size: 3

  # Using custom edge nats server image for TLS verify and map support.
  serverImage: "wallyqs/nats-server"
  version: "edge-2.0.0-RC5"

  tls:
    enableHttps: true

    # Certificates to secure the NATS client connections:
    serverSecret: "nats-tls-example"

    # Certificates to secure the routes.
    routesSecret: "nats-tls-routes-example"

  auth:
    tlsVerifyAndMap: true
    clientsAuthSecret: "nats-tls-users"

    # How long to wait for authentication
    clientsAuthTimeout: 5

  pod:
    # To be able to reload the secret changes
    enableConfigReload: true
    reloaderImage: connecteverything/nats-server-config-reloader

    # Bind the port 4222 as the host port to allow external access.
    enableClientsHostPort: true

    # Initializer container that resolves the external IP from the
    # container where it is running.
    advertiseExternalIP: true

    # Image of container that resolves external IP from K8S API
    bootconfigImage: "wallyqs/nats-boot-config"
    bootconfigImageTag: "0.5.0"

  # Service account required to be able to find the external IP
  template:
    spec:
      serviceAccountName: "nats-server"
' | kubectl apply -f -
```

### Create APP using certs

#### Adding a new pod which uses the certificates

**Development**

```go
package main

import (
    "encoding/json"
    "flag"
    "fmt"
    "log"
    "time"

    "github.com/nats-io/go-nats"
    "github.com/nats-io/nuid"
)

func main() {
    var (
        serverList     string
        rootCACertFile string
        clientCertFile string
        clientKeyFile  string
    )
    flag.StringVar(&serverList, "s", "tls://nats-1.nats-cluster.default.svc:4222", "List of NATS of servers available")
    flag.StringVar(&rootCACertFile, "cacert", "./certs/ca.pem", "Root CA Certificate File")
    flag.StringVar(&clientCertFile, "cert", "./certs/client.pem", "Client Certificate File")
    flag.StringVar(&clientKeyFile, "key", "./certs/client-key.pem", "Client Private key")
    flag.Parse()

    log.Println("NATS endpoint:", serverList)
    log.Println("Root CA:", rootCACertFile)
    log.Println("Client Cert:", clientCertFile)
    log.Println("Client Key:", clientKeyFile)

    // Connect options
    rootCA := nats.RootCAs(rootCACertFile)
    clientCert := nats.ClientCert(clientCertFile, clientKeyFile)
    alwaysReconnect := nats.MaxReconnects(-1)

    var nc *nats.Conn
    var err error
    for {
        nc, err = nats.Connect(serverList, rootCA, clientCert, alwaysReconnect)
        if err != nil {
            log.Printf("Error while connecting to NATS, backing off for a sec... (error: %s)", err)
            time.Sleep(1 * time.Second)
            continue
        }
        break
    }

    nc.Subscribe("discovery.*.status", func(m *nats.Msg) {
        log.Printf("[Received on %q] %s", m.Subject, string(m.Data))
    })

    discoverySubject := fmt.Sprintf("discovery.%s.status", nuid.Next())
    info := struct {
        InMsgs        uint64   `json:"in_msgs"`
        OutMsgs       uint64   `json:"out_msgs"`
        Reconnects    uint64   `json:"reconnects"`
        CurrentServer string   `json:"current_server"`
        Servers       []string `json:"servers"`
    }{}

    for range time.NewTicker(1 * time.Second).C {
        stats := nc.Stats()
        info.InMsgs = stats.InMsgs
        info.OutMsgs = stats.OutMsgs
        info.Reconnects = stats.Reconnects
        info.CurrentServer = nc.ConnectedUrl()
        info.Servers = nc.Servers()
        payload, err := json.Marshal(info)
        if err != nil {
            log.Printf("Error marshalling data: %s", err)
        }
        err = nc.Publish(discoverySubject, payload)
        if err != nil {
            log.Printf("Error during publishing: %s", err)
        }
        nc.Flush()
    }
}
```

```text
FROM golang:1.11.0-alpine3.8 AS builder
COPY . /go/src/github.com/nats-io/nats-kubernetes/examples/nats-cluster-routes-tls/app
WORKDIR /go/src/github.com/nats-io/nats-kubernetes/examples/nats-cluster-routes-tls/app
RUN apk add --update git
RUN go get -u github.com/nats-io/go-nats
RUN go get -u github.com/nats-io/nuid
RUN CGO_ENABLED=0 go build -o nats-client-app -v -a ./client.go

FROM scratch
COPY --from=builder /go/src/github.com/nats-io/nats-kubernetes/examples/nats-cluster-routes-tls/app/nats-client-app /nats-client-app
ENTRYPOINT ["/nats-client-app"]
```

```bash
docker build . -t wallyqs/nats-client-app
docker run wallyqs/nats-client-app
docker push wallyqs/nats-client-app
```

#### Pod spec

```shell
echo ' apiVersion: apps/v1beta2 kind: Deployment

## The name of the deployment

metadata: name: nats-client-app

spec:

## This selector has to match the template.metadata.labels section

## which is below in the PodSpec

selector: matchLabels: name: nats-client-app

## Number of instances

replicas: 1

## PodSpec

template: metadata: labels: name: nats-client-app spec: volumes:

* name: "client-tls-certs"

  secret:

    secretName: "nats-tls-client-example"

  containers:

* name: nats-client-app

  command: \["/nats-client-app", "-s", "tls://nats-cluster.default.svc:4222", "-cacert", '/etc/nats-client-tls-certs/ca.pem', '-cert', '/etc/nats-client-tls-certs/client.pem', '-key', '/etc/nats-client-tls-certs/client-key.pem'\]

  image: wallyqs/nats-client-app:latest

  imagePullPolicy: Always

  volumeMounts:

  * name: "client-tls-certs"

    mountPath: "/etc/nats-client-tls-certs/"

    ' \| kubectl apply -f -
```

