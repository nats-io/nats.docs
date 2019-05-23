# Securing NATS Streaming Server


## Authenticating users

To enable user authentication from the command line, you can use the same mechanism as the NATS Server (`nats-server`). You pass in the `—user <user>` and `—pass <pass>` commands, or `--auth` parameters, and the NATS streaming server will automatically use these credentials. Or you can use a configuration file with a single user or token.

When using a configuration file with multi-user authorization, you must use the `—user` and `—pass` parameters with the NATS streaming server, matching a user in the configuration file, in order to specify which user the NATS streaming server should authenticate with to it's embedded NATS server.

For example, if you pass the NATS streaming server a file with a several users, you must run the streaming server as a user such as "Joe" who is defined in the configuration file.

## Using TLS

While there are several TLS related parameters for the NATS Streaming server, securing the server's connection is straightforward. However, bear in mind that the NATS Streaming server embeds the NATS server resulting in a client-server relationship where the NATS Streaming server is a client of it's embedded NATS server.

That means two sets of TLS configuration parameters must be used: TLS server parameters for the embedded NATS server, and TLS client parameters for the NATS Streaming server itself.

The streaming server specifies it's TLS client certificates with the following three parameters:

```sh
-tls_client_key              Client key for the streaming server
-tls_client_cert             Client certificate for the streaming server
-tls_client_cacert           Client certificate CA for the streaming server
```

These could be the same certificates used with your NATS streaming clients.

The embedded NATS server specifies TLS server certificates with these:

```sh
--tlscert <file>             Server certificate file
--tlskey <file>              Private key for server certificate
--tlscacert <file>           Client certificate CA for verification
```

The server parameters are used the same way you'd [secure a typical NATS server](https://github.com/nats-io/nats-server#securing-nats).

Proper usage of the NATS Streaming Server requires the use of both client and server parameters.

For example:

```sh
% nats-streaming-server -tls_client_cert client-cert.pem -tls_client_key client-key.pem -tls_client_cacert ca.pem -tlscert server-cert.pem -tlskey server-key.pem -tlscacert ca.pem
```

Further TLS related functionality can be found in [Securing NATS > TLS](https://github.com/nats-io/nats-server#securing-nats). Note that if specifying cipher suites is required, a configuration file for the embedded NATS server can be passed through the `-config` command line parameter.
