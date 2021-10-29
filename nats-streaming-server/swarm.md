# Docker Swarm

## Step 1:

Create an overlay network for the NATS & NATS Streaming cluster \(in this example, `nats-streaming-example`\). Notice we added the `--attachable` option which will allow other containers to join the network which will be done at the end to confirm that can connect to the cluster.

```bash
docker network create --driver overlay --attachable nats-streaming-example
```

## Step 2:

Next create the NATS cluster which will be used by the NATS Streaming cluster.

```bash
for i in `seq 1 3`; do
  sudo docker service create --network nats-streaming-example \
                             --name nats-cluster-node-$i nats:1.1.0 \
                             -cluster nats://0.0.0.0:6222 \
                             -routes nats://nats-cluster-node-1:6222,nats://nats-cluster-node-2:6222,nats://nats-cluster-node-3:6222
done
```

## Step 3:

Now that there is a NATS cluster available to connect, create the NATS Streaming cluster of three nodes as follows:

```bash
for i in `seq 1 3`; do
  sudo docker service create --network nats-streaming-example \
                             --name nats-streaming-node-$i nats-streaming:0.9.2 \
                             -store file -dir store -clustered -cluster_id swarm -cluster_node_id node-$i \
                             -cluster_peers node-1,node-2,node-3 \
                             -nats_server nats://nats-cluster-node-1:4222,nats://nats-cluster-node-2:4222,nats://nats-cluster-node-3:4222
done
```

## Step 4:

Next, confirm that it is possible to publish and replay messages via NATS Streaming by attaching a container to the same network where both NATS and NATS Streaming exist. Below you can find an example session of doing so, note that even though the client is only connecting to `nats://nats-cluster-node-1:4222` the NATS cluster will be routing the messages so that they will be processed to the NATS Streaming cluster service.

```bash
$ docker run --network nats-streaming-example -it synadia/nats-box

# Publishing 3 messages
c01c232d571a:~# stan-pub -s nats://nats-cluster-node-1:4222 --cluster swarm hello world
Published [hello] : 'world'
c01c232d571a:~# stan-pub -s nats://nats-cluster-node-1:4222 --cluster swarm hello world
Published [hello] : 'world'
c01c232d571a:~# stan-pub -s nats://nats-cluster-node-1:4222 --cluster swarm hello world
Published [hello] : 'world'

# Replaying the messages from the beginning
c01c232d571a:~# stan-sub -s nats://nats-cluster-node-1:4222 --cluster swarm -id $RANDOM --all hello
Connected to nats://nats-cluster-node-1:4222 clusterID: [swarm] clientID: [2379]
Listening on [hello], clientID=[2379], qgroup=[] durable=[]
[#1] Received: sequence:1 subject:"hello" data:"world" timestamp:1595949420614047600
[#2] Received: sequence:2 subject:"hello" data:"world" timestamp:1595949422327787300
[#3] Received: sequence:3 subject:"hello" data:"world" timestamp:1595949422898530500
```

