# 安装 NATS 服务器

NATS 的理念是简单。安装只需解压一个压缩文件并将二进制文件复制到合适的目录；您也可以使用自己喜欢的软件包管理器。以下是安装或运行 NATS 的不同方法列表：

* [命令行](installation.md#getting-the-binary-from-the-command-line)
* [Docker](installation.md#installing-via-docker)
* [Kubernetes](nats-on-kubernetes/nats-kubernetes.md)
* [软件包管理器](installation.md#installing-via-a-package-manager)
* [Release Zip](installation.md#downloading-a-release-build)
* [Development Build](installation.md#installing-from-the-source)

另请参阅 [安装 NATS 客户端](clients.md#installing-the-nats-cli-tool)

## 支持的操作系统和架构

下表列出了当前支持的 NATS 服务器构建组合，包括操作系统和架构。

| Operating System | Architectures                                  | Status       |
| ---------------- | ---------------------------------------------- | ------------ |
| Darwin (macOS)   | amd64, arm64                                   | Stable       |
| Linux            | amd64, 386, arm6, arm7, arm64, mips64le, s390x | Stable       |
| Windows          | amd64, 386, arm6, arm7, arm64                  | Stable       |
| FreeBSD          | amd64                                          | Stable       |
| NetBSD           | -                                              | Experimental |
| IBM z/OS         | -                                              | Experimental |

_注意：并非所有以下安装方法都支持所有操作系统和架构组合。_

## 硬件要求

NATS 服务器本身对硬件要求很低，可以支持小型边缘设备，但如果有更多资源可用，也可以充分利用这些资源。

CPU 应考虑接受 TLS 连接。在网络分区后，每个断开连接的客户端都会尝试同时连接到集群中的 NATS 服务器，因此这些服务器上的 CPU 在短时间内会激增。当有大量客户端时，可以通过设置重新连接抖动（reconnect jitter）来缓解此问题，通过延长 TLS 超时时间来减少错误，并通过扩大集群规模来解决。

我们强烈建议您进行测试，以确定较小、更便宜的机器是否足以满足您的工作负载需求——通常它们是可以的！我们建议从这里开始，并根据特定环境的负载测试调整资源。在使用云提供商实例类型时，请确保节点具有足够的网络接口卡（NIC）以支持应用程序所需的带宽。

对于高吞吐量用例，网络接口卡（NIC）或可用带宽通常是瓶颈，因此请确保硬件或云提供商实例类型能够满足您的需求。

### Core NATS

下表列出了在不同发布者、订阅者和消息速率组合下实现稳定的集群性能所需的**最小的核心数和内存**。  
我们将 稳定 定义为 不存在系统减速、内存耗尽的情况。  
这些测试是在容器内进行的，其中 `GOMEMLIMIT` 设置为内存分配的 90%，并使用 2021 年代的 CPU 和 SSD 作为 JetStream 存储。  
请注意，这些是**最低配置**，实际生产环境可能需要更多资源。

| 集群大小 | CPU 核心数 | 内存 | 订阅者数量 | 发布者数量 | 发布速率（消息/秒） | 总消息速率（消息/秒）|
| ---------: | --------: | -----: | ----------: | ---------: | -----------------: | ----------------------: |
|            1 |         1 | 32 MiB |           1 |        100 |               1000 |                 100,000 |
|            1 |         1 | 64 MiB |           1 |       1000 |                100 |                 100,000 |
|            3 |         1 | 32 MiB |           1 |       1000 |                100 |                 100,000 |
|            3 |         1 | 64 MiB |           1 |       1000 |                100 |                 100,000 |

### 使用 JetStream

此表格遵循相同的模式，其中发布的消息由流接收并使用文件存储。对于大小为三的集群，该流使用三个副本。订阅者依赖于“拉取消费者”（pull consumer）来获取消息。

| 集群大小 | CPU 核心数 |  内存 | 订阅者数量 | 发布者数量 | 发布速率（消息/秒） | 总消息速率（消息/秒） |
| ---------: | --------: | ------: | ----------: | ---------: | -----------------: | -----------------------: |
|            1 |         1 |  32 MiB |           1 |         10 |                100 |                    1,000 |
|            1 |         1 |  32 MiB |           1 |        100 |                 10 |                    1,000 |
|            1 |         1 |  64 MiB |           1 |        100 |                100 |                   10,000 |
|            1 |         1 |  64 MiB |           1 |       1000 |                 10 |                   10,000 |
|            3 |         1 |  32 MiB |           1 |        100 |                 10 |                    1,000 |
|            3 |         1 |  64 MiB |           1 |        100 |                100 |                   10,000 |
|            3 |         1 |  64 MiB |           1 |       1000 |                 10 |                   10,000 |
|            3 |         1 | 256 MiB |           1 |       1000 |                100 |                  100,000 |

对于**生产部署**的 JetStream，我们建议**至少 4 CPU 核心和 8 GiB 内存**，以降低资源相关问题带来的风险

关于在 Kubernetes 中配置资源限制的建议，请参阅：https://github.com/nats-io/k8s/tree/main/helm/charts/nats#nats-container-resources

## 通过命令行获取二进制文件

获取适用于您机器的`nats-server`二进制文件的最简单方法是使用以下shell命令。

例如，要获取版本2.11.6的二进制文件：

```shell
curl -fsSL https://binaries.nats.dev/nats-io/nats-server/v2@v2.11.6 | sh
```

要获取最新发布的版本，请使用`@latest`。您也可以使用`@main`获取最新开发版本，或在`@`后使用标签、特定分支或提交哈希。

## 通过Docker安装

使用Docker，您可以轻松安装服务器，而不会在系统上散落二进制文件和其他构件。唯一的先决条件是[安装docker](https://docs.docker.com/install)。

```shell
docker pull nats:latest
```

在Docker上运行NATS：

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

更多关于 [容器化NATS的信息可在此处获取](running/nats_docker/)。

## 通过包管理器安装

在Windows上，使用[scoop.sh](https://scoop.sh)：

```shell
scoop install main/nats-server
```

在Mac OS上：

```shell
brew install nats-server
```

Arch Linux：

对于Arch用户，有一个[AUR包](https://aur.archlinux.org/packages/nats-server)，您可以通过以下方式安装：

```shell
yay -S nats-server
```

要测试您的安装（假设可执行文件对您的shell可见）：

输入`nats-server`应该会输出类似以下内容

```
[41634] 2019/05/13 09:42:11.745919 [INF] Starting nats-server version 2.*.*
[41634] 2019/05/13 09:42:11.746240 [INF] Listening for client connections on 0.0.0.0:4222
...
[41634] 2019/05/13 09:42:11.746249 [INF] Server id is NBNYNR4ZNTH4N2UQKSAAKBAFLDV3PZO4OUYONSUIQASTQT7BT4ZF6WX7
[41634] 2019/05/13 09:42:11.746252 [INF] Server is ready
```

## 下载发行版构建

您可以在[nats-io/nats-server GitHub发布页面](https://github.com/nats-io/nats-server/releases/)上找到nats-server的最新发布版本。

从发布页面复制您选择的发布归档文件的链接，并使用`curl -L`下载。

例如，假设服务器版本为X.Y.Z，且为Linux AMD64架构：

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

最后：

```shell
sudo cp nats-server/nats-server-vX.Y.Z-linux-amd64/nats-server /usr/bin
```

## 从源码安装

如果您已[安装Go](https://go.dev/doc/install)，安装二进制文件很简单：

```shell
go install github.com/nats-io/nats-server/v2@main
```

这种方式将安装[main](https://github.com/nats-io/nats-server)分支的构建版本，它几乎肯定不是已发布的版本。如果您是开发人员并想体验最新功能，这是最简单的方法。

通过输入`nats-server`来测试您的安装（假设 $GOPATH/bin 在您的 PATH 中），应该会输出类似以下内容

```
[2397474] 2023/09/27 10:32:02.709019 [INF] Starting nats-server
[2397474] 2023/09/27 10:32:02.709165 [INF]   Version:  2.11.0-dev
[2397474] 2023/09/27 10:32:02.709182 [INF]   Git:      [not set]
[2397474] 2023/09/27 10:32:02.709185 [INF]   Name:     NDQU7SGA4ECW4PHL4KNBY42AFQEZDAPMMQZVSQDKGTARZI5JHJV6KO2N
[2397474] 2023/09/27 10:32:02.709187 [INF]   ID:       NDQU7SGA4ECW4PHL4KNBY42AFQEZDAPMMQZVSQDKGTARZI5JHJV6KO2N
[2397474] 2023/09/27 10:32:02.709795 [INF] Listening for client connections on 0.0.0.0:4222
[2397474] 2023/09/27 10:32:02.710173 [INF] Server is ready
```

## 从源码构建

我们使用 goreleaser 来构建发布在 [GitHub releases](https://github.com/nats-io/nats-server/releases) 上的资源。
我们的构建是完全可重复的，因此在安装了 Go 之后，可以执行以下命令从源码构建：

```
go install github.com/goreleaser/goreleaser/v2@latest

git clone git@github.com:nats-io/nats-server.git
cd nats-server
git checkout v2.12.0 
[[ `git status --porcelain` ]] && echo "Must have repo in clean state before building"

goreleaser release --skip=announce,publish,validate --clean -f .goreleaser.yml
```

要对我们的发布版本验证 SHASUM，可以执行：

```
wget https://github.com/nats-io/nats-server/releases/download/v2.12.0/SHA256SUMS
diff --color --minimal --context=0 SHA256SUMS dist/SHA256SUMS
```