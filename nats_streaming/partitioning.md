# Partitioning

***Note, this feature is incompatible with Clustering mode. Trying to start a server with Partitioning and Clustering enabled will result in a startup error.***

It is possible to limit the list of channels a server can handle. This can be used to:

* Prevent creation of unwanted channels
* Share the load between several servers running with the same cluster ID

In order to do so, you need to enable the `partitioning` parameter in the configuration file, and also specify the list of allowed channels in the `channels` section of the `store_limits` configuration.

Channels don't need to override any limit, but they need to be specified for the server to service only these channels.

Here is an example:

```
partitioning: true
store_limits: {
    channels: {
        "foo": {}
        "bar": {}
        # Use of wildcards in configuration is allowed. However, applications cannot
        # publish to, or subscribe to, wildcard channels.
        "baz.*": {}
    }
}
```

When partitioning is enabled, multiple servers with the same cluster ID can coexist on the same NATS network, each server handling its own set of channels. ***Note however that in this mode, state is not replicated as it is in Clustering mode. The only communication between servers is to report if a given channel is handled in more than one serve.r***

## Wildcards

NATS Streaming does not support sending or subscribing to wildcard channels (such as `foo.*`).

However, it is possible to use wildcards to define the partition that a server can handle. For instance, with the following configuration:
```
partitioning: true
store_limits: {
    channels: {
        "foo.*": {}
        "bar.>": {}
    }
}
```
The streaming server would accept subscriptions or published messages to channels such as:
1. `foo.bar`
2. `bar.baz`
3. `bar.baz.bat`
4. ...

But would ignore messages or subscriptions on:

1. `foo`
2. `foo.bar.baz`
3. `bar`
4. `some.other.channel`
5. ...

## A given channel must be defined in a single server

When a server starts, it sends its list of channels to all other servers on the same cluster in an attempt to detect duplicate channels. When a server receives this list and finds that it has a channel in common, it will return an error to the emitting server, which will then fail to start.

However, on startup, it is possible that the underlying NATS cluster is not fully formed. The server would not get any response from the rest of the cluster and therefore start successfully and service clients. Anytime a Streaming server detects that a NATS server was added to the NATS cluster, it will resend its list of channels. It means that currently running servers may suddenly fail with a message regarding duplicate channels. Having the same channel on different servers means that a subscription would be created on all servers handling the channel, but only one server will receive and process message acknowledgements. Other servers would then redeliver messages (since they would not get the acknowledgements), which would cause duplicates.

***In order to avoid issues with channels existing on several servers, it is ultimately the responsibility of the administrator to ensure that channels are unique.***

## Fault Tolerance and Partitioning

You can easily combine the Fault Tolerance and Partitioning feature.

To illustrate, suppose that we want two partitions, one for `foo.>` and one for `bar.>`.

The configuration for the first server `foo.conf` would look like:
```
partitioning: true
store_limits: {
    channels: {
        foo.>: {}
    }
}
```

The second configuration `bar.conf` would be:
```
partitioning: true
store_limits: {
    channels: {
        bar.>: {}
    }
}
```

If you remember, Fault Tolerance is configured by specifying a name (`ft_group_name`). Suppose there is an NFS mount called `/nss/datastore` on both `host1` and `host2`.

Starting an FT pair for the partition `foo` could look like this:
```
host1$ nats-streaming-server -store file -dir /nss/datastore/foodata -sc foo.conf -ft_group_name foo -cluster nats://host1:6222 -routes nats://host2:6222,nats://host2:6223

host2$ nats-streaming-server -store file -dir /nss/datastore/foodata -sc foo.conf -ft_group_name foo -cluster nats://host2:6222 -routes nats://host1:6222,nats://host1:6223
```
Notice that each server on each note points to each other (the `-routes` parameter). The reason why we also point to `6223` will be explained later. They both listen for routes connections on their host's `6222` port.

We now start the FT pair for `bar`. Since we are running from the same machines (we don't have to), we need to use a different port:
```
host1$ nats-streaming-server -store file -dir /nss/datastore/bardata -sc bar.conf -ft_group_name bar -p 4223 -cluster nats://host1:6223 -routes nats://host2:6222,nats://host2:6223

host2$ nats-streaming-server -store file -dir /nss/datastore/bardata -sc bar.conf -ft_group_name bar -p 4223 -cluster nats://host2:6223 -routes nats://host1:6222,nats://host1:6223
```
You will notice that the `-routes` parameter points to both `6222` and `6223`, this is so that both partitions belong to the same cluster and be view as "one" by a Streaming application connecting to this cluster. Effectively, we have created a full mesh of 4 NATS servers that can all communicate with each other. Two of these servers are backups for servers running on the same FT group.

## Applications behavior

When an application connects, it specifies a cluster ID. If several servers are running with that same cluster ID, the application will be able to publish/subscribe to any channel handled by the cluster (as long as those servers are all connected to the NATS network).

A published message will be received by only the server that has that channel defined. If no server is handling this channel, no specific error is returned, instead the publish call will timeout. Same goes for message acknowledgements. Only the server handling the subscription on this channel should receive those.

However, other client requests (such as connection and subscription requests) are received by all servers. For connections, all servers handle them and the client library will receive a response from all servers in the cluster, but use the first one that it received.

For subscriptions, a server receiving the request for a channel that it does not handle will simply ignore the request. Again, if no server handle this channel, the client's subscription request will simply time out.