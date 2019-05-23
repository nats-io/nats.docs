# Using NATS Streaming with Docker Swarm

#### Step 1:

Create an overlay network for the NATS & NATS Streaming cluster (in this example, `nats-streaming-example`).
Notice we added the `--attachable` option which will allow other containers to join the network which will be
done at the end to confirm that can connect to the cluster.

```sh
% docker network create --driver overlay --attachable nats-streaming-example
```

#### Step 2:

Next create the NATS cluster which will be used by the NATS Streaming cluster.

```sh
for i in `seq 1 3`; do
  sudo docker service create --network nats-streaming-example \
                             --name nats-cluster-node-$i nats:1.1.0 \
                             -cluster nats://0.0.0.0:6222 \
                             -routes nats://nats-cluster-node-1:6222,nats://nats-cluster-node-2:6222,nats://nats-cluster-node-3:6222
done
```

#### Step 3:

Now that there is a NATS cluster available to connect, create the NATS Streaming cluster of three nodes as follows:

```sh
for i in `seq 1 3`; do
  sudo docker service create --network nats-streaming-example \
                             --name nats-streaming-node-$i nats-streaming:0.9.2 \
                             -store file -dir store -clustered -cluster_id swarm -cluster_node_id node-$i \
                             -cluster_peers node-1,node-2,node-3 \
                             -nats_server nats://nats-cluster-node-1:4222,nats://nats-cluster-node-2:4222,nats://nats-cluster-node-3:4222
done
```

#### Step 4:

Next, confirm that it is possible to publish and replay messages via NATS Streaming by attaching a container
to the same network where both NATS and NATS Streaming exist.  Below you can find an example session of doing so,
note that even though the client is only connecting to `nats://nats-cluster-node-1:4222` the NATS cluster will
be routing the messages so that they will be processed to the NATS Streaming cluster service.

```sh
$ sudo docker run --network nats-streaming-example -it golang:latest

root@d12f9f3fcdde:/go# cd src/github.com/nats-io/go-nats-streaming/

# Publishing 3 messages
root@d12f9f3fcdde:/go/src/github.com/nats-io/go-nats-streaming# go run examples/stan-pub/main.go -s nats://nats-cluster-node-1:4222 --cluster swarm hello world
Published [hello] : 'world'
root@d12f9f3fcdde:/go/src/github.com/nats-io/go-nats-streaming# go run examples/stan-pub/main.go -s nats://nats-cluster-node-1:4222 --cluster swarm hello world
Published [hello] : 'world'
root@d12f9f3fcdde:/go/src/github.com/nats-io/go-nats-streaming# go run examples/stan-pub/main.go -s nats://nats-cluster-node-1:4222 --cluster swarm hello world
Published [hello] : 'world'

# Replaying the messages from the beginning
root@d12f9f3fcdde:/go/src/github.com/nats-io/go-nats-streaming# go run examples/stan-sub/main.go -s nats://nats-cluster-node-1:4222 --cluster swarm -id $RANDOM --all hello
Connected to nats://nats-cluster-node-1:4222 clusterID: [swarm] clientID: [17010]
subscribing with DeliverAllAvailable
Listening on [hello], clientID=[17010], qgroup=[] durable=[]
[#1] Received on [hello]: 'sequence:1 subject:"hello" data:"world" timestamp:1526948600795366785 '
[#2] Received on [hello]: 'sequence:2 subject:"hello" data:"world" timestamp:1526948604613783399 '
[#3] Received on [hello]: 'sequence:3 subject:"hello" data:"world" timestamp:1526948606124258269 '
```
