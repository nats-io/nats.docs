
## NATS Server Containerization

The NATS server is provided as a Docker image on [Docker Hub](https://hub.docker.com/_/nats/) that you can run using the Docker daemon. The NATS server Docker image is extremely lightweight, coming in under 10 MB in size.

[Synadia](https://synadia.com) actively maintains and supports the NATS server Docker image.

### Usage

To use the Docker container image, install Docker and pull the public image:

```sh
> docker pull nats
```

Run the NATS server image:

```sh
> docker run -d --name nats-main nats
```

By default the NATS server exposes multiple ports:

- 4222 is for clients.
- 8222 is an HTTP management port for information reporting.
- 6222 is a routing port for clustering.
- Use -p or -P to customize.

For example:

```sh
$ docker run -d --name nats-main nats
[INF] Starting nats-server version 0.6.6
[INF] Starting http monitor on port 8222
[INF] Listening for route connections on 0.0.0.0:6222
[INF] Listening for client connections on 0.0.0.0:4222
[INF] nats-server is ready
```

To run with the ports exposed on the host:

```sh
> docker run -d -p 4222:4222 -p 6222:6222 -p 8222:8222 --name nats-main nats
```

To run a second server and cluster them together:

```sh
> docker run -d --name=nats-2 --link nats-main nats --routes=nats-route://ruser:T0pS3cr3t@nats-main:6222
```

**NOTE** Since the Docker image protects routes using credentials we need to provide them above. Extracted [from Docker image configuration](https://github.com/nats-io/nats-docker/blob/master/amd64/nats-server.conf#L16-L20)

```ascii
# Routes are protected, so need to use them with --routes flag
# e.g. --routes=nats-route://ruser:T0pS3cr3t@otherdockerhost:6222
authorization {
  user: ruser
  password: T0pS3cr3t
  timeout: 2
}
```

To verify the routes are connected:

```sh
$ docker run -d --name=nats-2 --link nats-main nats --routes=nats-route://ruser:T0pS3cr3t@nats-main:6222 -DV
[INF] Starting nats-server version 0.6.6
[INF] Starting http monitor on port 8222
[INF] Listening for route connections on :6222
[INF] Listening for client connections on 0.0.0.0:4222
[INF] nats-server is ready
[DBG] Trying to connect to route on nats-main:6222
[DBG] 172.17.0.52:6222 - rid:1 - Route connection created
[DBG] 172.17.0.52:6222 - rid:1 - Route connect msg sent
[DBG] 172.17.0.52:6222 - rid:1 - Registering remote route "ee35d227433a738c729f9422a59667bb"
[DBG] 172.17.0.52:6222 - rid:1 - Route sent local subscriptions
```

## Clustering With Docker

Below is are a couple examples of how to setup nats-server cluster using Docker. We put 3 different configurations (one per nats-server server) under a folder named conf as follows:

```ascii
|-- conf
    |-- nats-server-A.conf
    |-- nats-server-B.conf
    |-- nats-server-C.conf
```

Each one of those files have the following content below: (Here I am using ip 192.168.59.103 as an example, so just replace with the proper ip from your server)

### Example 1: Setting up a cluster on 3 different servers provisioned beforehand

In this example, the three servers are started with config files that know about the other servers.

#### nats-server-A

```ascii
# Cluster Server A

port: 7222

cluster {
  host: '0.0.0.0'
  port: 7244

  routes = [
    nats-route://192.168.59.103:7246
    nats-route://192.168.59.103:7248
  ]
}
```

#### nats-server-B

```ascii
# Cluster Server B

port: 8222

cluster {
  host: '0.0.0.0'
  port: 7246

  routes = [
    nats-route://192.168.59.103:7244
    nats-route://192.168.59.103:7248
  ]
}
```

#### nats-server-C

```ascii
# Cluster Server C

port: 9222

cluster {
  host: '0.0.0.0'
  port: 7248

  routes = [
    nats-route://192.168.59.103:7244
    nats-route://192.168.59.103:7246
  ]
}
```

To start the containers, on each one of your servers, you should be able to start the nats-server image as follows:

```sh
docker run -it -p 0.0.0.0:7222:7222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/nats-server-A.conf:/tmp/cluster.conf nats -c /tmp/cluster.conf -p 7222 -D -V
```

```
docker run -it -p 0.0.0.0:8222:8222 -p 0.0.0.0:7246:7246 --rm -v $(pwd)/conf/nats-server-B.conf:/tmp/cluster.conf nats -c /tmp/cluster.conf -p 8222 -D -V
```

```
docker run -it -p 0.0.0.0:9222:9222 -p 0.0.0.0:7248:7248 --rm -v $(pwd)/conf/nats-server-C.conf:/tmp/cluster.conf nats -c /tmp/cluster.conf -p 9222 -D -V
```

### Example 2: Setting a nats-server cluster one by one

In this scenario:

- We bring up A and get its ip (nats-route://192.168.59.103:7244)
- Then create B and then use address of A in its configuration.
- Get the address of B nats-route://192.168.59.104:7246 and create C and use the addresses of A and B.

First, we create the Node A and start up a nats-server server with the following config:

```ascii
# Cluster Server A

port: 4222

cluster {
  host: '0.0.0.0'
  port: 7244

}
```

```sh
docker run -it -p 0.0.0.0:4222:4222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/nats-server-A.conf:/tmp/cluster.conf nats -c /tmp/cluster.conf -p 4222 -D -V
```

Then we proceed to create the next node. We realize that the first node has ip:port as `192.168.59.103:7244` so we add this to the routes configuration as follows:

```ascii
# Cluster Server B

port: 4222

cluster {
  host: '0.0.0.0'
  port: 7244

  routes = [
    nats-route://192.168.59.103:7244
  ]
}
```

Then start server B:

```sh
docker run -it -p 0.0.0.0:4222:4222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/nats-server-B.conf:/tmp/cluster.conf nats -c /tmp/cluster.conf -p 4222 -D -V
```

Finally, we create another Node C. We now know the routes of A and B so we can add it to its configuration:

```ascii
# Cluster Server C

port: 4222

cluster {
  host: '0.0.0.0'
  port: 7244

  routes = [
    nats-route://192.168.59.103:7244
    nats-route://192.168.59.104:7244
  ]
}
```

Then start it:

```sh
docker run -it -p 0.0.0.0:4222:4222 -p 0.0.0.0:7244:7244 --rm -v $(pwd)/conf/nats-server-C.conf:/tmp/cluster.conf nats -c /tmp/cluster.conf -p 9222 -D -V
```

### Testing the Clusters

Now, the following should work: make a subscription to Node A then publish to Node C. You should be able to to receive the message without problems.

```sh
nats-sub -s "nats://192.168.59.103:7222" hello &

nats-pub -s "nats://192.168.59.105:7222" hello world

[#1] Received on [hello] : 'world'

# nats-server on Node C logs:
[1] 2015/06/23 05:20:31.100032 [TRC] 192.168.59.103:7244 - rid:2 - <<- [MSG hello RSID:8:2 5]

# nats-server on Node A logs:
[1] 2015/06/23 05:20:31.100600 [TRC] 10.0.2.2:51007 - cid:8 - <<- [MSG hello 2 5]
```

## Tutorial

See the [NATS Docker tutorial](tutorial.md) for more instructions on using the NATS server Docker image.
