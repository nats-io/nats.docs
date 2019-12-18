# Creating a NATS Streaming cluster in K8S with FT mode

## Preparation

First, we need a Kubernetes cluster with a provider that offers a
service with a `ReadWriteMany` filesystem available.  In this short guide,
we will create the cluster on AWS and then use EFS for the filesystem: 

```
# Create 3 nodes Kubernetes cluster
eksctl create cluster --name nats-eks-cluster \
  --nodes 3 \
  --node-type=t3.large \
  --region=us-east-2

# Get the credentials for your cluster
eksctl utils write-kubeconfig --name nats-eks-cluster --region us-east-2
```

For the FT mode to work, we will need to create an EFS volume which
can be shared by more than one pod. Go into the [AWS console](https://us-east-2.console.aws.amazon.com/efs/home?region=us-east-2#/wizard/1) and create one and make the sure that it is in a security group where the k8s nodes will have access to it.  In case of clusters created via eksctl, this will be a security group named `ClusterSharedNodeSecurityGroup`:

<img width="1063" alt="Screen Shot 2019-12-04 at 11 25 08 AM" src="https://user-images.githubusercontent.com/26195/70177488-5ef0bd00-16d2-11ea-9cf3-e0c3196bc7da.png">

<img width="1177" alt="Screen Shot 2019-12-04 at 12 40 13 PM" src="https://user-images.githubusercontent.com/26195/70179769-9497a500-16d6-11ea-9e18-2a8588a71819.png">

### Creating the EFS provisioner

Confirm from the FilesystemID from the cluster and the DNS name, we will use those values to create an EFS provisioner controller within the K8S cluster:

<img width="852" alt="Screen Shot 2019-12-04 at 12 08 35 PM" src="https://user-images.githubusercontent.com/26195/70177502-657f3480-16d2-11ea-9d00-b9a8c2f5320b.png">

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: efs-provisioner
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: efs-provisioner-runner
rules:
  - apiGroups: [""]
    resources: ["persistentvolumes"]
    verbs: ["get", "list", "watch", "create", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "list", "watch", "update"]
  - apiGroups: ["storage.k8s.io"]
    resources: ["storageclasses"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["create", "update", "patch"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: run-efs-provisioner
subjects:
  - kind: ServiceAccount
    name: efs-provisioner
     # replace with namespace where provisioner is deployed
    namespace: default
roleRef:
  kind: ClusterRole
  name: efs-provisioner-runner
  apiGroup: rbac.authorization.k8s.io
---
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-efs-provisioner
rules:
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: leader-locking-efs-provisioner
subjects:
  - kind: ServiceAccount
    name: efs-provisioner
    # replace with namespace where provisioner is deployed
    namespace: default
roleRef:
  kind: Role
  name: leader-locking-efs-provisioner
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: efs-provisioner
data:
  file.system.id: fs-c22a24bb
  aws.region: us-east-2
  provisioner.name: synadia.com/aws-efs
  dns.name: ""
---
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: efs-provisioner
spec:
  replicas: 1
  strategy:
    type: Recreate 
  template:
    metadata:
      labels:
        app: efs-provisioner
    spec:
      serviceAccountName: efs-provisioner
      containers:
        - name: efs-provisioner
          image: quay.io/external_storage/efs-provisioner:latest
          env:
            - name: FILE_SYSTEM_ID
              valueFrom:
                configMapKeyRef:
                  name: efs-provisioner
                  key: file.system.id
            - name: AWS_REGION
              valueFrom:
                configMapKeyRef:
                  name: efs-provisioner
                  key: aws.region
            - name: DNS_NAME
              valueFrom:
                configMapKeyRef:
                  name: efs-provisioner
                  key: dns.name

            - name: PROVISIONER_NAME
              valueFrom:
                configMapKeyRef:
                  name: efs-provisioner
                  key: provisioner.name
          volumeMounts:
            - name: pv-volume
              mountPath: /efs
      volumes:
        - name: pv-volume
          nfs:
            server: fs-c22a24bb.efs.us-east-2.amazonaws.com
            path: /
---
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: aws-efs
provisioner: synadia.com/aws-efs
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: efs
  annotations:
    volume.beta.kubernetes.io/storage-class: "aws-efs"
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Mi
```

Result of deploying the manifest:

```sh
serviceaccount/efs-provisioner                                        created 
clusterrole.rbac.authorization.k8s.io/efs-provisioner-runner          created 
clusterrolebinding.rbac.authorization.k8s.io/run-efs-provisioner      created 
role.rbac.authorization.k8s.io/leader-locking-efs-provisioner         created 
rolebinding.rbac.authorization.k8s.io/leader-locking-efs-provisioner  created 
configmap/efs-provisioner                                             created 
deployment.extensions/efs-provisioner                                 created 
storageclass.storage.k8s.io/aws-efs                                   created 
persistentvolumeclaim/efs                                             created 
```

### Setting up the NATS Streaming cluster

Now create a NATS Streaming cluster with FT mode enabled and using NATS embedded mode
that is mounting the EFS volume:

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: stan
  labels:
    app: stan
spec:
  selector:
    app: stan
  clusterIP: None
  ports:
  - name: client
    port: 4222
  - name: cluster
    port: 6222
  - name: monitor
    port: 8222
  - name: metrics
    port: 7777
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: stan-config
data:
  stan.conf: |
    http: 8222
    
    cluster {
      port: 6222
      routes [
        nats://stan:6222
      ]
      cluster_advertise: $CLUSTER_ADVERTISE
      connect_retries: 10
    }
    streaming {
      id: test-cluster
      store: file
      dir: /data/stan/store
      ft_group_name: "test-cluster"
      file_options {
          buffer_size: 32mb
          sync_on_flush: false
          slice_max_bytes: 512mb
          parallel_recovery: 64
      }
      store_limits {
          max_channels: 10
          max_msgs: 0
          max_bytes: 256gb
          max_age: 1h
          max_subs: 128
      }  
    }
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: stan
  labels:
    app: stan
spec:
  selector:
    matchLabels:
      app: stan
  serviceName: stan
  replicas: 3
  volumeClaimTemplates:
  - metadata:
      name: efs
      annotations:
        volume.beta.kubernetes.io/storage-class: "aws-efs"
    spec:
      accessModes: [ "ReadWriteMany" ]
      resources:
        requests:
          storage: 1Mi
  template:
    metadata:
      labels:
        app: stan
    spec:
      # STAN Server
      terminationGracePeriodSeconds: 30

      containers:
      - name: stan
        image: nats-streaming:latest

        ports:
        # In case of NATS embedded mode expose these ports
        - containerPort: 4222
          name: client
        - containerPort: 6222
          name: cluster
        - containerPort: 8222
          name: monitor
        args:
         - "-sc"
         - "/etc/stan-config/stan.conf"

        # Required to be able to define an environment variable
        # that refers to other environment variables.  This env var
        # is later used as part of the configuration file.
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: CLUSTER_ADVERTISE
          value: $(POD_NAME).stan.$(POD_NAMESPACE).svc
        volumeMounts:
          - name: config-volume
            mountPath: /etc/stan-config
          - name: efs
            mountPath: /data/stan
        resources:
          requests:
            cpu: 0
        livenessProbe:
          httpGet:
            path: /
            port: 8222
          initialDelaySeconds: 10
          timeoutSeconds: 5
      - name: metrics
        image: synadia/prometheus-nats-exporter:0.5.0
        args:
        - -connz
        - -routez
        - -subz
        - -varz
        - -channelz
        - -serverz
        - http://localhost:8222
        ports:
        - containerPort: 7777
          name: metrics
      volumes:
      - name: config-volume
        configMap:
          name: stan-config
```

Your cluster now will look something like this:

```
kubectl get pods
NAME                                     READY   STATUS    RESTARTS   AGE
efs-provisioner-6b7866dd4-4k5wx          1/1     Running   0          21m
stan-0                                   2/2     Running   0          6m35s
stan-1                                   2/2     Running   0          4m56s
stan-2                                   2/2     Running   0          4m42s
```

If everything was setup properly, one of the servers will be the active node.

```
$ kubectl logs stan-0 -c stan
[1] 2019/12/04 20:40:40.429359 [INF] STREAM: Starting nats-streaming-server[test-cluster] version 0.16.2
[1] 2019/12/04 20:40:40.429385 [INF] STREAM: ServerID: 7j3t3Ii7e2tifWqanYKwFX
[1] 2019/12/04 20:40:40.429389 [INF] STREAM: Go version: go1.11.13
[1] 2019/12/04 20:40:40.429392 [INF] STREAM: Git commit: [910d6e1]
[1] 2019/12/04 20:40:40.454212 [INF] Starting nats-server version 2.0.4
[1] 2019/12/04 20:40:40.454360 [INF] Git commit [c8ca58e]
[1] 2019/12/04 20:40:40.454522 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2019/12/04 20:40:40.454830 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/12/04 20:40:40.454841 [INF] Server id is NB3A5RSGABLJP3WUYG6VYA36ZGE7MP5GVQIQVRG6WUYSRJA7B2NNMW57
[1] 2019/12/04 20:40:40.454844 [INF] Server is ready
[1] 2019/12/04 20:40:40.456360 [INF] Listening for route connections on 0.0.0.0:6222
[1] 2019/12/04 20:40:40.481927 [INF] STREAM: Starting in standby mode
[1] 2019/12/04 20:40:40.488193 [ERR] Error trying to connect to route (attempt 1): dial tcp: lookup stan on 10.100.0.10:53: no such host
[1] 2019/12/04 20:40:41.489688 [INF] 192.168.52.76:40992 - rid:6 - Route connection created
[1] 2019/12/04 20:40:41.489788 [INF] 192.168.52.76:40992 - rid:6 - Router connection closed
[1] 2019/12/04 20:40:41.489695 [INF] 192.168.52.76:6222 - rid:5 - Route connection created
[1] 2019/12/04 20:40:41.489955 [INF] 192.168.52.76:6222 - rid:5 - Router connection closed
[1] 2019/12/04 20:40:41.634944 [INF] STREAM: Server is active
[1] 2019/12/04 20:40:41.634976 [INF] STREAM: Recovering the state...
[1] 2019/12/04 20:40:41.655526 [INF] STREAM: No recovered state
[1] 2019/12/04 20:40:41.671435 [INF] STREAM: Message store is FILE
[1] 2019/12/04 20:40:41.671448 [INF] STREAM: Store location: /data/stan/store
[1] 2019/12/04 20:40:41.671524 [INF] STREAM: ---------- Store Limits ----------
[1] 2019/12/04 20:40:41.671527 [INF] STREAM: Channels:                   10
[1] 2019/12/04 20:40:41.671529 [INF] STREAM: --------- Channels Limits --------
[1] 2019/12/04 20:40:41.671531 [INF] STREAM:   Subscriptions:           128
[1] 2019/12/04 20:40:41.671533 [INF] STREAM:   Messages     :     unlimited
[1] 2019/12/04 20:40:41.671535 [INF] STREAM:   Bytes        :     256.00 GB
[1] 2019/12/04 20:40:41.671537 [INF] STREAM:   Age          :        1h0m0s
[1] 2019/12/04 20:40:41.671539 [INF] STREAM:   Inactivity   :     unlimited *
[1] 2019/12/04 20:40:41.671541 [INF] STREAM: ----------------------------------
[1] 2019/12/04 20:40:41.671546 [INF] STREAM: Streaming Server is ready
```
