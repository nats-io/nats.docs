# 简介

要在 Kubernetes 上部署 NATS ，我们推荐使用 [Helm](https://helm.sh/) 以及官方的 NATS Helm Chart。

## Helm 仓库

要注册 NATS Helm 图表，请运行以下命令：

```sh
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
```

## 配置值

图表的默认配置值将会部署一个 作为 `StatefulSet` 的单个 NATS 服务器，以及一个作为副本的 [nats-box](https://github.com/nats-io/nats-box) `Deployment`。

[ArtifactHub 页面](https://artifacthub.io/packages/helm/nats/nats) 提供了当前版本的 Helm 配置值列表和示例。

_如需跟踪开发版本，请看 [源代码仓库](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#nats-server)。_

一旦创建了所需的配置，即可安装图表：

```sh
helm install nats nats/nats
```

## 验证连接性

Pod 启动后，可通过访问 `nats-box` 容器并运行 CLI 命令来验证连接性。

```sh
kubectl exec -it deployment/nats-box -- nats pub test hi
```

输出应显示成功发布到 NATS。

```
16:17:00 Published 2 bytes to "test"
```

## 商业部署选项

Synadia 提供 [Deploy for Kubernetes](https://www.synadia.com/deploy-for-kubernetes/)，这是一种自助式、部署在你自己 K8s 集群上的方案，其中包含 NATS 和其他附加组件。