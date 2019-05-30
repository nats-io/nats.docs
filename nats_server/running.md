# Running

The nats-server has many command line options. To get started, you don't have to specify anything.
In the absence of any flags, the NATS server will start listening for NATS client connections on port 4222.
By default, security is disabled.

### Standalone

When the server starts it will print some information including where the server is listening for client connections:

```
> nats-server
[41634] 2019/05/13 09:42:11.745919 [INF] Starting nats-server version 2.0.0
[41634] 2019/05/13 09:42:11.746240 [INF] Listening for client connections on 0.0.0.0:4222
...
[41634] 2019/05/13 09:42:11.746249 [INF] Server id is NBNYNR4ZNTH4N2UQKSAAKBAFLDV3PZO4OUYONSUIQASTQT7BT4ZF6WX7
[41634] 2019/05/13 09:42:11.746252 [INF] Server is ready
```


### Docker

If you are running your NATS server in a docker container:

```
> docker run -p 4222:4222 -ti nats:latest
[1] 2019/05/13 14:55:11.981434 [INF] Starting nats-server version 2.0.0
...
[1] 2019/05/13 14:55:11.981545 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2019/05/13 14:55:11.981560 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/05/13 14:55:11.981565 [INF] Server is ready
[1] 2019/05/13 14:55:11.982492 [INF] Listening for route connections on 0.0.0.0:6222
...
```

More information on [containerized NATS is available here](/nats_docker/README.md).
