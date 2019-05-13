## NATS Server Installation

NATS philosophy is simplicity. Installation is just decompression a zip file and copying the binary to an appropiate directory; you can also use your favorite package manager.

### Installing via a Package Manager

On Windows:
```
> choco install nats-server
```

On Mac OS:
```
> brew install nats-server
```

Via Docker:
```
> docker pull nats-server:latest
```

### Installing directly Release Build

You can find the latest release of nats-server [here](https://github.com/nats-io/nats-server/releases/latest).

Simply download the zip file matching your systems architecture, and unzip. For this example, assuming version 2.0.0 of the server, and a Linux AMD64:

```
> curl -L https://github.com/nats-io/nats-server/releases/download/v2.0.0/nats-server-v2.0.0-linux-amd64.zip -o nats-server.zip

> unzip nats-server.zip -d nats-server
Archive:  nats-server.zip
   creating: nats-server-v2.0.0-darwin-amd64/
  inflating: nats-server-v2.0.0-darwin-amd64/README.md
  inflating: nats-server-v2.0.0-darwin-amd64/LICENSE
  inflating: nats-server-v2.0.0darwin-amd64/nats-server

> cp nats-server-v2.0.0darwin-amd64/nats-server /usr/local/bin

```

### Installing from the source

If you have go installed, installing the binary is very easy:

```
> go get github.com/nats-io/nats-server
```

This mechanism will always install the latest build on [master](https://github.com/nats-io/nats-server), which almost certainly will not be a released version. If you are a developer and want to play with the the latest, this is the easiest way of obtaining it. 


## Testing Your Installation

To test your installation (provided the install locations are visible by your shell):

```
> nats-server
[41634] 2019/05/13 09:42:11.745919 [INF] Starting nats-server version 2.0.0
[41634] 2019/05/13 09:42:11.746240 [INF] Listening for client connections on 0.0.0.0:4222
...
[41634] 2019/05/13 09:42:11.746249 [INF] Server id is NBNYNR4ZNTH4N2UQKSAAKBAFLDV3PZO4OUYONSUIQASTQT7BT4ZF6WX7
[41634] 2019/05/13 09:42:11.746252 [INF] Server is ready
```