# Using Docker with NGS

You can join a JetStream instance to your [NGS](https://synadia.com/ngs/pricing) account, first we need a credential for testing JetStream:

```text
$ nsc add user -a YourAccount --name leafnode --expiry 1M
```

You'll get a credential file somewhere like `~/.nkeys/creds/synadia/YourAccount/leafnode.creds`, mount this file into the docker container for JetStream using `-v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds`.

```text
$ docker run -ti -v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds --name jetstream synadia/jsm:latest server
[1] 2020/01/20 12:44:11.752465 [INF] Starting nats-server version 2.2.0-beta
...
[1] 2020/01/20 12:55:01.849033 [INF] Connected leafnode to "connect.ngs.global"
```

Your JSM shell will still connect locally, other connections in your NGS account can use JetStream at this point.

