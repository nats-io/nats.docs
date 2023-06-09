---
title: Server
description: Server download/install guide.
---

# {% $markdoc.frontmatter.title %}

The current version is **v{% version name="server" /%}**.

The server is written in [Go](https://go.dev) and compiles to a ~16MB native binary. A notable feature is the [sparse set of dependencies](https://github.com/nats-io/nats-server/blob/main/go.mod) the server relies on.

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

Standalone builds for all supported operating systems and CPU architectures are available as downloadable assets on the [GitHub releases page](https://github.com/nats-io/nats-server/releases/). For convenience, here is a matrix of with direct links:

|          | Linux                                                | macOS                                      | Windows                                    | FreeBSD                                            |
| :------- | :--------------------------------------------------- | :----------------------------------------- | :----------------------------------------- | :------------------------------------------------- |
| amd64    | [zip][linux-amd64-zip], [tgz][linux-amd64-tgz]       | [zip][mac-amd64-zip], [tgz][mac-amd64-tgz] | [zip][win-amd64-zip], [tgz][win-amd64-tgz] | [zip][freebsd-amd64-zip], [tgz][freebsd-amd64-tgz] |
| arm64    | [zip][linux-arm64-zip], [tgz][linux-arm64-tgz]       | [zip][mac-arm64-zip], [tgz][mac-arm64-tgz] | [zip][win-arm64-zip], [tgz][win-arm64-tgz] | -                                                  |
| arm6     | [zip][linux-arm6-zip], [tgz][linux-arm6-tgz]         | -                                          | [zip][win-arm6-zip], [tgz][win-arm6-tgz]   | -                                                  |
| arm7     | [zip][linux-arm7-zip], [tgz][linux-arm7-tgz]         | -                                          | [zip][win-arm7-zip], [tgz][win-arm7-tgz]   | -                                                  |
| 386      | [zip][linux-386-zip], [tgz][linux-386-tgz]           | -                                          | [zip][win-386-zip], [tgz][win-386-tgz]     | -                                                  |
| mips64le | [zip][linux-mips64le-zip], [tgz][linux-mips64le-tgz] | -                                          | -                                          | -                                                  |
| s390x    | [zip][linux-s390x-zip], [tgz][linux-s390x-tgz]       | -                                          | -                                          | -                                                  |

[linux-amd64-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-amd64.tar.gz
[linux-amd64-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-amd64.zip
[linux-386-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-386.tar.gz
[linux-386-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-386.zip
[linux-arm6-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-arm6.tar.gz
[linux-arm6-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-arm6.zip
[linux-arm7-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-arm7.tar.gz
[linux-arm7-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-arm7.zip
[linux-arm64-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-arm64.tar.gz
[linux-arm64-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-arm64.zip
[linux-mips64le-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-mips64le.tar.gz
[linux-mips64le-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-mips64le.zip
[linux-s390x-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-s390x.tar.gz
[linux-s390x-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-linux-s390x.zip
[mac-amd64-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-darwin-amd64.tar.gz
[mac-amd64-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-darwin-amd64.zip
[mac-arm64-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-darwin-arm64.tar.gz
[mac-arm64-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-darwin-arm64.zip
[win-amd64-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-amd64.tar.gz
[win-amd64-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-amd64.zip
[win-386-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-386.tar.gz
[win-386-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-386.zip
[win-arm6-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-arm6.tar.gz
[win-arm6-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-arm6.zip
[win-arm7-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-arm7.tar.gz
[win-arm7-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-arm7.zip
[win-arm64-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-arm64.tar.gz
[win-arm64-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-windows-arm64.zip
[freebsd-amd64-tgz]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-freebsd-amd64.tar.gz
[freebsd-amd64-zip]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-freebsd-amd64.zip

{% callout %}
Need a build for a different operating system or architecture? Feel free to [open an issue](https://github.com/nats-io/nats-server/issues) to propose it be integrated in the release process.
{% /callout %}

## Packages

{% callout type="warning" %}
The `nats-server` package is available in a variety of repositories, however
they may be significantly outdated. [Repology](https://repology.org/project/nats-server/versions) is a useful tool to check whether the version is up-to-date for a handful of common package repositories and distribution versions.
{% /callout %}

### Linux

Official builds are packaged for Debian and Red Hat-based distributions.

|          | Debian              | RedHat              |
| :------- | :------------------ | :------------------ |
| amd64    | [deb][deb-amd64]    | [rpm][rpm-amd64]    |
| arm64    | [deb][deb-arm64]    | [rpm][rpm-arm64]    |
| arm6     | [deb][deb-arm6]     | [rpm][rpm-arm6]     |
| arm7     | [deb][deb-arm7]     | [rpm][rpm-arm7]     |
| 386      | [deb][deb-386]      | [rpm][rpm-386]      |
| mips64le | [deb][deb-mips64le] | [rpm][rpm-mips64le] |
| s390x    | [deb][deb-s390x]    | [rpm][rpm-s390x]    |

[deb-amd64]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-amd64.deb
[deb-arm64]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-arm64.deb
[deb-arm6]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-arm6.deb
[deb-arm7]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-arm7.deb
[deb-386]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-386.deb
[deb-mips64le]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-mips64le.deb
[deb-s390x]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-s390x.deb
[rpm-amd64]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-amd64.rpm
[rpm-arm64]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-arm64.rpm
[rpm-arm6]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-arm6.rpm
[rpm-arm7]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-arm7.rpm
[rpm-386]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-386.rpm
[rpm-mips64le]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-mips64le.rpm
[rpm-s390x]: https://github.com/nats-io/nats-server/releases/download/v2.9.17/nats-server-v2.9.17-s390x.rpm

#### Debian/Ubuntu

Install it using `apt install` with the appropriate permissions (i.e. `sudo`).

```sh
apt install ./nats-server-<version>-<arch>.deb
```

#### CentOS/RedHat

Install it using `rpm` with the appropriate permissions (i.e. `sudo`).

```sh
rpm -i ./nats-server-<version>-<arch>.rpm
```

### macOS

#### Homebrew

Homebrew is updated via community contribution, but the Formulae is often updated the same day that a new release is made.

```sh
brew install nats-server
```

### Windows

#### Scoop

```sh
scoop bucket add main
scoop install main/nats-server
```

## Docker

[Official Docker images](https://hub.docker.io/_/nats) are availble. To run the server locally and expose it for client connections, run the following command.

```sh
docker run -p 4222:4222 -ti nats:{% version name="server" /%}
```

### Nightly builds

[Synadia](https://synadia.com) hosts repositories for nightly Docker image builds off the `main` branch and the `dev` branch. The `main` branch tracks the next _patch_ release, e.g. 2.9.17 &rarr; 2.9.18, while the `dev` branch tracks the next _minor_ release, e.g. 2.9.x &rarr; 2.10.0.

#### Main

```sh
docker run -p 4222:4222 -ti synadia/nats-server:nightly-main
```

#### Dev

```sh
docker run -p 4222:4222 -ti synadia/nats-server:nightly
```

## Kubernetes

A [Helm chart](https://github.com/nats-io/k8s) is available to delpoy to Kubernetes. This can be accomplished by registering the repo with Helm and ensuring it is up-to-date.

```sh
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
```

Prior to installing, refer to the [configuration options](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#configuration) available for the `values.yaml` file. To install the chart, run the following command.

```sh
helm install nats nats/nats -f values.yaml
```

## Source

Building from source requires a recent version of the [Go compiler](https://go.dev/dl/). Once installed, it can be built and installed from source using the `go` tool.

```sh
go get github.com/nats-io/nats-server/v2
```
