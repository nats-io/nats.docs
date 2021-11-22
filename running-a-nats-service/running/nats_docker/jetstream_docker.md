# Using Docker

In one window start a JetStream enabled nats server:

```shell
docker run --network host -p 4222:4222 nats -js
```

And make sure you have the CLI tools [`nats`](/using-nats/nats-tools/nats%20CLI/readme.md) and [`nsc`](/using-nats/nats-tools/nsc) installed

Now skip to the [`Administer JetStream`](/running-a-nats-service/nats_admin/jetstream_admin/README.md) section.

## Using Docker with NGS

You can join a JetStream instance to your [NGS](https://synadia.com/ngs/pricing) account, first we need a credential for testing JetStream:

You'll want to do this outside of docker to keep the credentials that are generated.

```shell
nsc add user -a YourAccount --name leafnode --expiry 1M
```

You'll get a credential file somewhere like `~/.nkeys/creds/synadia/YourAccount/leafnode.creds`, mount this file into the docker container for JetStream using `-v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds`.

```shell
docker run -ti -v ~/.nkeys/creds/synadia/YourAccount/leafnode.creds:/leafnode.creds --name jetstream nats:latest
```
Output
```text
[1] 2021/10/08 21:48:51.426008 [INF] Starting nats-server
[1] 2021/10/08 21:48:51.426091 [INF]   Version:  2.6.1
...
[1] 2021/10/08 21:48:51.849033 [INF] Connected leafnode to "connect.ngs.global"
```