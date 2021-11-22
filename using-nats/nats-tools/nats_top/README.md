# nats-top

[nats-top](https://github.com/nats-io/nats-top) is a [top](http://man7.org/linux/man-pages/man1/top.1.html)-like tool for monitoring nats-server servers.

The nats-top tool provides a dynamic real-time view of a NATS server. nats-top can display a variety of system summary information about the NATS server, such as subscription, pending bytes, number of messages, and more, in real time. For example:

```bash
nats-top
```
Example output
```text
nats-server version 0.6.4 (uptime: 31m42s)
Server:
  Load: CPU: 0.8%   Memory: 5.9M  Slow Consumers: 0
  In:   Msgs: 34.2K  Bytes: 3.0M  Msgs/Sec: 37.9  Bytes/Sec: 3389.7
  Out:  Msgs: 68.3K  Bytes: 6.0M  Msgs/Sec: 75.8  Bytes/Sec: 6779.4

Connections: 4
  HOST                 CID      SUBS    PENDING     MSGS_TO     MSGS_FROM   BYTES_TO    BYTES_FROM  LANG     VERSION SUBSCRIPTIONS
  127.0.0.1:56134      2        5       0           11.6K       11.6K       1.1M        905.1K      go       1.1.0   foo, hello
  127.0.1.1:56138      3        1       0           34.2K       0           3.0M        0           go       1.1.0    _INBOX.a96f3f6853616154d23d1b5072
  127.0.0.1:56144      4        5       0           11.2K       11.1K       873.5K      1.1M        go       1.1.0   foo, hello
  127.0.0.1:56151      5        8       0           11.4K       11.5K       1014.6K     1.0M        go       1.1.0   foo, hello
```

## Installation

nats-top can be installed using `go get`. For example:

```bash
go get github.com/nats-io/nats-top
```

NOTE: You may have to run the above command as user `sudo` depending on your setup. If you receive an error that you cannot install nats-top because your $GOPATH is not set, when in fact it is set, use command `sudo -E go get github.com/nats-io/nats-top` to install nats-top. The `-E` flag tells sudo to preserve the current user's environment.

## Usage

Once installed, nats-top can be run with the command `nats-top` and optional arguments.

```bash
nats-top [-s server] [-m monitor] [-n num_connections] [-d delay_in_secs] [-sort by]
```

## Options

Optional arguments inclde the following:

| Option | Description |
| :--- | :--- |
| `-m monitor` | Monitoring http port from nats-server. |
| `-n num_connections` | Limit the connections requested to the server \(default 1024\). |
| `-d delay_in_secs` | Screen refresh interval \(default 1 second\). |
| `-sort by` | Field to use for sorting the connections \(see below\). |

## Commands

While in nats-top view, you can use the following commands.

### option

Use the `o<option>` command to set the primary sort key to the `<option>` value. The option value can be one of the following: `cid`, `subs`, `pending`, `msgs_to`, `msgs_from`, `bytes_to`, `bytes_from`, `lang`, `version`.

You can also set the sort option on the command line using the `-sort` flag. For example: `nats-top -sort bytes_to`.

### limit

Use the `n<limit>` command to set the sample size of connections to request from the server.

You can also set this on the command line using the `-n num_connections` flag. For example: `nats-top -n 1`.

Note that if `n<limit>` is used in conjunction with `-sort`, the server will respect both options allowing queries such as the following: Query for the connection with largest number of subscriptions: `nats-top -n 1 -sort subs`.

### s, ? and q Commands

Use the `s` command to toggle displaying connection subscriptions.

Use the `?` command to show help message with options.

Use the `q` command to quit nats-top.

### Tutorial

For a walkthrough with `nats-top` check out the [tutorial](nats-top-tutorial.md).

