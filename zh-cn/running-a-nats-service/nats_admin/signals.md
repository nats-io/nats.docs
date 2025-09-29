# 信号

## 命令行

在 Unix 系统上，NATS 服务器会响应以下信号：

| Signal    | Result                                                         |
| :-------- | :------------------------------------------------------------- |
| `SIGKILL` | 立即终止进程                                  |
| `SIGQUIT` | 立即终止进程并生成核心转储（core dump）         |
| `SIGINT`  | 优雅地停止服务器                                    |
| `SIGTERM` | 优雅地停止服务器                                    |
| `SIGUSR1` | 重新打开日志文件以进行日志轮转                          |
| `SIGHUP`  | 重新加载服务器配置文件                              |
| `SIGUSR2` | 在驱逐所有客户端后停止服务器（跛脚鸭模式）

`nats-server` 二进制文件可用于通过 `--signal`/`-sl` 标志向正在运行的 NATS 服务器发送这些信号。它支持以下命令：

| Command  | Signal    |
| :------- | :-------- |
| `stop`   | `SIGKILL` |
| `quit`   | `SIGINT`  |
| `term`   | `SIGTERM` |
| `reopen` | `SIGUSR1` |
| `reload` | `SIGHUP`  |
| `ldm`    | `SIGUSR2` |

### 优雅地停止服务器

```shell
nats-server --signal quit
```

### 强制停止服务器

```shell
nats-server --signal stop
```

### 启用“跛脚鸭模式”停止服务器

```shell
nats-server --signal ldm
```

### 重新打开日志文件以进行日志轮转

```shell
nats-server --signal reopen
```

### 重新加载服务器配置

```shell
nats-server --signal reload
```

### 多个进程

如果有多个正在运行的 `nats-server` 进程，或者 `pgrep` 不可用，则必须指定一个 PID 或者 PID 文件的绝对路径：

```shell
nats-server --signal stop=<pid>
```

```shell
nats-server --signal stop=/path/to/pidfile
```

从 NATS v2.10.0 开始，可以使用通配符表达式匹配一个或多个进程 ID，例如：

```shell
nats-server --signal ldm=12*
```

## Windows

有关在 Windows 上向 NATS 服务器发送信号的信息，请参阅 [Windows 服务](../running/windows_srv.md) 部分。