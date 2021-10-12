# Walkthrough prerequisites

In order to try NATS (and JetStream) on your own while going through the concepts by following the walkthrough, the `nats` CLI tool must be installed, and either the NATS server must be installed or alternatively you can use NGS or the demo server located at `nats://demo.nats.io`.

## Installing the [`nats`](/nats-tools/natscli.md) CLI Tool

For macOS:

```text
> brew tap nats-io/nats-tools
> brew install nats-io/nats-tools/nats
```

For Arch Linux:

```text
> yay natscli
```

Binaries are also available as [GitHub Releases](https://github.com/nats-io/natscli/releases).

## Installing the NATS server locally (if needed)

If you are going to run a server locally you need to first install it and start it. Alternatively if you are going to use a remote server you only need to pass the server URL to `nats` using the `-s` or preferably create a context using `nats context add` to specify the server URL(s) and credentials file containing your user JWT.

### Installing via a Package Manager

On Mac OS:

```text
> brew install nats-server
```

On Windows:

```text
> choco install nats-server
```

### Downloading a Release Build

You can find the latest release of nats-server [here](https://github.com/nats-io/nats-server/releases/latest).

Download the zip file matching your systems architecture, and unzip. For this example, assuming version 2.0.0 of the server and a Linux AMD64:

```text
> curl -L https://github.com/nats-io/nats-server/releases/download/v2.0.0/nats-server-v2.0.0-linux-amd64.zip -o nats-server.zip

> unzip nats-server.zip -d nats-server
Archive:  nats-server.zip
   creating: nats-server-v2.0.0-linux-amd64/
  inflating: nats-server-v2.0.0-linux-amd64/README.md
  inflating: nats-server-v2.0.0-linux-amd64/LICENSE
  inflating: nats-server-v2.0.0-linux-amd64/nats-server

> sudo cp nats-server/nats-server-v2.0.0-linux-amd64/nats-server /usr/bin
```

### 1. Start the NATS server (if needed)

To start a simple demonstration server locally just use:

```bash
% nats-server
```

When the server starts successfully, you will see the following messages:

```bash
[9013] 2021/10/11 15:08:52.573742 [INF] Starting nats-server
[9013] 2021/10/11 15:08:52.573844 [INF]   Version:  2.6.1
[9013] 2021/10/11 15:08:52.573847 [INF]   Git:      [not set]
[9013] 2021/10/11 15:08:52.573849 [INF]   Name:     NBP3KW36QXLRMVQZMKPIMQHUT6TA23XX2W5Q3DFU2TFPWXWEASC4YU4Q
[9013] 2021/10/11 15:08:52.573851 [INF]   ID:       NBP3KW36QXLRMVQZMKPIMQHUT6TA23XX2W5Q3DFU2TFPWXWEASC4YU4Q
[9013] 2021/10/11 15:08:52.574507 [INF] Listening for client connections on 0.0.0.0:4222
[9013] 2021/10/11 15:08:52.574728 [INF] Server is ready
```

The NATS server listens for client connections on TCP Port 4222.