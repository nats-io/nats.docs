# Walkthrough Setup

We have provided Walkthroughs for you to try NATS (and JetStream) on your own. In order to follow along with the walkthroughs, you could choose one of these options:

* The `nats` CLI tool must be installed, and a local NATS server must be installed (or you can use a remote server you have access to).
* You can use Synadia's NGS.
* You could even use the demo server from where you installed NATS. This is accessible via `nats://demo.nats.io` (this is a NATS connection URL; not a browser URL. You pass it to a NATS client application).

## Installing the [`nats`](../../using-nats/nats-tools/nats\_cli/) CLI Tool

Please refer to the [installation section in the readme](https://github.com/nats-io/natscli?tab=readme-ov-file#installation).

## Installing the NATS server locally (if needed)

If you are going to run a server locally you need to first install it and start it.  
Please refer to the [nats server installation doc](../../running-a-nats-service/installation.md)

Alternatively if you already know how to use NATS on a remote server, you only need to pass the server URL to `nats` using the `-s` option or preferably create a context using `nats context add`, to specify the server URL(s) and credentials file containing your user JWT.

### Start the NATS server (if needed)

To start a simple demonstration server locally, simply run:

```bash
nats-server
```

(or `nats-server -m 8222` if you want to enable the HTTP monitoring functionality)

When the server starts successfully, you will see the following messages:

```
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
