The NATS Server is highly optimized and its binary is very compact (less than 20 MB), it can run on any machine from a lowly Raspberry Pi to the largest of servers, in the cloud, on premise or at the edge, on bare metal on VMs or in containers.

NATS Servers can cluster together to provide fault-tolerance and scalability. NATS servers can run as Leaf Nodes connecting to a cluster transparently proxying and expanding NATS and JetStream service to any location, be it a VPC, a VLAN, a remote office, a single machine at home or even an edge location with partial connectivity.

NATS clusters in different regions or cloud providers can be connected together by gateways that filter unneeded traffic and allow for disaster recovery and queued distributed processing with geo-location affinity.

Even better, if you have build your application with NATS you don't need to run your own server, cluster, or super-cluster and can simply leverage Synadia's [NGS](https://synadia.com/ngs/how-it-works), the global NATS super-cluster service provided by [Synadia](https://synadia.com).

This section of the documentation explains how to install, deploy, run, configure, orchestrate, test and manage NATS servers.
