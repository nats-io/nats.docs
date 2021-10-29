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

