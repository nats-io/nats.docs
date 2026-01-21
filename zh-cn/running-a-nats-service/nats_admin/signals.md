# 信号

## 命令行

在 Unix 系统上，NATS 服务器会响应以下信号。  
您可以使用标准 Unix `kill` 命令发送这些信号，或使用 `nats-server --signal` 命令以方便使用。

| nats-server command | Unix Signal | Description                       |
| :------------------ | :---------- | :------------------------------------------------------------- |
| `--signal ldm`      | `SIGUSR2`   | 优雅关闭（逐步驱逐客户端）\([跛脚鸭模式](lame_duck_mode.md)\) |
| `--signal quit`     | `SIGINT`    | 优雅地停止服务器                                    |
| `--signal term`     | `SIGTERM`   | 优雅地停止服务器                                    |
| `--signal stop`     | `SIGKILL`   | 立即终止进程                                  |
| `--signal reload`   | `SIGHUP`    | 重新加载服务器配置文件                              |
| `--signal reopen`   | `SIGUSR1`   | 重新打开日志文件以进行日志轮转                          |
| _(仅 kill)_       | `SIGQUIT`   | 立即终止进程并执行[堆栈转储](https://pkg.go.dev/os/signal#hdr-Default_behavior_of_signals_in_Go_programs)         |

### 用法

要向正在运行的 nats-server 发送信号：

```shell
nats-server --signal <command>
```

例如，使用跛脚鸭模式优雅停止服务器：

```shell
nats-server --signal ldm
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
