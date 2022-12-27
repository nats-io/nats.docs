# Windows Service

The NATS server supports running as a Windows service. In fact, this is the recommended way of running NATS on Windows. There is currently no installer; users should use `sc.exe` to install the service:

```shell
sc.exe create nats-server binPath= "%NATS_PATH%\nats-server.exe [nats-server flags]"
sc.exe start nats-server
```

The above will create and start a `nats-server` service. Note that the nats-server flags should be provided when creating the service. This allows for running multiple NATS server configurations on a single Windows server by using a 1:1 service instance per installed NATS server service. Once the service is running, it can be controlled using `sc.exe` or `nats-server.exe --signal`:

```shell
REM Reload server configuration
nats-server.exe --signal reload

REM Reopen log file for log rotation
nats-server.exe --signal reopen

REM Stop the server
nats-server.exe --signal stop
```

The above commands will default to controlling the `nats-server` service. If the service is another name, it can be specified:

```shell
nats-server.exe --signal stop=<service name>
```

For a complete list of signals, see [process signaling](../nats_admin/signals.md).

## Windows Service Specific Settings

### `NATS_STARTUP_DELAY` environment variable

The Windows service system requires communication with programs that run as Windows services. One important signal form the program is the initial "ready" signal, where the program informs Windows that it is running as expected.

By default `nats-server` allows itself 10 seconds to send this signal.
If the server is not ready after this time, the server will signal a failure to start.
This delay can be adjusted by setting the `NATS_STARTUP_DELAY` environment variable to a suitable duration (e.g. "20s" for 20 seconds, "1m" for one minute).
This adjustment can be necessary in cases where NATS is correctly running from command-line, but the service fails to start in this timeframe.
