## NATS Clients

The nats-server doesn't come bundled with any clients. But most client libraries come with tools that allow you to publish, subscribe, send requests and reply messages.

If you have a client library installed you can try using a bundled client. Otherwise you can easily install some clients.

### If you have Go installed:

```
> go get https://github.com/nats-io/go-nats-examples/tools/nats-pub
> go get https://github.com/nats-io/go-nats-examples/tools/nats-sub
```

### Or download a zip file

You can pre-built binaries from the [go-nats-examples repo](https://github.com/nats-io/go-nats-examples/releases/tag/0.0.50)


### Testing your setup

First [start a nats-server](running.md). Then you can on two different terminal windows:

Start a subscriber:
```
> nats-sub ">"
Listening on [>]
```

Publish your first message:
```
> nats-pub hello world
Published [hello] : 'world'
```

On the subscriber window you should see:

```
[#1] Received on [hello]: 'world'
```
