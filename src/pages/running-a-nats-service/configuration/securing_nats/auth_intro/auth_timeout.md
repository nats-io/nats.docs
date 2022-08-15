# Authentication Timeout

Much like the [`tls timeout` option](/running-a-nats-service/configuration/securing_nats/tls.md#tls-timeout), authentication can specify a `timeout` value.

If a client doesn't authenticate to the server within the specified time, the server disconnects the server to prevent abuses.

Timeouts are specified in seconds (and can be fractional).

As with TLS timeouts, long timeouts can be an opportunity for abuse. If setting the authentication timeout, it is important to note that it should be longer than the `tls timeout` option, as the authentication timeout includes the TLS upgrade time.

```
authorization: {
    timeout: 3
    users: [
        {user: a, password b},
        {user: b, password a}
    ]
}
```
