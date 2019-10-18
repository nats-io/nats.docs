
## NATS Server Containerization

The NATS server is provided as a Docker image on [Docker Hub](https://hub.docker.com/_/nats/) that you can run using the Docker daemon. The NATS server Docker image is extremely lightweight, coming in under 10 MB in size.

[Synadia](https://synadia.com) actively maintains and supports the NATS server Docker image.

### Usage

To use the Docker container image, install Docker and pull the public image:

```sh
docker pull nats
```

Run the NATS server image:

```sh
docker run nats
```

By default the NATS server exposes multiple ports:

- 4222 is for clients.
- 8222 is an HTTP management port for information reporting.
- 6222 is a routing port for clustering.
- Use -p or -P to customize.

### Creating a NATS Cluster

First run a server with the ports exposed on a `docker network`:

```sh
$ docker network create nats
```

```sh
docker run --name nats --network nats --rm -p 4222:4222 -p 8222:8222 nats
[INF] Starting nats-server version 2.1.0
[INF] Git commit [1cc5ae0]
[INF] Starting http monitor on 0.0.0.0:8222
[INF] Listening for client connections on 0.0.0.0:4222
[INF] Server id is NDHWPPFNP2ASLPHXTMUU63NKUTZIKPJPMVBAHBAWJVAOSJG4QPXVRWL3
[INF] Server is ready
[INF] Listening for route connections on 0.0.0.0:6222
```
```

Next, start another couple of servers and point them to the seed server to make them form a cluster:

```sh
docker run --name nats-1 --network nats --rm nats --cluster nats://0.0.0.0:6222 --routes=nats://ruser:T0pS3cr3t@nats:6222
docker run --name nats-2 --network nats --rm nats --cluster nats://0.0.0.0:6222 --routes=nats://ruser:T0pS3cr3t@nats:6222
```

**NOTE** Since the Docker image protects routes using credentials we need to provide them above. Extracted [from Docker image configuration](https://github.com/nats-io/nats-docker/blob/6fb8c05311bb4d1554390f66abb0a5ebef1e1c9d/2.1.0/scratch/amd64/nats-server.conf#L13-L19)

To verify the routes are connected, you can make a request to the monitoring endpoint on `/routez` as follows and confirm that there are now 2 routes:

```sh
curl http://127.0.0.1:8222/routez
{
  "server_id": "ND34PZ64QLLJKSU5SLSWRS5EUXEKNHW5BUVLCNFWA56R4D7XKDYWJFP7",
  "now": "2019-10-17T21:29:38.126871819Z",
  "num_routes": 2,
  "routes": [
    {
      "rid": 7,
      "remote_id": "NDF4PMDKSKIZBYHUU5R7NA5KXNXLTKHVLN6ALBLQPAWTJKRAWJVPN4HA",
      "did_solicit": false,
      "is_configured": false,
      "ip": "172.17.0.3",
      "port": 59810,
      "pending_size": 0,
      "rtt": "561µs",
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 0
    },
    {
      "rid": 8,
      "remote_id": "ND6P52R5PASBYXK2MK44P6BYV7Q7PZEMTZJ5O5K7WXF4F54UD3EKVBSC",
      "did_solicit": false,
      "is_configured": false,
      "ip": "172.17.0.4",
      "port": 37882,
      "pending_size": 0,
      "rtt": "772µs",
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 0
    }
  ]
}
```

### Testing the Clusters

Now, the following should work: make a subscription on one of the nodes and publish it from another node. You should be able to receive the message without problems.

```sh
$ docker run --network nats --rm -it synadia/nats-box
~ # nats-sub -s nats://nats:4222 hello &
Listening on [hello]

~ # nats-pub -s "nats://nats-1:4222" hello first
~ # nats-pub -s "nats://nats-2:4222" hello second
[#1] Received on [hello]: 'first'
[#2] Received on [hello]: 'second'
```

Also stopping the seed node to which the subscription was done, should trigger an automatic failover to the other nodes:

```sh
$ docker stop nats

... 
Disconnected: will attempt reconnects for 10m
Reconnected [nats://172.17.0.4:4222]
```

Publishing again will continue to work after the reconnection:

```sh
~ # nats-pub -s "nats://nats-1:4222" hello again
~ # nats-pub -s "nats://nats-2:4222" hello again
```

## Tutorial

See the [NATS Docker tutorial](nats-docker-tutorial.md) for more instructions on using the NATS server Docker image.
