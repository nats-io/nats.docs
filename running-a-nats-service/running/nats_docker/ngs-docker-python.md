# Python и NGS в Docker

Запустите легковесный контейнер Docker:

```shell
docker run --entrypoint /bin/bash -it python:3.8-slim-buster
```

Или вы можете примонтировать локальные creds через volume:

```shell
docker run --entrypoint /bin/bash -v $HOME/.nkeys/creds/synadia/NGS/:/creds -it python:3.8-slim-buster
```

Установите nats.py и зависимости для установки nkeys:

```shell
apt-get update && apt-get install -y build-essential curl
pip install asyncio-nats-client[nkeys]
```

Получите примеры Python с помощью curl:

```shell
curl -o nats-pub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-pub/__main__.py
curl -o nats-sub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-sub/__main__.py
```

Создайте подписку, которая остается активной:

```shell
python nats-sub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello &
```

Опубликуйте сообщение:

```shell
python nats-pub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello -d world
```
