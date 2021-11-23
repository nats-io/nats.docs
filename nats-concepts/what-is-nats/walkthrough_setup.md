# Walkthrough prerequisites

We have provided Walkthroughs for you to try NATS (and JetStream) on your own. In order to follow along with the walkthroughs, the `nats` CLI tool must be installed, and a local NATS server must be installed (or alternatively you can use a remote server you have access to, or Synadia's NGS (or you could even use the demo server located at `nats://demo.nats.io`)).

## Installing the [`nats`](/using-nats/nats-tools/nats_cli/readme.md) CLI Tool

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

## Installing the NATS server locally (if needed)

If you are going to run a server locally you need to first install it and start it. Alternatively if you are going to use a remote server you only need to pass the server URL to `nats` using the `-s` or preferably create a context using `nats context add` to specify the server URL(s) and credentials file containing your user JWT.

### Installing via a Package Manager

On Mac OS:

```shell
brew install nats-server
```

On Windows:

```shell
choco install nats-server
```

On Linux:

```shell
yay nats-server
```

### Downloading a Release Build

You can find the latest release of nats-server [here](https://github.com/nats-io/nats-server/releases).

Download the zip file matching your systems architecture, and unzip. For this example, assuming version 2.6.2 of the server and a Linux AMD64:

```shell
curl -L https://github.com/nats-io/nats-server/releases/download/v2.6.5/nats-server-v2.6.5-linux-amd64.zip -o nats-server.zip
```

```shell
unzip nats-server.zip -d nats-server
```
which should output something like
```text
Archive:  nats-server.zip
   creating: nats-server-v2.6.2-linux-amd64/
  inflating: nats-server-v2.6.2-linux-amd64/README.md
  inflating: nats-server-v2.6.2-linux-amd64/LICENSE
  inflating: nats-server-v2.6.2-linux-amd64/nats-server
```
and finally:
```shell
sudo cp nats-server/nats-server-v2.6.2-linux-amd64/nats-server /usr/bin
```

### 1. Start the NATS server (if needed)

To start a simple demonstration server locally simply run:

```bash
nats-server
```

(or `nats-server -m 8222` if you want to enable the HTTP monitoring functionality)

When the server starts successfully, you will see the following messages:

```text
[14524] 2021/10/25 22:53:53.525530 [INF] Starting nats-server
[14524] 2021/10/25 22:53:53.525640 [INF]   Version:  2.6.1
[14524] 2021/10/25 22:53:53.525643 [INF]   Git:      [not set]
[14524] 2021/10/25 22:53:53.525647 [INF]   Name:     NDAUZCA4GR3FPBX4IFLBS4VLAETC5Y4PJQCF6APTYXXUZ3KAPBYXLACC
[14524] 2021/10/25 22:53:53.525650 [INF]   ID:       NDAUZCA4GR3FPBX4IFLBS4VLAETC5Y4PJQCF6APTYXXUZ3KAPBYXLACC
[14524] 2021/10/25 22:53:53.526392 [INF] Starting http monitor on 0.0.0.0:8222
[14524] 2021/10/25 22:53:53.526445 [INF] Listening for client connections on 0.0.0.0:4222
[14524] 2021/10/25 22:53:53.526684 [INF] Server is ready
```

The NATS server listens for client connections on TCP Port 4222.