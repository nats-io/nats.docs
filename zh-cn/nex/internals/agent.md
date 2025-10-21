# Nex Agent

**Nex Agent** 负责管理 _单个_ 工作负载。通过代理 （agent）的 API，节点可以请求部署、取消部署某个工作负载，或者（对于函数）触发该工作负载。

在代理内部，有定义如何管理该工作负载的逻辑。我们在 Go 代码中使用了一个提供者（provider）代码架构，这使我们能够轻松扩展和增强所支持的工作负载类型。

目前，对不同类型的工作负载的处理方式如下：

* **elf**（64位 Linux）_服务_ - 部署工作负载时，此二进制文件作为代理的子进程执行。来自部署请求的环境变量会在解密后传递给该二进制文件。
* **JavaScript** _函数_ - 此函数在部署时处于空闲状态，然后根据部署请求中定义的一组配置刺激源被触发。例如，您可以定义一组主题和通配符，用于触发 JavaScript 函数。
* **WebAssembly** _函数_ - 此函数在部署时处于空闲状态，然后根据配置的刺激源被触发（声明方式与所有函数类型相同）。

所有函数类型的工作负载都必须依赖于 [宿主服务](../host_services/)，以便与键值存储桶、发布/请求、对象存储等受管资源进行交互。

## 启动代理

代理进程是由 [此处的 Go 代码](https://github.com/synadia-io/nex/tree/main/agent) 编译的 `nex-agent` 二进制文件。此二进制文件既 _不会_ 由 Node 进程直接执行，也不会由开发人员或用户启动。

代理位于 [根文件系统](rootfs.md) 中。当您启动一个 Firecracker 虚拟机时，这并不像执行 Docker 的 `run` 命令一样简单。启动 Firecracker VM 更像是启动一个操作系统。为了告诉 Linux 操作系统在启动时（例如，当 Firecracker VM 启动时）应该启动哪些进程，我们需要一个 [init](https://en.wikipedia.org/wiki/Init) 系统。

Init 系统可能会让人感到困惑和难以理解。从本质上讲，Linux 中的 `init` 进程就是在启动过程中最先启动的第一个进程。根据您使用的 `init` 应用程序不同，您需要以不同的方式配置启动服务和其他启动时的活动。

出于一些原因（这里不再赘述），让 `nex-agent` 成为 init 进程并不是一个好主意。相反，我们希望 init 进程来启动并管理 `nex-agent`。

为此，我们正在使用 [OpenRC](https://github.com/OpenRC/openrc/blob/master/user-guide.md)。代理使用的默认 OpenRC 配置如下：

```
#!/sbin/openrc-run

name=$RC_SVCNAME
description="Nex Agent"
supervisor="supervise-daemon"
command="/usr/local/bin/agent"
pidfile="/run/agent.pid"
command_user="nex:nex"
output_log="/home/nex/nex.log"
error_log="/home/nex/err.log"

depend() {
	after net.eth0
}
```

此脚本定义了我们的 OpenRC _服务_ 的基本属性。服务名为“Nex Agent”，以用户 `nex` 和组 `nex` 的身份运行，可执行文件为 `/usr/local/bin/agent`。需要注意的是，该服务必须在 `net.eth0` 设备初始化之后才能启动。

有关如何把代理物理放置到根文件系统中的更多信息，请继续阅读下一节，我们将介绍根文件系统。