# NATS 对比

本功能对比是对当今几种流行消息技术中一些主要组件的总结。这绝不是一个详尽的列表，每种技术都应经过深入调查，以确定哪种技术最适合您的实施。

在本次对比中，我们将介绍NATS、Apache Kafka、RabbitMQ、Apache Pulsar和gRPC。

## 语言与平台覆盖范围

| 项目 | 客户端语言与平台 |
| :--- | :--- |
| **NATS** | Core NATS：已知48种客户端类型，其中11种由维护者支持，18种由社区贡献。NATS Streaming：7种客户端类型由维护者支持，4种由社区贡献。NATS服务器可在Golang支持的架构上编译，提供二进制分发版本。 |
| **gRPC** | 13种客户端语言。 |
| **Kafka** | 社区和Confluent支持18种客户端类型。Kafka服务器可在支持Java的平台上运行，支持范围非常广泛。 |
| **Pulsar** | 7种客户端语言，5种第三方客户端——在macOS和Linux上测试通过。 |
| **RabbitMQ** | 至少10种维护者支持的客户端平台，超过50种社区支持的客户端类型。服务器支持以下平台：Linux、Windows NT。 |

## 内置模式

| 项目 | 支持的模式 |
| :--- |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **NATS** | 通过内置的发布/订阅、请求-回复和负载均衡队列订阅者模式实现流和服务。支持动态请求权限设置和请求主题混淆。 |
| **gRPC** | 每个通道可支持一个服务，该服务可能具有流语义。服务的负载均衡可以通过客户端或代理实现。 |
| **Kafka** | 通过发布/订阅实现流。负载均衡可通过消费者组实现。应用程序代码必须通过多个主题将请求与回复相关联，以实现服务（请求-回复）模式。 |
| **Pulsar** | 通过发布/订阅实现流。多种竞争消费者模式支持负载均衡。应用程序代码必须通过多个主题将请求与回复相关联，以实现服务（请求-回复）模式。 |
| **RabbitMQ** | 通过发布/订阅实现流，以及通过 直接回复到... 功能实现服务。负载均衡可通过工作队列实现。应用程序必须通过多个主题将请求与回复相关联，以实现服务（请求-回复）模式。 |

## 交付保障

| 项目 | 服务质量/保障 |
| :--- | :--- |
| **NATS** | JetStream支持最多一次、至少一次和恰好一次三种保障级别。 |
| **gRPC** | 最多一次。 |
| **Kafka** | 至少一次、恰好一次。 |
| **Pulsar** | 最多一次、至少一次和恰好一次。 |
| **RabbitMQ** | 最多一次、至少一次。 |

## 多租户与共享

| 项目 | 多租户支持 |
| :--- | :--- |
| **NATS** | NATS通过账户和支持共享流和服务，真正实现了多租户和去中心化安全。 |
| **gRPC** | N/A |
| **Kafka** | 不支持多租户。 |
| **Pulsar** | 通过租户实现多租户；不支持跨租户的内置数据共享。每个租户可以拥有自己的身份验证和授权方案。 |
| **RabbitMQ** | 通过虚拟主机（vhosts）支持多租户；不支持数据共享。 |

## 身份认证

| 项目 | 身份认证 |
| :--- | :--- |
| **NATS** | NATS支持TLS、NATS凭据、NKEYS（NATS ED25519密钥）、用户名和密码，或简单令牌。 |
| **gRPC** | TLS、ALT、令牌、通道和调用凭据，以及插件机制。 |
| **Kafka** | 支持Kerberos和TLS。支持JAAS和一个开箱即用的授权器实现，该实现使用ZooKeeper存储连接和主题信息。 |
| **Pulsar** | TLS身份验证、Athenz、Kerberos、JSON Web Token身份验证。 |
| **RabbitMQ** | TLS、SASL、用户名和密码，以及可插拔授权。 |

## 授权

| 项目 | 授权 |
| :--- | :--- |
| **NATS** | 账户限制包括连接数、消息大小、导入和导出数量。用户级别的发布和订阅权限、连接限制、CIDR地址限制和一天中的时间限制。 |
| **gRPC** | 用户可以配置调用凭据，以对服务上的单个调用进行精细粒度的授权。 |
| **Kafka** | 支持JAAS、ACLs，用于丰富的Kafka资源，包括主题、集群、组等。 |
| **Pulsar** | 可以为特定角色授予生产与消费等操作的列表权限。 |
| **RabbitMQ** | ACL规定了对交换、队列、事务等资源的配置、写入和读取操作的权限。身份验证是可插拔的。 |

## 消息保留与持久化

| 项目 | 消息保留与持久化支持 |
| :--- | :--- |
| **NATS** | 支持基于内存和文件的持久化。消息可以通过时间、计数或序列号回放，支持持久订阅。在NATS Streaming中，脚本可以将旧的日志段归档到冷存储。 |
| **gRPC** | 不适用 |
| **Kafka** | 支持基于文件的持久化。消息可以通过指定偏移量回放，支持持久订阅。日志压缩和KSQL也受支持。 |
| **Pulsar** | 支持分层存储，包括文件、Amazon S3或Google Cloud Storage（GCS）。Pulsar可以按特定位置回放消息，支持持久订阅。Pulsar SQL和主题压缩也受支持，以及Pulsar函数。 |
| **RabbitMQ** | 支持基于文件的持久化。Rabbit支持基于队列的语义（而非日志），因此无法进行消息回放。 |

## 高可用性与容错

| 项目 | 高可用性 (HA) 和容错 (FT) 支持 |
| :--- | :--- |
| **NATS** | Core NATS支持具备自愈功能的全网状集群，为客户端提供高可用性。NATS Streaming具有热备故障转移备份服务器，有两种模式（FT和完全集群）。JetStream支持水平扩展，内置镜像复制。 |
| **gRPC** | 不适用。gRPC依赖于外部资源来实现HA/FT。 |
| **Kafka** | 通过Zookeeper协调完全复制的集群成员。 |
| **Pulsar** | Pulsar支持集群代理，具备地理复制。 |
| **RabbitMQ** | 通过联邦插件提供完整的数据复制集群支持。集群要求低延迟网络，且网络分区很少发生。 |

## 部署

| 项目 | 支持的部署模型 |
| :--- | :--- |
| **NATS** | NATS 网络元件（服务器）是一个小巧的静态二进制文件，可部署于任何环境，从云端的大型实例到资源受限的设备（如树莓派）。NATS 支持自适应边缘架构，允许进行大规模、灵活的部署。单服务器、叶节点、集群和超级集群（集群的集群）可以任意组合，形成极其灵活的部署方式，适用于云、本地、边缘和 IoT 场景。客户端无需感知拓扑结构，可以连接到部署中的任意 NATS 服务器。 |
| **gRPC** | gRPC 是点对点的，没有需要部署或管理的服务器或代理，但在生产部署中总是需要额外的组件。 |
| **Kafka** | Kafka 支持集群化，并支持镜像到松散耦合的远程集群。客户端与集群内定义的分区绑定。Kafka 服务器需要 JVM、8 核 CPU、64 GB 至 128 GB 内存、两个或多个 8-TB SAS/SSD 磁盘以及一个 10-Gig 网卡。[_（1）_](compare-nats.md#参考资料) |
| **Pulsar** | Pulsar 支持集群化和集群间内置的地理复制。客户端可以连接到任何配置了适当租户和命名空间的集群。Pulsar 需要 JVM，并且至少需要 6 台 Linux 机器或虚拟机：3 台运行 ZooKeeper，3 台运行 Pulsar broker 和 BookKeeper bookie。[_（2）_](compare-nats.md#参考资料) |
| **RabbitMQ** | RabbitMQ 支持集群，并通过联邦插件支持跨集群消息传播。客户端无需感知拓扑结构，可以连接到任何集群。服务器需要 Erlang VM 及相关依赖。 |

## 监控

| 项目 | 监控工具 |
| :--- | :--- |
| **NATS** | NATS 支持将监控数据导出到 Prometheus，并提供 Grafana 仪表板来监控和配置警报。此外还有如 nats-top 等开发监控工具。支持强大的边车（side car）部署模式，或通过 NATS surveyor 实现简单的连接查看模式。 |
| **gRPC** | 监控 gRPC 需要外部组件，例如服务网格（service mesh）。 |
| **Kafka** | Kafka 拥有许多管理工具和控制台，包括 Confluent Control Center、Kafka、Kafka Web Console、Kafka Offset Monitor。 |
| **Pulsar** | 命令行工具（CLI）、按主题的仪表板以及第三方工具。 |
| **RabbitMQ** | 命令行工具（CLI）、一个基于插件的管理系统（包含仪表板）以及第三方工具。 |

## 管理

| 项目 | 管理工具 |
| :--- | :--- |
| **NATS** | NATS 将运维与安全分离。部署中的用户和账户管理可以是去中心化的，并通过 CLI 进行管理。服务器（网络元件）的配置与安全分离，使用命令行和配置文件，并可在运行时重新加载更改。 |
| **gRPC** | 管理 gRPC 需要外部组件，例如服务网格（service mesh）。 |
| **Kafka** | Kafka 拥有许多管理工具和控制台，包括 Confluent Control Center、Kafka、Kafka Web Console、Kafka Offset Monitor。 |
| **Pulsar** | 命令行工具（CLI）、按主题的仪表板以及第三方工具。 |
| **RabbitMQ** | 命令行工具（CLI）、一个基于插件的管理系统（包含仪表板）以及第三方工具。 |

## 集成

| 项目 | 内置及第三方集成 |
| :--- | :--- |
| **NATS** | NATS 支持 WebSockets、Kafka 网桥、IBM MQ 网桥、Redis 连接器、Apache Spark、Apache Flink、CoreOS、Elastic、Elasticsearch、Prometheus、Telegraf、Logrus、Fluent Bit、Fluentd、OpenFAAS、HTTP、MQTT 以及[更多](https://nats.io/download/#connectors-and-utilities)。 |
| **gRPC** | 有许多第三方集成，包括 HTTP、JSON、Prometheus、Grift 等。[_（3）_](compare-nats.md#参考资料) |
| **Kafka** | Kafka 生态系统中有大量集成，包括流处理（Storm, Samza, Flink）、Hadoop、数据库（JDBC, Oracle Golden Gate）、搜索和查询（ElasticSearch, Hive）以及各种日志和其他集成。 |
| **Pulsar** | Pulsar 拥有许多集成，包括 ActiveMQ、Cassandra、Debezium、Flume、Elasticsearch、Kafka、Redis 等。 |
| **RabbitMQ** | RabbitMQ 拥有许多插件，包括协议（MQTT, STOMP）、WebSockets 以及各种授权和认证插件。 |

## 参考资料

1.  [https://docs.cloudera.com/HDPDocuments/HDF3/HDF-3.1.0/bk_planning-your-deployment/content/ch_hardware-sizing.html](https://docs.cloudera.com/HDPDocuments/HDF3/HDF-3.1.0/bk_planning-your-deployment/content/ch_hardware-sizing.html)
2.  [https://pulsar.apache.org/docs/4.0.x/deploy-bare-metal/](https://pulsar.apache.org/docs/4.0.x/deploy-bare-metal/)
3.  [https://github.com/grpc-ecosystem](https://github.com/grpc-ecosystem)