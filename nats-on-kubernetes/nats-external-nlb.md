# Using a load balancer for external access to NATS on K8S

Although it is not recommended in general to use a load balancer
with NATS for external access, sometimes due to policy it might
help to use one.  If that is the case, then one option would be
to use an L4 load balancer that has raw tcp support.

In the example below, you can find how to use an [AWS Network Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html)
to connect externally to a cluster that has TLS setup.

```sh
# One-line installer creates a secure cluster named 'nats'
$ curl -sSL https://nats-io.github.io/k8s/setup.sh | sh

# Create AWS Network Load Balancer service
$ echo '
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
    app: nats
' | kubectl apply -f -

$ kubectl get svc nats-nlb -o wide
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP                                                                     PORT(S)          AGE    SELECTOR
nats-nlb   LoadBalancer   10.100.67.123   a18b60a948fc611eaa7840286c60df32-9e96a2af4b5675ec.elb.us-east-2.amazonaws.com   4222:30297/TCP   151m   app=nats

$ nats-pub -s nats://a18b60a948fc611eaa7840286c60df32-9e96a2af4b5675ec.elb.us-east-2.amazonaws.com:4222 -creds nsc/nkeys/creds/KO/A/test.creds test.foo bar
```

Also, it would be recommended to disable [no_advertise](nats-server/configuration/clustering/cluster_config.md) 
to avoid gossiping internal addresses from pods in Kubernetes to NATS clients.
