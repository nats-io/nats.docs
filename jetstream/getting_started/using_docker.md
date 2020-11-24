### Using Docker

The `synadia/jsm:latest` docker image contains both the JetStream enabled NATS Server and the `nats` utility this guide covers.

In one window start JetStream:

```
$ docker run -ti -p 4222:4222 --name jetstream synadia/jsm:latest server
[1] 2020/01/20 12:44:11.752465 [INF] Starting nats-server version 2.2.0-beta
[1] 2020/01/20 12:44:11.752694 [INF] Git commit [19dc3eb]
[1] 2020/01/20 12:44:11.752875 [INF] Starting JetStream
[1] 2020/01/20 12:44:11.753692 [INF] ----------- JETSTREAM (Beta) -----------
[1] 2020/01/20 12:44:11.753794 [INF]   Max Memory:      1.46 GB
[1] 2020/01/20 12:44:11.753822 [INF]   Max Storage:     1.00 TB
[1] 2020/01/20 12:44:11.753860 [INF]   Store Directory: "/tmp/jetstream"
[1] 2020/01/20 12:44:11.753893 [INF] ----------------------------------------
[1] 2020/01/20 12:44:11.753988 [INF] JetStream state for account "$G" recovered
[1] 2020/01/20 12:44:11.754148 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2020/01/20 12:44:11.754279 [INF] Server id is NDYX5IMGF2YLX6RC4WLZA7T3JGHPZR2RNCCIFUQBT6C4TP27Z6ZIC73V
[1] 2020/01/20 12:44:11.754308 [INF] Server is ready
```

And in another log into the utilities:

```
$ docker run -ti --link jetstream synadia/jsm:latest
```

This shell has the `nats` utility and all other NATS cli tools used in the rest of this guide.

Now skip to the `Administer JetStream` section.

### Using Docker with NGS

You can join a JetStream instance to your [NGS](https://synadia.com/ngs/pricing) account, first we need a credential for testing JetStream:

```
$ nsc add user -a YourAccount --name leafnode --expiry 1M
```

You'll get a credential file somewhere like `~/.nkeys/creds/synadia/YourAccount/leafnode.creds`, mount this file into the docker container for JetStream using `-v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds`.

```
$ docker run -ti -v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds --name jetstream synadia/jsm:latest server
[1] 2020/01/20 12:44:11.752465 [INF] Starting nats-server version 2.2.0-beta
...
[1] 2020/01/20 12:55:01.849033 [INF] Connected leafnode to "connect.ngs.global"
```

Your JSM shell will still connect locally, other connections in your NGS account can use JetStream at this point.