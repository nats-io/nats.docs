## NATS 功能对比
本文对比了当今几种主流消息技术中的部分关键组成与能力。该对比可能不全；在选型时，仍建议针对每项技术做更深入的调研，以确定哪一种最适合你的具体实现。

本对比涵盖 NATS、Apache Kafka、RabbitMQ、Apache Pulsar 与 gRPC。

<html>
<body>
<table>
    <tr>
        <td rowspan="5" valign="top"><b>
            语言与平台覆盖
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Core NATS：已知 48 种客户端类型，其中 11 种由维护者支持、18 种由社区贡献。NATS Streaming：有 7 种客户端类型由维护者支持、4 种由社区贡献。NATS 服务器可在 Golang 支持的架构上编译，且 NATS 提供二进制发行包。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            社区与 Confluent 共同支持 18 种客户端类型。Kafka 服务器可运行于支持 Java 的平台上，覆盖范围非常广。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            至少 10 个由维护者支持的客户端平台，且有超过 50 种由社区支持的客户端类型。服务器支持的平台包括：Linux、Windows、NT。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            7 种客户端语言，另有 5 个第三方客户端——已在 macOS 与 Linux 上测试。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            13 种客户端语言。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            内置模式
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            通过内置的发布/订阅、请求-响应，以及负载均衡的队列订阅者模式，实现流与服务。支持动态请求授权与请求主题（subject）混淆。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            通过发布/订阅实现流。可通过消费者组实现负载均衡。若要实现服务（请求-响应）模式，应用代码需要在多个 topic 上对请求与响应进行关联。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            通过发布/订阅实现流，并通过 direct reply-to 特性实现服务。可通过 Work Queue 实现负载均衡。若要实现服务（请求-响应）模式，应用需要在多个 topic 上对请求与响应进行关联。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            通过发布/订阅实现流。多种竞争消费者（competing consumer）模式可支持负载均衡。若要实现服务（请求-响应）模式，应用代码需要在多个 topic 上对请求与响应进行关联。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            每个 channel 对应一个服务（该服务可能具有流式语义）。服务的负载均衡可在客户端侧完成，也可以通过代理实现。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            交付保障
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            JetStream 支持“至多一次”“至少一次”“恰好一次”。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            “至少一次”“恰好一次”。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            “至多一次”“至少一次”。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            “至多一次”“至少一次”“恰好一次”。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            “至多一次”。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            多租户与共享
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS 通过 Account，以及定义可共享的流与服务，实现真正的多租户能力与去中心化安全。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            不支持多租户。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            通过 vhost 支持多租户；但不支持数据共享。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            通过 tenant 实现多租户；但不支持跨 tenant 的内置数据共享。每个 tenant 都可以有自己的认证与授权方案。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            不适用
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            认证（AuthN）
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS 支持 TLS、NATS 凭据（credentials）、NKEYS（NATS ED25519 密钥）、用户名密码或简单 token。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            支持 Kerberos 与 TLS。支持 JAAS，并提供开箱即用的授权器实现，使用 ZooKeeper 存储连接与 subject。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            TLS、SASL、用户名密码，以及可插拔的授权机制。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            TLS 认证、Athenz、Kerberos、JWT（JSON Web Token）认证。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            TLS、ALT、Token、channel 与 call 级别凭据，以及插件机制。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            授权（AuthZ）
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Account 级限制包括：连接数、消息大小、import/export 数量。也支持用户级发布与订阅权限、连接限制、CIDR 地址限制以及按时间段限制。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            支持 JAAS，并通过 ACL 对丰富的 Kafka 资源进行控制，包括 topic、cluster、group 等。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            通过 ACL 决定对 exchange、queue、transaction 等资源的配置、写入与读取权限。认证机制可插拔。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            可向特定角色授予一组操作权限，例如 produce 与 consume。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            用户可配置 call credentials，对服务中的单次调用进行细粒度授权。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            消息保留与持久化
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            支持内存、文件与数据库持久化。消息可按时间、数量或序列号回放，并支持持久订阅。使用 NATS Streaming 时，脚本可将旧日志片段归档到冷存储。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            支持基于文件的持久化。可通过指定 offset 回放消息，并支持持久订阅。也支持日志压缩（log compaction）与 KSQL。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            支持基于文件的持久化。Rabbit 采用队列语义（而非日志语义），因此不提供消息回放能力。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            支持分层存储，包括文件、Amazon S3 或 Google Cloud Storage（GCS）。Pulsar 可从指定位置回放消息，并支持持久订阅。也支持 Pulsar SQL、topic compaction 与 Pulsar functions。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            不适用
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            高可用/容错
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Core NATS 支持全互联（full-mesh）集群，并具备自愈特性，为客户端提供高可用。NATS Streaming 提供暖备故障切换的备份服务器，包含两种模式（FT 与完整集群）。JetStream 将通过内置镜像支持水平扩展。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            完全复制的集群成员通过 ZooKeeper 协同。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            通过 federation 插件支持集群与全量数据复制。集群需要低延迟网络，并且网络分区应尽量少见。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Pulsar 支持 broker 集群与地理复制（geo-replication）。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            不适用。gRPC 的高可用/容错依赖外部组件。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            部署
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS 的网络元素（server）是一个体积小的静态二进制，可部署在各种环境：从云上的大型实例到资源受限的设备（如 Raspberry Pi）。
NATS 支持 Adaptive Edge 架构，便于进行大规模且灵活的部署。单机、leaf node、集群以及 supercluster（集群的集群）可以按任意方式组合，适配云端、本地机房、边缘与 IoT 等场景。客户端无需感知拓扑，可连接到部署中的任意 NATS 服务器。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka 支持集群，并可通过镜像与松耦合的远端集群协作。客户端与集群内定义的 partition 绑定。Kafka 服务器需要 JVM、8 核 CPU、64GB–128GB 内存、两块或以上 8TB SAS/SSD 磁盘，以及 10Gb 网卡。<sup>1</sup>
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            Rabbit 支持集群，并可通过 federation 插件进行跨集群消息传播。客户端无需感知拓扑，可连接到任意集群。服务器需要 Erlang VM 及相关依赖。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Pulsar 支持集群，并内置跨集群的地理复制（geo-replication）。客户端在正确配置 tenant 与 namespace 后，可连接到任意集群。Pulsar 需要 JVM，并至少需要 6 台 Linux 机器或虚拟机：其中 3 台运行 ZooKeeper，另 3 台运行 Pulsar broker 与 BookKeeper bookie。<sup>2</sup>
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            gRPC 是点对点通信，没有需要部署或管理的 server/broker，但在生产部署中通常仍需要额外组件配合。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            监控
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS 支持将监控数据导出到 Prometheus，并提供 Grafana 仪表盘用于监控与告警配置。也有用于开发的监控工具，如 nats-top。支持稳健的 sidecar 部署模式，也支持使用 NATS surveyor 的“连接即查看”模式。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka 有多种管理工具与控制台，包括 Confluent Control Center、Kafka、Kafka Web Console、Kafka Offset Monitor。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            CLI 工具、基于插件的管理系统（含仪表盘）以及第三方工具。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            CLI 工具、按 topic 维度的仪表盘，以及第三方工具。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            需要借助服务网格等外部组件来监控 gRPC。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            运维管理
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS 将运维与安全相分离。部署中的用户与 Account 管理可以去中心化，并通过 CLI 进行管理。服务器（网络元素）配置与安全相互独立，可通过命令行与配置文件进行配置，并支持运行时重载变更。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka 有多种管理工具与控制台，包括 Confluent Control Center、Kafka、Kafka Web Console、Kafka Offset Monitor。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            CLI 工具、基于插件的管理系统（含仪表盘）以及第三方工具。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            CLI 工具、按 topic 维度的仪表盘，以及第三方工具。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            需要借助服务网格等外部组件来管理 gRPC。
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            集成
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS 支持 WebSockets、Kafka bridge、IBM MQ Bridge、Redis Connector、Apache Spark、Apache Flink、CoreOS、Elastic、Elasticsearch、Prometheus、Telegraf、Logrus、Fluent Bit、Fluentd、OpenFAAS、HTTP，以及 MQTT（即将推出）。
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka 生态中有大量集成，包括流处理（Storm、Samza、Flink）、Hadoop、数据库（JDBC、Oracle Golden Gate）、搜索与查询（ElasticSearch、Hive），以及多种日志与其他集成。
        </td>
    </tr>
    <tr>
        <td><b>
            RabbitMQ
            </b>
        </td>
        <td>
            RabbitMQ 有许多插件，包括协议插件（MQTT、STOMP）、WebSockets，以及各种认证与授权插件。
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Pulsar 也有许多集成，包括 ActiveMQ、Cassandra、Debezium、Flume、Elasticsearch、Kafka、Redis 等。
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            有多种第三方集成，包括 HTTP、JSON、Prometheus、Grift 等。<sup>3</sup>
        </td>
    </tr>
    
</table>
<h3>参考资料</h3>
<p><sup>1</sup> https://docs.cloudera.com/HDPDocuments/HDF3/HDF-3.1.0/bk_planning-your-deployment/content/ch_hardware-sizing.html#:~:text=Kafka%20Broker%20Node%3A%20eight%20cores,and%20a%2010%2D%20Gige%20Nic%20.&text=75%20MB%2Fsec%20per%20node,therefore%2010GB%20Nic%20is%20required%20</p>
<p><sup>2</sup> https://pulsar.apache.org/docs/v1.21.0-incubating/deployment/cluster/ </p>
<p><sup>3</sup> https://github.com/grpc-ecosystem</p>
</body>
</html>
