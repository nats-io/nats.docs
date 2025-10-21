# 在 Docker 中运行 Python 和 NGS

启动一个轻量级的 Docker 容器：

```shell
docker run --entrypoint /bin/bash -it python:3.8-slim-buster
```

或者，您也可以通过挂载本地凭据卷来实现：

```shell
docker run --entrypoint /bin/bash -v $HOME/.nkeys/creds/synadia/NGS/:/creds -it python:3.8-slim-buster
```

安装 nats.py 及其依赖项以支持 nkeys：

```shell
apt-get update && apt-get install -y build-essential curl
pip install asyncio-nats-client[nkeys]
```

使用 curl 获取 Python 示例代码：

```shell
curl -o nats-pub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-pub/__main__.py
curl -o nats-sub.py -O -L https://raw.githubusercontent.com/nats-io/nats.py/master/examples/nats-sub/__main__.py
```

创建一个持续监听的订阅：

```shell
python nats-sub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello &
```

发布一条消息：

```shell
python nats-pub.py --creds /creds/NGS.creds  -s tls://connect.ngs.global:4222 hello -d world
```

