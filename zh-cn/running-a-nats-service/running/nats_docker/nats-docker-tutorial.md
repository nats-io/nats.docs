# 教程

在本教程中，您将运行 [NATS 服务器 Docker 镜像](https://hub.docker.com/_/nats/)。该 Docker 镜像提供了一个 NATS 服务器实例。Synadia 积极维护并支持 nats-server Docker 镜像。NATS 镜像的大小仅为 6 MB。

**1. 配置 Docker。**

有关指导，请参阅 [Docker 入门指南](https://www.docker.com/get-started/)。

运行 Docker 的最简单方法是使用 [Docker Desktop](https://www.docker.com/products/docker-desktop/)。

**2. 运行 nats-server Docker 镜像。**

```bash
docker run -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server -ti nats:latest
```

**3. 确认 NATS 服务器正在运行。**

您应看到以下内容：

```text
Unable to find image 'nats:latest' locally
latest: Pulling from library/nats
2d3d00b0941f: Pull complete 
24bc6bd33ea7: Pull complete 
Digest: sha256:47b825feb34e545317c4ad122bd1a752a3172bbbc72104fc7fb5e57cf90f79e4
Status: Downloaded newer image for nats:latest
```

随后会显示以下内容，表明 NATS 服务器正在运行：

```text
[1] 2019/06/01 18:34:19.605144 [INF] Starting nats-server version 2.0.0
[1] 2019/06/01 18:34:19.605191 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2019/06/01 18:34:19.605286 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/06/01 18:34:19.605312 [INF] Server is ready
[1] 2019/06/01 18:34:19.608756 [INF] Listening for route connections on 0.0.0.0:6222
```

请注意，NATS 服务器 Docker 镜像下载速度非常快，其大小仅为 6 MB。

**4. 测试 NATS 服务器以验证其是否正在运行。**

测试客户端连接端口的一种简单方法是使用 telnet。

```bash
telnet localhost 4222
```

预期结果：

```text
Trying ::1...
Connected to localhost.
Escape character is '^]'.
INFO {"server_id":"NDP7NP2P2KADDDUUBUDG6VSSWKCW4IC5BQHAYVMLVAJEGZITE5XP7O5J","version":"2.0.0","proto":1,"go":"go1.11.10","host":"0.0.0.0","port":4222,"max_payload":1048576,"client_id":13249}
```

您也可以通过浏览器访问 `http://localhost:8222` 来测试监控端点。

