# Getting Started

Getting started with Jetstream is straightforward.  While we speak of Jetstream as if it is a seperate component, it's actually a subsystem built into the NATS server that needs to be enabled.

## Command line

Enable Jetstream by specifying the `-js` flag when starting the NATS server.

`$ nats-server -js`

## Configuration File

Enable Jetstream through a configuration file.  By default, the Jetstream subsytem will store data in the /tmp directory.  Here's a minimal file that will store data in a local "nats" directory, suitable for development and local testing.

`$ nats-server -c js.conf`

```text
# js.conf
jetstream {
   store_dir=nats
}
```

Normally Jetstream will be run in clustered mode and will replicate data, so the best place to store Jetstream data would be locally on a fast SSD.  One should specifically avoid NAS or NFS storage for Jetstream.

See [Using Docker](./using_docker.md) and [Using Source](./using_source.md) for more information.