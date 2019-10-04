# Avoiding the Thundering Herd

When a server goes down, there is a possible anti-pattern called the _Thundering Herd_ where all of the clients try to reconnect immediately, thus creating a denial of service attack. In order to prevent this, most NATS client libraries randomize the servers they attempt to connect to. This setting has no effect if only a single server is used, but in the case of a cluster, randomization, or shuffling, will ensure that no one server bears the brunt of the client reconnect attempts.

However, if you want to disable the randomization process, so that servers are always checked in the same order, you can do that in most libraries with a connection options:

!INCLUDE "../../\_examples/reconnect\_no\_random.html"

