# Signals

## Command Line

On Unix systems, the NATS server responds to the following signals:

| Signal    | Result                                                         |
| :-------- | :------------------------------------------------------------- |
| `SIGKILL` | Kills the process immediately                                  |
| `SIGQUIT` | Kills the process immediately and performs a core dump         |
| `SIGINT`  | Stops the server gracefully                                    |
| `SIGTERM` | Stops the server gracefully                                    |
| `SIGUSR1` | Reopens the log file for log rotation                          |
| `SIGHUP`  | Reloads server configuration file                              |
| `SIGUSR2` | Stops the server after evicting all clients \(lame duck mode\) |

The `nats-server` binary can be used to send these signals to running NATS servers using the `-sl` flag:

### Quit the server

```shell
nats-server --signal quit
```

### Stop the server

```shell
nats-server --signal stop
```

### Lame duck mode the server

```shell
nats-server --signal ldm
```

### Reopen log file for log rotation

```shell
nats-server --signal reopen
```

### Reload server configuration

```shell
nats-server --signal reload
```

### Multiple processes

If there are multiple `nats-server` processes running, or if `pgrep` isn't available, you must either specify a PID or the absolute path to a PID file:

```shell
nats-server --signal stop=<pid>
```

```shell
nats-server --signal stop=/path/to/pidfile
```

As of NATS v2.10.0, a glob expression can be used to match one or more process IDs, such as:

```shell
nats-server --signal ldm=12*
```

## Windows

See the [Windows Service](../running/windows_srv.md) section for information on signaling the NATS server on Windows.
