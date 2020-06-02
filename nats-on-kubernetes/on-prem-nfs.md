# NATS streaming server using an on-prem NFS

A guide to setup nats + stan on k8s using helm with an on-prem NFS.

This guide assumes that NATS is being installed in a namespace called `nats`.

## NFS Server Setup

On a linux based system, install `nfs-kernel-server`.

```sh
apt update
apt install nfs-kernel-server
```

Edit `/etc/exports` to export file system, example:

```sh
/var/mnt     192.168.10.0/24(rw,no_root_squash,no_subtree_check,fsid=0)
/var/mnt/stan 192.168.10.0/24(rw,no_root_squash,no_subtree_check)
```

Then, reload the nfs server

```sh
exportfs -a
/etc/init.d/nfs-kernel-server reload
```

## k8s NFS client provisioner

We need to create a storage class and a method to automatically create k8s PVCs (persistent volume claims) and associated PVs (persistent volume).

Incidentally, there is an [helm chart](https://github.com/helm/charts/tree/master/stable/nfs-client-provisioner) for this task.

### ReadWriteOnce provisioner

```sh
helm repo update
helm repo list
helm install nats-nfs-client stable/nfs-client-provisioner \
    --set nfs.server=<NFS_SERVER_IP> \
    --set nfs.path=/stan \ # Important, this needs to match the folder exported when the NFS server was setup. DO NOT use full path.
    --set storageClass.name=nats-nfs \ # Name of your storage class
    --set storageClass.reclaimPolicy=Retain \
    --set storageClass.archiveOnDelete=false \
    --set nfs.mountOptions={vers=4}
```

### ReadWriteMany provisioner (required for fault tolerant setup)

At this stage, the helm chart does not allow modification of access mode via values.yaml.

Download the chart and manually modify `persistentvolume.yaml` and `persistentvolumeclaim.yaml` to have `accessModes` set to `ReadWriteMany`.

Then install the chart from your local directory

```sh
helm install nats-nfs-client <path to your modified chart> \
    --set nfs.server=<NFS_SERVER_IP> \
    --set nfs.path=/stan \ # Important, this needs to match the folder exported when the NFS server was setup. DO NOT use full path.
    --set storageClass.name=nats-nfs \ # Name of your storage class
    --set storageClass.reclaimPolicy=Retain \
    --set storageClass.archiveOnDelete=false \
    --set nfs.mountOptions={vers=4}
```

## Install nats + stan

### Simple setup:

```sh
helm install nats-server nats/nats --namespace=nats
helm install stan-server nats/stan --namespace=nats \
    --set stan.nats.url=nats://nats-server:4222 \
    --set store.type=file \
    --set store.file.path=/stan/store \
    --set store.volume.enabled=true \
    --set store.volume.mount=/stan \
    --set store.volume.storageSize=1Gi \
    --set store.volume.accessModes=ReadWriteOnce \
    --set store.volume.storageClass=nats-nfs
```

### Fault Tolerant (requires ReadWriteMany access):

```sh
helm install nats-server nats/nats --namespace=nats
helm install stan-server nats/stan --namespace=nats \
    --set stan.replicas=3 \
    --set stan.nats.url=nats://nats-server:4222 \
    --set store.type=file \
    --set store.ft.group=stan-ft-group-1 \
    --set store.file.path=/stan/store \
    --set store.volume.enabled=true \
    --set store.volume.mount=/stan \
    --set store.volume.storageSize=1Gi \
    --set store.volume.accessModes=ReadWriteMany \
    --set store.volume.storageClass=nats-nfs
```

### HA setup (requires 3 nodes to spread pods)

Create a nats-affinity.yaml

```sh
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - nats
          topologyKey: "kubernetes.io/hostname"

```

Then, install nats as follows:

```sh
helm install nats-server nats/nats --namespace=nats \
    --set cluster.enabled=true \
    -f nats-affinity.yaml
```

Wait for the pods to become ready.

Create a stan-affinity.yaml

```sh
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - stan
          topologyKey: "kubernetes.io/hostname"
  podAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values:
                  - nats
          topologyKey: "kubernetes.io/hostname"
```

Then, install stan as follows:

```sh
helm install stan-server nats/stan --namespace=nats \
    --set stan.nats.url=nats://nats-server:4222 \
    --set store.type=file \
    --set store.file.path=/stan/store \
    --set store.volume.enabled=true \
    --set store.volume.mount=/stan \
    --set store.volume.storageSize=1Gi \
    --set store.volume.accessModes=ReadWriteOnce \
    --set store.volume.storageClass=nats-nfs \
    --set store.cluster.enabled=true \
    --set store.cluster.logPath=/stan/log \
    -f stan-affinity.yaml
```