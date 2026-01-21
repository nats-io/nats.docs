# Installing a NATS Server

NATS philosophy is simplicity. Installation is just decompressing a zip file and copying the binary to an appropriate directory; you can also use your favorite package manager. Here's a list of different ways you can install or run NATS:

* [Command Line](installation.md#getting-the-binary-from-the-command-line)
* [Docker](installation.md#installing-via-docker)
* [Kubernetes](nats-on-kubernetes/nats-kubernetes.md)
* [Package Manager](installation.md#installing-via-a-package-manager)
* [Release Zip](installation.md#downloading-a-release-build)
* [Development Build](installation.md#installing-from-the-source)

See also [installing the NATS client](clients.md#installing-the-nats-cli-tool)

## Supported operating systems and architectures

The NATS server officially supports the following platforms:

| Operating System | Architectures | Status |
|------------------|---------------|--------|
| Linux            | amd64, arm64  | Stable |
| Darwin (macOS)   | arm64         | Stable |
| Windows          | amd64, arm64  | Stable |

We build additional [OS/architecture combinations](https://github.com/nats-io/nats-server/releases) that are available on a best-effort, community-support basis.  

## Hardware requirements

The NATS server itself has minimal hardware requirements to support small edge devices, but can take advantage of more resources if available.

CPU should be considered in accepting TLS connections. After a network partition, every disconnected client will attempt to connect to a NATS server in the cluster simultaneously, so CPU on those servers will momentarily spike. When there are many clients this can be mitigated with reconnect jitter settings, and errors can be reduced with longer TLS timeouts, and scaling up cluster sizes.

We highly recommend testing to see if smaller, cheaper machines suffice for your workload - often they do! We suggest starting here and adjusting resources after load testing specific to your environment. When using cloud provider instance types make sure the node has a sufficient NIC to support the required bandwidth for the application needs.

For high throughput use cases, the network interface card (NIC) or the available bandwidth are often the bottleneck, so ensure the hardware or cloud provider instance types are sufficient for your needs.

### Core NATS

The tables below outline the **minimum number of cores and memory** for stable cluster performance with different combinations of publishers, subscribers, and message rates.  
Stability is defined as the system avoiding slowdowns or running out of memory.  
These tests were conducted inside containers with `GOMEMLIMIT` set to 90% of the memory allocation, utilizing a 2021-era CPU and SSD for JetStream storage.  
Note that these are **minimum configurations**, and actual production environments may require additional resources.

| Cluster Size | CPU cores | Memory | Subscribers | Publishers | Publish Rate msg/s | Total Message Rate msg/s|
| -----------: | --------: | -----: | ----------: | ---------: | -----------------: | ----------------------: |
|            1 |         1 | 32 MiB |           1 |        100 |               1000 |                 100,000 |
|            1 |         1 | 64 MiB |           1 |       1000 |                100 |                 100,000 |
|            3 |         1 | 32 MiB |           1 |       1000 |                100 |                 100,000 |
|            3 |         1 | 64 MiB |           1 |       1000 |                100 |                 100,000 |

### With JetStream

This table follows the same pattern, with published messages received by a stream using file storage. For a cluster size of three, the stream uses three replicas. Subscribers rely on a "pull consumer" for fetching messages.

| Cluster Size | CPU cores |  Memory | Subscribers | Publishers | Publish Rate msg/s | Total Message Rate msg/s |
| -----------: | --------: | ------: | ----------: | ---------: | -----------------: | -----------------------: |
|            1 |         1 |  32 MiB |           1 |         10 |                100 |                    1,000 |
|            1 |         1 |  32 MiB |           1 |        100 |                 10 |                    1,000 |
|            1 |         1 |  64 MiB |           1 |        100 |                100 |                   10,000 |
|            1 |         1 |  64 MiB |           1 |       1000 |                 10 |                   10,000 |
|            3 |         1 |  32 MiB |           1 |        100 |                 10 |                    1,000 |
|            3 |         1 |  64 MiB |           1 |        100 |                100 |                   10,000 |
|            3 |         1 |  64 MiB |           1 |       1000 |                 10 |                   10,000 |
|            3 |         1 | 256 MiB |           1 |       1000 |                100 |                  100,000 |

For **production deployment** of JetStream, we recommend starting with **at least 4 CPU cores and 8 GiB of memory** to reduce the risk of resource-related issues.

For recommendations on configuring limits in Kubernetes, see: https://github.com/nats-io/k8s/tree/main/helm/charts/nats#nats-container-resources

## Getting the binary from the command line

The simplest way to get the `nats-server` binary for your machine is to use the following shell command.

For example, to get the binary for version 2.11.6:

```shell
curl -fsSL https://binaries.nats.dev/nats-io/nats-server/v2@v2.11.6 | sh
```

To get the latest released version, use `@latest`. You can also use `@main` to get the tip, or use a tag, specific branch, or commit hash after the `@`.

## Installing via Docker

With Docker, you can install the server easily without scattering binaries and other artifacts on your system. The only pre-requisite is to [install docker](https://docs.docker.com/install).

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
```

More information on [containerized NATS is available here](running/nats_docker/).

## Installing via a Package Manager

On Windows, using [scoop.sh](https://scoop.sh):

```shell
scoop install main/nats-server
```

On Mac OS:

```shell
brew install nats-server
```

Arch Linux:

For Arch users, there is an [AUR package](https://aur.archlinux.org/packages/nats-server) that you can install with:

```shell
yay -S nats-server
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


## Downloading a Release Build

You can find the latest release of nats-server on [the nats-io/nats-server GitHub releases page](https://github.com/nats-io/nats-server/releases/).

From the releases page, copy the link to the release archive file of your choice and download it using `curl -L`.

For example, assuming version X.Y.Z of the server and a Linux AMD64:

```shell
curl -L https://github.com/nats-io/nats-server/releases/download/vX.Y.Z/nats-server-vX.Y.Z-linux-amd64.tar.gz -o nats-server.tar.gz
```

```shell
tar -xvzf nats-server.tar.gz
```

```shell
Archive:  nats-server.zip
   creating: nats-server-vX.Y.Z-linux-amd64/
...
```

and finally:

```shell
sudo cp nats-server-vX.Y.Z-linux-amd64/nats-server /usr/bin
```

## Installing From the Source

If you have [Go installed](https://go.dev/doc/install), installing the binary is easy:

```shell
go install github.com/nats-io/nats-server/v2@main
```

This mechanism will install a build of the [main](https://github.com/nats-io/nats-server) branch, which almost certainly will not be a released version. If you are a developer and want to play with the latest, this is the easiest way.

To test your installation (provided $GOPATH/bin is in your path) by typing `nats-server` which should output something like

```
[2397474] 2023/09/27 10:32:02.709019 [INF] Starting nats-server
[2397474] 2023/09/27 10:32:02.709165 [INF]   Version:  2.11.0-dev
[2397474] 2023/09/27 10:32:02.709182 [INF]   Git:      [not set]
[2397474] 2023/09/27 10:32:02.709185 [INF]   Name:     NDQU7SGA4ECW4PHL4KNBY42AFQEZDAPMMQZVSQDKGTARZI5JHJV6KO2N
[2397474] 2023/09/27 10:32:02.709187 [INF]   ID:       NDQU7SGA4ECW4PHL4KNBY42AFQEZDAPMMQZVSQDKGTARZI5JHJV6KO2N
[2397474] 2023/09/27 10:32:02.709795 [INF] Listening for client connections on 0.0.0.0:4222
[2397474] 2023/09/27 10:32:02.710173 [INF] Server is ready
```

## Building From the Source

We use goreleaser to build assets published on [GitHub releases](https://github.com/nats-io/nats-server/releases).  
Our builds are fully reproducible, so with Go installed, one can execute the following commands to build from source:
```
go install github.com/goreleaser/goreleaser/v2@latest

git clone git@github.com:nats-io/nats-server.git
cd nats-server
git checkout v2.12.0 
[[ `git status --porcelain` ]] && echo "Must have repo in clean state before building"

goreleaser release --skip=announce,publish,validate --clean -f .goreleaser.yml
```
And to verify SHASUMs against our release:
```
wget https://github.com/nats-io/nats-server/releases/download/v2.12.0/SHA256SUMS
diff --color --minimal --context=0 SHA256SUMS dist/SHA256SUMS
```
