# Lame Duck Mode

In production we recommend that a server is shut down with ​lame duck mode​ as a graceful way to slowly evict clients. With large deployments this mitigates the "thundering herd" situation that will place CPU pressure on servers as TLS enabled clients reconnect.

## Server

Lame duck mode is initiated by signaling the server:

```shell
nats-server --signal ldm
```

After entering lame duck mode, the server will stop accepting new connections, wait for a 10 second grace period, then begin to evict clients over a period of time configurable by the [lame_duck_duration](https://docs.nats.io/nats-server/configuration#runtime-configuration) configuration option. This period defaults to 2 minutes.

## Clients

When entering lame duck mode, the server will send a message to clients. Some maintainer supported clients will invoke an optional callback indicating that a server is entering lame duck mode. This is used for cases where an application can benefit from preparing for the short outage between the time it is evicted and automatically reconnected to another server.

