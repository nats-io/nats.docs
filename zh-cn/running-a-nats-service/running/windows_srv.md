# Windows 服务

NATS 服务器支持以 Windows 服务 的形式运行。事实上，这是在 Windows 上运行 NATS 的推荐方式。目前尚无安装程序；用户应使用 `sc.exe` 来安装服务：

```shell
sc.exe create nats-server binPath= "%NATS_PATH%\nats-server.exe [nats-server flags]"
sc.exe start nats-server
```

上述命令将创建并启动一个名为 `nats-server` 的服务。请注意，在创建服务时就应提供 `nats-server` 的标志。这允许通过为每个已安装的 NATS 服务实例使用一对一的服务实例，在单个 Windows 服务器上运行多个 NATS 服务器配置。一旦服务运行，可以使用 `sc.exe` 或 `nats-server.exe --signal` 进行控制：

```shell
REM Reload server configuration
nats-server.exe --signal reload

REM Reopen log file for log rotation
nats-server.exe --signal reopen

REM Stop the server
nats-server.exe --signal stop
```

上述命令默认会控制名为 `nats-server` 的服务。如果服务名称不同，可以指定：

```shell
nats-server.exe --signal stop=<服务名称 >
```

有关信号的完整列表，请参阅 [进程信号](../nats_admin/signals.md)。

## 权限

在上述示例中，默认用户将是 `System`，该用户具有本地管理员权限，并对磁盘上的几乎所有文件都有写入权限。

如果您更改了服务用户（例如改为权限更受限的 `NetworkService`），请确保已设置相应的权限。服务器至少需要对配置文件具有读取权限，以及在使用 Jetstream 时，对 JetStream 存储目录具有写入权限。

```shell
sc config "nats-server" obj= "NT AUTHORITY\NetworkService" password= ""
```

当未配置日志文件时，Nats-server 将向默认控制台写入日志条目。并非所有用户都被允许输出日志到控制台（例如，`NetworkService` 用户不允许）。

{% hint style="info" %}
为方便调试，建议运行带有显式日志文件的 NATS 服务，并仔细检查已配置用户的写入权限。
{% endhint %}

```shell
sc.exe create nats-server binPath= "%NATS_PATH%\nats-server.exe --log C:\temp\nats-server.log [其他 flags ]"
```

## Windows 服务 特定设置

### 环境变量 `NATS_STARTUP_DELAY`

Windows 服务系统需要与作为 Windows 服务 运行的程序进行通信。程序向服务系统发的一个重要信号是初始的“就绪”信号，即程序通知 Windows 它正在按预期运行。

默认情况下，`nats-server` 给自己最多 10 秒来发送此信号。如果服务器在此时间之后仍未准备好，服务器将发出启动失败的信号。此延迟可以通过将环境变量 `NATS_STARTUP_DELAY` 设置为合适的持续时间（例如，“20s”表示 20 秒，“1m”表示 1 分钟）来调整。

**请注意**
* 为使环境变量 `NATS_STARTUP_DELAY` 对 NATS 服务 可用，建议将其设置为 系统变量。
* `NATS_STARTUP_DELAY=30s` 将使 NATS 服务器等待**最多 30 秒**，但只要服务器准备好接受连接，就会报告服务为 RUNNING。要**测试**延长的启动超时时间，您可能需要减慢服务器启动速度，例如通过使用非常大的流（数十 GB）或通过将 Jetstream 存储放置在缓慢的网络设备上。

在某些情况下，NATS 从命令行正确运行，但恢复 JetStream 流状态和连接到其集群对等节点所需的时间超过 10 秒时，可能需要进行此调整。