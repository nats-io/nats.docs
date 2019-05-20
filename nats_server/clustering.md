## NATS Server Clustering


NATS supports running each server in clustered mode. You can cluster servers together for high volume messaging systems and resiliency and high availability. Clients are cluster-aware.

Note that NATS clustered servers have a forwarding limit of one hop. This means that each `nats-server` instance will **only** forward messages that it has received **from a client** to the immediately adjacent `nats-server` instances to which it has routes. Messages received **from** a route will only be distributed to local clients. Therefore a full mesh cluster, or complete graph, is recommended for NATS to function as intended and as described throughout the documentation.

## Cluster URLs

In addition to a port for listening for clients, `nats-server` can listen on a "cluster" URL (the `-cluster` option). Additional `nats-server` servers can then add that URL to their `-routes` argument to join the cluster. These options can also be specified in a config file, but only the command-line version is shown in this overview for simplicity.

### Running with No Cluster

```sh
nats-server -p 4222
```
----

### Running a Simple Cluster

```sh
# Server A on 10.10.0.1
nats-server -p 4222 -cluster nats://10.10.0.1:5222

# Server B on 10.10.0.2
nats-server -p 4222 -cluster nats://10.10.0.2:5222 -routes nats://10.10.0.1:5222
```

----

```sh
# Server A on 10.10.0.1
nats-server -p 4222 -cluster nats://10.10.0.1:5222 -routes nats://10.10.0.2:5222

# Server B on 10.10.0.2
nats-server -p 4222 -cluster nats://10.10.0.2:5222 -routes nats://10.10.0.1:5222
```

Clients connecting to any server in the cluster will remain connected to the cluster even if the server it originally connected to is taken down, as long as at least a single server remains.

## Command Line Options

The following cluster options are supported:

    --routes [rurl-1, rurl-2]     Routes to solicit and connect
    --cluster nats://host:port    Cluster URL for solicited routes

When a NATS server routes to a specified URL, it will advertise its own cluster URL to all other servers in the route route effectively creating a routing mesh to all other servers. 

**Note:** when using the `-routes` option, you must also specify a `-cluster` option.

Clustering can also be configured using the server [config file](cluster_config.md).

## Three Server Cluster Example

The following example demonstrates how to run a cluster of 3 servers on the same host. We will start with the seed server and use the `-D` command line parameter to produce debug information.

```sh
nats-server -p 4222 -cluster nats://localhost:4248 -D
```

Alternatively, you could use a configuration file, let's call it `seed.conf`, with a content similar to this:

```ascii
# Cluster Seed Node

listen: 127.0.0.1:4222
http: 8222

cluster {
  listen: 127.0.0.1:4248
}
```

And start the server like this:

```sh
nats-server -config ./seed.conf -D
```

This will produce an output similar to:

```sh
[75653] 2016/04/26 15:14:47.339321 [INF] Listening for route connections on 127.0.0.1:4248
[75653] 2016/04/26 15:14:47.340787 [INF] Listening for client connections on 127.0.0.1:4222
[75653] 2016/04/26 15:14:47.340822 [DBG] server id is xZfu3u7usAPWkuThomoGzM
[75653] 2016/04/26 15:14:47.340825 [INF] server is ready
```

It is also possible to specify the hostname and port independently. At least the port is required. If you leave the hostname off it will bind to all the interfaces ('0.0.0.0').

```ascii
cluster {
  host: 127.0.0.1
  port: 4248
}
```

Now let's start two more servers, each one connecting to the seed server.

```sh
nats-server -p 5222 -cluster nats://localhost:5248 -routes nats://localhost:4248 -D
```

When running on the same host, we need to pick different ports for the client connections `-p`, and for the port used to accept other routes `-cluster`. Note that `-routes` points to the `-cluster` address of the seed server (`localhost:4248`).

Here is the log produced. See how it connects and registers a route to the seed server (`...GzM`).

```sh
[75665] 2016/04/26 15:14:59.970014 [INF] Listening for route connections on localhost:5248
[75665] 2016/04/26 15:14:59.971150 [INF] Listening for client connections on 0.0.0.0:5222
[75665] 2016/04/26 15:14:59.971176 [DBG] server id is 53Yi78q96t52QdyyWLKIyE
[75665] 2016/04/26 15:14:59.971179 [INF] server is ready
[75665] 2016/04/26 15:14:59.971199 [DBG] Trying to connect to route on localhost:4248
[75665] 2016/04/26 15:14:59.971551 [DBG] 127.0.0.1:4248 - rid:1 - Route connection created
[75665] 2016/04/26 15:14:59.971559 [DBG] 127.0.0.1:4248 - rid:1 - Route connect msg sent
[75665] 2016/04/26 15:14:59.971720 [DBG] 127.0.0.1:4248 - rid:1 - Registering remote route "xZfu3u7usAPWkuThomoGzM"
[75665] 2016/04/26 15:14:59.971731 [DBG] 127.0.0.1:4248 - rid:1 - Route sent local subscriptions
```

From the seed's server log, we see that the route is indeed accepted:

```sh
[75653] 2016/04/26 15:14:59.971602 [DBG] 127.0.0.1:52679 - rid:1 - Route connection created
[75653] 2016/04/26 15:14:59.971733 [DBG] 127.0.0.1:52679 - rid:1 - Registering remote route "53Yi78q96t52QdyyWLKIyE"
[75653] 2016/04/26 15:14:59.971739 [DBG] 127.0.0.1:52679 - rid:1 - Route sent local subscriptions
```

Finally, let's start the third server:

```sh
nats-server -p 6222 -cluster nats://localhost:6248 -routes nats://localhost:4248 -D
```

Again, notice that we use a different client port and cluster address, but still point to the same seed server at the address `nats://localhost:4248`:

```sh
[75764] 2016/04/26 15:19:11.528185 [INF] Listening for route connections on localhost:6248
[75764] 2016/04/26 15:19:11.529787 [INF] Listening for client connections on 0.0.0.0:6222
[75764] 2016/04/26 15:19:11.529829 [DBG] server id is IRepas80TBwJByULX1ulAp
[75764] 2016/04/26 15:19:11.529842 [INF] server is ready
[75764] 2016/04/26 15:19:11.529872 [DBG] Trying to connect to route on localhost:4248
[75764] 2016/04/26 15:19:11.530272 [DBG] 127.0.0.1:4248 - rid:1 - Route connection created
[75764] 2016/04/26 15:19:11.530281 [DBG] 127.0.0.1:4248 - rid:1 - Route connect msg sent
[75764] 2016/04/26 15:19:11.530408 [DBG] 127.0.0.1:4248 - rid:1 - Registering remote route "xZfu3u7usAPWkuThomoGzM"
[75764] 2016/04/26 15:19:11.530414 [DBG] 127.0.0.1:4248 - rid:1 - Route sent local subscriptions
[75764] 2016/04/26 15:19:11.530595 [DBG] 127.0.0.1:52727 - rid:2 - Route connection created
[75764] 2016/04/26 15:19:11.530659 [DBG] 127.0.0.1:52727 - rid:2 - Registering remote route "53Yi78q96t52QdyyWLKIyE"
[75764] 2016/04/26 15:19:11.530664 [DBG] 127.0.0.1:52727 - rid:2 - Route sent local subscriptions
```

First a route is created to the seed server (`...GzM`) and after that, a route from `...IyE` - which is the ID of the second server - is accepted.

The log from the seed server shows that it accepted the route from the third server:

```sh
[75653] 2016/04/26 15:19:11.530308 [DBG] 127.0.0.1:52726 - rid:2 - Route connection created
[75653] 2016/04/26 15:19:11.530384 [DBG] 127.0.0.1:52726 - rid:2 - Registering remote route "IRepas80TBwJByULX1ulAp"
[75653] 2016/04/26 15:19:11.530389 [DBG] 127.0.0.1:52726 - rid:2 - Route sent local subscriptions
```

And the log from the second server shows that it connected to the third.

```sh
[75665] 2016/04/26 15:19:11.530469 [DBG] Trying to connect to route on 127.0.0.1:6248
[75665] 2016/04/26 15:19:11.530565 [DBG] 127.0.0.1:6248 - rid:2 - Route connection created
[75665] 2016/04/26 15:19:11.530570 [DBG] 127.0.0.1:6248 - rid:2 - Route connect msg sent
[75665] 2016/04/26 15:19:11.530644 [DBG] 127.0.0.1:6248 - rid:2 - Registering remote route "IRepas80TBwJByULX1ulAp"
[75665] 2016/04/26 15:19:11.530650 [DBG] 127.0.0.1:6248 - rid:2 - Route sent local subscriptions
```

At this point, there is a full mesh cluster of NATS servers.

### Testing the Cluster

Now, the following should work: make a subscription to Node A then publish to Node C. You should be able to to receive the message without problems.

```sh
nats-sub -s "nats://192.168.59.103:7222" hello &

nats-pub -s "nats://192.168.59.105:7222" hello world

[#1] Received on [hello] : 'world'

# GNATSD on Node C logs:
[1] 2015/06/23 05:20:31.100032 [TRC] 192.168.59.103:7244 - rid:2 - <<- [MSG hello RSID:8:2 5]

# GNATSD on Node A logs:
[1] 2015/06/23 05:20:31.100600 [TRC] 10.0.2.2:51007 - cid:8 - <<- [MSG hello 2 5]
```
