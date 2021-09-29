# Running

The nats-server has many command line options. To get started, you don't have to specify anything. In the absence of any flags, the NATS server will start listening for NATS client connections on port 4222. By default, security is disabled.

## Standalone

When the server starts it will print some information including where the server is listening for client connections:

```text
> nats-server
[9318] 2020/02/06 14:06:08.220885 [INF] Starting nats-server version 2.1.4
[9318] 2020/02/06 14:06:08.221099 [INF] Git commit [fb009af]
[9318] 2020/02/06 14:06:08.221466 [INF] Listening for client connections on 0.0.0.0:4222
[9318] 2020/02/06 14:06:08.221476 [INF] Server id is NAINBEK336OZMOZUBNOFCJWG4Q2XNFEROWLF6FQWOGM4CBLI5Y6G33NW
[9318] 2020/02/06 14:06:08.221478 [INF] Server is ready
...
```

## Docker

If you are running your NATS server in a docker container:

```text
docker run -p 4222:4222 -ti nats:latest
[1] 2020/02/06 19:04:56.020658 [INF] Starting nats-server version 2.1.4
[1] 2020/02/06 19:04:56.020712 [INF] Git commit [fb009af]
[1] 2020/02/06 19:04:56.020833 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2020/02/06 19:04:56.020897 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2020/02/06 19:04:56.020919 [INF] Server id is NBSNFHIXGTZJ4OCMHU52UGVOLCJEKYTYEAFMABDJUAKZUQE2ULXBQGHX
[1] 2020/02/06 19:04:56.020923 [INF] Server is ready
[1] 2020/02/06 19:04:56.021174 [INF] Listening for route connections on 0.0.0.0:6222
...
```


## JetStream

Remember that in order to enable JetStream and all the functionalities that use it you need to enable it on at least one of your servers

### Command Line

Enable JetStream by specifying the `-js` flag when starting the NATS server.

`$ nats-server -js`

### Configuration File

You can also enable JetStream through a configuration file. By default, the JetStream subsytem will store data in the /tmp directory. Here's a minimal file that will store data in a local "nats" directory, suitable for development and local testing.

`$ nats-server -c js.conf`

```text
# js.conf
jetstream {
   store_dir=nats
}
```

Normally JetStream will be run in clustered mode and will replicate data, so the best place to store JetStream data would be locally on a fast SSD. One should specifically avoid NAS or NFS storage for JetStream.
More information on [containerized NATS is available here](../nats_docker/).

