# Getting Started

Getting started with JetStream is straightforward. While we speak of JetStream as if it is a separate component, it's actually a subsystem built into the NATS server that needs to be enabled.

## Command Line

Enable JetStream by specifying the `-js` flag when starting the NATS server.

`$ nats-server -js`

## Configuration File

You can also enable JetStream through a configuration file. By default, the JetStream subsytem will store data in the /tmp directory. Here's a minimal file that will store data in a local "nats" directory, suitable for development and local testing.

`$ nats-server -c js.conf`

```text
# js.conf
jetstream {
   store_dir=nats
}
```

Normally JetStream will be run in clustered mode and will replicate data, so the best place to store JetStream data would be locally on a fast SSD. One should specifically avoid NAS or NFS storage for JetStream.

See [Using Docker](../../../running-a-nats-service/running/nats_docker/jetstream_docker.md) and [Using Source](using_source.md) for more information.

