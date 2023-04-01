# routes

/ [config](/ref/config/index.md) / [cluster](/ref/config/config/cluster/index.md)

A list of server URLs to cluster with. Self-routes are ignored. Should authentication via token or username/password
be required, specify them as part of the URL.

## Examples

Simple Route URLs

```
routes: [
  nats-route://localhost:6222,
  nats-route://localhost:6223,
  nats-route://localhost:6224,
]

```
