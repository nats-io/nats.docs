# Getting Started with NATS Streaming

This tutorial demonstrates NATS Streaming using example [Go NATS Streaming clients](https://github.com/nats-io/stan.go.git).

## Prerequisites

- [Set up your Git environment](https://help.github.com/articles/set-up-git/).
- [Set up your Go environment](https://golang.org/doc/install).

## Setup

Download and install the [NATS Streaming Server](https://github.com/nats-io/nats-streaming-server/releases).

Clone the following repositories:

- NATS Streaming Server: `git clone https://github.com/nats-io/nats-streaming-server.git`
- NATS Streaming Client: `git clone https://github.com/nats-io/stan.go.git`

## Start the NATS Streaming Server

Two options:

Run the binary that you downloaded, for example: `$ ./nats-streaming-server`

Or, run from source:

```sh
> cd $GOPATH/src/github.com/nats-io/nats-streaming-server
> go run nats-streaming-server.go
```

You should see the following, indicating that the NATS Streaming Server is running:

```sh
> go run nats-streaming-server.go
[59232] 2019/05/22 14:24:54.426344 [INF] STREAM: Starting nats-streaming-server[test-cluster] version 0.14.2
[59232] 2019/05/22 14:24:54.426423 [INF] STREAM: ServerID: 3fpvAuXHo3C66Rkd4rmfFX
[59232] 2019/05/22 14:24:54.426440 [INF] STREAM: Go version: go1.11.10
[59232] 2019/05/22 14:24:54.426442 [INF] STREAM: Git commit: [not set]
[59232] 2019/05/22 14:24:54.426932 [INF] Starting nats-server version 1.4.1
[59232] 2019/05/22 14:24:54.426937 [INF] Git commit [not set]
[59232] 2019/05/22 14:24:54.427104 [INF] Listening for client connections on 0.0.0.0:4222
[59232] 2019/05/22 14:24:54.427108 [INF] Server is ready
[59232] 2019/05/22 14:24:54.457604 [INF] STREAM: Recovering the state...
[59232] 2019/05/22 14:24:54.457614 [INF] STREAM: No recovered state
[59232] 2019/05/22 14:24:54.711407 [INF] STREAM: Message store is MEMORY
[59232] 2019/05/22 14:24:54.711465 [INF] STREAM: ---------- Store Limits ----------
[59232] 2019/05/22 14:24:54.711471 [INF] STREAM: Channels:                  100 *
[59232] 2019/05/22 14:24:54.711474 [INF] STREAM: --------- Channels Limits --------
[59232] 2019/05/22 14:24:54.711478 [INF] STREAM:   Subscriptions:          1000 *
[59232] 2019/05/22 14:24:54.711481 [INF] STREAM:   Messages     :       1000000 *
[59232] 2019/05/22 14:24:54.711485 [INF] STREAM:   Bytes        :     976.56 MB *
[59232] 2019/05/22 14:24:54.711488 [INF] STREAM:   Age          :     unlimited *
[59232] 2019/05/22 14:24:54.711492 [INF] STREAM:   Inactivity   :     unlimited *
[59232] 2019/05/22 14:24:54.711495 [INF] STREAM: ----------------------------------
```

## Run the publisher client

Publish several messages. For each publication you should get a result.

```sh
> cd $GOPATH/src/github.com/nats-io/stan.go/examples/stan-pub
> go run main.go foo "msg one"
Published [foo] : 'msg one'
> go run main.go foo "msg two"
Published [foo] : 'msg two'
> go run main.go foo "msg three"
Published [foo] : 'msg three'
```

## Run the subscriber client

Use the `--all` flag to receive all published messages.

```sh
> cd $GOPATH/src/github.com/nats-io/stan.go/examples/stan-sub
> go run main.go --all -c test-cluster -id myID foo
Connected to nats://localhost:4222 clusterID: [test-cluster] clientID: [myID]
subscribing with DeliverAllAvailable
Listening on [foo], clientID=[myID], qgroup=[] durable=[]
[#1] Received on [foo]: 'sequence:1 subject:"foo" data:"msg one" timestamp:1465962202884478817 '
[#2] Received on [foo]: 'sequence:2 subject:"foo" data:"msg two" timestamp:1465962208545003897 '
[#3] Received on [foo]: 'sequence:3 subject:"foo" data:"msg three" timestamp:1465962215567601196
```

## Explore other subscription options

```sh
	--seq <seqno>                   Start at seqno
	--all                           Deliver all available messages
	--last                          Deliver starting with last published message
	--since <duration>              Deliver messages in last interval (e.g. 1s, 1hr, https://golang.org/pkg/time/#ParseDuration)
	--durable <name>                Durable subscriber name
	--unsubscribe                   Unsubscribe the durable on exit
```
