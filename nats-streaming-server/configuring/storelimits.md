# Store Limits

The `store_limits` section in the configuration file \(or the command line parameters `-mc`, `-mm`, etc..\) allow you to configure the global limits.

These limits offer some upper bounds on the size of the storage. By multiplying the limits per channel with the maximum number of channels, you will get a total limit.

It is not the case, though, if you override limits of some channels. Indeed, it is possible to define specific limits per channel. Here is how:

```text
...
store_limits: {
    # Override some global limits
    max_channels: 10
    max_msgs: 10000
    max_bytes: 10MB
    max_age: "1h"

    # Per channel configuration.
    # Can be channels, channels_limits, per_channel, per_channel_limits or ChannelsLimits
    channels: {
        "foo": {
            # Possible options are the same than in the store_limits section, except
            # for max_channels. Not all limits need to be specified.
            max_msgs: 300
            max_subs: 50
        }
        "bar": {
            max_msgs:50
            max_bytes:1KB
        }
        "baz": {
            # Set to 0 for ignored (or unlimited)
            max_msgs: 0
            # Override with a lower limit
            max_bytes: 1MB
            # Override with a higher limit
            max_age: "2h"
        }
        # When using partitioning, channels need to be listed.
        # They don't have to override any limit.
        "bozo": {}

        # Wildcards are possible in configuration. This says that any channel
        # that will start with "foo" but with at least 2 tokens, will be
        # able to store 400 messages. Other limits are inherited from global.
        "foo.>": {
            max_msgs:400
        }
        # This one says that if the channel name starts with "foo.bar" but has
        # at least one more token, the sever will hold it for 2 hours instead
        # of one. The max number of messages is inherited from "foo.>", so the
        # limit will be 400. All other limits are inherited from global.
        "foo.bar.>": {
            max_age: "2h"
        }
        # Delete channels with this prefix once they don't have any
        # subscription and no new message for more than 1 hour
        "temp.>": {
            max_inactivity: "1h"
        }
    }
}
...
```

Note that the number of defined channels cannot be greater than the stores' maximum number of channels. _**This is true only for channels without wildcards.**_

Channels limits can override global limits by being either higher, lower or even set to unlimited.

_**An unlimited value applies to the specified limit, not to the whole channel.**_

That is, in the configuration above, `baz` has the maximum number of messages set to 0, which means ignored or unlimited. Yet, other limits such as max bytes, max age and max subscriptions \(inherited in this case\) still apply. What that means is that the store will not check the number of messages but still check the other limits.

For a truly unlimited channel _all_ limits need to be set to 0.

## Limits Inheritance

When starting the server from the command line, global limits that are not specified \(configuration file or command line parameters\) are inherited from default limits selected by the server.

Per-channel limits that are not explicitly configured inherit from the corresponding global limit \(which can itself be inherited from default limit\).

If a per-channel limit is set to 0 in the configuration file \(or negative value programmatically\), then it becomes unlimited, regardless of the corresponding global limit.

On startup the server displays the store limits. Notice the `*` at the right of a limit to indicate that the limit was inherited from the default store limits.

For channels that have been configured, their name is displayed and only the limits being specifically set are displayed to minimize the output.

## Wildcards

Wildcards are allowed for channel configuration. Limits for `foo.>` will apply to any channel that starts with `foo` \(but has at least one more token\). If `foo.bar.>` is specified, it will inherit from `foo.>` and from global limits.

Below is what would be displayed with the above store limits configuration. Notice how `foo.bar.>` is indented compared to `foo.>` to show the inheritance.

```text
[INF] STREAM: Starting nats-streaming-server[test-cluster] version 0.16.0
[INF] STREAM: ServerID: bFHdJP9hesjHIR0RheCl7W
[INF] STREAM: Go version: go1.11.13
[INF] STREAM: Git commit: [not set]
[INF] Starting nats-server version 2.0.2
[INF] Git commit [not set]
[INF] Listening for client connections on 0.0.0.0:4222
[INF] Server id is NDMRMUBKS37GDEPOZP4YVMTRLS6ROZS4O2JQVFOGDRJTGIY44OUV7ZSD
[INF] Server is ready
[INF] STREAM: Recovering the state...
[INF] STREAM: No recovered state
[INF] STREAM: Message store is MEMORY
[INF] STREAM: ---------- Store Limits ----------
[INF] STREAM: Channels:                   10
[INF] STREAM: --------- Channels Limits --------
[INF] STREAM:   Subscriptions:          1000 *
[INF] STREAM:   Messages     :         10000
[INF] STREAM:   Bytes        :      10.00 MB
[INF] STREAM:   Age          :        1h0m0s
[INF] STREAM:   Inactivity   :     unlimited *
[INF] STREAM: -------- List of Channels ---------
[INF] STREAM: baz
[INF] STREAM:  |-> Messages             unlimited
[INF] STREAM:  |-> Bytes                  1.00 MB
[INF] STREAM:  |-> Age                     2h0m0s
[INF] STREAM: bozo
[INF] STREAM: temp.>
[INF] STREAM:  |-> Inactivity              1h0m0s
[INF] STREAM: foo.>
[INF] STREAM:  |-> Messages                   400
[INF] STREAM:  foo.bar.>
[INF] STREAM:   |-> Age                    2h0m0s
[INF] STREAM: bar
[INF] STREAM:  |-> Messages                    50
[INF] STREAM:  |-> Bytes                  1.00 KB
[INF] STREAM: -----------------------------------
```

## Limits are Retroactive

Suppose you have set a channel limit to hold at most 100 messages, and the channel currently holds 72 messages. The server is stopped and the message limit for this channel is lowered to 50 messages, then the server is restarted.

On startup, the server will apply the store limits, which means that this channel will now hold the maximum number of messages \(50\) and the 22 oldest messages will be removed due to the channel limit.

We strongly recommend not raising the limit back to the higher limit if messages have been removed in the previous step because those removed messages may or may not become available again depending on the store implementation or if running in clustering mode or not.

## Clustering

When running `--clustered`, messages are kept in a RAFT consensus log file \(under `--cluster_log_path`\) in addition to the configured store.

This directory will grow as more messages keep coming within the 2-4 minute intervals of RAFT Snapshotting. After snapshotting the RAFT log will not shrink, but the space for more messages will be allocated internally. As a result - in addition to `max_bytes` multiplied by `max_channels` - disk space needs to be provisioned for RAFT Log, which can grow up to the size of payloads that channels could receive per minute \* 4.

