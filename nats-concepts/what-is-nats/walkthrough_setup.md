# Walkthrough prerequisites

We have provided Walkthroughs for you to try NATS (and JetStream) on your own. In order to follow along with the walkthroughs, you could choose one of these options:  

- The `nats` CLI tool must be installed, and a local NATS server must be installed (or you can use a remote server you have access to).   
- You can use Synadia's NGS.   
- You could even use the demo server from where you installed NATS. This is accessible via `nats://demo.nats.io` (this is a NATS connection URL; not a browser URL. You pass it to a NATS client application).  
  
## Installing the [`nats`](/using-nats/nats-tools/nats_cli/readme.md) CLI Tool

For MacOS:

```shell
brew tap nats-io/nats-tools
brew install nats-io/nats-tools/nats
```

For Arch Linux:

```shell
yay natscli
```
    
For other versions of Linux and for Windows:  
The `.deb` or `.rpm` files and Windows binaries (even for ARM) are available here [GitHub Releases](https://github.com/nats-io/natscli/releases).

## Installing the NATS server locally (if needed)

If you are going to run a server locally you need to first install it and start it. Alternatively if you already know how to use NATS on a remote server, you only need to pass the server URL to `nats` using the `-s` option or preferably create a context using `nats context add`, to specify the server URL(s) and credentials file containing your user JWT.

### Installing the NATS server via a Package Manager

On Mac OS:

```shell
brew install nats-server
```

On Windows:

```shell
choco install nats-server
```

On Arch Linux:

```shell
yay nats-server
```
  
For other versions of Linux or other architectures, you can install a [release build](https://github.com/nats-io/nats-server/releases) as shown below.
  
### Downloading a Release Build

You can find the latest release of `nats-server` [here](https://github.com/nats-io/nats-server/releases).

You could manually download the zip file matching your systems architecture, and unzip it. You could also use `curl` to download a specific version. The example below shows for example, how to download version 2.6.2 of the `nats-server` for Linux AMD64:  

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
and finally, copy it to the `bin` folder (this allows you to run the executable from anywhere in the system):
```shell
sudo cp nats-server/nats-server-v2.6.2-linux-amd64/nats-server /usr/bin
```

### Start the NATS server (if needed)

To start a simple demonstration server locally, simply run:

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
