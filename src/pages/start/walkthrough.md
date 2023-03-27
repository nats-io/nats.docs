# Get Started

This tutorial will introduce the patterns and capabililties of NATS by using a locally running server and using the CLI to interact with the server.

## Install the server

The NATS server can be installed in a variety of ways as [described here](/download/server). If the binary is installed locally, you can run the server as follows.

```sh
nats-server
```

This will bind to port `4222` by default. If that is an issue, you can use the `-p` option to set a different port.

If you prefer to use Docker, you can run and expose the server as follows:

```sh
docker run -p 4222:4222 nats
```

## Install the CLI

The [NATS CLI](/reference/clients/cli) is a comprehensive tool for interacting with a NATS deployment. Follow the [install instructions](/download/clients/cli) for your platform.

Once installed, we will save and select a *connection context* for the demo server so we don't need to type the server URL every time.

```sh
nats context save demo --server tls://demo.nats.io --select
```

## Publish and subscribe

The core communication model of NATS is [publish-subscribe](/concepts/publish-subscribe) which enables an N:M distribution of [messages](/concepts/messages) between publishers and subscribers on a particular [subject](/concepts/subjects).

Messages that are published will be received by NATS and broadcasted to clients connected and subscribed to the message subject. Importantly, if there are no interest for that subject (no active subscriptions), the message will be dropped.

To illustrate this, we can publish a message and then attempt to subscribe to it.

```sh
nats pub 'hello'
