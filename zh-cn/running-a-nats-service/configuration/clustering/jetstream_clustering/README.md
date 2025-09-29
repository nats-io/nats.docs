# JetStream 集群

JetStream 中的集群对于高可用和可扩展的系统是必需的。集群背后是 RAFT 算法。使用集群不需要深入理解 RAFT，不过了解一点点便可以解释设置 JetStream 集群背后的一些要求。

## RAFT

JetStream 使用 NATS 优化的 RAFT 算法进行集群。通常 RAFT 会产生大量流量，但 NATS 服务器通过将用于复制消息的数据平面与 RAFT 通常用于确保共识的消息相结合来优化这一点。每个参与的服务器都需要一个唯一的 `server_name`（仅在同一域内适用）。

### RAFT 组

RAFT 组包括 API 处理程序、流、消费者，内部算法指定哪些服务器处理哪些流和消费者。

RAFT 算法有一些要求：

* 用于持久化状态的日志
* 用于共识的法定人数

### 法定人数

为了确保在完全重启后数据的一致性，需要服务器的法定人数。法定人数是 (½ 的集群大小 + 1)。这是在灾难性故障后确保至少一个节点具有最新数据和状态所需的最小节点数。因此，对于集群大小为 3，您至少要有两个启用了 JetStream 的 NATS 服务器可用以存储新消息。对于集群大小为 5，您至少要有 3 个 NATS 服务器可用，依此类推。

### RAFT 组

**元组** - 所有服务器加入元组，JetStream API 由此组管理。选举一个领导者，该领导者拥有 API 并负责服务器放置。

![元组](../../../../.gitbook/assets/meta-group.png)

**流组** - 每个流创建一个对应的 RAFT 组，此组在其成员之间同步状态和数据。选举的领导者处理 ACK 等，如果没有领导者，流将不接受消息。

![流组](../../../../.gitbook/assets/stream-groups.png)

**消费者组** - 每个消费者创建一个对应的 RAFT 组，此组在其成员之间同步消费者状态。该组将位于流组所在的机器上，并处理消费 ACK 等。每个消费者会有自己的组。

![消费者组](../../../../.gitbook/assets/consumer-groups.png)

### 集群大小

通常，我们建议在 NATS 集群中使用 3 或 5 个启用了 JetStream 的服务器。这在可扩展性和容错性之间取得了平衡。例如，如果 5 个服务器启用了 JetStream，您可能希望在一个"区域"中有两个服务器，在另一个区域中有两个服务器，在第三个区域中有剩余的服务器。这意味着您可以在任何时候丢失任何一个"区域"并继续运行。

### 混合启用了 JetStream 的服务器与标准 NATS 服务器

这是可能的，在某些情况下甚至是推荐方案。通过混合服务器类型，您可以将某些针对存储优化的机器专用于 Jetstream，而将其他仅针对计算优化的机器专用于标准 NATS 服务器，从而降低运营成本。通过正确的配置，标准服务器将处理非持久性 NATS 流量，而启用了 JetStream 的服务器将处理 JetStream 流量。

## 配置

要配置 JetStream 集群，只需像通常一样通过指定配置中的集群块来配置集群。集群列表中任何启用了 JetStream 的服务器将自动通信并自我设置。但与核心 NATS 集群不同，每个 JetStream 节点**必须指定**服务器名称和集群名称。

以下是跨三台机器 `n1-c1`、`n2-c1` 和 `n3-c1` 的三节点集群的显式列出的服务器配置。

### 服务器密码配置

应配置[系统账户 ($SYS)](../../sys\_accounts/#system-account) 下的用户和密码。以下配置使用 [bcrypted 密码](../../securing\_nats/auth\_intro/username\_password.md)：`a very long s3cr3t! password`。

### 服务器 1 (host\_a)

```
server_name=n1-c1
listen=4222

accounts {
  $SYS {
    users = [
      { user: "admin",
        pass: "$2a$11$DRh4C0KNbNnD8K/hb/buWe1zPxEHrLEiDmuq1Mi0rRJiH/W25Qidm"
      }
    ]
  }
}

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: C1
  listen: 0.0.0.0:6222
  routes: [
    nats://host_b:6222
    nats://host_c:6222
  ]
}
```

### 服务器 2 (host\_b)

```
server_name=n2-c1
listen=4222

accounts {
  $SYS {
    users = [
      { user: "admin",
        pass: "$2a$11$DRh4C0KNbNnD8K/hb/buWe1zPxEHrLEiDmuq1Mi0rRJiH/W25Qidm"
      }
    ]
  }
}

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: C1
  listen: 0.0.0.0:6222
  routes: [
    nats://host_a:6222
    nats://host_c:6222
  ]
}
```

### 服务器 3 (host\_c)

```
server_name=n3-c1
listen=4222

accounts {
  $SYS {
    users = [
      { user: "admin",
        pass: "$2a$11$DRh4C0KNbNnD8K/hb/buWe1zPxEHrLEiDmuq1Mi0rRJiH/W25Qidm"
      }
    ]
  }
}

jetstream {
   store_dir=/nats/storage
}

cluster {
  name: C1
  listen: 0.0.0.0:6222
  routes: [
    nats://host_a:6222
    nats://host_b:6222
  ]
}
```

根据需要添加节点。为您的环境选择一个有意义的数据目录，理想情况下是快速的 SSD，并启动每个服务器。在两个服务器上线后，您就可以使用 JetStream 了。
