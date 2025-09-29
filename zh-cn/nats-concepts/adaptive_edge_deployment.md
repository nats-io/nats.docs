# NATS 自适应部署架构

从单个进程到包含叶子节点服务器的全球超级集群，您可以根据需求灵活调整NATS服务的部署方式。无论是多个云环境中的服务器和VPC，还是部分连接的小型边缘设备，以及介于两者之间的各种情况，您都可以随着需求的增长轻松扩容和扩容您的NATS服务。

## 单个服务器

最简单的NATS服务基础设施版本是一个单独的`nats-server`进程。`nats-server`二进制文件经过高度优化，非常轻量且资源使用效率极高。

客户端应用通过连接到该`nats-server`进程的URL（例如`"nats://localhost"`）建立连接。

![](../.gitbook/assets/single-server.svg)

## 服务器集群

如果您需要一个容错的NATS服务，或者需要扩容，可以将一组`nats-server`进程组成一个集群。

客户端应用连接并保持与构成集群的（一个或多个）`nats-server` URL（例如`"nats://server1","nats://server2",...`）的连接。

![](../.gitbook/assets/server-cluster.svg)

## 超级集群

您可以进一步扩容单一集群，实现灾难恢复，并通过部署多个集群并通过网关连接（这些连接会进行兴趣修剪）将它们相互连接起来，从而得到全局部署（例如在多个地点或区域、多个VPC或多个云提供商）。

客户端应用连接到其中一个集群的（一个或多个）`nats-server` URL（例如`"nats://us-west-1.company.com","nats://us-west-2.company.com",...`）。

![](../.gitbook/assets/super_cluster.svg)

## 叶子节点

您可以通过部署一个或多个 “本地的” **叶子节点**NATS服务器来轻松“扩容”由集群或超级集群提供的NATS服务。叶子节点服务器代理并路由其客户端应用与NATS服务基础设施之间的流量。这里的“本地的”不仅指物理位置：它可以是某个位置、边缘设备或单台开发机器，也可以服务于一个VPC、特定应用程序的一组服务器进程、不同的账户，甚至一个业务部门。叶子节点NATS服务器可以配置为通过WebSocket连接（而不是TLS或纯TCP）连接到集群。

叶子节点对集群而言表现为一个单一的账户连接。即使叶子节点暂时与集群断开连接，仍可为其客户端提供持续的NATS服务。您甚至可以在叶子节点上启用JetStream，以创建本地流，这些流会被镜像（镜像为存储转发模式，因此可以从连接中断中恢复）到上游集群中的全局流。

客户端应用配置为连接到其“本地的”叶子节点服务器的URL（例如`"nats://leaf-node-1","nats://leaf-node-2",...`）。

![](../.gitbook/assets/leaf_nodes.svg)

## 参考资料

NATS 集群&#x20;

{% embed url="https://youtu.be/srARy0m9SdI" %}
集群
{% endembed %}

NATS 超级集群&#x20;

{% embed url="https://youtu.be/6O_sNSJ2p70" %}
超级集群
{% endembed %}

NATS 叶子节点&#x20;

{% embed url="https://youtu.be/WH55czo1BNk" %}
叶子节点
{% endembed %}

NATS 服务队列中的地理亲和性&#x20;

{% embed url="https://youtu.be/jLTVhP08Tq0?t=190" %}
队列中的地理亲和性
{% endembed %}