# Process Signaling

On Unix systems, the NATS Streaming Server responds to the following signals:

| Signal          | Result                                |
| --------------- | ------------------------------------- |
| SIGKILL         | Kills the process immediately         |
| SIGINT, SIGTERM | Stops the server gracefully           |
| SIGUSR1         | Reopens the log file for log rotation |

The `nats-streaming-server` binary can be used to send these signals to running NATS Streaming Servers using the `-sl` flag:

```sh
# Reopen log file for log rotation
nats-streaming-server -sl reopen

# Stop the server
nats-streaming-server -sl quit
```

If there are multiple `nats-streaming-server` processes running, specify a PID:

```sh
nats-streaming-server -sl quit=<pid>
```

See the [Windows Service](#windows-service) section for information on signaling the NATS Streaming Server on Windows.
