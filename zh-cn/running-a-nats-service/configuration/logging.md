# 日志记录

## 配置日志记录

NATS 服务器提供了各种日志选项，你可以通过命令行或配置文件设置。

### 命令行选项

支持以下日志操作：

```
-l, --log FILE                   File to redirect log output.
-T, --logtime                    Timestamp log entries (default is true).
-s, --syslog                     Enable syslog as log method.
-r, --remote_syslog              Syslog server address.
-D, --debug                      Enable debugging output.
-V, --trace                      Trace the raw protocol.
-VV                              Verbose trace (traces system account as well)
-DV                              Debug and Trace.
-DVV                             Debug and verbose trace (traces system account as well)
```

#### 调试和追踪

`-DV` 选项为服务器启用追踪和调试。

```bash
nats-server -DV -m 8222 -user foo -pass bar
```

#### 日志文件重定向

```bash
nats-server -DV -m 8222 -l nats.log
```

#### 时间戳

如果 `-T false` 则日志条目不带时间戳。默认为 true。

#### 系统日志

你可以使用 `UDP` 配置系统日志：

```bash
nats-server -r udp://localhost:514
```

或 `syslog:`

```bash
nats-server -r syslog://<hostname>:<port>
```

例如：

```bash
syslog://logs.papertrailapp.com:26900
```

### 使用配置文件

所有这些设置也能在配置文件中使用。

```
debug:   false
trace:   true
logtime: false
logfile_size_limit: 1GB
logfile_max_num: 100
log_file: "/tmp/nats-server.log"
```

### 日志轮转

在 NATS Server v2.1.4 中引入，当大小大于 `logfile_size_limit` 中设置的配置限制时，NATS 允许自动轮转日志文件。备份文件将与原始日志文件同名，后缀为 .yyyy.mm.dd.hh.mm.ss.micros。

你还可以将 NATS 包含的机制与 [logrotate](https://github.com/logrotate/logrotate) 结合使用，这是一个简单的标准 Linux 实用程序，可在大多数发行版（如 Debian、Ubuntu、RedHat (CentOS) 等）上用于轮转日志，使日志轮转变得简单。

例如，你可以配置 `logrotate`：

```
/path/to/nats-server.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    postrotate
        kill -SIGUSR1 `cat /var/run/nats-server.pid`
    endscript
}
```

第一行指定后续行将应用的位置。

文件的其余部分指定日志将每天轮转（"daily" 选项）并且将保留 30 个旧副本（"rotate" 选项）。其他选项在 [logrotate 文档](https://linux.die.net/man/8/logrotate) 中有描述。

"postrotate" 部分告诉 NATS 服务器在轮转完成后重新加载日志文件。命令 `` `kill -SIGUSR1 ``cat /var/run/nats-server.pid\`\`\` 不会杀死 NATS 服务器进程，而是向其发送信号，使其重新加载日志文件。这将导致新请求记录到刷新的日志文件中。

`/var/run/nats-server.pid` 文件是 NATS 服务器存储主进程 pid 的位置。

## 一些额外说明

* NATS 服务器在详细模式下将记录 `UNSUB` 消息的接收，但这并不表示订阅已消失，仅表示消息已收到。日志中的 `DELSUB` 消息可用于确定实际订阅移除何时发生。
