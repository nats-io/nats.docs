# nats-bench

NATS is fast and lightweight and places a priority on performance. the `nats` CLI tool can, amongst many other things, be used for running benchmarks and measuring performance of your target NATS service infrastructure. In this tutorial you learn how to benchmark and tune NATS on your systems and environment.

## Prerequisites

* [Install the NATS CLI Tool](/using-nats/nats-tools/nats-tools/natscli.md)
* [Install the NATS server](../../../running-a-nats-service/installation.md)

## Start the NATS server with monitoring enabled

```bash
nats-server -m 8222 -js
```

Verify that the NATS server starts successfully, as well as the HTTP monitor:

```text
[89075] 2021/10/05 23:26:35.342816 [INF] Starting nats-server
[89075] 2021/10/05 23:26:35.342971 [INF]   Version:  2.6.1
[89075] 2021/10/05 23:26:35.342974 [INF]   Git:      [not set]
[89075] 2021/10/05 23:26:35.342976 [INF]   Name:     NDUYLGUUNSD53IUR77SQE2XK4PRCDJNPTICAGMGTAYAFN22KNL2GLJ23
[89075] 2021/10/05 23:26:35.342979 [INF]   Node:     ESalpH2B
[89075] 2021/10/05 23:26:35.342981 [INF]   ID:       NDUYLGUUNSD53IUR77SQE2XK4PRCDJNPTICAGMGTAYAFN22KNL2GLJ23
[89075] 2021/10/05 23:26:35.343583 [INF] Starting JetStream
[89075] 2021/10/05 23:26:35.343946 [INF]     _ ___ _____ ___ _____ ___ ___   _   __  __
[89075] 2021/10/05 23:26:35.343955 [INF]  _ | | __|_   _/ __|_   _| _ \ __| /_\ |  \/  |
[89075] 2021/10/05 23:26:35.343957 [INF] | || | _|  | | __ \ | | |   / _| / _ \| |\/| |
[89075] 2021/10/05 23:26:35.343959 [INF]  __/|___| |_| |___/ |_| |_|____/_/ __|  |_|
[89075] 2021/10/05 23:26:35.343960 [INF]
[89075] 2021/10/05 23:26:35.343962 [INF]          https://docs.nats.io/jetstream
[89075] 2021/10/05 23:26:35.343964 [INF]
[89075] 2021/10/05 23:26:35.343967 [INF] ---------------- JETSTREAM ----------------
[89075] 2021/10/05 23:26:35.343970 [INF]   Max Memory:      48.00 GB
[89075] 2021/10/05 23:26:35.343973 [INF]   Max Storage:     581.03 GB
[89075] 2021/10/05 23:26:35.343974 [INF]   Store Directory: "/var/folders/1b/wb_d92cd6cl_fshyy5qy2tlc0000gn/T/nats/jetstream"
[89075] 2021/10/05 23:26:35.343979 [INF] -------------------------------------------
```

## Run a publisher throughput test

Let's run a test to see how fast a single publisher can publish one million 16 byte messages to the NATS server.

```bash
nats bench foo --pub 1 --size 16
```

The output tells you the number of messages and the number of payload bytes that the client was able to publish per second:

```text
23:33:51 Starting pub/sub benchmark [msgs=100,000, msgsize=16 B, pubs=1, subs=0, js=false]
23:33:51 Starting publisher, publishing 100,000 messages
Finished      0s [======================================================================================================================================================] 100%

Pub stats: 5,173,828 msgs/sec ~ 78.95 MB/sec
```

Now increase the number of messages published:

```bash
nats bench foo --pub 1 --size 16 --msgs 10000000
```
Example output
```text
23:34:29 Starting pub/sub benchmark [msgs=10,000,000, msgsize=16 B, pubs=1, subs=0, js=false]
23:34:29 Starting publisher, publishing 10,000,000 messages
Finished      2s [======================================================================================================================================================] 100%

Pub stats: 4,919,947 msgs/sec ~ 75.07 MB/sec
```

## Run a publish/subscribe throughput test

When using both publishers and subscribers, `nats bench` reports aggregate, as well as individual publish and subscribe throughput performance.

Let's look at throughput for a single publisher with a single subscriber:

```bash
nats bench foo --pub 1 --sub 1 --size 16
```

Note that the output shows the aggregate throughput as well as the individual publisher and subscriber performance:

```text
23:36:00 Starting pub/sub benchmark [msgs=100,000, msgsize=16 B, pubs=1, subs=1, js=false]
23:36:00 Starting subscriber, expecting 100,000 messages
23:36:00 Starting publisher, publishing 100,000 messages
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%

NATS Pub/Sub stats: 5,894,441 msgs/sec ~ 89.94 MB/sec
 Pub stats: 3,517,660 msgs/sec ~ 53.68 MB/sec
 Sub stats: 2,957,796 msgs/sec ~ 45.13 MB/sec
```

## Run a 1:N throughput test

When specifying multiple publishers, or multiple subscribers, `nats bench` will also report statistics for each publisher and subscriber individually, along with min/max/avg and standard deviation.

Let's increase both the number of messages, and the number of subscribers.:

```bash
nats bench foo --pub 1 --sub 5 --size 16 --msgs 1000000
```

Example output

```text
23:38:08 Starting pub/sub benchmark [msgs=1,000,000, msgsize=16 B, pubs=1, subs=5, js=false]
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting subscriber, expecting 1,000,000 messages
23:38:08 Starting publisher, publishing 1,000,000 messages
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%

NATS Pub/Sub stats: 7,123,965 msgs/sec ~ 108.70 MB/sec
 Pub stats: 1,188,419 msgs/sec ~ 18.13 MB/sec
 Sub stats: 5,937,525 msgs/sec ~ 90.60 MB/sec
  [1] 1,187,633 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [2] 1,187,597 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [3] 1,187,526 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [4] 1,187,528 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  [5] 1,187,505 msgs/sec ~ 18.12 MB/sec (1000000 msgs)
  min 1,187,505 | avg 1,187,557 | max 1,187,633 | stddev 48 msgs
```

## Run a N:M throughput test

When more than 1 publisher is specified, `nats bench` evenly distributes the total number of messages \(`-msgs`\) across the number of publishers \(`-pub`\).

Now let's increase the number of publishers and examine the output:

```bash
nats bench foo --pub 5 --sub 5 --size 16 --msgs 1000000
```

Example output

```text
23:39:28 Starting pub/sub benchmark [msgs=1,000,000, msgsize=16 B, pubs=5, subs=5, js=false]
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting subscriber, expecting 1,000,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
23:39:28 Starting publisher, publishing 200,000 messages
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%
Finished      0s [======================================================================================================================================================] 100%

NATS Pub/Sub stats: 7,019,849 msgs/sec ~ 107.11 MB/sec
 Pub stats: 1,172,667 msgs/sec ~ 17.89 MB/sec
  [1] 236,240 msgs/sec ~ 3.60 MB/sec (200000 msgs)
  [2] 236,168 msgs/sec ~ 3.60 MB/sec (200000 msgs)
  [3] 235,541 msgs/sec ~ 3.59 MB/sec (200000 msgs)
  [4] 234,911 msgs/sec ~ 3.58 MB/sec (200000 msgs)
  [5] 235,545 msgs/sec ~ 3.59 MB/sec (200000 msgs)
  min 234,911 | avg 235,681 | max 236,240 | stddev 485 msgs
 Sub stats: 5,851,064 msgs/sec ~ 89.28 MB/sec
  [1] 1,171,181 msgs/sec ~ 17.87 MB/sec (1000000 msgs)
  [2] 1,171,169 msgs/sec ~ 17.87 MB/sec (1000000 msgs)
  [3] 1,170,867 msgs/sec ~ 17.87 MB/sec (1000000 msgs)
  [4] 1,170,641 msgs/sec ~ 17.86 MB/sec (1000000 msgs)
  [5] 1,170,250 msgs/sec ~ 17.86 MB/sec (1000000 msgs)
  min 1,170,250 | avg 1,170,821 | max 1,171,181 | stddev 349 msgs
```

## Run a request/reply latency test

In one shell start a nats bench in 'reply mode' and let it run

```bash
nats bench foo --sub 1 --reply
```

And in another shell send some requests

```bash
nats bench foo --pub 1 --request --msgs 10000
```
Example output
```text
23:47:35 Benchmark in request/reply mode
23:47:35 Starting request/reply benchmark [msgs=10,000, msgsize=128 B, pubs=1, subs=0, js=false, request=true, reply=false]
23:47:35 Starting publisher, publishing 10,000 messages
Finished      1s [==============================================================================================================================================================================================================================================================================================================================================================================================================================================================] 100%

Pub stats: 8,601 msgs/sec ~ 1.05 MB/sec
```

In this case the average latency of request/reply between the two `nats bench` processes over NATS was 1/8,601th of a second (116.2655505 microseconds).

You can now hit control-c to kill that `nats bench --reply` process

Note: by default `nats bench` subscribers in 'reply mode' join a queue group, so you can use `nats bench` for example to simulate a bunch of load balanced server processes.

## Run JetStream benchmarks

### Measure JetStream publication performance
First let's publish some messages into a stream, `nats bench` will automatically create a stream called `benchstream` using default attributes.

```bash
nats bench bar --js --pub 1 --size 16 --msgs 1000000
```
Example output
```text
00:00:10 Starting JetStream benchmark [msgs=1,000,000, msgsize=16 B, pubs=1, subs=0, js=true, stream=benchstream  storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, pullbatch=100, maxackpending=-1, replicas=1, purge=false]
00:00:10 Starting publisher, publishing 1,000,000 messages
Finished      3s [======================================================================================================================================================] 100%

Pub stats: 272,497 msgs/sec ~ 4.16 MB/sec
```

### Measure JetStream consumption (replay) performance
We can now measure the speed of replay of messages stored in the stream to a consumer

```bash
nats bench bar --js --sub 1 --msgs 1000000
```
Example output
```text
00:05:04 JetStream ordered push consumer mode: subscribers will not acknowledge the consumption of messages
00:05:04 Starting JetStream benchmark [msgs=1,000,000, msgsize=128 B, pubs=0, subs=1, js=true, stream=benchstream  storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, pullbatch=100, maxackpending=-1, replicas=1, purge=false]
00:05:04 Starting subscriber, expecting 1,000,000 messages
Finished      1s [======================================================================================================================================================] 100%

Sub stats: 777,480 msgs/sec ~ 94.91 MB/sec
```

#### Push and pull consumers
By default `nats bench --js` subscribers use 'ordered push' consumers, which are ordered, reliable and flow controlled but not 'acknowledged' meaning that the subscribers _do not_ send an acknowledgement back to the server upon receiving each message from the stream. Ordered push consumers are the preferred way for a single application instance to get it's own copy of all (or some) of the data stored in a stream.
However, you can also benchmark 'pull consumers', which are instead the preferred way to horizontally scale the processing (or consumption) of the messages in the stream where the subscribers _do_ acknowledge the processing of every single message, but can leverage batching to increase the processing throughput.

### Play around with the knobs

Don't be afraid to test different JetStream storage and replication options (assuming you have access to a JetStream enabled cluster of servers if you want to go beyond `--replicas 1`), and of course the number of publishing/subscribing threads and the publish or pull subscribe batch sizes.

Note: If you change the attributes of a stream between runs you will have to delete the stream (e.g. run `nats stream rm benchstream`)

### Leave no trace: clean up the resources when you are finished
Once you have finished benchmarking streams, remember that if you have stored many messages in the stream (which is very easy and fast to do) your stream may end up using a certain amount of resources on the nats-server(s) infrastructure (i.e. memory and files) that you may want to reclaim.

You can instruct use the `--purge` bench command flag to tell `nats` to purge the stream of messages before starting its benchmark, or purge the stream manually using `nats stream purge benchstream` or just delete it altogether using `nats stream rm benchstream`.


