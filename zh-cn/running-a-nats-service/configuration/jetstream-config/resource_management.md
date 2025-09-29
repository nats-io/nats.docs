# 配置 JetStream

### 为 nats-server 启用 JetStream

要在服务器中启用 JetStream，我们必须首先在顶层配置它：

```
jetstream: enabled
```

你也可以从命令行使用 `-js, --jetstream` 和 `-sd, --store_dir <dir>` 标志

## 多租户和资源管理

JetStream 与通过账户实现的多租户 NATS 2.0 兼容。启用 JetStream 的服务器支持为不同账户创建完全隔离的 JetStream 环境。

叶子节点中的 JetStream 环境应隔离在它们自己的 JetStream 域中 - [叶子节点](../leafnodes/)

服务器将动态确定可用资源。不过，建议你设置特定的限制：

```
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
    domain: acme
}
```

### 设置账户资源限制

此时 JetStream 会被启用，如果你有一个没有启用账户的服务器，服务器中的所有用户都将有权使用JetStream

```
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
}

accounts {
    HR: {
        jetstream: enabled
    }
}
```

这里 `HR` 账户将有权访问服务器上配置的所有资源，我们可以限制它：

```
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
}

accounts {
    HR: {
        jetstream {
            max_mem: 512M
            max_file: 1G
            max_streams: 10
            max_consumers: 100
        }
    }
}
```

现在 `HR` 账户在各个维度都受到限制。

如果你尝试在没有全局启用 JetStream 的情况下为账户配置 JetStream，你会收到警告，并且被指定为系统的账户不能启用 JetStream。

#### 设置 JetStream API 和最大 HA 资源限制

自 v2.10.21 版本起，NATS JetStream API 有一个 10K 的飞行中（inflight）请求限制，超出此限制后它将开始丢弃请求，以保护免受内存积累并避免压倒 JetStream 服务。有时可能需要进一步降低限制以减少 JetStream 流量增加影响服务的可能性。另一个重要的限制是 `max_ha_assets`，它将限制每个服务器支持的 3副本 或 5副本 流和消费者的最大数量：

示例：

```
jetstream {
  request_queue_limit: 1000
    limits {
      max_ha_assets = 2000
    }
  }
```

当达到请求限制时，所有待处理的请求都会被丢弃，因此在某些情况下可能需要进一步降低限制以减少对应用程序的影响。在日志中会出现以下内容，报告请求已被丢弃：

```
[WRN] JetStream API queue limit reached, dropping 1000 requests
```

对于应用程序，这将意味着这些操作将出错并且必须重试。每当发生这种情况时，它还会在主题 `$JS.EVENT.ADVISORY.API.LIMIT_REACHED` 下发出通知。

#### 使用 `nsc` CLI 工具的运营商模式账户资源限制

如果你使用运营商模式，JetStream 特定的账户配置可以存储在账户 JWT 中。前面名为 HR 的账户可以如下配置：

```bash
nsc add account --name HR
nsc edit account --name HR --js-mem-storage 1G --js-disk-storage 512M  --js-streams 10 --js-consumer 100
```