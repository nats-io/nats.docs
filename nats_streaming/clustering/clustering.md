# Clustering

NATS Streaming Server supports clustering and data replication, implemented with the [Raft consensus algorithm](https://raft.github.io/), for the purposes of high availability.

There are two ways to bootstrap a cluster: with an explicit cluster configuration or with "auto" configuration using a seed node. With the first, we provide the IDs of the nodes participating in the cluster. In this case, the participating nodes will elect a leader. With the second, we start one server as a seed node, which will elect itself as leader, and subsequent servers will automatically join the seed (note that this also works with the explicit cluster configuration once the leader has been established). With the second method, we need to be careful to avoid starting multiple servers as seed as this will result in a split-brain. Both of these configuration methods are shown in the sections below.

It is recommended to run an odd number of servers in a cluster with a minimum of three servers to avoid split-brain scenarios. Note that if less than a majority of servers are available, the cluster cannot make progress, e.g. if two nodes go down in a cluster of three, the cluster is unavailable until at least one node comes back.

Note about Channels Partitioning and Clustering. These two features are mutually exclusive. Trying to start a server with channels Partitioning and Clustering enabled will result in a startup error. Clustering requires all channels to be replicated in the cluster.