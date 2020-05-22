# Getting started with Python and NGS running in Docker

Start a lightweight Docker container:

```
docker run --entrypoint /bin/bash -it python:3.8-slim-buster
```

Or you can also mount local creds via a volume:

```
docker run --entrypoint /bin/bash -v $HOME/.nkeys/creds/synadia/NGS/:/creds -it python:3.8-slim-buster
```

Install nats.py and dependencies to install nkeys:

```
apt-get update && apt-get install -y build-essential curl
pip install asyncio-nats-client[nkeys]
```

Get the Python examples using curl:

```
curl -o nats-pub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-pub/__main__.py
curl -o nats-sub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-sub/__main__.py
```

Create a subscription that lingers:

```
python nats-sub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello &
```

Publish a message:

```
python nats-pub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello -d world
```
