# What's New in NATS

The NATS.io team is always working to bring you features to improve your NATS experience. Below you will find feature summaries for new implementations to NATS. Check back often for release highlights and updates.

## Server release v2.1.6
### TLS Configuration for Account Resolver

This release adds the ability to specify TLS configuration for the account resolver.
```code
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

Queue Permissions allow you to express authorization for queue groups. As queue groups are integral to implementing horizontally scalable microservices, control of who is allowed to join a specific queue group is important to the overall security model. Original PR - <https://github.com/nats-io/nats-server/pull/1143>

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
