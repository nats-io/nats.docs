# Docker Swarm

### 第一步：

为集群创建一个 overlay 网络（本例中为 `nats-cluster-example`），并启动一个初始的 NATS 服务器。

首先创建一个 overlay 网络：

```bash
docker network create --driver overlay nats-cluster-example
```

接着，启动一个初始的"种子"（seed）服务器，作为 NATS 集群的成员，监听端口 6222 以便其他服务器加入并与其建立路由：

```bash
docker service create --network nats-cluster-example --name nats-cluster-node-1 nats:1.0.0 -cluster nats://0.0.0.0:6222 -DV
```

### 第二步：

第二步是创建另一个服务，它连接到 overlay 网络中的 NATS 服务器。请注意，这里我们连接到名为 `nats-cluster-node-1` 的服务器：

```bash
docker service create --name ruby-nats --network nats-cluster-example wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0 -e '
  NATS.on_error do |e|
    puts "ERROR: #{e}"
  end
  NATS.start(:servers => ["nats://nats-cluster-node-1:4222"]) do |nc|
    inbox = NATS.create_inbox
    puts "[#{Time.now}] Connected to NATS at #{nc.connected_server}, inbox: #{inbox}"

    nc.subscribe(inbox) do |msg, reply|
      puts "[#{Time.now}] Received reply - #{msg}"
    end

    nc.subscribe("hello") do |msg, reply|
      next if reply == inbox
      puts "[#{Time.now}] Received greeting - #{msg} - #{reply}"
      nc.publish(reply, "world")
    end

    EM.add_periodic_timer(1) do
      puts "[#{Time.now}] Saying hi (servers in pool: #{nc.server_pool}"
      nc.publish("hello", "hi", inbox)
    end
  end'
```

### 第三步：

现在，您可以通过创建更多 Docker 服务向 Swarm 集群添加更多节点，并在 `-routes` 参数中引用种子服务器：

```bash
docker service create --network nats-cluster-example --name nats-cluster-node-2 nats:1.0.0 -cluster nats://0.0.0.0:6222 -routes nats://nats-cluster-node-1:6222 -DV
```

在此情况下，`nats-cluster-node-1` 通过自动发现功能为集群中的其他服务器提供种子信息。现在，NATS 服务器 `nats-cluster-node-1` 和 `nats-cluster-node-2` 已经组成一个集群。

增加订阅者的副本数量：

```bash
docker service scale ruby-nats=3
```

然后确认其在 Docker Swarm 集群上的分布情况：

```bash
docker service ps ruby-nats
```
```text
ID                         NAME         IMAGE                                     NODE    DESIRED STATE  CURRENT STATE          ERROR
25skxso8honyhuznu15e4989m  ruby-nats.1  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
0017lut0u3wj153yvp0uxr8yo  ruby-nats.2  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
2sxl8rw6vm99x622efbdmkb96  ruby-nats.3  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-2  Running        Running 2 minutes ago
```

在向集群添加更多 NATS 服务器节点后，客户端会通过自动发现，_动态地_ 感知到更多节点加入集群！

```text
[2016-08-15 12:51:52 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:53 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:54 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:55 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}, {:uri=>#<URI::Generic nats://10.0.1.7:4222>, :reconnect_attempts=>0}, {:uri=>#<URI::Generic nats://10.0.1.6:4222>, :reconnect_attempts=>0}]
```

添加更多能够回复（因为会忽略自身的响应）的工作节点后的示例输出：

```text
[2016-08-15 16:06:26 +0000] Received reply - world
[2016-08-15 16:06:26 +0000] Received reply - world
[2016-08-15 16:06:27 +0000] Received greeting - hi - _INBOX.b8d8c01753d78e562e4dc561f1
[2016-08-15 16:06:27 +0000] Received greeting - hi - _INBOX.4c35d18701979f8c8ed7e5f6ea
```

## 以此类推...

从这里开始，您可以通过简单地添加具有新服务名称（这些服务路由到种子服务器 `nats-cluster-node-1`）的服务器来试验扩展 NATS 集群。正如您在上面看到的，客户端将自动更新以了解到集群中有新的服务器可用。

```bash
docker service create --network nats-cluster-example --name nats-cluster-node-3 nats:1.0.0 -cluster nats://0.0.0.0:6222 -routes nats://nats-cluster-node-1:6222 -DV
```

