# Оркестрация Docker Swarm

### Шаг 1

Создайте overlay‑сеть для кластера (в этом примере `nats-cluster-example`) и запустите начальный сервер NATS.

Сначала создайте overlay‑сеть:

```bash
docker network create --driver overlay nats-cluster-example
```

Затем запустите начальный «seed»‑сервер кластера NATS, который будет слушать подключения других серверов по маршрутам на порту 6222:

```bash
docker service create --network nats-cluster-example --name nats-cluster-node-1 nats:1.0.0 -cluster nats://0.0.0.0:6222 -DV
```

### Шаг 2

Второй шаг — создать еще один сервис, который подключается к NATS‑серверу внутри overlay‑сети. Обратите внимание: подключаемся к серверу `nats-cluster-node-1`:

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

### Шаг 3

Теперь можно добавлять новые узлы в Swarm‑кластер через дополнительные docker‑сервисы, указывая seed‑сервер в параметре `-routes`:

```bash
docker service create --network nats-cluster-example --name nats-cluster-node-2 nats:1.0.0 -cluster nats://0.0.0.0:6222 -routes nats://nats-cluster-node-1:6222 -DV
```

В этом случае `nats-cluster-node-1` «засеивает» остальную часть кластера через функцию автообнаружения. Теперь серверы NATS `nats-cluster-node-1` и `nats-cluster-node-2` объединены в кластер.

Добавьте больше реплик подписчика:

```bash
docker service scale ruby-nats=3
```

Затем подтвердите распределение в Docker Swarm‑кластере:

```bash
docker service ps ruby-nats
```
```text
ID                         NAME         IMAGE                                     NODE    DESIRED STATE  CURRENT STATE          ERROR
25skxso8honyhuznu15e4989m  ruby-nats.1  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
0017lut0u3wj153yvp0uxr8yo  ruby-nats.2  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-1  Running        Running 2 minutes ago  
2sxl8rw6vm99x622efbdmkb96  ruby-nats.3  wallyqs/ruby-nats:ruby-2.3.1-nats-v0.8.0  node-2  Running        Running 2 minutes ago
```

Пример вывода после добавления дополнительных узлов сервера NATS в кластер приведен ниже — обратите внимание, что клиент _динамически_ узнает о новых узлах кластера через автообнаружение!

```text
[2016-08-15 12:51:52 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:53 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:54 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}]
[2016-08-15 12:51:55 +0000] Saying hi (servers in pool: [{:uri=>#<URI::Generic nats://10.0.1.3:4222>, :was_connected=>true, :reconnect_attempts=>0}, {:uri=>#<URI::Generic nats://10.0.1.7:4222>, :reconnect_attempts=>0}, {:uri=>#<URI::Generic nats://10.0.1.6:4222>, :reconnect_attempts=>0}]
```

Пример вывода после добавления дополнительных воркеров, которые могут отвечать (так как игнорируют собственные ответы):

```text
[2016-08-15 16:06:26 +0000] Received reply - world
[2016-08-15 16:06:26 +0000] Received reply - world
[2016-08-15 16:06:27 +0000] Received greeting - hi - _INBOX.b8d8c01753d78e562e4dc561f1
[2016-08-15 16:06:27 +0000] Received greeting - hi - _INBOX.4c35d18701979f8c8ed7e5f6ea
```

## И так далее…

Далее можно экспериментировать, добавляя серверы в кластер NATS, просто создавая новые сервисы и направляя их маршруты на seed‑сервер `nats-cluster-node-1`. Как видно выше, клиенты автоматически узнают о новых серверах в кластере.

```bash
docker service create --network nats-cluster-example --name nats-cluster-node-3 nats:1.0.0 -cluster nats://0.0.0.0:6222 -routes nats://nats-cluster-node-1:6222 -DV
```
