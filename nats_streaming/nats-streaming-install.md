# Install and Run NATS Streaming Server

In this tutorial you install and run the NATS Streaming server (`nats-streaming-server`). 
You can follow this same procedure anytime you want to run the NATS Streaming server.

### Install the NATS Streaming server

There are numerous ways to install the NATS Streaming server.

#### GitHub releases

The latest official release binaries are always available on the [GitHub releases page](https://github.com/nats-io/nats-streaming-server/releases). 
The following platforms are available:

- Linux (x86, x86_64, ARM)
- Windows (x86, x86_64)
- macOS

The following methods may also be used. _Please note that these methods may not install the latest released version_:

#### Go

Make sure [your Go environment is set up](/documentation/tutorials/go-install/)

```sh
% go get github.com/nats-io/nats-streaming-server
```

Note that this method may not install the latest released version.

#### Docker Hub

The latest [official Docker image](https://hub.docker.com/_/nats-streaming/) is always available on Docker Hub.

#### Windows

On Windows, the NATS Streaming server can also be installed via [Chocolatey](https://chocolatey.org/packages/nats-streaming-server):

```sh
% choco install nats-streaming-server
```

#### macOS

On macOS, the NATS Streaming server can be installed via [Homebrew](http://brewformulas.org/NatsStreamingServer):

```sh
% brew install nats-streaming-server
```

### Start the NATS Streaming server

You can invoke the NATS Streaming server binary, with no options and no configuration file, to start a server with acceptable standalone defaults (no authentication, no clustering).

```sh
% nats-streaming-server
```

When the server starts successfully, you will see that the NATS Streaming server listens for client connections on TCP Port 4222:

```sh
[18085] 2016/10/31 13:11:44.059012 [INF] Starting nats-streaming-server[test-cluster] version 0.3.1
[18085] 2016/10/31 13:11:44.059830 [INF] Starting nats-server version 0.9.4
[18085] 2016/10/31 13:11:44.061544 [INF] Listening for client connections on 0.0.0.0:4222
[18085] 2016/10/31 13:11:44.061966 [INF] Server is ready
[18085] 2016/10/31 13:11:44.396819 [INF] STAN: Message store is MEMORY
[18085] 2016/10/31 13:11:44.396832 [INF] STAN: --------- Store Limits ---------
[18085] 2016/10/31 13:11:44.396837 [INF] STAN: Channels:                  100 *
[18085] 2016/10/31 13:11:44.396839 [INF] STAN: -------- channels limits -------
[18085] 2016/10/31 13:11:44.396842 [INF] STAN:   Subscriptions:          1000 *
[18085] 2016/10/31 13:11:44.396844 [INF] STAN:   Messages     :       1000000 *
[18085] 2016/10/31 13:11:44.396855 [INF] STAN:   Bytes        :     976.56 MB *
[18085] 2016/10/31 13:11:44.396858 [INF] STAN:   Age          :     unlimited *
[18085] 2016/10/31 13:11:44.396859 [INF] STAN: --------------------------------
```

### Start the NATS Streaming Server with NATS monitoring enabled (optional)

The NATS Streaming server exposes the monitoring interface of its embedded NATS Server (`nats-server`) on port 8222.

```sh
% nats-streaming-server -m 8222
```

If you run the NATS Streaming server with monitoring enabled, you see the following messages:

```sh
[18122] 2016/10/31 13:13:10.048663 [INF] Starting nats-streaming-server[test-cluster] version 0.3.1
[18122] 2016/10/31 13:13:10.048843 [INF] Starting nats-server version 0.9.4
[18122] 2016/10/31 13:13:10.048890 [INF] Starting http monitor on 0.0.0.0:8222
[18122] 2016/10/31 13:13:10.048968 [INF] Listening for client connections on 0.0.0.0:4222
[18122] 2016/10/31 13:13:10.048992 [INF] Server is ready
[18122] 2016/10/31 13:13:10.388282 [INF] STAN: Message store is MEMORY
[18122] 2016/10/31 13:13:10.388301 [INF] STAN: --------- Store Limits ---------
[18122] 2016/10/31 13:13:10.388309 [INF] STAN: Channels:                  100 *
[18122] 2016/10/31 13:13:10.388312 [INF] STAN: -------- channels limits -------
[18122] 2016/10/31 13:13:10.388316 [INF] STAN:   Subscriptions:          1000 *
[18122] 2016/10/31 13:13:10.388319 [INF] STAN:   Messages     :       1000000 *
[18122] 2016/10/31 13:13:10.388333 [INF] STAN:   Bytes        :     976.56 MB *
[18122] 2016/10/31 13:13:10.388338 [INF] STAN:   Age          :     unlimited *
[18122] 2016/10/31 13:13:10.388341 [INF] STAN: --------------------------------
```
