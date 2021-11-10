# What's New!

The NATS.io team is always working to bring you features to improve your NATS experience. Below you will find feature summaries for new implementations to NATS. Check back often for release highlights and updates.

## Server release v2.6.0

### **Notice for JetStream Users**

See important [note](./#notice-for-jetstream-users) if upgrading from a version prior to NATS Server v2.4.0.

### Notice for MQTT Users

See important [notes](./#mqtt-update) if upgrading from a version prior to v2.5.0.

### Monitoring

* JetStream's reserved memory and memory used from accounts with reservations in `/jsz` and `/varz` endpoints
* Hardened systemd service

For full release information, see links below;

* Release notes [2.6.0](https://github.com/nats-io/nats-server/releases/tag/v2.6.0)
* Full list of Changes [2.5.0...2.6.0](https://github.com/nats-io/nats-server/compare/v2.6.0...v2.5.0)

## Server release v2.5.0

### **Notice for JetStream Users**

See important [note](./#notice-for-jetstream-users) if upgrading from a version prior to NATS Server v2.4.0.

### MQTT/Monitoring

* `MQTTClient` in the `/connz` connections report and system events CONNECT and DISCONNECT. Ability to select on `mqtt_client`.

### MQTT Improvement

* Sessions are now all stored inside a single stream, as opposed to individual streams, reducing resources usage.

### MQTT Update

* Due to the aforementioned improvement described above, when an MQTT client connects for the first time after an upgrade to this server version, the server will migrate all individual `$MQTT_sess_<xxxx>` streams to a new `$MQTT_sess` stream for the user's account.

For full release information, see links below;

* Release notes [2.5.0](https://github.com/nats-io/nats-server/releases/tag/v2.5.0)
* Full list of Changes [2.4.0...2.5.0](https://github.com/nats-io/nats-server/compare/v2.4.0...v2.5.0)

## Server release v2.4.0

### Notice for JetStream Users

With the latest release of the NATS server, we have fixed bugs around queue subscriptions and have restricted undesired behavior that could be confusing or introduce data loss by unintended/undefined behavior of client applications. If you are using queue subscriptions on a JetStream Push Consumer or have created multiple push subscriptions on the same consumer, you may be affected and need to upgrade your client version along with the server version. We’ve detailed the behavior with different client versions below.

With a NATS Server **prior** to v2.4.0 and client libraries **prior** to these versions: NATS C client v3.1.0, Go client v1.12.0, Java client 2.12.0-SNAPSHOT, NATS.js v2.2.0, NATS.ws v1.3.0, NATS.deno v1.2.0, NATS .NET 0.14.0-pre2:

* It was possible to create multiple non-queue subscription instances for the same JetStream durable consumer. This is not correct since each instance will receive the same copy of a message and acknowledgment is therefore meaningless since the first instance to acknowledge the message will prevent other instances to control if/when a message should be acknowledged.
* Similar to the first issue, it was possible to create many different queue groups for one single JetStream consumer.
* For queue subscriptions, if no consumer nor durable name was provided, the libraries would create ephemeral JetStream consumers, which meant that each member of the same group would receive the same message as the other members, which was not the expected behavior. Users assumed that 2 members subscribing to “foo” with the queue group named “bar” would load-balance the consumption of messages from the stream/consumer.
* It was possible to create a queue subscription on a JetStream consumer configured with heartbeat and/or flow control. This does not make sense because by definition, queue members would receive some (randomly distributed) messages, so the library would think that heartbeats are missed, and flow control would also be disrupted.

If above client libraries are not updated to the latest but the NATS Server is upgraded to v2.4.0:

* It is still possible to create multiple non-queue subscription instances for the same JetStream durable consumer. Since the check is performed by the library (with the help of a new field called `PushBound` in the consumer information object set by the server), this misbehavior is still possible.
* Queue subscriptions will not receive any message. This is because the server now has a new field `DeliverGroup` in the consumer configuration, which won’t be set for existing JetStream consumers and by the older libraries, and detects interest (and starts delivering) only when a subscription on the deliver subject for a queue subscription matching the “deliver group” name is found. Since the JetStream consumer is thought to be a non-deliver-group consumer, the opposite happens: the server detects a core NATS _queue_ subscription on the “deliver subject”, therefore does not trigger delivery on the JetStream consumer’s “deliver subject”.

The 2 other issues are still present because those checks are done in the updated libraries.

If the above client libraries are updated to the latest version, but the NATS Server is still to version prior to v2.4.0 (that is, up to v2.3.4):

* It is still possible to create multiple non-queue subscription instances for the same JetStream durable consumer. This is because the JetStream consumer’s information retrieved by the library will not have the `PushBound` boolean set by the server, therefore will not be able to alert the user that they are trying to create multiple subscription instances for the same JetStream consumer.
* Queue subscriptions will fail because the consumer information returned will not contain the `DeliverGroup` field. The error will be likely to the effect that the user tries to create a queue subscription to a non-queue JetStream consumer. Note that if the application creates a queue subscription for a non-yet created JetStream consumer, then this call will succeed, however, adding new members or restarting the application with the now existing JetStream consumer will fail.
* Creating queue subscriptions without a named consumer/durable will now result in the library using the queue name as the durable name.
* Trying to create a queue subscription with a consumer configuration that has heartbeat and/or flow control will now return an error message.

For completeness, using the latest client libraries and NATS Server v2.4.0:

* Trying to start multiple non-queue subscriptions instances for the same JetStream consumer will now return an error to the effect that the user is trying to create a “duplicate subscription”. That is, there is already an active subscription on that JetStream consumer. It is now only possible to create a queue group for a JetStream consumer created for that group. The `DeliverGroup` field will be set by the library or need to be provided when creating the consumer externally.
* Trying to create a queue subscription without a durable nor consumer name results in the library creating/using the queue group as the JetStream consumer’s durable name.
* Trying to create a queue subscription with a consumer configuration that has heartbeat and/or flow control will now return an error message.

Note that if the server v2.4.0 recovers existing JetStream consumers that were created prior to v2.4.0 (and with older libraries), none of them will have a `DeliverGroup`, so none of them can be used for queue subscriptions. They will have to be recreated.

### JetStream

* Domain to the content of a `PubAck` protocol
* `PushBound` boolean in `ConsumerInfo` to indicate that a push consumer is already bound to an active subscription
* `DeliverGroup` string in `ConsumerConfig` to specify which deliver group (or queue group name) the consumer is created for
* Warning log statement in situations where catchup for a stream resulted in an error

### Monitoring

* The ability for normal accounts to access scoped `connz` information

### Misc

* Operator option `resolver_pinned_accounts` to ensure users are signed by certain accounts

For full release information, see links below;

* Release notes [2.4.0](https://github.com/nats-io/nats-server/releases/tag/v2.4.0)
* Full list of Changes [2.3.4...2.4.0](https://github.com/nats-io/nats-server/compare/v2.3.4...v2.4.0)

## Server release v2.3.0

* [OCSP support](nats-server/configuration/ocsp.md)

### JetStream

* Richer API errors. JetStream errors now contain an ErrCode that uniquely describes the error.
* Ability to send more advanced Stream purge requests that can purge all messages for a specific subject
* Stream can now be configured with a per-subject message limit
* Encryption of JetStream data at rest

For full release information, see links below;

* Release notes [2.3.0](https://github.com/nats-io/nats-server/releases/tag/v2.3.0)
* Full list of Changes [2.2.6...2.3.0](https://github.com/nats-io/nats-server/compare/v2.2.6...v2.3.0)

## Server release v2.2.0

See [NATS 2.2](whats_new_22.md) for new features.

## Server release v2.1.7

### Monitoring Endpoints Available via System Services

Monitoring endpoints as listed in the table below are accessible as system services using the following subject pattern:

* `$SYS.REQ.SERVER.<id>.<endpoint-name>` (request server monitoring endpoint corresponding to endpoint name.)
* `$SYS.REQ.SERVER.PING.<endpoint-name>` (from all server request server monitoring endpoint corresponding to endpoint name - will return multiple messages)

For more information on monitoring endpoints see [NATS Server Configurations System Events](nats-server/configuration/sys_accounts/#available-events-and-services).

### Addition of `no_auth_user` Configuration

Configuration of `no_auth_user` allows you to refer to a configured user/account when no credentials are provided.

For more information and example, see [Securing NATS](nats-server/configuration/securing_nats/accounts.md#no-auth-user)

For full release information, see links below;

* Release notes [2.1.7](https://github.com/nats-io/nats-server/releases/tag/v2.1.7)
* Full list of Changes [2.1.6...2.1.7](https://github.com/nats-io/nats-server/compare/v2.1.6...v2.1.7)

## Server release v2.1.6

### TLS Configuration for Account Resolver

This release adds the ability to specify TLS configuration for the account resolver.

```
resolver_tls {
  cert_file: ...
  key_file: ...
  ca_file: ...
}
```

### Additional Trace & Debug Verbosity Options

`trace_verbose` and command line parameters `-VV` and `-DVV` added. See [NATS Logging Configuration](nats-server/configuration/logging.md)

### Subscription Details in Monitoring Endpoints

We've added the option to include subscription details in monitoring endpoints `/routez` and `/connz`. For instance `/connz?subs=detail` will now return not only the subjects of the subscription, but the queue name (if applicable) and some other details.

* Release notes [2.1.6](https://github.com/nats-io/nats-server/releases/tag/v2.1.6)
* Full list of Changes [2.1.4...2.1.6](https://github.com/nats-io/nats-server/compare/v2.1.4...v2.1.6)

## Server release v2.1.4

### Log Rotation

NATS introduces `logfile_size_limit` allowing auto-rotation of log files when the size is greater than the configured limit set in `logfile_size_limit` as a number of bytes. You can provide the size with units, such as MB, GB, etc. The backup files will have the same name as the original log file with the suffix .yyyy.mm.dd.hh.mm.ss.micros. For more information see Configuring Logging in the [NATS Server Configuration section](nats-server/configuration/logging.md#using-the-configuration-file).

* Release notes [2.1.4](https://github.com/nats-io/nats-server/releases/tag/v2.1.4)
* Full list of Changes [2.1.2...2.1.4](https://github.com/nats-io/nats-server/compare/v2.1.2...v2.1.4)

## Server release v2.1.2

### Queue Permissions

Queue Permissions allow you to express authorization for queue groups. As queue groups are integral to implementing horizontally scalable microservices, control of who is allowed to join a specific queue group is important to the overall security model. Original PR - [https://github.com/nats-io/nats-server/pull/1143](https://github.com/nats-io/nats-server/pull/1143)

More information on Queue Permissions can be found in the [Developing with NATS](developing-with-nats/receiving/queues.md#queue-permissions) section.

## Server release v2.1.0

### Service Latency Tracking

As services and service mesh functionality has become prominent, we have been looking at ways to make running scalable services on NATS.io a great experience. One area we have been looking at is observability. With publish/subscribe systems, everything is inherently observable, however we realized it was not as simple as it could be. We wanted the ability to transparently add service latency tracking to any given service with no changes to the application. We also realized that global systems, such as those NATS.io can support, needed something more than a single metric. The solution was to allow any sampling rate to be attached to an exported service, with a delivery subject for all collected metrics. We collect metrics that show the requestor’s view of latency, the responder’s view of latency and the NATS subsystem itself, even when requestor and responder are in different parts of the world and connected to different servers in a NATS supercluster.

* Release notes [2.1.0](https://github.com/nats-io/nats-server/releases/tag/v2.1.0)
* Full list of Changes [2.0.4...2.1.0](https://github.com/nats-io/nats-server/compare/v2.0.4...v2.1.0)

## Server release v2.0.4

### Response Only Permissions

For services, the authorization for responding to requests usually included wildcards for _INBOX.> and possibly $GR.> with a supercluster for sending responses. What we really wanted was the ability to allow a service responder to only respond to the reply subject it was sent.

### Response Types

Exported Services were originally tied to a single response. We added the type for the service response and now support singletons (default), streams and chunked. Stream responses represent multiple response messages, chunked represents a single response that may have to be broken up into multiple messages.

* Release notes [2.0.4](https://github.com/nats-io/nats-server/releases/tag/v2.0.4)
* Full list of Changes [2.0.2...2.0.4](https://github.com/nats-io/nats-server/compare/v2.0.2...v2.0.4)
