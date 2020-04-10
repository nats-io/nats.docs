# Clients

The nats-server doesn't come bundled with any clients. But most client libraries come with sample programs that allow you to publish, subscribe, send requests and reply messages.

If you have a client library installed, you can try using a bundled client. Otherwise, you can easily install some clients.

## If you have Go installed:

```text
> go get github.com/nats-io/go-nats-examples/tools/nats-pub
> go get github.com/nats-io/go-nats-examples/tools/nats-sub
```

## Or download a zip file

You can install pre-built binaries from the [go-nats-examples repo](https://github.com/nats-io/go-nats-examples/releases/tag/0.0.50)

## Testing your setup

Open a terminal and [start a nats-server](running/):

```text
> nats-server
[29670] 2019/05/16 08:45:59.836809 [INF] Starting nats-server version 2.0.0
[29670] 2019/05/16 08:45:59.836889 [INF] Git commit [not set]
[29670] 2019/05/16 08:45:59.837161 [INF] Listening for client connections on 0.0.0.0:4222
[29670] 2019/05/16 08:45:59.837168 [INF] Server id is NAYH35Q7ROQHLQ3K565JR4OPTJGO5EK4FJX6KX5IHHEPLQBRSYVWI2NO
[29670] 2019/05/16 08:45:59.837170 [INF] Server is ready
```

On another terminal session start a subscriber:

```text
> nats-sub ">"
Listening on [>]
```

Note that when the client connected, the server didn't log anything interesting because server output is relatively quiet unless something interesting happens.

To make the server output more lively, you can specify the `-V` flag to enable logging of server protocol tracing messages. Go ahead and `<ctrl>+c` the process running the server, and restart the server with the `-V` flag:

```text
nats-server -V
[10864] 2020/02/06 14:17:18.085700 [INF] Starting nats-server version 2.1.4
[10864] 2020/02/06 14:17:18.085811 [INF] Git commit [not set]
[10864] 2020/02/06 14:17:18.086039 [INF] Listening for client connections on 0.0.0.0:4222
[10864] 2020/02/06 14:17:18.086046 [INF] Server id is NDKUZPVC3Y4YHLZBDDCDZSPLAH7KZU3NVTL3WQZ2QIIY2DQN7KZ5BDNW
[10864] 2020/02/06 14:17:18.086049 [INF] Server is ready
[10864] 2020/02/06 14:17:19.393075 [TRC] [::1]:62646 - cid:1 - <<- [CONNECT {"verbose":false,"pedantic":false,"lang":"ruby","version":"0.11.0","protocol":1,"echo":true}]
[10864] 2020/02/06 14:17:19.393265 [TRC] [::1]:62646 - cid:1 - <<- [SUB >  2]
[10864] 2020/02/06 14:17:21.758750 [TRC] [::1]:62646 - cid:1 - ->> [PING]
[10864] 2020/02/06 14:17:21.759400 [TRC] [::1]:62646 - cid:1 - <<- [PONG]
```

If you had created a subscriber, you should notice output on the subscriber telling you that it disconnected, and reconnected. The server output above is more interesting. You can see the subscriber send a `CONNECT` protocol message and a `PING` which was responded to by the server with a `PONG`.

> You can learn more about the [NATS protocol here](../nats-protocol/nats-protocol/), but more interesting than the protocol description is [an interactive demo](../nats-protocol/nats-protocol-demo.md).

On a third terminal, publish your first message:

```text
> nats-pub hello world
Published [hello] : 'world'
```

On the subscriber window you should see:

```text
> nats-sub ">"
Listening on [>]
[#1] Received on [hello] : 'world'
```

## Testing Against a Remote Server

If the NATS server were running in a different machine or a different port, you'd have to specify that to the client by specifying a _NATS URL_. NATS URLs take the form of: `nats://<server>:<port>` and `tls://<server>:<port>`. URLs with a `tls` protocol sport a secured TLS connection.

```text
> nats-sub -s nats://server:port ">"
```

If you want to try on a remote server, the NATS team maintains a demo server you can reach at `demo.nats.io`.

```text
> nats-sub -s nats://demo.nats.io ">"
```

