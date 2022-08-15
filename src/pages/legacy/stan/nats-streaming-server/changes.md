# STAN NATS Streaming Server

* [Version `0.10.0`](changes.md#version-0100)
* [Version `0.9.0`](changes.md#version-090)
* [Version `0.8.0-beta`](changes.md#version-080-beta)
* [Version `0.6.0`](changes.md#version-060)
* [Version `0.5.0`](changes.md#version-050)
* [Version `0.4.0`](changes.md#version-040)

## Version `0.10.0`

The server needs to persist more state for a client connection. Therefore, the Store interface has been changed:

* Changed `AddClient(clientID, hbInbox string)` to `AddClient(info *spb.ClientInfo)`

For SQL Stores, the `Clients` table has been altered to add a `proto` column.\
You can update the SQL table manually or run the provided scripts that create the tables if they don't exists and alter the `Clients` table adding the new column. For instance, with MySQL, you would run something similar to:

```
mysql -u root nss_db < scripts/mysql.db.sql
```

The above assumes you are in the NATS Streaming Server directory, and the streaming database is called `nss_db`.

Otherwise, from the mysql CLI, you can run the command:

```
mysql> alter table Clients add proto blob;
Query OK, 0 rows affected (0.05 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

For Postgres, it would be:

```
nss_db=# alter table Clients add proto bytea;
ALTER TABLE
```

If you run the server version with `0.10.0` a database that has not been updated, you would get the following error:

```
[FTL] STREAM: Failed to start: unable to prepare statement "INSERT INTO Clients (id, hbinbox, proto) VALUES (?, ?, ?)": Error 1054: Unknown column 'proto' in 'field list'
```

## Version `0.9.0`

Additions to the Store interface to support deletion of channels.

* Added `Store.GetChannelLimits()` API to return the store limits for a given channel.
* Added `Store.DeleteChannel()` API to delete a channel.

Protocol was added to support replication of deletion of a channel in the cluster.

## Version `0.8.0-beta`

The Store interface has been slightly changed to accommodate the clustering feature.

*   Changed `MstStore.Store()` API to accept a `*pb.MsgProto` instead of a byte array. This is because the server is now assigning the sequence number.

    The store implementation should ignore the call if the given sequence number is below or equal to what has been already stored.
* Added `MsgStore.Empty()` API to empty a given channel message store.

## Version `0.6.0`

The Store interface has been heavily modified. Some of the responsibilities have been moved into the server resulting on deletion of some Store APIs and removal of `UserData` fields in `Client` and `ChannelStore` (renamed `Channel`) objects.

> **NOTE:** Although the interface has changed, the file format of the FileStore implementation has not, which means that there is backward/forward compatibility between this and previous releases.

The Store interface was updated:

* Added error `ErrAlreadyExists` that `CreateChannel()` should return if channel already exists.
* `RecoveredState` has now `Channels` (instead of `Subs`) and is a map of `*RecoveredChannel` keyed by channel name.
* `RecoveredChannel` has a pointer to a `Channel` (formely `ChannelStore`) and an array of pointers to `RecoveredSubscription` objects.
* `RecoveredSubscription` replaces `RecoveredSubState`.
* `Client` no longer stores a `UserData` field.
* `Channel` (formerly `ChannelStore`) no longer stores a `UserData` field.
*   `CreateChannel()` no longer accepts a `userData interface{}` parameter. It returns a `*Channel` and an `error`. If the channel

    already exists, the error `ErrAlreadyExists` is returned.
*   `LookupChannel()`, `HasChannel()`, `GetChannels()`, `GetChannelsCount()`, `GetClient()`, `GetClients`, `GetClientsCount()` and `MsgsState()` APIs

    have all been removed. The server keeps track of clients and channels and therefore does not need those APIs.
* `AddClient()` is now simply returning a `*Client` and `error`. It no longer accepts a `userData interface{}` parameter.
*   `DeleteClient()` now returns an error instead of returning the deleted `*Client`. This will allow the server to

    report possible errors.

The SubStore interface was updated:

*   `DeleteSub()` has been modified to return an error. This allows the server to report possible errors during deletion

    of a subscription.

The MsgStore interface was updated:

*   `Lookup()`, `FirstSequence()`, `LastSequence()`, `FirstAndLastSequence()`, `GetSequenceFromTimestamp()`, `FirstMsg()` and `LastMsg()`

    have all been modified to return an error. This is so that implementations that may fail to lookup, get the first sequence, etc...

    have a way to report the error to the caller.

## Version `0.5.0`

The Store interface was updated. There are 2 news APIs:

* `GetChannels()`: Returns a map of `*ChannelStore`, keyed by channel names. &#x20;

The implementation needs to return a copy to make it safe for the caller to manipulate

the map without a risk of concurrent access.

* `GetChannelsCount()`: Returns the number of channels currently stored.

## Version `0.4.0`

The Store interface was updated. There are 2 news APIs:

* `Recover()`: The recovery of persistent state was previously done in the constructor of the store implementation. &#x20;

It is now separate and specified with this API. The server will first instantiate the store, in

which some initialization or checks can be made.

If no error is reported, the server will then proceed with calling `Recover()`, which will returned the recovered state.

*   `GetExclusiveLock()`: In Fault Tolerance mode, when a server is elected leader, it will attempt to get an exclusive

    lock to the shared storage before proceeding.

Check the [Store interface](https://github.com/nats-io/nats-streaming-server/blob/master/stores/store.go) for more information.
