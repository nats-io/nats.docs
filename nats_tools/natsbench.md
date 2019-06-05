## Benchmarking

NATS is fast and lightweight and places a priority on performance. NATS provides tools for measuring performance. In this tutorial you learn how to benchmark and tune NATS on your systems and environment.

#### Prerequisites

- [Set up your Go environment](https://golang.org/doc/install)
- [Install the NATS server](/nats_server/installation.md)

#### Start the NATS server with monitoring enabled

```sh
% nats-server -m 8222
```

Verify that the NATS server starts successfully, as well as the HTTP monitor:

```sh
[18541] 2016/10/31 13:26:32.037819 [INF] Starting nats-server version 0.9.4
[18541] 2016/10/31 13:26:32.037912 [INF] Starting http monitor on 0.0.0.0:8222
[18541] 2016/10/31 13:26:32.037997 [INF] Listening for client connections on 0.0.0.0:4222
[18541] 2016/10/31 13:26:32.038020 [INF] Server is ready
```

#### Installing and running the benchmark utility 

The NATS benchmark can be installed and run via Go.  Ensure your golang environment is setup.

There are two approaches; you can either install the `nats-bench` utility in the directory specified in your `GOBIN` environment variable:

```sh
% go install $GOPATH/src/github.com/nats-io/nats.go/examples/nats-bench.go
```

... or you can simply run it via `go run`:

```sh
% go run $GOPATH/src/github.com/nats-io/nats.go/examples/nats-bench.go
```

*On windows use the % environment variable syntax, replacing `$GOPATH` with `%GOPATH%`.*

For the purpose of this tutorial, we'll assume that you chose the first option, and that you've added the `GOBIN` environment variable to your `PATH`.

The `nats-bench` utility is straightforward to use. The options are as follows:

```sh
% nats-bench -h
Usage: nats-bench [-s server (nats://localhost:4222)] [--tls] [-np NUM_PUBLISHERS] [-ns NUM_SUBSCRIBERS] [-n NUM_MSGS] [-ms MESSAGE_SIZE] [-csv csvfile] <subject>
```

The options are self-explanatory. Each publisher or subscriber runs in its own go routine with its own NATS connection.

#### Run a publisher throughput test

Let's run a test to see how fast a single publisher can publish one million 16 byte messages to the NATS server.

```sh
% nats-bench -np 1 -n 100000 -ms 16 foo
```

The output tells you the number of messages and the number of payload bytes that the client was able to publish per second:

```sh
Starting benchmark [msgs=100000, msgsize=16, pubs=1, subs=0]
Pub stats: 7,055,644 msgs/sec ~ 107.66 MB/sec
```

Now increase the number of messages published:

```sh
% nats-bench -np 1 -n 10000000 -ms 16 foo
Starting benchmark [msgs=10000000, msgsize=16, pubs=1, subs=0]
Pub stats: 7,671,570 msgs/sec ~ 117.06 MB/sec
```

#### Run a publish/subscribe throughput test

When using both publishers and subscribers, `nats-bench` reports aggregate, as well as individual publish and subscribe throughput performance.

Let's look at throughput for a single publisher with a single subscriber:

```sh
% nats-bench -np 1 -ns 1 -n 100000 -ms 16 foo
```

Note that the output shows the aggregate throughput as well as the individual publisher and subscriber performance:

```sh
Starting benchmark [msgs=100000, msgsize=16, pubs=1, subs=1]
NATS Pub/Sub stats: 2,009,230 msgs/sec ~ 30.66 MB/sec
 Pub stats: 1,076,537 msgs/sec ~ 16.43 MB/sec
 Sub stats: 1,004,615 msgs/sec ~ 15.33 MB/sec
 ```

#### Run a 1:N throughput test

When specifying multiple publishers, or multiple subscribers, `nats-bench` will also report statistics for each publisher and subscriber individually, along with min/max/avg and standard deviation.

Let's increase both the number of messages, and the number of subscribers.:

```sh
% nats-bench -np 1 -ns 5 -n 10000000 -ms 16 foo
```

Output:

```sh
Starting benchmark [msgs=10000000, msgsize=16, pubs=1, subs=5]
NATS Pub/Sub stats: 5,730,851 msgs/sec ~ 87.45 MB/sec
 Pub stats: 955,279 msgs/sec ~ 14.58 MB/sec
 Sub stats: 4,775,709 msgs/sec ~ 72.87 MB/sec
  [1] 955,157 msgs/sec ~ 14.57 MB/sec (10000000 msgs)
  [2] 955,150 msgs/sec ~ 14.57 MB/sec (10000000 msgs)
  [3] 955,157 msgs/sec ~ 14.57 MB/sec (10000000 msgs)
  [4] 955,156 msgs/sec ~ 14.57 MB/sec (10000000 msgs)
  [5] 955,153 msgs/sec ~ 14.57 MB/sec (10000000 msgs)
  min 955,150 | avg 955,154 | max 955,157 | stddev 2 msgs
```

#### Run a N:M throughput test

When more than 1 publisher is specified, `nats-bench` evenly distributes the total number of  messages (`-n`) across the number of publishers (`-np`). 

Now let's increase the number of publishers and examine the output:

```sh
% nats-bench -np 5 -ns 5 -n 10000000 -ms 16 foo
```

The output:

```sh
Starting benchmark [msgs=10000000, msgsize=16, pubs=5, subs=5]
NATS Pub/Sub stats: 6,716,465 msgs/sec ~ 102.49 MB/sec
 Pub stats: 1,119,653 msgs/sec ~ 17.08 MB/sec
  [1] 226,395 msgs/sec ~ 3.45 MB/sec (2000000 msgs)
  [2] 225,955 msgs/sec ~ 3.45 MB/sec (2000000 msgs)
  [3] 225,889 msgs/sec ~ 3.45 MB/sec (2000000 msgs)
  [4] 224,552 msgs/sec ~ 3.43 MB/sec (2000000 msgs)
  [5] 223,933 msgs/sec ~ 3.42 MB/sec (2000000 msgs)
  min 223,933 | avg 225,344 | max 226,395 | stddev 937 msgs
 Sub stats: 5,597,054 msgs/sec ~ 85.40 MB/sec
  [1] 1,119,461 msgs/sec ~ 17.08 MB/sec (10000000 msgs)
  [2] 1,119,466 msgs/sec ~ 17.08 MB/sec (10000000 msgs)
  [3] 1,119,444 msgs/sec ~ 17.08 MB/sec (10000000 msgs)
  [4] 1,119,444 msgs/sec ~ 17.08 MB/sec (10000000 msgs)
  [5] 1,119,430 msgs/sec ~ 17.08 MB/sec (10000000 msgs)
  min 1,119,430 | avg 1,119,449 | max 1,119,466 | stddev 12 msgs
  ```
