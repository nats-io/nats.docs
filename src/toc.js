const toc = `
## Introduction

* [Overview](overview)
* [Use Cases](use-cases)
* [Guided Tour](tour)

## Download

* [Server](download/server)
* [Clients](download/clients)

## Development

* [Overview](dev)
* [Connecting](dev/connecting)
* [Messaging](dev/messaging)
  * [Pub-Sub](dev/messaging/pub-sub)
  * [Request-Reply](dev/messaging/request-reply)
  * [Queue Groups](dev/messaging/queue-groups)
* [Streaming](dev/streaming)
  * [Streams](dev/streaming/streams)
  * [Consumers](dev/streaming/consumers)
* [Key-Value](dev/key-value)
* [Object Store](dev/object-store)
* [Services](dev/services)
* [Security](dev/security)
  * [Authentication](dev/security/authn)
  * [Authorization](dev/security/authz)

## Architecture

* [Overview](arch)
* [Application](arch/application)
  * [Assets](arch/client/assets)
  * [Security](arch/client/security)
  * [Connectivity](arch/client/connectivity)
* [System](arch/system)
  * [Clustering](arch/server/clustering)
  * [Security](arch/server/security)
  * [Connectivity](arch/server/connectivity)
  * [Embedded](arch/server/embedded)

## Deployment

* [Overview](deploy)
  * [Considerations](deploy/considerations)
* [Bare Metal](deploy/bare-metal)
* [Containers](deploy/containers)
* [Kubernetes](deploy/kubernetes)
* [Cloud](deploy/cloud)
  * [AWS](deploy/cloud/aws)
  * [Google Cloud](deploy/cloud/google)
  * [Azure](deploy/cloud/azure)
* [Edge](deploy/edge)

## Operations

* [Overview](ops)
* [Monitoring](ops/monitoring)
* [Security](ops/security)
* [Updates](ops/updates)
* [Disaster Recovery](ops/disaster-recovery)

## Troubleshooting

* [Client](troubleshooting/client)
* [Server](troubleshooting/server)

## Reference

* [Overview](ref)
* [Server Config](ref/config)
* [Permissions](ref/permissions)
* [CLI Commands](ref/cli)
* [nsc Commands](ref/nsc)
* [Protocols](ref/protocols)
  * [Client](ref/protocols/client)
    * [JetStream](ref/protocols/client/jetstream)
  * [Cluster](ref/protocols/cluster)
  * [Gateway](ref/protocols/gateway)
  * [Leafnode](ref/protocols/leafnode)
* [FAQ](ref/faq)

## Ecosystem

- [Overview](eco)
- [Tools](eco/tools)
- [Integrations](eco/integrations)

## Releases

* [2.9.x](releases/2.9.x)
* [2.8.x](releases/2.8.x)
* [2.7.x](releases/2.7.x)
* [2.6.x](releases/2.6.x)
* [2.5.x](releases/2.5.x)
* [2.4.x](releases/2.4.x)
* [2.3.x](releases/2.3.x)
* [2.2.x](releases/2.2.x)
* [2.1.x](releases/2.1.x)
* [2.0.x](releases/2.0.x)
`
export default toc
