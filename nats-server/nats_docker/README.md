# NATS and Docker

## NATS Server Containerization

The NATS server is provided as a Docker image on [Docker Hub](https://hub.docker.com/_/nats/) that you can run using the Docker daemon. The NATS server Docker image is extremely lightweight, coming in under 10 MB in size.

[Synadia](https://synadia.com) actively maintains and supports the NATS server Docker image.

### Usage

To use the Docker container image, install Docker and pull the public image:

```bash
docker pull nats
```

Run the NATS server image:

```bash
docker run nats
```

By default the NATS server exposes multiple ports:

* 4222 is for clients.
* 8222 is an HTTP management port for information reporting.
* 6222 is a routing port for clustering.
* Use -p or -P to customize.

### Creating a NATS Cluster

First run a server with the ports exposed on a `docker network`:

```bash
$ docker network create nats
```

```bash
docker run --name nats --network nats --rm -p 4222:4222 -p 8222:8222 nats
[INF] Starting nats-server version 2.1.0
[INF] Git commit [1cc5ae0]
[INF] Starting http monitor on 0.0.0.0:8222
[INF] Listening for client connections on 0.0.0.0:4222
[INF] Server id is NDHWPPFNP2ASLPHXTMUU63NKUTZIKPJPMVBAHBAWJVAOSJG4QPXVRWL3
[INF] Server is ready
[INF] Listening for route connections on 0.0.0.0:6222
```

Next, start another couple of servers and point them to the seed server to make them form a cluster:

```bash
docker run --name nats-1 --network nats --rm nats --cluster nats://0.0.0.0:6222 --routes=nats://ruser:T0pS3cr3t@nats:6222
docker run --name nats-2 --network nats --rm nats --cluster nats://0.0.0.0:6222 --routes=nats://ruser:T0pS3cr3t@nats:6222
```

**NOTE** Since the Docker image protects routes using credentials we need to provide them above. Extracted [from Docker image configuration](https://github.com/nats-io/nats-docker/blob/6fb8c05311bb4d1554390f66abb0a5ebef1e1c9d/2.1.0/scratch/amd64/nats-server.conf#L13-L19)

To verify the routes are connected, you can make a request to the monitoring endpoint on `/routez` as follows and confirm that there are now 2 routes:

```bash
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

### Creating a NATS Cluster with Docker Compose

It is also straightforward to create a cluster using Docker Compose. Below is a simple example that uses a network named `nats` to create a full mesh cluster.

```yaml
version: "3.5"
services:
  nats:
    image: nats
    ports:
      - "8222:8222"
    networks: ["nats"]
  nats-1:
    image: nats
    command: "--cluster nats://0.0.0.0:6222 --routes=nats://ruser:T0pS3cr3t@nats:6222"
    networks: ["nats"]
    depends_on: ["nats"]
  nats-2:
    image: nats
    command: "--cluster nats://0.0.0.0:6222 --routes=nats://ruser:T0pS3cr3t@nats:6222"
    networks: ["nats"]
    depends_on: ["nats"]

networks:
  nats:
    name: nats

```

Now we use Docker Compose to create the cluster that will be using the `nats` network:

```bash
$ docker-compose -f nats-cluster.yaml up
Recreating docs_nats_1   ... done
Recreating docs_nats-2_1 ... done
Recreating docs_nats-1_1 ... done
Attaching to docs_nats-2_1, docs_nats_1, docs_nats-1_1
nats-2_1  | [1] 2019/10/19 06:41:26.064501 [INF] Starting nats-server version 2.1.0
nats-2_1  | [1] 2019/10/19 06:41:26.064783 [INF] Git commit [1cc5ae0]
nats_1    | [1] 2019/10/19 06:41:26.359150 [INF] Starting nats-server version 2.1.0
nats_1    | [1] 2019/10/19 06:41:26.359365 [INF] Git commit [1cc5ae0]
nats_1    | [1] 2019/10/19 06:41:26.360540 [INF] Starting http monitor on 0.0.0.0:8222
nats-1_1  | [1] 2019/10/19 06:41:26.578773 [INF] 172.18.0.2:6222 - rid:1 - Route connection created
nats_1    | [1] 2019/10/19 06:41:27.138198 [INF] 172.18.0.4:38900 - rid:2 - Route connection created
nats-2_1  | [1] 2019/10/19 06:41:27.147816 [INF] 172.18.0.2:6222 - rid:1 - Route connection created
nats-2_1  | [1] 2019/10/19 06:41:27.150367 [INF] 172.18.0.3:60702 - rid:2 - Route connection created
nats-1_1  | [1] 2019/10/19 06:41:27.153078 [INF] 172.18.0.4:6222 - rid:3 - Route connection created
```

### Testing the Clusters

Now, the following should work: make a subscription on one of the nodes and publish it from another node. You should be able to receive the message without problems.

```bash
$ docker run --network nats --rm -it synadia/nats-box
~ # nats-sub -s nats://nats:4222 hello &
Listening on [hello]

~ # nats-pub -s "nats://nats-1:4222" hello first
~ # nats-pub -s "nats://nats-2:4222" hello second
```

Also stopping the seed node to which the subscription was done, should trigger an automatic failover to the other nodes:

```bash
$ docker stop nats

... 
Disconnected: will attempt reconnects for 10m
Reconnected [nats://172.17.0.4:4222]
```

Publishing again will continue to work after the reconnection:

```bash
~ # nats-pub -s "nats://nats-1:4222" hello again
~ # nats-pub -s "nats://nats-2:4222" hello again
```

## Tutorial

See the [NATS Docker tutorial](nats-docker-tutorial.md) for more instructions on using the NATS server Docker image.

