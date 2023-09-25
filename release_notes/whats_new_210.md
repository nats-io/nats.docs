# NATS 2.10

This guide is tailored for existing NATS users upgrading from NATS version 2.9.x. This will read as a summary with links to specific documentation pages to learn more about the feature or improvement.

## Upgrade considerations

### Client versions

Although all existing client versions will work, new client versions will expose additional options used to leverage new features. The minimum client versions that have full 2.10.0 support include:

- CLI - [v0.1.0](https://github.com/nats-io/natscli/releases/tag/v0.1.0)
- nats.go - [v1.30.0](https://github.com/nats-io/nats.go/releases/tag/v1.30.0)
- nats.rs - [v0.32.0](https://github.com/nats-io/nats.rs/releases/tag/async-nats%2Fv0.32.0)
- nats.deno - [v1.17.0](https://github.com/nats-io/nats.deno/releases/tag/v1.17.0)
- nats.js - [v2.17.0](https://github.com/nats-io/nats.js/releases/tag/v2.17.0)
- nats.ws - [v1.18.0](https://github.com/nats-io/nats.ws/releases/tag/v1.18.0)
- nats.java - Comming soon!
- nats.net - Comming soon!
- nats.net.v2 - Comming soon!
- nats.py - Comming soon!
- nats.c - Comming soon!

### Helm charts

- k8s/nats - Coming soon!
- k8s/nack - Coming soon!

### Downgrade warnings

For critical infrastructure like NATS, zero downtime upgrades are table stakes. Although the best practice for all infrastructure like this is for users to thoroughly test a new release against your specific workloads, inevitably there are cases where an upgrade occurs in production followed by a decision to downgrade. This is never recommended and can cause more harm than good for most infrastructure and data systems.

Below are a few important considerations if downgrading is required.

#### Storage format changes

2.10.0 brings on-disk storage changes which bring significant performance improvements. These are not compatible with previous versions of the NATS Server. If an upgrade is performed to a server with existing stream data on disk, followed by a downgrade, the older version server will not understand the stream data in the new format.

However, being mindful of the possibility of the need to downgrade, a special version of the 2.9.x series was released with awareness of key changes in the new storage format, allowing it to startup properly.

The takeaway is that if a downgrade is the only resort, it must be to 2.9.22 or later to ensure storage format changes are handled appropriately.

#### Stream and consumer config options

There are new stream and consumer configuration options that could be problematic if a downgrade occurs since previous versions of the server have no awareness of them. Examples include:

- Multi-filter consumers - Downgrading would result in no filter being applied since the new field is configured as a list rather than a single string.
- Subject-transform on streams - Downgrading would result in the subject transform not being applied since the server has no awareness of it.
- Compression on streams - Downgrading when compression is enabled on streams will cause those streams to become unloadable since the older server versions will not understand the compression being used.

## Features

### Reload

- A server reload can now be performed by sending a message on [`$SYS.REQ.SERVER.<server-id>.RELOAD`][sys-config-reload] by a client authenticated in the system account.

### JetStream

- A new [`sync_interval` server config option][server-config-sync-interval] has been added to change the default sync interval of stream data when written to disk, including allowing all writes to be flushed immediately. This option is only relevant if you need to modify durability guarantees.

### Core NATS Subject transforms

- Subject mappings can now be [cluster-scoped][server-config-cluster-scoped] and weighted, enabling the ability to have different mappings or weights on a per cluster basis.
- The requirement to use all wildcard tokens in subject mapping or transforms has been relaxed. This can be applied to config or account-based subject mapping, stream subject transforms, and stream republishing, but not on subject mappings that are associated with stream and service import/export between accounts.

### Streams

- A [`subject_transform` field][stream-config-subject-transforms] has been added enabling per-stream subject transforms. This applies to standard streams, mirrors, and sourced streams.
- A [`metadata` field][stream-config-metadata] has been added to stream configuration enabling arbitrary user-defined key-value data. This is to supplant or augment the `description` field.
- A [`first_seq` field][stream-config-first-seq] has been added to stream configuration enabling explicitly setting the initial sequence on stream creation.
- A [`compression` field][stream-config-compression] has been added to stream configuration enabling on-disk compression for file-based streams.
- The ability to edit the [`republish` config option][stream-config-republish] on a stream after stream creation was added.
- A [`Nats-Time-Stamp` header][stream-republish-headers] is now included in republished messages containing the original message's timestamp.
- A `ts` field has been added to stream info responses indicating the server time of the snapshot. This was added to allow for local time calculations with relying on the local clock.
- An array of subject-transforms (subject filter + subject transform destination) can be added to a mirror or source configuration (can not use the single subject filter/subject transform destination fields at the same time as the array).
- A stream configured with `sources` can source from the same stream multiple times when distinct filter+transform options are used, allowing for some messages of a stream to be sourced more than once.

### Consumers

- A [`filter_subjects` field][consumer-config-filter-subjects] has been added which enables applying server-side filtering against multiple disjoint subjects, rather than only one.
- A [`metadata` field][consumer-config-metadata] has been added to consumer configuration enabling arbitrary user-defined key-value data. This is to supplant or augment the `description` field.
- A `ts` field has been added to consumer info responses indicating the server time of the snapshot. This was added to allow for local time calculations without relying on the local clock.

### Key-value

- A [`metadata` field][kv-config-metadata] has been added to key-value configuration enabling arbitrary user-defined key-value data. This is to supplant or augment the `description` field.
- A bucket configured as a mirror or sourcing from other buckets

### Object store

- A [`metadata` field][obj-config-metadata] has been added to object store configuration enabling arbitrary user-defined key-value data. This is to supplant or augment the `description` field.

### Authn/Authz

- A pluggable server extension, referred to as [auth callout][auth-callout], has been added. This provides a mechanism for delegating authentication checks against a bring-your-own (BYO) provider and, optionally, dynamically declaring permissions for the authenticated user.

### Monitoring

- A `unique_tag` field has been added to the [`/varz`][monitoring-http-varz] and [`/jsz`][monitoring-http-jsz] HTTP endpoint responses, corresponding to the value of `unique_tag` defined in the server config.
- A `slow_consumer_stats` field has been added to the [`/varz`][monitoring-http-varz] HTTP endpoint providing a count of slow consumers for clients, routes, gateways, and leafnodes.
- A `raft=1` query parameter has been added to the [`/jsz`][monitoring-http-jsz] HTTP endpoint which adds `stream_raft_group` and `consumer_raft_groups` fields to the response.
- A `num_subscriptions` field has been added to the [`$SYS.REQ.SERVER.PING.STATZ`][monitoring-sys-ping-statz] NATS endpoint responses.
- A system account responder for [`$SYS.REQ.SERVER.PING.IDZ`][monitoring-sys-ping-idz] has been added which returns info for the server that the client is connected to.
- A system account responder for [`$SYS.REQ.SERVER.PING.PROFILEZ`][monitoring-sys-ping-profilez] has been added and works even if a profiling port is not enabled in the server configuration.
- A user account responder for [`$SYS.REQ.USER.INFO`][monitoring-sys-user-info] has been added which allows a connected user to query for the account they are in and permissions they have.

### MQTT

- Support for [QoS2][mqtt-qos2] has been added. Check out the new [MQTT implementation details](https://github.com/nats-io/nats-server/blob/main/server/README-MQTT.md) overview.

### Clustering

- When defining routes between servers, a handful of optimizations have been introduced including a pool of TCP connections between servers, optional pinning of accounts to connections, and optional compression of traffic. There is quite a bit to dig into, so check out the [v2 routes][v2-routes] page for details.

### Leafnodes

- A [`handshake_first` config option][server-config-handshake-first] has been added enabling TLS-first handshakes for leafnode connections.

### Windows

- The [`NATS_STARTUP_DELAY` environment variable][windows-startup] has been added to allow changing the default startup for the server of 10 seconds

## Improvements

### Reload

- The [`nats-server --signal` command][signal-command] now supports a glob expression on the `<pid>` argument which would match a subset of all `nats-server` instances running on the host.

### Streams

- Prior to 2.10, setting [`republish` configuration][stream-config-republish] on mirrors would result in an error. On sourcing streams, only messages that were actively between stored matching configured `subjects` would be republished. The behavior has been relaxed to allow republish on mirrors and include all messages on sourcing streams.

### Consumers

- A new header has been added on a fetch response that indicates to clients the fetch has been fulfilled without requiring clients to rely on hearbeats. It avoids some conditions in which the client would issue fetch requests that could go over limits or have more fetch requests pending than required.

### Leafnodes

- Previously, a leafnode configured with two or more remotes binding to the same hub account would be rejected. This restriction has been relaxed since each remote could be binding to a different local account.

### MQTT

- Previously a dot `.` in an MQTT topic was not supported, however now it is! Check out the [topic-subject conversion table][mqtt-topic-dot] for details.

[auth-callout]: ../running-a-nats-service/configuration/securing_nats/auth_callout.md
[monitoring-http-varz]: ../running-a-nats-service/nats_admin/monitoring/readme.md#general-information
[monitoring-http-jsz]: ../running-a-nats-service/nats_admin/monitoring/readme.md#jetstream-information
[monitoring-sys-ping-idz]: ../running-a-nats-service/configuration/sys_accounts/sys_accounts.md#usdsys.req.server.ping.idz-discovering-servers
[monitoring-sys-ping-statz]: ../running-a-nats-service/configuration/sys_accounts/sys_accounts.md#usdsys.req.server.less-than-id-greater-than.statsz-requesting-server-stats-summary
[monitoring-sys-ping-profilez]: ../running-a-nats-service/configuration/sys_accounts/sys_accounts.md#usdsys.req.server.less-than-id-greater-than.profilez-request-profiling-information
[monitoring-sys-user-info]: ../running-a-nats-service/configuration/sys_accounts/sys_accounts.md#usdsys.req.user.info-request-connected-user-information
[stream-config-republish]: ../nats-concepts/jetstream/streams.md#republish
[stream-config-subject-transforms]: ../nats-concepts/jetstream/streams.md#subjecttransforms
[stream-config-metadata]: ../nats-concepts/jetstream/streams.md#configuration
[stream-config-compression]: ../nats-concepts/jetstream/streams.md#configuration
[stream-config-first-seq]: ../nats-concepts/jetstream/streams.md#configuration
[stream-republish-headers]: ../nats-concepts/jetstream/headers.md#republish
[consumer-config-filter-subjects]: ../nats-concepts/jetstream/consumers.md#filtersubjects
[consumer-config-metadata]: ../nats-concepts/jetstream/consumers.md#configuration
[kv-config-metadata]: ../nats-concepts/jetstream/key-value-store.md#configuration
[obj-config-metadata]: ../nats-concepts/jetstream/object-store.md#configuration
[windows-startup]: ../running-a-nats-service/running/windows_srv.md#nats_startup_delay-environment-variable
[v2-routes]: ../running-a-nats-service/configuration/clustering/v2_routes.md
[server-config-sync-interval]: ../running-a-nats-service/configuration/README.md#jetstream
[server-config-cluster-scoped]: ../nats-concepts/subject_mapping.md#cluster-scoped-mappings
[server-config-handshake-first]: ../running-a-nats-service/configuration/leafnodes/README.md#tls-first-handshake
[signal-command]: ../running-a-nats-service/nats_admin/signals.md#multiple-processes
[sys-config-reload]: ../running-a-nats-service/configuration/README.md#configuration-reloading
[mqtt-topic-dot]: ../running-a-nats-service/configuration/mqtt/README.md
[mqtt-qos2]: ../running-a-nats-service/configuration/mqtt/README.md
