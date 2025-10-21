# 在 Docker 中运行 Synadia Cloud (NGS) 叶子节点

本小教程将展示如何在本地 Docker 容器中运行 2 个 NATS 服务器，并通过 [Synadia Cloud 平台](https://cloud.synadia.com?utm_source=nats_docs&utm_medium=nats) 将它们相互连接。

NGS 是 NATS 的一个全球性的、受管理的 NATS 网络，你的本地容器将作为叶子节点连接到该网络。

首先，在 [https://cloud.synadia.com/](https://cloud.synadia.com?utm_source=nats_docs&utm_medium=nats) 上开一个免费账户。

登录后，进入 `default` NGS 账户（您可以在您的 Synadia Cloud 账户中管理多个隔离的 NGS 账户）。

在 `Settings` > `Limits` 中，将 `Leaf Nodes` 增加到 2。保存配置更改。
（您的免费账户最多可支持 2 个叶子连接，但初始配置仅允许使用 1 个连接。）

接下来，转到 `default` 账户下的 `Users` 部分，并创建两个用户：`red` 和 `blue`。
（用户是另一种可以用来隔离系统不同部分的方式，您可以为其自定义权限、数据访问、限制等。）

分别为这两个用户点选 `Get Connected` 、 `Download Credentials`。

现在，您应该在计算机上拥有两个文件：`default-red.creds` 和 `default-blue.creds`。

创建一个最小化的 NATS 服务器配置文件 `leafnode.conf`，它将适用于两个叶子节点：

```
leafnodes {
    remotes = [
        {
          url: "tls://connect.ngs.global"
          credentials: "ngs.creds"
        },
    ]
}
```

让我们启动第一个叶子节点（针对用户 `red`）：

```shell
docker run  -p 4222:4222 -v leafnode.conf:/leafnode.conf -v /etc/ssl/cert.pem:/etc/ssl/cert.pem -v default-red.creds:/ngs.creds  nats:latest -c /leafnode.conf
```

`-p 4222:4222` 将容器内的服务器端口 4222 映射到本地的端口 4222。
`-v leafnode.conf:/leafnode.conf` 将上面创建的配置文件挂载到容器内的 `/leafnode.conf` 位置。
`-v /etc/ssl/cert.pem:/etc/ssl/cert.pem` 将根证书安装到容器内，因为 `nats` 镜像本身不包含这些证书，而它们是验证 NGS 提供的 TLS 证书所必需的。
`-v default-red.creds:/ngs.creds` 将用户 `red` 的凭证安装到容器内的 `/ngs.creds` 位置。
`-c /leafnode.conf` 是传递给容器入口点（`nats-server`）的参数。

启动容器后，您应看到 NATS 服务器成功启动：
```
[1] 2024/06/14 18:03:51.810719 [INF] Server is ready
[1] 2024/06/14 18:03:52.075951 [INF] 34.159.142.0:7422 - lid:5 - Leafnode connection created for account: $G
[1] 2024/06/14 18:03:52.331354 [INF] 34.159.142.0:7422 - lid:5 - JetStream using domains: local "", remote "ngs"
```

现在启动第二个叶子节点，只需对命令进行两个小调整：

```shell
docker run  -p 4333:4222 -v leafnode.conf:/leafnode.conf -v /etc/ssl/cert.pem:/etc/ssl/cert.pem -v default-blue.creds:/ngs.creds  nats:latest -c /leafnode.conf
```

请注意，我们将端口绑定到本地的 `4333`（因为 `4222` 已被占用），并挂载了 `blue` 的凭证。

恭喜！您已经成功地将两个叶子节点连接到 NGS 全球网络。

尽管这是一个全球共享环境，但您的账户与别的流量完全隔离，反之亦然。

现在，让我们让连接到两个叶子节点的两个客户端互相通信。

首先，在用户 `red` 的叶子节点上启动一个简单的服务：

```shell
nats -s localhost:4222 reply docker-leaf-test "At {{Time}}, I received your request: {{Request}}"
```

然后，使用用户 `blue` 运行的叶子节点发送一条请求：

```shell
$ nats -s localhost:4333 request docker-leaf-test "Hello World"

At 8:15PM, I received your request: Hello World
```

恭喜！您刚刚将两个叶子节点连接到全球 NGS 网络，并使用它们发送请求和接收响应。

您的消息与其他数百万条消息一起被透明地路由，但除了您的 Synadia 云账户之外，任何人都无法看到你的消息。


### 相关且有用的：
 *  GitHub 上的 [NATS 服务器官方 Docker 镜像](https://github.com/nats-io/nats-docker) 和 [issues](https://github.com/nats-io/nats-docker/issues)
 * [DockerHub 上的 `nats` 镜像](https://hub.docker.com/_/nats)
 * [NATS CLI 工具](/using-nats/nats-tools/nats_cli/) 和 [`nats bench`](/using-nats/nats-tools/nats_cli/natsbench)
 * [叶子节点配置](/running-a-nats-service/configuration/leafnodes)