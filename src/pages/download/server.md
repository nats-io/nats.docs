---
title: Server
description: Server download/install guide.
---

# {% $markdoc.frontmatter.title %}

The current version is **v{% version name="server" /%}**.

The server is written in [Go](https://go.dev) and builds as a ~16MB native binary. A notable feature is the [sparse set of dependencies](https://github.com/nats-io/nats-server/blob/main/go.mod) the server relies on.

There are several ways to download and install the NATS server depending on the environment you are targeting.

- [Builds](#builds)
- [Packages](#packages)
- [Docker](#docker)
- [Kubernetes](#kubernetes)
- [Source](#source)

{% callout %}
If you are looking to design and run a production deployment of NATS, refer to the [deployment](/deployment/overview) section.
{% /callout %}

## Builds

Standalone builds for all supported operating systems and CPU architectures are available on the [GitHub releases page](https://github.com/nats-io/nats-server/releases/).

For reference, the following operating systems and architectures are supported:

- Linux
  - 386
  - amd64
  - arm6
  - arm7
  - mips64le
  - s390x
- Windows
  - 386
  - amd64
  - arm6
  - arm7
  - arm64
- macOS
  - amd64
  - arm64
- FreeBSD
  - amd64

{% callout %}
Need a build for a different operating system or architecture? Feel free to [open an issue](https://github.com/nats-io/nats-server/issues) to propose it be integrated in the release process.
{% /callout %}

## Packages

- [Linux](#linux)
- [macOS](#macos)
- [Windows](#windows)

### Linux

#### Debian/Ubuntu

```sh
apt-get install nats-server
```

#### CentOS/RedHat

```sh
yum install nats-server
```

#### Arch

```sh
yay nats-server
```

### macOS

#### Homebrew

```sh
brew install nats-server
```

### Windows

#### Choco

```sh
choco install nats-server
```

## Docker

[Official Docker images](https://hub.docker.io/_/nats) are availble. To run the server locally and expose it for client connections, run the following command.

```sh
docker run -p 4222:4222 -ti nats:{% version name="server" /%}
```

## Kubernetes

A [Helm chart](https://github.com/nats-io/k8s) is available to delpoy to Kubernetes. This can be accomplished by registering the repo with Helm and ensuring it is up-to-date.

```sh
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
```

Prior to installing, refer to the [configuration options](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#configuration) available for the `values.yaml` file. To install the chart,

```sh
helm install nats nats/nats -f values.yaml
```

## Source

Building from source requires a recent version of the [Go compiler](https://go.dev/dl/). Once installed, it can be built and installed from source using the `go` tool.

```sh
go get github.com/nats-io/nats-server/v2
```
