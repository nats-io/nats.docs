# Authentication Timeout

You can specify a timeout to limit how long the server will wait for a client to authenticate.

If you don't specify a value, or if you specify the value "0", then the default will be 1 second more than the `tls_timeout`.

If you do specify an invalid value, it will use a default of 1 second.

If a client doesn't authenticate to the server within the specified time, the server disconnects the server to prevent abuses.

Timeouts are specified in seconds (and can be fractional).
Unlike `tls_timeout`, you cannot use "human readable" values like `10s`, you
must specify a number, which will be interpreted as seconds.
`10` will be 10 seconds, `3.5` will be 3 seconds and 500 milliseconds, etc.

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
