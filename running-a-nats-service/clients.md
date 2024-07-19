# NATS Clients, Server

This content benefits developers and operators, especially the NATS CLI tool installation instructions. While developers can use this tool to code applications, operators can use this tool to monitor the NATS server and troubleshoot issues. This content is important because it helps developers and operators ensure that messaging systems are secure and reliable. This information guides you through the tool installation and test setup processes with ease.

A NATS client is an application that connects to a NATS server using a URL along with a credential file, which is used for authentication and authorization to the NATS server and infrastructure. 

The NATS server (`nats-server`) doesn't come bundled with any clients. Its companion is the NATS CLI tool. Install the NATS CLI tool even if you don't intend to run your own servers – as it's the best tool to test, monitor, manage, and interact with a NATS infrastructure. This is an ideal tool even if the infrastructure is an isolated local server, leaf node server, cluster, or global super-cluster.

Other useful NATS client tools include [`nsc`](../using-nats/nats-tools/nsc/) and [`nk`](../using-nats/nats-tools/nk.md). The [`nsc`](../using-nats/nats-tools/nsc/) CLI tool manages account attributes and user JWT tokens. The [`nk`](../using-nats/nats-tools/nk.md) tool and library manage Nkeys, helpful for authentication and authorization.

Most client libraries come with sample programs that allow you to publish, subscribe, and send requests and reply messages.

## Embed NATS

If your application is written in Go (and NATS fits your use case and deployment scenarios), you can even embed a NATS server inside your application.

[Embedding NATS in Go](https://dev.to/karanpratapsingh/embedding-nats-in-go-19o)

## Install NATS CLI Tool

To retrieve the latest version of the NATS binary (top of the `main` branch) from the shell and for all platforms:
```shell
curl -sf https://binaries.nats.dev/nats-io/natscli/nats | sh
```

You can also get a specific version by adding `@` followed by the version's tag:
```shell
curl -sf https://binaries.nats.dev/nats-io/natscli/nats@v0.1.4 | sh
```

For macOS:

```shell
brew tap nats-io/nats-tools
brew install nats-io/nats-tools/nats
```

For Arch Linux:

```shell
yay natscli
```

Binaries are also available as [GitHub Releases](https://github.com/nats-io/natscli/releases).

## Test your setup

Open a terminal and [start a nats-server](broken-reference):

```shell
nats-server
```

```
[45695] 2021/09/29 02:22:53.570667 [INF] Starting nats-server
[45695] 2021/09/29 02:22:53.570796 [INF]   Version:  2.6.1
[45695] 2021/09/29 02:22:53.570799 [INF]   Git:      [not set]
[45695] 2021/09/29 02:22:53.570804 [INF]   Name:     NAAACXGWSD6ZW5KVHOTSGGPU2JCMZUDSMY5GVZZP27DMRPWYINC2X6ZI
[45695] 2021/09/29 02:22:53.570807 [INF]   ID:       NAAACXGWSD6ZW5KVHOTSGGPU2JCMZUDSMY5GVZZP27DMRPWYINC2X6ZI
[45695] 2021/09/29 02:22:53.571747 [INF] Listening for client connections on 0.0.0.0:4222
[45695] 2021/09/29 02:22:53.572051 [INF] Server is ready
```

On another terminal session, first check the connection to the server:

```shell
nats server check connection -s 0.0.0.0:4222
```

```
OK Connection OK:connected to nats://127.0.0.1:4222 in 790.28µs OK:rtt time 69.896µs OK:round trip took 0.000102s | connect_time=0.0008s;0.5000;1.0000 rtt=0.0001s;0.5000;1.0000 request_time=0.0001s;0.5000;1.0000
```

Next, start a subscriber using the NATS CLI tool:

```shell
nats subscribe ">" -s 0.0.0.0:4222
```

When the client connected, the server didn't log anything interesting because server output is relatively quiet unless something interesting happens.

To make the server output livelier, you can specify the `-V` flag to enable logging of server protocol tracing messages. Enter `<ctrl>+C` to stop the server process then restart the server with the `-V` flag:

```shell
nats-server -V
```

```
[45703] 2021/09/29 02:23:05.189377 [INF] Starting nats-server
[45703] 2021/09/29 02:23:05.189489 [INF]   Version:  2.6.1
[45703] 2021/09/29 02:23:05.189493 [INF]   Git:      [not set]
[45703] 2021/09/29 02:23:05.189497 [INF]   Name:     NAIBOVQLOZSDIUFQYZOQUGV3PNZUT66D4WF5MKS2G7N423UGJDH2DFWG
[45703] 2021/09/29 02:23:05.189500 [INF]   ID:       NAIBOVQLOZSDIUFQYZOQUGV3PNZUT66D4WF5MKS2G7N423UGJDH2DFWG
[45703] 2021/09/29 02:23:05.190236 [INF] Listening for client connections on 0.0.0.0:4222
[45703] 2021/09/29 02:23:05.190504 [INF] Server is ready
[45703] 2021/09/29 02:23:07.111053 [TRC] 127.0.0.1:51653 - cid:4 - <<- [CONNECT {"verbose":false,"pedantic":false,"tls_required":false,"name":"NATS CLI Version 0.0.26","lang":"go","version":"1.12.0","protocol":1,"echo":true,"headers":true,"no_responders":true}]
[45703] 2021/09/29 02:23:07.111282 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - <<- [PING]
[45703] 2021/09/29 02:23:07.111301 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - ->> [PONG]
[45703] 2021/09/29 02:23:07.111632 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - <<- [SUB >  1]
[45703] 2021/09/29 02:23:07.111679 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - <<- [PING]
[45703] 2021/09/29 02:23:07.111689 [TRC] 127.0.0.1:51653 - cid:4 - "v1.12.0:go:NATS CLI Version 0.0.26" - ->> [PONG]
```

If you had created a subscriber, you should notice output on the subscriber telling you that it disconnected then reconnected. The server output above is more interesting. You can see the subscriber sent a `CONNECT` protocol message and a `PING`, which the server responded to with a `PONG`.

You can learn more about the NATS protocol [here](../reference-protocols.md). You can also view an exciting interactive demo [here](../reference/nats-protocol/nats-protocol-demo.md).

On a third terminal, publish your first message:

```shell
nats pub hello world -s 0.0.0.0:4222
```

On the subscriber window, you should see:

```
[#1] Received on "hello"
world
```

## Test against a remote server

If the NATS server were running on a different machine or a different port, you'd have to provide those details to the client by specifying a NATS URL (either in a `nats context` or using the `-s` flag).

### NATS URLs

You can format NATS URLs as: `nats://<server>:<port>` and `tls://<server>:<port>`. URLs with a `tls` protocol have a secure TLS connection.

If you are connecting to a cluster, you can specify more than one URL (comma separated). A test cluster with three NATS servers on your local machine and listening at ports 4222, 5222, and 6222 – for example – will be formatted as `nats://localhost:4222,nats://localhost:5222,nats://localhost:6222`.

### Example

```shell
nats sub -s nats://server:port ">"
```

If you want to try on a remote server, the NATS team maintains a demo server you can reach at `demo.nats.io`.

```shell
nats sub -s nats://demo.nats.io ">"
```
