# Kubernetes Controller

JetStream Controller 允许你通过 K8S CRD 管理 NATS JetStream 流和消费者。你可以在[这里](https://github.com/nats-io/nack#getting-started)找到有关如何部署和使用的更多信息。下面你可以找到一个如何创建流和几个消费者的示例：

```yaml
---
apiVersion: jetstream.nats.io/v1beta1
kind: Stream
metadata:
  name: mystream
spec:
  name: mystream
  subjects: ["orders.*"]
  storage: memory
  maxAge: 1h
---
apiVersion: jetstream.nats.io/v1beta1
kind: Consumer
metadata:
  name: my-push-consumer
spec:
  streamName: mystream
  durableName: my-push-consumer
  deliverSubject: my-push-consumer.orders
  deliverPolicy: last
  ackPolicy: none
  replayPolicy: instant
---
apiVersion: jetstream.nats.io/v1beta1
kind: Consumer
metadata:
  name: my-pull-consumer
spec:
  streamName: mystream
  durableName: my-pull-consumer
  deliverPolicy: all
  filterSubject: orders.received
  maxDeliver: 20
  ackPolicy: explicit
```

一旦 CRD 安装完成，你就可以使用 `kubectl` 来管理流和消费者，如下所示：

```bash
$ kubectl get streams
NAME       STATE     STREAM NAME   SUBJECTS
mystream   Created   mystream      [orders.*]

$ kubectl get consumers
NAME               STATE     STREAM     CONSUMER           ACK POLICY
my-pull-consumer   Created   mystream   my-pull-consumer   explicit
my-push-consumer   Created   mystream   my-push-consumer   none

# 如果你最终处于错误状态，运行 kubectl describe 获取更多信息。
#     kubectl describe streams mystream
#     kubectl describe consumers my-pull-consumer
```