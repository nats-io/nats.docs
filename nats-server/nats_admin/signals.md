# Signals

On Unix systems, the NATS server responds to the following signals:

| Signal | Result |
| :--- | :--- |
| `SIGKILL` | Kills the process immediately |
| `SIGQUIT` | Kills the process immediately and performs a core dump |
| `SIGINT` | Stops the server gracefully |
| `SIGTERM` | Stops the server gracefully |
| `SIGUSR1` | Reopens the log file for log rotation |
| `SIGHUP` | Reloads server configuration file |
| `SIGUSR2` | Stops the server after evicting all clients \(lame duck mode\) |

The `nats-server` binary can be used to send these signals to running NATS servers using the `-sl` flag:

```bash
# Quit the server
nats-server --signal quit

# Stop the server
nats-server --signal stop

# Reopen log file for log rotation
nats-server --signal reopen

# Reload server configuration
nats-server --signal reload

# Lame duck mode server configuration
nats-server --signal ldm
```

If there are multiple `nats-server` processes running, or if `pgrep` isn't available, you must either specify a PID or the absolute path to a PID file:

```bash
nats-server --signal stop=<pid>
```

```bash
nats-server --signal stop=/path/to/pidfile
```

See the [Windows Service](../running/windows_srv.md) section for information on signaling the NATS server on Windows.

