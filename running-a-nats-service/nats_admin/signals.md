# Signals

## Command Line

On Unix systems, the NATS server responds to the following signals.  
You can send these using the standard Unix `kill` command, or use the `nats-server --signal` command for convenience.

| nats-server command | Unix Signal | Description                                                    |
| :------------------ | :---------- | :------------------------------------------------------------- |
| `--signal ldm`      | `SIGUSR2`   | Graceful shutdown (evicts clients gradually) \([lame duck mode](lame_duck_mode.md)\) |
| `--signal quit`     | `SIGINT`    | Stops the server gracefully                                    |
| `--signal term`     | `SIGTERM`   | Stops the server gracefully                                    |
| `--signal stop`     | `SIGKILL`   | Kills the process immediately                                  |
| `--signal reload`   | `SIGHUP`    | Reloads server configuration file                              |
| `--signal reopen`   | `SIGUSR1`   | Reopens the log file for log rotation                          |
| _(kill only)_       | `SIGQUIT`   | Kills the process immediately and performs a [stack dump](https://pkg.go.dev/os/signal#hdr-Default_behavior_of_signals_in_Go_programs)         |

### Usage

To send a signal to a running nats-server:

```shell
nats-server --signal <command>
```

For example, to gracefully stop the server with lame duck mode:

```shell
nats-server --signal ldm
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
