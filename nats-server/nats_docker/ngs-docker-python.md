# Python and NGS Running in Docker

Start a lightweight Docker container:

```shell
docker run --entrypoint /bin/bash -it python:3.8-slim-buster
```

Or you can also mount local creds via a volume:

```shell
docker run --entrypoint /bin/bash -v $HOME/.nkeys/creds/synadia/NGS/:/creds -it python:3.8-slim-buster
```

Install nats.py and dependencies to install nkeys:

```shell
apt-get update && apt-get install -y build-essential curl
pip install asyncio-nats-client[nkeys]
```

Get the Python examples using curl:

```shell
curl -o nats-pub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-pub/__main__.py
curl -o nats-sub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-sub/__main__.py
```

Create a subscription that lingers:

```shell
python nats-sub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello &
```

Publish a message:

```shell
python nats-pub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello -d world
```

