## NATS Feature Comparison
This feature comparison is a summary of a few of the major components in several of the popular messaging technologies of today. This is by no means an exhaustive list and each technology should be investigated thoroughly to decide which will work best for your implementation.

This comparison features NATS, Apache Kafka, RabbitMQ, Apache Pulsar, and gRPC.

<html>
<body>
<table>
    <tr>
        <td rowspan="5" valign="top"><b>
            Language and Platform Coverage
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Core NATS: 48 known client types, 11 supported by maintainers, 18 contributed by the community. NATS Streaming: 7 client types supported by maintainers, 4 contributed by the community. NATS servers can be compiled on architectures supported by Golang. NATS provides binary distributions.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            18 client types supported across the community and by Confluent. Kafka servers can run on platforms supporting java; very wide support.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            At least 10 client platforms that are maintainer-supported with over 50 community supported client types. Servers are supported on the following platforms: Linux Windows, NT.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            7 client languages, 5 third-party clients - tested on macOS and Linux.
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            13 client languages.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Built-in Patterns
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Streams and Services through built in publish/subscribe, request/reply, and load balanced queue subscriber patterns. Dynamic request permissioning and request subject obfuscation is supported.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Streams through publish/subscribe.  Load balancing can be achieved with consumer groups.  Application code must correlate requests with replies over multiple topics for a service (request/reply) pattern.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            Streams through publish/subscribe, and services with a direct reply-to feature.  Load balancing can be achieved with a Work Queue.  Applications must correlate requests with replies over multiple topics for a  service (request/reply) pattern.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Streams through publish/subscribe.  Multiple competing consumer patterns support load balancing.  Application code must correlate requests with replies over multiple topics for a  service (request/reply) pattern.  
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            One service, which may have streaming semantics, per channel. Load Balancing for a service can be done either client-side or by using a proxy.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Delivery Guarantees
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            At most once, at least once, and exactly once is available in Jetstream.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            At least once, exactly once.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            At most once, at least once.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            At most once, at least once, and exactly once.  
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            At most once.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Multi-tenancy and Sharing
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS supports true multi-tenancy and decentralized security through accounts and defining shared streams and services.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Multi-tenancy is not supported.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            Multi-tenancy is supported with vhosts; data sharing is not supported.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Multi-tenancy is implemented through tenants; built-in data sharing across tenants is not supported.  Each tenant can have it’s own authentication and authorization scheme.  
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            N/A
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            AuthN
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS supports TLS, NATS credentials, NKEYS (NATS ED25519 keys), username and password, or simple token.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Supports Kerberos and TLS. Supports JAAS and an out-of-box authorizer implementation that uses ZooKeeper to store connection and subject.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            TLS, SASL, username and password, and pluggable authorization.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            TLS Authentication, Athenz, Kerberos, JSON Web Token Authentication.  
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            TLS, ALT, Token, channel and call credentials, and a plug-in mechanism.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            AuthZ
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Account limits including # of connections, message size, # of imports and exports.  User level publish and subscribe permissions, connection restrictions, CIDR address restrictions, and time of day restrictions.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Supports JAAS, ACLs for a rich set of Kafka resources including topics, clusters, groups and others.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            ACLs dictate permissions for configure, write and read operations on resources like exchanges, queues, transactions, and others.  Authentication is pluggable.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Permissions may be granted to specific roles for lists of operations such as produce and consume.  
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            Users can configure call credentials to authorize fine grained individual calls on a service.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Message Retention and Persistence
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Supports memory, file, and database persistence.  Messages can be replayed by time, count, or sequence number, and durable subscriptions are supported.  With NATS streaming, scripts can archive old log segments to cold storage.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Supports file based persistence.  Messages can be replayed by specifying an offset, and durable subscriptions are supported.  Log compaction is supported as well as KSQL.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            Supports file based persistence.  Rabbit supported queue based semantics (vs log), so no message replay is available.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Supports tiered storage including file, Amazon S3 or Google Cloud Storage (GCS).  Pulsar can replay messages from a specific position and supports durable subscriptions.  Pulsar SQL and topic compaction is supported, as well as Pulsar functions. 
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            N/A
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            High Availability/Fault Tolerance
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            Core NATS supports full mesh clustering with self-healing features to provide high availability to clients. NATS streaming has warm failover backup servers with two modes (FT and full clustering). Jetstream will support horizontal scalability with built-in mirroring.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Fully replicated cluster members are coordinated via Zookeeper.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            Clustering Support with full data replication via federation plugins.  Clusters require low-latency networks where network partitions are rare.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Pulsar supports clustered brokers with geo-replication.
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            N/A.  gRPC relies on external resources for HA/FT.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Deployment
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            The NATS network element (server) is a small static binary that can be deployed anywhere from large instances in the cloud to resource constrained devices like a Raspberry PI.
NATS supports the Adaptive Edge architecture which allows for large, flexible deployments.  Single servers, leaf nodes, clusters, and superclusters (cluster of clusters) can be combined in any fashion for an extremely flexible deployment amenable to cloud, on-premise, edge and IoT.  Clients are unaware of topology and can connect to any NATS server in a deployment.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka supports clustering with mirroring to loosely coupled remote clusters.  Clients are tied to partitions defined within clusters.  Kafka servers require a JVM, eight cores, 64 GB to128 GB of RAM, two or more 8-TB SAS/SSD disks, and a 10-Gig NIC.<sup>1</sup>
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            Rabbit supports clusters and cross cluster message propagation through a federation plugin. Clients are unaware of topology and may connect to any cluster.  The server requires the Erlang VM and dependencies.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Pulsar supports clustering and built-in geo-replication between clusters.  Clients may connect to any cluster with an appropriately configured tenant and namespace.  Pulsar requires a JVM and requires at least 6 Linux machines or VMs. 3 running ZooKeeper. 3 running a Pulsar broker and a BookKeeper bookie.<sup>2</sup>
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            gRPC is point to point and does not have a server or broker to deploy or manage, but always requires additional pieces for production deployments.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Monitoring
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS supports exporting monitoring data to Prometheus and has Grafana dashboards to monitor and configure alerts.  There are also development monitoring tools such as nats-top.  Robust side car deployment or a simple connect-and-view model with NATS surveyor is supported.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka has a number of management tools and consoles including Confluent Control Center, Kafka, Kafka Web Console, Kafka Offset Monitor.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            CLI tools, a plugin-based management system with dashboards and third-party tools.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            CLI tools, per-topic dashboards, and third-party tools.
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            External components such as a service mesh are required to monitor gRPC.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Management
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS separates operations from security.  User and Account management in a deployment may be decentralized and managed through a CLI.  Server (network element) configuration is separated from security with a command line and configuration file which can be reloaded with changes at runtime.
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka has a number of management tools and consoles including Confluent Control Center, Kafka, Kafka Web Console, Kafka Offset Monitor.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            CLI tools, a plugin-based management system with dashboards and third-party tools.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            CLI tools, per-topic dashboards, and third-party tools.
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            External components such as a service mesh are required to manage gRPC.
        </td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><b>
            Integrations
            </b>
        </td>
        <td><b>
            NATS
            </b>
        </td>
        <td>
            NATS supports WebSockets, a Kafka bridge, an IBM MQ Bridge, a Redis Connector, Apache Spark, Apache Flink, CoreOS, Elastic, Elasticsearch, Prometheus, Telegraf, Logrus, Fluent Bit, Fluentd, OpenFAAS, HTTP, and MQTT (coming soon).
        </td>
    </tr>
    <tr>
        <td><b>
            Kafka
            </b>
        </td>
        <td>
            Kafka has a large number of integrations in its ecosystem, including stream processing (Storm, Samza, Flink), Hadoop, database (JDBC, Oracle Golden Gate), Search and Query (ElasticSearch, Hive), and a variety of logging and other integrations.
        </td>
    </tr>
    <tr>
        <td><b>
            Rabbit
            </b>
        </td>
        <td>
            RabbitMQ has many plugins, including protocols (MQTT, STOMP), WebSockets, and various authorization and authentication plugins.
        </td>
    </tr>
    <tr>
        <td><b>
            Pulsar
            </b>
        </td>
        <td>
            Pulsar has many integrations, including ActiveMQ, Cassandra, Debezium, Flume, Elasticsearch, Kafka, Redis, and others.
        </td>
    </tr>
    <tr>
        <td><b>
            gRPC
            </b>
        </td>
        <td>
            There are a number of third party integrations including HTTP, JSON, Prometheus, Grift and others.<sup>3</sup>
        </td>
    </tr>
    
</table>
<h3>References</h3>
<p><sup>1</sup> https://docs.cloudera.com/HDPDocuments/HDF3/HDF-3.1.0/bk_planning-your-deployment/content/ch_hardware-sizing.html#:~:text=Kafka%20Broker%20Node%3A%20eight%20cores,and%20a%2010%2D%20Gige%20Nic%20.&text=75%20MB%2Fsec%20per%20node,therefore%2010GB%20Nic%20is%20required%20</p>
<p><sup>2</sup> https://pulsar.apache.org/docs/v1.21.0-incubating/deployment/cluster/ </p>
<p><sup>3</sup> https://github.com/grpc-ecosystem</p>
</body>
</html>
