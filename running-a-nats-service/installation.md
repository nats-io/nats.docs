# Installing a NATS Server

NATS philosophy is simplicity. Installation is just decompressing a zip file and copying the binary to an appropriate directory; you can also use your favorite package manager. Here's a list of different ways you can install or run NATS:

- [Docker](installation.md#installing-via-docker)
- [Kubernetes](nats-on-kubernetes/nats-kubernetes.md)
- [Package Manager](installation.md#installing-via-a-package-manager)
- [Release Zip](installation.md#downloading-a-release-build)
- [Development Build](installation.md#installing-from-the-source)

## Supported operating systems and architectures

The following table indicates the current supported NATS server build combinations for operating systems and architectures.

| Operating System | Architectures                                  | Status       |
| :--------------- | :--------------------------------------------- | :----------- |
| Darwin (macOS)   | amd64, arm64                                   | Stable       |
| Linux            | amd64, 386, arm6, arm7, arm64, mips64le, s390x | Stable       |
| Windows          | amd64, 386, arm6, arm7, arm64                  | Stable       |
| FreeBSD          | amd64                                          | Stable       |
| NetBSD           | -                                              | Experimental |
| IBM z/OS         | -                                              | Experimental |

_Note, not all installation methods below have distributions for all OS and architecture combinations._

## Hardware requirements

The NATS server itself has minimal hardware requirements to support small edge devices, but can take advantage of more resources if available.

CPU should be considered in accepting TLS connections. After a network partition, every disconnected client will attempt to connect to a NATS server in the cluster simultaneously, so CPU on those servers will momentarily spike. When there are many clients this can be mitigated with reconnect jitter settings, and errors can be reduced with longer TLS timeouts, and scaling up cluster sizes.

We highly recommend testing to see if smaller, cheaper machines suffice for your workload - often they do! We suggest starting here and adjusting resources after load testing specific to your environment. When using cloud provider instance types make sure the node has a sufficient NIC to support the required bandwidth for the application needs.

For high throughput use cases, the network interface card (NIC) or the available bandwidth are often the bottleneck, so ensure the hardware or cloud provider instance types are sufficient for your needs.

### Core NATS

The table below notes the minimum number of cores and memory with the different combinations of publishers, subscribers, and message rate where the single server or cluster remained stable (not slow nor hitting an out-of-memory). These were tested inside containers with `GOMEMLIMIT` set to 90% of the memory allocation and with a 2021-era CPU and SSD for JetStream storage.

All message rates are per second.

| Cluster Size | CPU cores | Memory | Subscribers | Publishers | Publish Rate | Total Message Rate |
| -----------: | --------: | -----: | ----------: | ---------: | -----------: | -----------------: |
|            1 |         1 | 32 MiB |           1 |        100 |         1000 |            100,000 |
|            1 |         1 | 64 MiB |           1 |       1000 |          100 |            100,000 |
|            3 |         1 | 32 MiB |           1 |       1000 |          100 |            100,000 |
|            3 |         1 | 64 MiB |           1 |       1000 |          100 |            100,000 |

### With JetStream

This table follows the same pattern as above, however the published messages are being received by a stream using file storage with the one replica or three (for a cluster size of three). The subscriber is relying on a "pull consumer" for fetching messages.

| Cluster Size | CPU cores |  Memory | Subscribers | Publishers | Publish Rate | Total Message Rate |
| -----------: | --------: | ------: | ----------: | ---------: | -----------: | -----------------: |
|            1 |         1 |  32 MiB |           1 |         10 |          100 |              1,000 |
|            1 |         1 |  32 MiB |           1 |        100 |           10 |              1,000 |
|            1 |         1 |  64 MiB |           1 |        100 |          100 |             10,000 |
|            1 |         1 |  64 MiB |           1 |       1000 |           10 |             10,000 |
|            3 |         1 |  32 MiB |           1 |        100 |           10 |              1,000 |
|            3 |         1 |  64 MiB |           1 |        100 |          100 |             10,000 |
|            3 |         1 |  64 MiB |           1 |       1000 |           10 |             10,000 |
|            3 |         1 | 256 MiB |           1 |       1000 |          100 |            100,000 |

## Installing via Docker

With Docker you can install the server easily without scattering binaries and other artifacts on your system. The only pre-requisite is to [install docker](https://docs.docker.com/install).

```shell
docker pull nats:latest
```

To run NATS on Docker:

```shell
docker run -p 4222:4222 -ti nats:latest
```

```
[1] 2019/05/24 15:42:58.228063 [INF] Starting nats-server version #.#.#
[1] 2019/05/24 15:42:58.228115 [INF] Git commit [#######]
[1] 2019/05/24 15:42:58.228201 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2019/05/24 15:42:58.228740 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/05/24 15:42:58.228765 [INF] Server is ready
[1] 2019/05/24 15:42:58.229003 [INF] Listening for route connections on 0.0.0.0:6222
```

More information on [containerized NATS is available here](running/nats_docker/).

## Installing via a Package Manager

On Windows:

```shell
choco install nats-server
```

On Mac OS:

```shell
brew install nats-server
```

To test your installation (provided the executable is visible to your shell):

Typing `nats-server` should output something like

```
[41634] 2019/05/13 09:42:11.745919 [INF] Starting nats-server version 2.*.*
[41634] 2019/05/13 09:42:11.746240 [INF] Listening for client connections on 0.0.0.0:4222
...
[41634] 2019/05/13 09:42:11.746249 [INF] Server id is NBNYNR4ZNTH4N2UQKSAAKBAFLDV3PZO4OUYONSUIQASTQT7BT4ZF6WX7
[41634] 2019/05/13 09:42:11.746252 [INF] Server is ready
```

On Linux:

```shell
yay -S nats-server
```

## Downloading a Release Build

You can find the latest release of nats-server on [the nats-io/nats-server GitHub releases page](https://github.com/nats-io/nats-server/releases/).

From the releases page, copy the link to the release archive file of your choice and download it using `curl -L`.

For example, assuming version X.Y.Z of the server and a Linux AMD64:

```shell
curl -L https://github.com/nats-io/nats-server/releases/download/vX.Y.Z/nats-server-vX.Y.Z-linux-amd64.zip -o nats-server.zip
```

```shell
unzip nats-server.zip -d nats-server
```

```shell
Archive:  nats-server.zip
   creating: nats-server-vX.Y.Z-linux-amd64/
...
```

and finally:

```shell
sudo cp nats-server/nats-server-vX.Y.Z-linux-amd64/nats-server /usr/bin
```

## Installing From the Source

If you have Go installed, installing the binary is easy:

```shell
go install github.com/nats-io/nats-server/v2@latest
```

This mechanism will install a build of the [main](https://github.com/nats-io/nats-server) branch, which almost certainly will not be a released version. If you are a developer and want to play with the latest, this is the easiest way.

To test your installation (provided $GOPATH/bin is in your path) by typing `nats-server` which should output something like

```
[2397474] 2023/09/27 10:32:02.709019 [INF] Starting nats-server
[2397474] 2023/09/27 10:32:02.709165 [INF]   Version:  2.10.1
[2397474] 2023/09/27 10:32:02.709182 [INF]   Git:      [not set]
[2397474] 2023/09/27 10:32:02.709185 [INF]   Name:     NDQU7SGA4ECW4PHL4KNBY42AFQEZDAPMMQZVSQDKGTARZI5JHJV6KO2N
[2397474] 2023/09/27 10:32:02.709187 [INF]   ID:       NDQU7SGA4ECW4PHL4KNBY42AFQEZDAPMMQZVSQDKGTARZI5JHJV6KO2N
[2397474] 2023/09/27 10:32:02.709795 [INF] Listening for client connections on 0.0.0.0:4222
[2397474] 2023/09/27 10:32:02.710173 [INF] Server is ready
```

## NATS v2 and Go Modules

If you are having issues when using the recent versions of NATS and Go modules such as:

```
go: github.com/nats-io/go-nats@v1.8.1: parsing go.mod: unexpected module path "github.com/nats-io/nats.go"
go: github.com/nats-io/go-nats-streaming@v0.5.0: parsing go.mod: unexpected module path "github.com/nats-io/stan.go"
```

To fix it:

1. Update your `go.mod` using the latest tags, for example for both NATS and NATS Streaming clients:

```ruby
module github.com/wallyqs/hello-nats-go-mod

go 1.12

require (
    github.com/nats-io/nats.go v1.8.1
    github.com/nats-io/stan.go v0.5.0
)
```

Or if you want to import the NATS Server v2 to embed it, notice the `/v2` after the nats-server module name. If that is not present, then go modules will not fetch it and would accidentally end up with 1.4.1 version of the server.

```ruby
require (
    github.com/nats-io/nats-server/v2 v2.0.0
    github.com/nats-io/nats.go v1.8.1
)
```

If embedding both NATS Streaming and NATS Servers:

```ruby
require (
    github.com/nats-io/nats-server/v2 v2.0.0 // indirect
    github.com/nats-io/nats-streaming-server v0.15.1
)
```

2. Next, update the imports within the repo:

```bash
find ./ -type f -name "*.go" -exec sed -i -e 's/github.com\/nats-io\/go-nats-streaming/github.com\/nats-io\/stan.go/g' {} \;

find ./ -type f -name "*.go" -exec sed -i -e 's/github.com\/nats-io\/go-nats/github.com\/nats-io\/nats.go/g' {} \;

find ./ -type f -name "*.go" -exec sed -i -e 's/github.com\/nats-io\/gnatsd/github.com\/nats-io\/nats-server\/v2/g' {} \;

find ./ -type f -name "*.go" -exec sed -i -e 's/github.com\/nats-io\/nats-server/github.com\/nats-io\/nats-server\/v2/g' {} \;
```

3. (Recommended) Run Go fmt as the rename will affect the proper ordering of the imports

### Gotchas when using `go get`

When using `go get` to fetch the client, include an extra slash at the end of the repo. For example:

```
GO111MODULE=on go get github.com/nats-io/nats.go/@latest
GO111MODULE=on go get github.com/nats-io/nats.go/@v1.8.1
```

When trying to fetch the latest version of the server with `go get`, you have to add `v2` at the end:

```
GO111MODULE=on go get github.com/nats-io/nats-server/v2@latest
```

Otherwise, `go get` will fetch the `v1.4.1` version of the server, which is also named (`gnatsd`), the previous name for nats-server.

```
GO111MODULE=on go get github.com/nats-io/nats-server@latest
go: finding github.com/nats-io/gnatsd/server latest
go: finding golang.org/x/crypto/bcrypt latest
go: finding golang.org/x/crypto latest
```

In order to use an older tag, you will have to use the previous name (gnatsd) otherwise it will result in `go mod` parsing errors.

```
# OK
GO111MODULE=on go get github.com/nats-io/go-nats/@v1.7.2

# Not OK
GO111MODULE=on go get github.com/nats-io/nats.go/@v1.7.2
go: finding github.com/nats-io/nats.go v1.7.2
go: downloading github.com/nats-io/nats.go v1.7.2
go: extracting github.com/nats-io/nats.go v1.7.2
go: finding github.com/nats-io/go-nats/encoders/builtin latest
go: finding github.com/nats-io/go-nats/util latest
go: finding github.com/nats-io/go-nats/encoders latest
go: finding github.com/nats-io/go-nats v1.8.1
go: downloading github.com/nats-io/go-nats v1.8.1
go: extracting github.com/nats-io/go-nats v1.8.1
go: github.com/nats-io/go-nats@v1.8.1: parsing go.mod: unexpected module path "github.com/nats-io/nats.go"
go: error loading module requirements
```

For more information you can review the original issue in [GitHub](https://github.com/nats-io/nats.go/issues/478).
