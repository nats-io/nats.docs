# Encrypting Connections with TLS

While authentication limits which clients can connect, TLS can be used to check the server’s identity and optionally the client’s identity and will encrypt all traffic between the two. The most secure version of TLS with NATS is to use verified client certificates. In this mode, the client can check that it trusts the certificate sent by NATS system but the individual server will also check that it trusts the certificate sent by the client. From an application's perspective connecting to a server that does not verify client certificates may appear identical. Under the covers, disabling TLS verification removes the server side check on the client’s certificate. When started in TLS mode, a `nats-server` will require all clients to connect with TLS. Moreover, if configured to connect with TLS, client libraries will fail to connect to a server without TLS.

The [Java examples repository](https://github.com/nats-io/java-nats-examples/tree/master/src/main/resources) contains certificates for starting the server in TLS mode.

```bash
> nats-server -c /src/main/resources/tls.conf
 or
> nats-server -c /src/main/resources/tls_verify.conf
```

## Connecting with TLS

Connecting to a server with TLS is straightforward. Most clients will automatically use TLS when connected to a NATS system using TLS. Setting up a NATS system to use TLS is primarily an exercise in setting up the certificate and trust managers. Clients may also need additional information, for example:

!INCLUDE "../../\_examples/connect\_tls.html"

## Connecting with the TLS Protocol

Some clients may support the `tls` protocol as well as a manual setting to turn on TLS. However, in that case there is likely some form of default or environmental settings to allow the TLS libraries to find certificate and trust stores.

!INCLUDE "../../\_examples/connect\_tls\_url.html"

