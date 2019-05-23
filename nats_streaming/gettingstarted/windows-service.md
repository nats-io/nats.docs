# Windows Service

The NATS Streaming Server supports running as a Windows service. There is currently no installer and instead users should use `sc.exe` to install the service:

Here is how to create and start a NATS Streaming Server named `nats-streaming-server`. Note that the server flags should be passed in when creating the service.
```sh
sc.exe create nats-streaming-server binPath="\"<streaming server path>\nats-streaming-server.exe\" [NATS Streaming flags]"
sc.exe start nats-streaming-server
```

You can create several instances, giving it a unique name. For instance, this is how you would create two services, named `nss1` and `nss2`, each one with its own set of parameters.
```
sc.exe create nss1 binPath="\"c:\nats-io\nats-streaming\nats-streaming-server.exe\" --syslog --syslog_name=nss1 -p 4222"

sc.exe create nss2 binPath="\"c:\nats-io\nats-streaming\nats-streaming-server.exe\" --syslog --syslog_name=nss2 -p 4223"
```
By default, when no logfile is specified, the server will use the system log. The default event source name is `NATS-Streaming-Server`. However, you can specify the name you want, which is especially useful when installing more than one service as described above.

Once the service is running, it can be controlled using `sc.exe` or `nats-streaming-server.exe -sl`:

```batch
REM Stop the server
nats-streaming-server.exe -sl quit
```
The above commands will default to controlling the service named `nats-streaming-server`. If the service has another name, it can be specified like this:
```batch
nats-streaming-server.exe -sl quit=<service name>
```
