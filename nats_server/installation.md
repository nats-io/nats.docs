# NATS Server Installation

NATS philosophy is simplicity. Installation is just decompressing a zip file and copying the binary to an appropriate directory; you can also use your favorite package manager. Here's a list of different ways you can install or run NATS:

- [Docker](#installing-via-docker)
- [Kubernetes](#installing-on-kubernetes-with-nats-operator)
- [Package Manager](#installing-via-a-package-manager)
- [Release Zip](#downloading-a-release-build)
- [Development Build](#installing-from-the-source)


### Installing via Docker

With Docker you can install the server easily without scattering binaries and other artifacts on your system. The only pre-requisite is to [install docker](https://docs.docker.com/install).

```
> docker pull nats:latest
latest: Pulling from library/nats
Digest: sha256:0c98cdfc4332c0de539a064bfab502a24aae18ef7475ddcc7081331502327354
Status: Image is up to date for nats:latest
docker.io/library/nats:latest
```

To run NATS on Docker:

```
> docker run -p 4222:4222 -ti nats:latest
[1] 2019/05/24 15:42:58.228063 [INF] Starting nats-server version #.#.#
[1] 2019/05/24 15:42:58.228115 [INF] Git commit [#######]
[1] 2019/05/24 15:42:58.228201 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2019/05/24 15:42:58.228740 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/05/24 15:42:58.228765 [INF] Server is ready
[1] 2019/05/24 15:42:58.229003 [INF] Listening for route connections on 0.0.0.0:6222
```

More information on [containerized NATS is available here](/nats_docker/README.md).


### Installing on Kubernetes with NATS Operator

Installation via the NATS Operator is beyond this tutorial. You can read about the [NATS
Operator](https://github.com/nats-io/nats-operator) here.


### Installing via a Package Manager

On Windows:
```
> choco install nats-server
```

On Mac OS:
```
> brew install nats-server
```

To test your installation (provided the executable is visible to your shell):

```
> nats-server
[41634] 2019/05/13 09:42:11.745919 [INF] Starting nats-server version 2.0.0
[41634] 2019/05/13 09:42:11.746240 [INF] Listening for client connections on 0.0.0.0:4222
...
[41634] 2019/05/13 09:42:11.746249 [INF] Server id is NBNYNR4ZNTH4N2UQKSAAKBAFLDV3PZO4OUYONSUIQASTQT7BT4ZF6WX7
[41634] 2019/05/13 09:42:11.746252 [INF] Server is ready
```

### Downloading a Release Build

You can find the latest release of nats-server [here](https://github.com/nats-io/nats-server/releases/latest).

Download the zip file matching your systems architecture, and unzip. For this example, assuming version 2.0.0 of the server and a Linux AMD64:

```
> curl -L https://github.com/nats-io/nats-server/releases/download/v2.0.0/nats-server-v2.0.0-linux-amd64.zip -o nats-server.zip

> unzip nats-server.zip -d nats-server
Archive:  nats-server.zip
   creating: nats-server-v2.0.0-darwin-amd64/
  inflating: nats-server-v2.0.0-darwin-amd64/README.md
  inflating: nats-server-v2.0.0-darwin-amd64/LICENSE
  inflating: nats-server-v2.0.0darwin-amd64/nats-server

> cp nats-server-v2.0.0darwin-amd64/nats-server /usr/local/bin

```

### Installing From the Source

If you have Go installed, installing the binary is easy:

```
> GO111MODULE=on go get github.com/nats-io/nats-server/v2
```

This mechanism will install a build of [master](https://github.com/nats-io/nats-server), which almost certainly will not be a released version. If you are a developer and want to play with the latest, this is the easiest way. 

To test your installation (provided the $GOPATH/bin is set):

```
> nats-server
[41634] 2019/05/13 09:42:11.745919 [INF] Starting nats-server version 2.0.0
[41634] 2019/05/13 09:42:11.746240 [INF] Listening for client connections on 0.0.0.0:4222
...
[41634] 2019/05/13 09:42:11.746249 [INF] Server id is NBNYNR4ZNTH4N2UQKSAAKBAFLDV3PZO4OUYONSUIQASTQT7BT4ZF6WX7
[41634] 2019/05/13 09:42:11.746252 [INF] Server is ready
```


