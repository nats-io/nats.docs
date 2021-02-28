# Using Docker

The `natsio/nats-box:latest` docker image contains the `nats` utility this guide covers.

In one window start a JetStream enabled nats server:

```
$ docker run --network host -p 4222:4222 nats -js
```

And in another log into the utilities:

```
$ docker run -ti --network host natsio/nats-box
```

This shell has the `nats` utility and all other NATS cli tools used in the rest of this guide.

Now skip to the `Administer JetStream` section.

### Using Docker with NGS

You can join a JetStream instance to your [NGS](https://synadia.com/ngs/pricing) account, first we need a credential for testing JetStream:

You'll want to do this outside of docker to keep the credentials that are generated.
```
$ nsc add user -a YourAccount --name leafnode --expiry 1M
```

You'll get a credential file somewhere like `~/.nkeys/creds/synadia/YourAccount/leafnode.creds`, mount this file into the docker container for JetStream using `-v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds`.

```
$ docker run -ti -v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds --name jetstream synadia/jsm:latest server
[1] 2020/01/20 12:44:11.752465 [INF] Starting nats-server version 2.2.0
...
[1] 2020/01/20 12:55:01.849033 [INF] Connected leafnode to "connect.ngs.global"
```

Your JSM shell will still connect locally, other connections in your NGS account can use JetStream at this point.