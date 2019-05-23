# NATS Streaming Server Installation

NATS philosophy is simplicity. Installation is just decompressing a zip file and copying the binary to an appropriate directory; you can also use your favorite package manager.

## Installing via a Package Manager

On Mac OS:
```
> brew install nats-streaming-server
```

Via Docker:
```
> docker pull nats-streaming
```

## Installing a release build

You can find the latest release of `nats-streaming-server` [here](https://github.com/nats-io/nats-streaming-server/releases/latest).

Download the zip file matching your systems architecture, and unzip. For this example, assuming version 0.14.2 of the server, and a Linux AMD64:
```
> curl -L https://github.com/nats-io/nats-streaming-server/releases/download/v0.14.2/nats-streaming-server-v0.14.2-linux-amd64.zip -o nats-streaming-server.zip

> unzip nats-streaming-server.zip -d tmp
Archive:  nats-streaming-server.zip
   creating: tmp/nats-streaming-server-v0.14.2-linux-amd64/
  inflating: tmp/nats-streaming-server-v0.14.2-linux-amd64/README.md  
  inflating: tmp/nats-streaming-server-v0.14.2-linux-amd64/LICENSE  
  inflating: tmp/nats-streaming-server-v0.14.2-linux-amd64/nats-streaming-server 
  
> cp tmp/nats-streaming-server-v0.14.2-linux-amd64/nats-streaming-server /usr/local/bin
```

## Installing from the source

If you have go installed, installing the binary is easy:

```
> go get github.com/nats-io/nats-streaming-server
```

This mechanism will install a build of master, which almost certainly will not be a released version. If you are a developer and want to play with the latest, this is the easiest way of obtaining it.

You can run the test suite from the `nats-streaming-server` root directory:
```
go test -v -p=1 ./... 
```

Some of the store tests require a SQL server to be running. To skip those, use this command instead:
```
go test -v -p=1 ./... -sql=false
```

## Testing Your Installation

To test your installation (provided the executable is visible to your shell):

```
> nats-streaming-server
[58061] 2019/05/22 13:56:45.463562 [INF] STREAM: Starting nats-streaming-server[test-cluster] version 0.14.2
[58061] 2019/05/22 13:56:45.463639 [INF] STREAM: ServerID: Avb51sMf9imRPVVwv6Ts0v
[58061] 2019/05/22 13:56:45.463657 [INF] STREAM: Go version: go1.11.10
[58061] 2019/05/22 13:56:45.463659 [INF] STREAM: Git commit: [not set]
[58061] 2019/05/22 13:56:45.464086 [INF] Starting nats-server version 1.4.1
[58061] 2019/05/22 13:56:45.464092 [INF] Git commit [not set]
[58061] 2019/05/22 13:56:45.464310 [INF] Listening for client connections on 0.0.0.0:4222
[58061] 2019/05/22 13:56:45.464328 [INF] Server is ready
[58061] 2019/05/22 13:56:45.495045 [INF] STREAM: Recovering the state...
[58061] 2019/05/22 13:56:45.495055 [INF] STREAM: No recovered state
[58061] 2019/05/22 13:56:45.749604 [INF] STREAM: Message store is MEMORY
[58061] 2019/05/22 13:56:45.749658 [INF] STREAM: ---------- Store Limits ----------
[58061] 2019/05/22 13:56:45.749664 [INF] STREAM: Channels:                  100 *
[58061] 2019/05/22 13:56:45.749668 [INF] STREAM: --------- Channels Limits --------
[58061] 2019/05/22 13:56:45.749671 [INF] STREAM:   Subscriptions:          1000 *
[58061] 2019/05/22 13:56:45.749675 [INF] STREAM:   Messages     :       1000000 *
[58061] 2019/05/22 13:56:45.749678 [INF] STREAM:   Bytes        :     976.56 MB *
[58061] 2019/05/22 13:56:45.749682 [INF] STREAM:   Age          :     unlimited *
[58061] 2019/05/22 13:56:45.749686 [INF] STREAM:   Inactivity   :     unlimited *
[58061] 2019/05/22 13:56:45.749690 [INF] STREAM: ----------------------------------
```
