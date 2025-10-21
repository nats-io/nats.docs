# 配置

虽然 NATS 服务器有许多命令行标志可以用于简单测试功能，但配置 NATS 服务器产品的标准方式是通过配置文件。
我们使用一种简单的配置格式，它结合了传统格式和较新风格（如 JSON 和 YAML）的优点。

```shell
nats-server -config my-server.conf
```

NATS 配置支持以下语法：

- 行可以用 `#` 和 `//` 注释
- 值可以通过以下分隔符分配给属性：
  - 等号：`foo = 2`
  - 冒号：`foo: 2`  
  - 空格：`foo 2`
- 数组用方括号括起来：`["a", "b", "c"]`
- 映射用花括号括起来：`{foo: 2}`
- 映射可以不使用分隔符赋值：`accounts { SYS {...}, cloud-user {...} }`  
- 分号可选用作终止符：`host: 127.0.0.1; port: 4222;`

NATS 配置文件使用 UTF-8 编码解析。

{% hint style="info" %}
我们强烈建议对名称和值仅使用 ASCII，将非 ASCII 文本的使用限制在注释中。
{% endhint %}

#### 注意

NATS 配置文件也可以渲染为 JSON 对象（带注释！），但要与变量结合使用，变量仍然必须不加引号。

{% hint style="info" %}
JSON 配置文件应仅限于机器生成的配置文件
{% endhint %}

## 字符串和数字

配置解析器非常宽容，正如你所见：

- 值可以是原始类型、列表或映射
- 字符串和数字通常会做正确的事情
- 数字支持单位，例如 1K 表示 1000，1KB 表示 1024

以数字开头的字符串值 _可能_ 会产生问题。要将此类值强制为字符串，请用引号括起来。

_错误的配置_：

```text
listen: 127.0.0.1:4222
authorization: {
    # Bad - Number parsing error
    token: 3secret
}
```

修复后的配置：

```text
listen: 127.0.0.1:4222
authorization: {
    # Good
    token: "3secret"
}
```

## 变量

服务器配置可以指定变量。变量允许你从配置中的一个或多个部分引用值。

**变量语法：**

* 块作用域
* 使用 `$` 前缀引用。引号块中的变量会被忽略。例如，像 `foo = "$VAR1"` 这样的用法将导致 `foo` 成为字面字符串 `"$VAR1"`。
* 变量必须被使用才能被识别。配置解析器将通过查找对变量的引用来区分 `unknown field` 和变量。
* 未定义的变量引用将从环境变量中解析。

**变量解析顺序：**
* 在同一作用域中查找变量
* 在父作用域中查找变量
* 在环境变量中查找变量
* 如果未找到，停止启动服务器并显示以下错误

`nats-server: variable reference for 'PORT' on line 5 can not be found`

{% hint style="warning" %}
如果环境变量值以数字开头，根据你运行的服务器版本，解析时可能会遇到问题。
{% endhint %}


```text
# 在配置中定义变量
TOKEN: "secret"

# 引用变量
authorization {
    token: $TOKEN
}
```

```text
# 在配置中定义变量
# 但 TOKEN 从未使用，导致配置解析错误
TOKEN: "secret"

# 引用变量
authorization {
    token: "another secret"
}
```
```shell
unknown field "TOKEN"
```

类似的配置，但这次变量从环境中解析：
```shell
export TOKEN="hello"
nats-server -c /config/file
```

```text
# TOKEN 在环境中定义
authorization {
    token: $TOKEN
}
```

## 包含指令

`include` 指令允许你将服务器配置拆分为多个文件。这对于将配置分成可以在不同服务器之间轻松重用的块非常有用。

包含 _必须_ 使用相对路径，并且相对于主配置（通过 `-c` 选项指定的配置）：

server.conf：

```text
listen: 127.0.0.1:4222
include ./auth.conf
```

> 注意 `include` 后面不跟 `=` 或 `:`，因为它是一个 _指令_。

auth.conf：

```text
authorization: {
    token: "f0oBar"
}
```

```text
> nats-server -c server.conf
```

## 配置重新加载

配置文件在服务器启动时被读取，不会重新扫描更改，也不会被锁定。

通过向 nats-server 发送[信号](/running-a-nats-service/nats_admin/signals.md)，服务器可以重新加载大多数配置更改，而无需重新启动服务器或断开客户端连接：

```shell
nats-server --signal reload
```

从 NATS v2.10.0 开始，可以使用系统账户用户向 NATS 服务发送重新加载信号，其中 `<server-id>` 是要定位的服务器的唯一 ID。

```shell
nats --user sys --password sys request '$SYS.REQ.SERVER.<server-id>.RELOAD' ""
```

## 配置属性

配置文件具有以下结构（无特定顺序）。所有块和属性都是可选的（除了 host 和 port）。

请参阅下文，了解每个配置块的详细说明

```text
# 常规设置
host: 0.0.0.0
port: 4222

# 各种服务器级别选项
# ...

# 以下部分是具有一组（嵌套）属性的映射

jetstream {
    # JetStream 存储位置、限制和加密
	store_dir: nats
}

tls { 
    # 用于客户端连接、路由和 https 监控连接的 tls 参数配置映射。
}

gateway {
    # 网关配置映射。网关用于连接集群。
}

leafnodes {
    # 叶子节点配置映射。LeafNodes 是轻量级集群。
}

mqtt {
    # mqtt 配置映射。允许客户端通过 mqtt 协议连接。
} 

websocket {
    # websocket 配置映射。允许客户端通过 websockets 连接。
} 

accounts {
    # 账户列表和账户内的用户
    # 用户可能有授权和认证部分
}

authorization { 
    # 用户可能有授权和认证部分
    # 仅当未定义账户时，此部分才有用
}

mappings {
    # 默认账户的主题映射
    # 当定义账户时，此部分必须在账户映射中
}

resolver {
    # 指向外部认证/授权解析器的指针
    # 有多种可能的解析器类型，在本文档的各自章节中解释
    # memory、nats-base、url ... 未来可能会添加更多
    # 此参数可以是简单配置的值 `MEMORY`
    # 或者是用于连接到解析器的属性映射
}

resolver_tls {
    # 基于 URL 的解析器的 TLS 配置
}

resolver_preload {
    # 在服务器启动时要加载的 JWT 令牌列表。
}

```

### 连接性

| Property                                                                                           | Description                                                                                                                                                                           | Default / Example                                  |
| :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------- |
| `host`                                                                                             | Host for client connections.                                                                                                                                                          | `0.0.0.0`                                 |
| `port`                                                                                             | Port for client connections.                                                                                                                                                          | `4222`                                    |
| `listen`                                                                                           | Listen specification `<host>:<port>` for client connections. Either use this or the options `host` and/or `port`.                                                                     | `0.0.0.0:4222`  &nbsp; Inherits from `host` and `port`                    |
| `client_advertise`                                                                                 | Alternative client listen specification `<host>:<port>` or just `<host>` to advertise to clients and other server. Advertising is only active in [cluster](clustering/cluster_config.md) setups with NAT. Explicitly setting the URL is useful when the server is situated behind a load balancer and/or TLS server authentication requires the correct DNS name to be presented. To completely disable `client_advertise` please set `no_advertise: true` in the [cluster configuration](clustering/README.md) section.   | A list of all interfaces the the server is bound to. `E.g. 127.0.0.1:4222,192.168.0.13:4222` |
| [`tls`](/running-a-nats-service/configuration/securing_nats/tls.md)                                | Configuration map for [tls](securing_nats/tls.md) parameters used for client connections, routes and https monitoring connections.                                                                                                                             |                  `tls {}` &nbsp;No tls active by default. Plain text TCP/IP.                         |
| [`gateway`](/running-a-nats-service/configuration/gateways/gateway.md#gateway-configuration-block) | Configuration map for [gateway](/running-a-nats-service/configuration/gateways). Gateways are used to connected clusters into superclusters.                                                                                                     |    `gateway {}` &nbsp; None by default.                                       |
| [`leafnodes`](/running-a-nats-service/configuration/leafnodes/leafnode_conf.md)                    | Configuration map for [leafnodes](/running-a-nats-service/configuration/leafnodes). LeafNodes are lightweight clusters.                                                                                                  |                `leafnodes {}` &nbsp; None by default.                             |
| [`mqtt`](/running-a-nats-service/configuration/mqtt/mqtt_config.md)                                | Configuration map for [mqtt](/running-a-nats-service/configuration/mqtt). Allow clients to connect via mqtt protocol.                                                                                                            |       `mqtt {}` &nbsp; Not active by default.                                       |
| [`websocket`](/running-a-nats-service/configuration/websocket/websocket_conf.md)                   | Configuration map for [websocket](/running-a-nats-service/configuration/websocket).                                                                                                   |    `websocket {}` &nbsp; Not active by default.                                          |

### 集群

| Property                                                                        | Description                                                                        | Default |
| :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- | :------ |
| [`cluster`](/running-a-nats-service/configuration/clustering/cluster_config.md) | Configuration map for [cluster](/running-a-nats-service/configuration/clustering). Nats Servers can form a cluster for load balancing and redundancy. |       `cluster {}` &nbsp; Not active by default.           |

### 主题映射

请注意，每个账户都形成自己的主题命名空间。因此 `mappings` 部分可以出现在服务器级别（应用于默认账户）或账户级别。

```text
host: 0.0.0.0
port:4222

mappings: {
	foo: bar
}

accounts: {
    accountA: { 
	mappings: {
	    orders.acme.*: orders.$1
	}
        users: [
            {user: admin, password: admin},
            {user: user, password: user}
           ]
    },
}
```



| Property                                                                        | Description                                                                        | Default |
| :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- | :------ |
| [`mappings`](configuring_subject_mapping.md) | Configuration map for [mapping subject](configuring_subject_mapping.md). Allows for subjects aliasing and patterns based translation. Can be used to great effect in supercluster and leafnode configuration and when sourcing streams.  |       `mappings {}` &nbsp; (none set)            |

### 连接超时

| Property         | Description                                                                                                                                                                                                                                                                                                                | Default |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ |
| `ping_interval`  | Duration at which pings are sent to clients, leaf nodes and routes. In the presence of client traffic, such as messages or client side pings, the server will not send pings. Therefore it is recommended to keep this value bigger than what [clients use](../../using-nats/developing-with-nats/connecting/pingpong.md). | `"2m"`  |
| `ping_max`       | After how many unanswered pings the server will allow before closing the connection.                                                                                                                                                                                                                                       | `2`     |
| `write_deadline` | Maximum number of seconds the server will block when writing. Once this threshold is exceeded the connection will be closed. See [_slow consumer_](/using-nats/developing-with-nats/events/slow.md) on how to deal with this on the client.                                                                                | `"10s"` |

### 限制

| Property            | Description                                                                                                                                                                                                                                                                                                                                                                                                   | Default        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------- |
| `max_connections`   | Maximum number of active client connections.                                                                                                                                                                                                                                                                                                                                                                  | `64K`          |
| `max_control_line`  | Maximum length of a protocol line \(including combined length of subject and queue group\). Increasing this value may require [client changes](/using-nats/developing-with-nats/connecting/misc.md#set-the-maximum-control-line-size) to be used. Applies to all traffic.                                                                                                                                     | `4KB`          |
| `max_payload`       | Maximum number of bytes in a message payload. Reducing this size may force you to implement [chunking](/using-nats/developing-with-nats/connecting/misc.md#get-the-maximum-payload-size) in your clients. Applies to client and leafnode payloads. It is not recommended to use values over 8MB but `max_payload` can be set up to 64MB. The max payload must be equal to or smaller than the `max_pending` value. | `1MB`          |
| `max_pending`       | Maximum number of bytes buffered for a connection. Applies to client connections. Note that applications can also set 'PendingLimits' (number of messages and total size) for their subscriptions.                                                                                                                                                                                                             | `64MB`         |
| `max_subscriptions` | Maximum numbers of subscriptions per client and leafnode accounts connection.                                                                                                                                                                                                                                                                                                                                 | `0`, unlimited |

### JetStream 服务器设置

你可以通过在服务器的配置中简单地添加 `jetstream {}` 映射来启用 JetStream。
默认情况下，JetStream 子系统会将数据存储在 /tmp 目录中，但你可以通过 `store_dir` 指定要使用的目录，以及 JetStream 存储的限制（值为 0 表示无限制）。

通常 JetStream 将在集群模式下运行并复制数据，因此存储 JetStream 数据的最佳位置是本地快速 SSD。应特别避免将 NAS 或 NFS 存储用于 JetStream。

{% hint style="warning" %}
请注意，每个启用 JetStream 的服务器必须使用其自己独立的存储目录。JetStream 在集群节点之间复制数据（最多 5 个副本），通过这种方式实现冗余和可用性。

JetStream 不通过共享文件系统实现备用和容错。如果备用服务器与活动服务器共享存储目录，你必须确保任何时候只有一个处于活动状态。不会检测到访问冲突。我们不推荐这样的设置。
{% endhint %}


这是一个最小的示例文件，将在本地 "nats" 目录中存储数据，并设置一些限制。

`$ nats-server -c js.conf`

```text
jetstream {
  store_dir: nats

  # 1GB
  max_memory_store: 1073741824

  # 10GB
  max_file_store: 10737418240
}
```

**全局 JetStream 选项（服务器级别）**

| Property                  | Description                                                                                                                                                                               | Default                 | Version |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :------ |
| `enable`                     |  Enable/disable JetStream without removing this section.  | `true`  | 2.2.0  |
| `store_dir`               | Directory to use for JetStream storage.                                                                                                                                                   | `/tmp/nats/jetstream`   | 2.2.0   |
| `max_memory_store`        | Maximum size of the 'memory' storage                                                                                                                                                      | 75% of available memory | 2.2.0   |
| `domain`        | Isolates the JetStream cluster to the local cluster. Recommended use with leaf nodes.                                                                                                                                                      | (not set) | 2.2.3   |
| `max_file_store`          | Maximum size of the 'file' storage. For units use `m mb g gb t tb`                                                                                                                                                         |  `1TB`  | 2.2.0   |
| `cipher`                  | Set to enable storage-level [encryption at rest](/running-a-nats-service/nats_admin/jetstream_admin/encryption_at_rest.md). Choose either `chacha`/`chachapoly` or `aes`.                          | (not set)               | 2.3.0   |
| `key`                     | The encryption key to use when encryption is enabled. A key length of at least 32 bytes is recommended. Note, this key is HMAC-256 hashed on startup which reduces the byte length to 64. | (not set)               | 2.3.0   |
| `prev_encryption_key`                     |    The previous encryption key. Used when changing storage encryption keys. | (not set)   | 2.10.0   |
| `max_outstanding_catchup` | Max in-flight bytes for stream catch-up                                                                                                                                                   | 64MB                    | 2.9.0   |
| `max_buffered_msgs`                     |    Maximum number of messages JetStream will buffer in memory when falling behind with RAFT or I/O. Used to protect against OOM when there are write bursts to a queue. | 10.000  | 2.11.0   |
| `max_buffered_size`                     |    Maximum number of bytes JetStream will buffer in memory when falling behind with RAFT or I/O. Used to protect against OOM when there are write bursts to a queue. | 128MB  | 2.11.0   |
| `request_queue_limit`                     |    Limits the number of API commands JetStream will buffer in memory. When the limit is reached, clients will get error responses rather than a timeout. Lower the value if you want to detect clients flooding JetStream. | 10.000  | 2.11.0   |
| `sync_interval`           | Examples: `10s` `1m` `always`  -   Change the default fsync/sync interval for page cache in the filestore. By default JetStream relies on stream replication in the cluster to guarantee data is available after an OS crash. If you run JetStream without replication or with a replication of just 2 you may want to shorten the fsync/sync interval. - You can force an fsync after each messsage with `always`, this will slow down the throughput to a few hundred msg/s.                                                                                                           | 2m                      | 2.10.0  |
| `strict`                     |    Return errors for invalid JetStream API requests. Some older client APIs may not expect this. Set to `false` for maximum backward compatibility.  | `true`  | 2.11.0   |
| `unique_tag`                     |    JetStream peers will be placed in servers with tags unique relative to the `unique_tag`  prefix. E.g. nodes in a cluster (or supercluster) are tagged `az:1`,`az:1`,`az:2`,`az:2`,`az:3`,`az:3`,`az:3` . Setting `unique_tag=az` will result in a new replica 3 stream to be placed in all three availability zones.  | (not set))  | 2.8.0  |
| `tpm`                     |  Trusted Platform Module   [TPM base encryption](#jetstream-tpm-encryption) | `tpm {}` (not set)  | 2.11.0   |
| `limits`                     |   [JetStream server limits](#jetstream-server-limits) | `limits{}`  (not set) | 2.8.0   |

### JetStream 账户设置
JetStream 部分也可能出现在账户中。默认情况下 JetStream 是禁用的。最小配置将启用 JetStream。
```text
accounts {
  A {}
    jetstream {
    }
  } 

```

| Property                  | Description                                                                                                                                                                               | Default                 | Version |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :------ |
| `max_memory`                     |  Maximum memory for in-memory streams. Sum of all accounts must be smaller than the server limit.  | no limit or server limit  | 2.2.0  |
| `max_file`                     |  Maximum memory for disk streams. Sum of all accounts must be smaller than the server limit. | no limit or server limit | 2.2.0  |
| `max_streams`                     |  Maximum number of streams.  | no limit  | 2.2.0  |
| `max_consumers`                     |  Maximum number of consumers per stream(!).  | no limit  | 2.2.0  |
| `max_ack_pending`                     |   Max acks pending in explicit ack mode. Stream stops delivery when the limits have been reached. Can override the server limit. | no limit or server limit  | 2.8.0  |
| `max_bytes_required`                     |  When `true` all streams require a max_bytes limit set. | `false`  | 2.7.0  |
| `store_max_stream_bytes`                     | Maximum size limit to which a disk stream can be set. Usually combined with `max_bytes_required`  | no limit  | 2.8.0  |
| `memory_max_stream_bytes`                     |  Maximum size limit to which a memory stream can be set. Usually combined with `max_bytes_required`  | no limit  | 2.8.0  |
| `cluster_traffic`                     |  `system` or `owner` Configures the account in which stream replication and RAFT traffic is sent. By default (and in all versions prior to 2.11.0) all cluster traffic was handled in the system account. When set to `owner`, such RAFT and replication traffic will be in the account where the stream was created. | `system`  | 2.11.0  |

### JetStream TPM 加密
````
jetstream {
  store_dir: nats
  max_file_store: 10G
  tpm {
          keys_file: "keys"
          encryption_password: "pwd"
  }
}
````
| Property                  | Description                                                                                                                                                                               | Default                 | Version |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :------ |
| `keys_file`                     |  Specifies the file where encryption keys are stored. This option is required, otherwise TPM will not be active. If the file does NOT EXIST, a new key will be dynamically created and stored in the `pcr`  | required | 2.11.0  |
| `encryption_password`                     | Password used for decrypting data the keys file. OR, the password used to seal the dynamically created key in the TPM store. | required  | 2.11.0  |
| `srk_password`                     |  The Storage Root Key (SRK) password is used to access the TPM's storage root key. The srk password is optional in TPM 2.0. | not set  | 2.11.0  |
| `pcr`                     |  Platform Configuration Registers (PCRs). 0-16 are reserved. Pick a value from 17 to 23. |  22  | 2.11.0  | 
| `cipher`                     |   `chacha`/`chachapoly` or `aes`.                    | `chachapoly` | 2.11.0  |  

### JetStream 服务器限制
````
jetstream {
  store_dir: nats
  max_file_store: 10G
  limits {
      max_ack_pending: 10000
      duplicate_window: 600s
  }
}
````
| Property                  | Description                                                                                                                                                                               | Default                 | Version |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :------ |
| `max_ack_pending`                     |  Default max acks pending in explicit ack mode. Stream stops delivery when the limits have been reached.   | no limit | 2.8.0  |
| `max_ha_assets`                     |  Maximum number of RAFT assets (stream and consumers) which can be placed on this node. Will not affect stream/consumers with replicas=1  | no limit  | 2.8.0  |
| `max_request_batch`                     |  Maximum fetch size for pull consumers. Use with caution. May break existing clients violating this limit.| no limit  | 2.8.0  |
| `duplicate_window`                     |  Maximum(!) de-duplication window of streams. Stream creation will fail if the value specified is larger than this. | no limit (but default for new streams is 120s) | 2.8.0  |  

### 认证和授权

#### 集中式认证和授权

默认的 NATS 服务器没有启用认证或授权。这仅对开发和简单的嵌入式用例有用。默认账户是 `$G`。

一旦在授权或账户部分配置了至少一个用户，默认的 $G 账户和无认证用户将被禁用。你可以通过设置 `no_auth_user` 来恢复无认证访问。

| Property                                                                                       | Description                                                                                                                                                                                                                                                                                                                                                                                                     | Default                                                                                 |
| :--------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [`authorization`](/running-a-nats-service/configuration/securing_nats/auth_intro)              | Configuration map for client [authentication/authorization](securing_nats/auth_intro/README.md). List of user and their auth setting. This section is used when only the default account ($G) is active.                                                                                                                                                                                                        | `authorization {}` &nbsp;(not set)                                                      |
| [`accounts`](/running-a-nats-service/configuration/securing_nats/accounts.md)                  | Configuration map for multi tenancy via [accounts](securing_nats/accounts.md). A list of accounts each with its own users and their auth settings. Each account forms its own subject and stream namespace, with no data shared unless explicit `import` and `export` is configured.                                                                                                                            | `accounts {}` &nbsp;(not set)                                                           |
| [`no_auth_user`](/running-a-nats-service/configuration/securing_nats/accounts.md#no-auth-user) | [Username](/running-a-nats-service/configuration/securing_nats/auth_intro/username_password.md) present in the [authorization block](/running-a-nats-service/configuration/securing_nats/auth_intro) or an [`account`](/running-a-nats-service/configuration/securing_nats/accounts.md). A client connecting without any form of authentication will be associated with this user, its permissions and account. | (not set) - will deny unauthorized access by default if any other users are configured. |

#### 分布式认证和授权

这里的配置选项指的是基于 [JWT](/running-a-nats-service/configuration/securing_nats/jwt) 的认证和授权。

| Property                                                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`operator`](/running-a-nats-service/configuration/securing_nats/jwt/README.md)                    | The Json Web Token of the [auth operator.](securing_nats/README.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [`resolver`](/running-a-nats-service/configuration/securing_nats/jwt/README.md)                    | The built-in NATS [`resolver`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#nats-based-resolver), [`MEMORY`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#memory) for static or [`URL(<url>)`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#url-resolver) to use an external account server. \(When the operator JWT contains an account URL, it will be used as default. In this case `resolver` is only needed to overwrite the default.\) |
| [`resolver_tls`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#url-resolver) | [`tls` configuration map](/running-a-nats-service/configuration/securing_nats/tls.md) for tls connections to the resolver. \(This is for an outgoing connection and therefore does not use `timeout`, `verify` and `map_and_verify`\)                                                                                                                                                                                                                                                                             |
| [`resolver_preload`](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#memory)   | [Map](/running-a-nats-service/configuration/securing_nats/jwt/resolver.md#memory) to preload account public keys and their corresponding JWT. Keys consist of `<account public nkey>`, value is the `<corresponding jwt>`.                                                                                                                                                                                                                                                                                        |

### 运行时配置

| Property                 | Description                                                                                                                                                                                                                                                                      | Default                |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| `disable_sublist_cache`  | If `true` disable subscription caches for all accounts. This saves resources in situations where different subjects are used all the time.                                                                                                                                    | `false`, cache enabled |
| `lame_duck_duration`     | In lame duck mode the server rejects new clients and **slowly** closes client connections. After this duration is over, the server shuts down. This value cannot be set lower than 30 seconds. Start lame duck mode with: [`nats-server --signal ldm`](../nats_admin/signals.md). | `"2m"`                 |
| `lame_duck_grace_period` | This is the duration the server waits, after entering lame duck mode, before starting to close client connections                                                                                                                                                                | `"10s"`                |
| `no_fast_producer_stall` | if `true`, the server will no longer stall the producer when attempting to deliver a message to a slow consumer but instead skip this consumer(by dropping the message for this consumer) and move to the next. | `false` the server will stall the fast producer |

### 集群配置、监控和追踪

| Property                                                                                           | Description                                                                                                                                                                                                              | Default                   | Version |
|:---------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------|:--------|
| `server_name`                                                                                      | The server's name, shows up in logging. Defaults to the server's id. When JetStream is used, within a domain, all server names need to be unique.                                                                        | Generated Server ID       |         |
| `server_tags`                                                                                      | A set of tags describing properties of the server. This will be exposed through `/varz` and can be used for system resource requests, such as placement of streams. It is recommended to use `key:value` style notation. | `[]`                      |         |
| `server_metadata`                                                                                  | A map containing string keys and values describing metadata of the server. This will be exposed through `/varz` and can be used for system resource requests.                                                            | `{}`                      | 2.12.0  |
| `trace`                                                                                            | If `true` enable protocol trace log messages. Excludes the system account.                                                                                                                                               | `false`, disabled         |         |
| `trace_verbose`                                                                                    | If `true` enable protocol trace log messages. Includes the system account.                                                                                                                                               | `false`, disabled         |         |
| `debug`                                                                                            | If `true` enable debug log messages                                                                                                                                                                                      | `false`, disabled         |         |
| `logtime`                                                                                          | If set to `false`, log without timestamps                                                                                                                                                                                | `true`, include timestamp |         |
| `log_file`                                                                                         | Log file name, relative to...                                                                                                                                                                                            | No log file               |         |
| [`log_size_limit`](/running-a-nats-service/configuration/logging.md#using-the-configuration-file)  | Size in bytes after the log file rolls over to a new one                                                                                                                                                                 | `0`, unlimited            |         |
| [`logfile_max_num`](/running-a-nats-service/configuration/logging.md#using-the-configuration-file) | Set the number of rotated logs to retain.                                                                                                                                                                                | `0`, unlimited            |         |
| `max_traced_msg_len`                                                                               | Set a limit to the trace of the payload of a message.                                                                                                                                                                    | `0`, unlimited            |         |
| `syslog`                                                                                           | Log to syslog.                                                                                                                                                                                                           | `false`, disabled         |         |
| `remote_syslog`                                                                                    | [Syslog server](/running-a-nats-service/configuration/logging.md#syslog) address.                                                                                                                                        | (not set)                 |         |
| [`http_port`](/running-a-nats-service/configuration/monitoring.md)                                 | http port for server monitoring.                                                                                                                                                                                         | (inactive)                |         |  
| [`http`](/running-a-nats-service/configuration/monitoring.md)                                      | Listen specification `<host>:<port>`for server monitoring.                                                                                                                                                               | (inactive)                |         |
| [`https_port`](/running-a-nats-service/configuration/monitoring.md)                                | https port for server monitoring. This is influenced by the tls property.                                                                                                                                                | (inactive)                |         |
| [`http_base_path`](/running-a-nats-service/configuration/monitoring.md)                            | base path for monitoring endpoints.                                                                                                                                                                                      | `/`                       |         |
| [`https`](/running-a-nats-service/configuration/monitoring.md)                                     | Listen specification `<host>:<port>`for TLS server monitoring.  Requires the `tls` section to be present.                                                                                                                | (inactive)                |         |
| `system_account`                                                                                   | Name of the system account. Users of this account can subscribe to system events. See [System Accounts](/running-a-nats-service/configuration/sys_accounts/README.md#system-account) for more details.                   | `$SYS`                    |         |
| `pid_file`                                                                                         | File containing PID, relative to ... This can serve as input to [nats-server --signal](/running-a-nats-service/nats_admin/signals.md)                                                                                    | (non set)                 |         |
| `port_file_dir`                                                                                    | Directory to write a file containing the servers' open ports to, relative to ...                                                                                                                                         | (not set)                 |         |
| `connect_error_reports`                                                                            | Number of attempts at which a repeated failed route, gateway or leaf node connection is reported. Connect attempts are made once every second.                                                                           | `3600`, approx every hour |         |
| `reconnect_error_reports`                                                                          | Number of failed attempts to reconnect a route, gateway or leaf node connection. Default is to report every attempt.                                                                                                     | `1`, every failed attempt |         |
