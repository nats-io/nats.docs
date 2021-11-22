# Using a Load Balancer for External Access to NATS

## Using a Load Balancer for External Access to NATS

In the example below, you can find how to use an [AWS Network Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html) to connect externally to a cluster that has TLS setup.

One-line installer creates a secure cluster named 'nats'
```bash
curl -sSL https://nats-io.github.io/k8s/setup.sh | sh
```

Create AWS Network Load Balancer service

```shell
echo '
apiVersion: v1
kind: Service
metadata:
  name: nats-nlb
  namespace: default
  labels:
    app: nats
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local
  ports:
  - name: nats
    port: 4222
    protocol: TCP
    targetPort: 4222
  selector:
    app.kubernetes.io/name: nats
' | kubectl apply -f -
```

Check that it worked

```shell
kubectl get svc nats-nlb -o wide
```
Example output
```text
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP                                                                     PORT(S)          AGE    SELECTOR
nats-nlb   LoadBalancer   10.100.67.123   a18b60a948fc611eaa7840286c60df32-9e96a2af4b5675ec.elb.us-east-2.amazonaws.com   4222:30297/TCP   151m   app=nats
```

Publish a test message
```shell
nats pub -s nats://a18b60a948fc611eaa7840286c60df32-9e96a2af4b5675ec.elb.us-east-2.amazonaws.com:4222 -creds nsc/nkeys/creds/KO/A/test.creds test.foo bar
```

Also, it would be recommended to set [no_advertise](../configuration/clustering/cluster_config.md) to `true` in order to avoid gossiping internal addresses from pods in Kubernetes to NATS clients.

## Setting up a NATS Server with external access on Azure

With the following, you can create a 3-node NATS Server cluster:

```bash
kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/b55687a97a5fd55485e1af302fbdbe43d2d3b968/nats-server/leafnodes/nats-cluster.yaml
```

The configuration map from the NATS cluster that was created can be found below.

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nats-config
data:
  nats.conf: |
    pid_file: "/var/run/nats/nats.pid"
    http: 8222
    # debug: true
    ping_interval: 30s

    cluster {
      port: 6222
      no_advertise: true

      routes: [
        nats://nats-0.nats.default.svc:6222
        nats://nats-1.nats.default.svc:6222
        nats://nats-2.nats.default.svc:6222
      ]
    }

    leaf {
      port: 7422
      authorization {
        timeout: 3s
        users = [
          { user: "foo", pass: "bar" }
        ]
      }
    }
```

Now let's expose the NATS Server by creating an L4 load balancer on Azure:

```bash
kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/b55687a97a5fd55485e1af302fbdbe43d2d3b968/nats-server/leafnodes/lb.yaml
```

Confirm the public IP that was allocated to the `nats-lb` service that was created, in this case it is `52.155.49.45`:

```shell
kubectl get svc -o wide
```
Output
```text
NAME         TYPE           CLUSTER-IP    EXTERNAL-IP    PORT(S)                                                 AGE     SELECTOR
kubernetes   ClusterIP      10.0.0.1      <none>         443/TCP                                                 81d     <none>
nats         ClusterIP      None          <none>         4222/TCP,6222/TCP,8222/TCP,7777/TCP,7422/TCP,7522/TCP   7h46m   app=nats
nats-lb      LoadBalancer   10.0.107.18   52.155.49.45   4222:31161/TCP,7422:30960/TCP                           7h40m   app=nats
```

Notice that the leafnode configuration requires authorization, so in order to connect to it we will need to configuration as follows:

```ruby
leaf {
  remotes = [
    {
      url: "nats://foo:bar@52.155.49.45:7422"
    }
  ]
}
```

You can also add a NATS Streaming cluster into the cluster connecting to the port 4222:

```bash
kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/b55687a97a5fd55485e1af302fbdbe43d2d3b968/nats-server/leafnodes/stan-server.yaml
```

Now if you create two NATS Servers that connect to the same leafnode port, they will be able to receive messages to each other:

```bash
nats-server -c leafnodes/leaf.conf -p 4222 &
nats-server -c leafnodes/leaf.conf -p 4223 &
```

Create a subscriber and publish a test message
```shell
nats sub -s localhost:4222 foo &
nats pub -s localhost:4223 foo hello 
```
Output
```text
Listening on [foo]
[#1] Received on [foo] : 'hello'
```

