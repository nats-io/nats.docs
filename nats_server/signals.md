## Process Signaling

On Unix systems, the NATS server responds to the following signals:

| Signal  | Result |
| :--- | :--- |
| SIGKILL | Kills the process immediately |
| SIGINT  | Stops the server gracefully |
| SIGUSR1 | Reopens the log file for log rotation |
| SIGHUP  | Reloads server configuration file |
| SIGUSR2  | Stops the server after evicting all clients (lame duck mode) |

The `nats-server` binary can be used to send these signals to running NATS servers using the `-sl` flag:

```sh
# Quit the server
nats-server -sl quit

# Stop the server
nats-server -sl stop

# Reopen log file for log rotation
nats-server -sl reopen

# Reload server configuration
nats-server -sl reload

# Lame duck mode server configuration
nats-server -sl ldm
```

If there are multiple `nats-server` processes running, or if `pgrep` isn't available, you must either specify a PID or the absolute path to a PID file:

```sh
nats-server -sl stop=<pid>
```

```sh
nats-server -sl stop=/path/to/pidfile
```

See the [Windows Service](windows_srv.md) section for information on signaling the NATS server on Windows.