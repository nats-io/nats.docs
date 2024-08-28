# Windows Service

The NATS server supports running as a Windows service. In fact, this is the recommended way of running NATS on Windows. There is currently no installer; users should use `sc.exe` to install the service:

```shell
sc.exe create nats-server binPath= "%NATS_PATH%\nats-server.exe [nats-server flags]"
sc.exe start nats-server
```

The above will create and start a `nats-server` service. Note the nats-server flags should be provided when creating the service. This allows for the running multiple NATS server configurations on a single Windows server by using a 1:1 service instance per installed NATS server service. Once the service is running, it can be controlled using `sc.exe` or `nats-server.exe --signal`:

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

## Permissions
The default user in the above example will be `System`, which has local administrator permissions and write access to almost all files on disk. 

If you change the service user, e.g. to the more restricted `NetworkService`, make sure permissions have been set. The server at a minimum will need read access to the config file and when using Jetstream, write access to the JetStream store directory. 

```shell
sc config "nats-server" obj= "NT AUTHORITY\NetworkService" password= ""
```

Nats-server will write log entries to the default console when no log file is configured. Console logging is not permitted for all users (e.g. not for NetworkService).

{% hint style="info" %}
To ease debugging, it is recommended to run a NATS service with an explicit log file and carefully check write permissions for the configured user.
{% endhint %}

```shell
sc.exe create nats-server binPath= "%NATS_PATH%\nats-server.exe --log C:\temp\nats-server.log [other flags]"
```

## Windows Service Specific Settings

## Windows Service Specific Settings

### `NATS_STARTUP_DELAY` environment variable

The Windows service system requires communication with programs that run as Windows services. One important signal from the program is the initial "ready" signal, where the program informs Windows that it is running as expected.

By default `nats-server` allows itself up to 10 seconds to send this signal.
If the server is not ready after this time, the server will signal a failure to start.
This delay can be adjusted by setting the `NATS_STARTUP_DELAY` environment variable to a suitable duration (e.g. "20s" for 20 seconds, "1m" for one minute).

**Please Note** 
* For the environment variable `NATS_STARTUP_DELAY` to be accessible from the NATS service, it is recommended to set it as a SYSTEM variable. 
* `NATS_STARTUP_DELAY=30s` will make the NATS server wait **up to 30s**, but will report the service as RUNNING as soon as the server is ready to accept connections. To **test** the extended time startup timeout you may need to slow down server startup, e.g. by using a very large stream (10s of GB) or placing Jetstream storage on a slow network device. 

This adjustment can be necessary in cases where NATS is correctly running from command line, but takes longer than 10s to recover Jetstream stream state and connect to its cluster peers.