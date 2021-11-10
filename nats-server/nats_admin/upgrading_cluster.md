# Upgrading a Cluster

The basic strategy for upgrading a cluster revolves around the server's ability to gossip cluster configuration to clients and other servers. When cluster configuration changes, clients become aware of new servers automatically. In the case of a disconnect, a client has a list of servers that joined the cluster in addition to the ones it knew about from its connection settings.

Note that since each server stores it's own permission and authentication configuration, new servers added to a cluster should provide the same users and authorization to prevent clients from getting rejected or gaining unexpected privileges.

For purposes of describing the scenario, let's get some fingers on keyboards, and go through the motions. Let's consider a cluster of two servers: 'A' and 'B', and yes - clusters should be _three_ to _five_ servers, but for purposes of describing the behavior and cluster upgrade process, a cluster of two servers will suffice.

Let's build this cluster:

```bash
nats-server -D -p 4222 -cluster nats://localhost:6222 -routes nats://localhost:6222,nats://localhost:6333
```

The command above is starting nats-server with debug output enabled, listening for clients on port 4222, and accepting cluster connections on port 6222. The `-routes` option specifies a list of nats URLs where the server will attempt to connect to other servers. These URLs define the cluster ports enabled on the cluster peers.

Keen readers will notice a self-route. The NATS server will ignore the self-route, but it makes for a single consistent configuration for all servers.

You will see the server started, we notice it emits some warnings because it cannot connect to 'localhost:6333'. The message more accurately reads:

```text
 Error trying to connect to route: dial tcp localhost:6333: connect: connection refused
```

Let's fix that, by starting the second server:

```bash
nats-server -D -p 4333 -cluster nats://localhost:6333 -routes nats://localhost:6222,nats://localhost:6333
```

The second server was started on port 4333 with its cluster port on 6333. Otherwise the same as 'A'.

Let's get one client, so we can observe it moving between servers as servers get removed:

```bash
nats sub -s nats://localhost:4222 ">"
```

After starting the subscriber you should see a message on 'A' that a new client connected.

We have two servers and a client. Time to simulate our rolling upgrade. But wait, before we upgrade 'A', let's introduce a new server 'C'. Server 'C' will join the existing cluster while we perform the upgrade. Its sole purpose is to provide an additional place where clients can go other than 'A' and ensure we don't end up with a single server serving all the clients after the upgrade procedure. Clients will randomly select a server when connecting unless a special option is provided that disables that functionality \(usually called 'DontRandomize' or 'noRandomize'\). You can read more about ["Avoiding the Thundering Herd"](upgrading_cluster.md). Suffice it to say that clients redistribute themselves about evenly between all servers in the cluster. In our case 1/2 of the clients on 'A' will jump over to 'B' and the remaining half to 'C'.

Let's start our temporary server:

```bash
nats server -D -p 4444 -cluster nats://localhost:6444 -routes nats://localhost:6222,nats://localhost:6333
```

After an instant or so, clients on 'A' learn of the new cluster member that joined. On our hands-on tutorial, `nats sub` is now aware of 3 possible servers, 'A' \(specified when we started the tool\) and 'B' and 'C' learned from the cluster gossip.

We invoke our admin powers and turn off 'A' by issuing a `CTRL+C` to the terminal on 'A' and observe that either 'B' or 'C' reports that a new client connected. That is our `nats sub` client.

We perform the upgrade process, update the binary for 'A', and restart 'A':

```bash
nats-server -D -p 4222 -cluster nats://localhost:6222 -routes nats://localhost:6222,nats://localhost:6333
```

We move on to upgrade 'B'. Notice that clients from 'B' reconnect to 'A' and 'C'. We upgrade and restart 'B':

```bash
nats-server -D -p 4333 -cluster nats://localhost:6333 -routes nats://localhost:6222,nats://localhost:6333
```

If we had more servers, we would continue the stop, update, restart rotation as we did for 'A' and 'B'. After restarting the last server, we can go ahead and turn off 'C.' Any clients on 'C' will redistribute to our permanent cluster members.

## Seed Servers

In the examples above we started nats-server specifying two clustering routes. It is possible to allow the server gossip protocol drive it and reduce the amount of configuration. You could for example start A, B and C as follows:

### A - Seed Server

```bash
nats-server -D -p 4222 -cluster nats://localhost:6222
```

### B

```bash
nats-server -D -p 4333 -cluster nats://localhost:6333 -routes nats://localhost:6222
```

### C

```bash
nats-server -D -p 4444 -cluster nats://localhost:6444 -routes nats://localhost:6222
```

Once they connect to the 'seed server', they will learn about all the other servers and connect to each other forming the full mesh.

