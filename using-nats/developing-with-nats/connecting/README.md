# Connecting

In order for a NATS client application to connect to the NATS service, and then subscribe or publish messages to subjects, it needs to be able to be configured with the details of how to connect to the NATS service infrastructure and of how to authenticate with it.

# NATS URL

The NATS URL is a string (in a URL format) that specifies the IP address(es) and port(s) where the NATS server(s) can be reached, as well as what kind of transport to use:
   * Plain un-encrypted TCP connection (i.e. NATS URLs starting with `nats://...`)
   * TLS encrypted TCP connection (i.e. NATS URLs starting with `tls://...`)
   * Websocket connection (i.e. NATS URLs starting with `ws://...`)

### [Connecting to clusters](cluster.md)
### [Connecting to a specific server](specific_server.md)
### [Default URL](default_server.md)

## Specifying a [connection timeout](connect_timeout.md)
## [Automatic reconnection](../reconnect/README.md)
## [Turning Off Echo'd Messages](noecho.md)
## [Miscellaneous](misc.md)

# Naming your connection
Although it is optional, it is always a good idea to [name](name.md) your connections in order to identify them to the NATS Server administrators.

# Securing connections

NATS provides an extensive set of [security features](/nats-concepts/security.md): multiple forms of authentication, authorization, encryption and isolation. Applications authenticate to the NATS server infrastructure as a *users* (and users belong to *accounts*). 

As an application programmer, you do not have any control over security. All you have to worry about is that your application can be configured to pass the appropriate authentication credentials (that will be provided by the administrators of the NATS Server infrastructure at deployment time) when connecting.

TLS can be used to encrypt all traffic between clients and the NATS system, regardless of the authentication mechanism used, and can also be used to authenticate if using client certificates.

# Authentication details

Client applications must pass authentication details at connection time for the application to identify itself with the NATS server(s).

NATS supports multiple authentication schemes:
   * [Username/Password credentials](security/userpass.md) (which can be passed as part of the NATS URL)
   * [Decentralized JWT Authentication/Authorization](security/creds.md) (where the application is configured with the location of 'credentials file' containing the JWT and private Nkey)
   * [Token Authentication](security/token.md#connecting-with-a-token) (where the application is configured with a Token string)
   * [TLS Certificate](security/tls.md#connecting-with-tls-and-verify-client-identity) (where the client is configured to use a client TLS certificate and the servers are configured to map the TLS client certificates to users defined in the server configuration)
   * [NKEY with Challenge](security/nkey.md) (/using-nats/developer/security/nkey) (where the client is configured with a Seed and User NKeys)

## Runtime configuration

Your application should expose a way to be configured (e.g. environment variables, command line arguments or flags, configuration file, etc...) at run time with the NATS URL(s) and the security credentials to use (i.e. NATS *context*) to connect to the NATS Server Infrastructure.

# Connection Options

Besides the connectivity and security details, there are other options for a NATS connection ranging from [timeouts](../reconnect/README.md#connection-timeout-attributes) to [reconnect settings](../reconnect/README.md#reconnection-attributes) to setting [asynchronous error and connection event callback handlers](../reconnect/README.md#advisories) in your application.

## See Also

WebSocket and NATS&#x20;

{% embed url="https://www.youtube.com/watch?t=1s&v=AbAR9zgJnjY" %}
WebSocket and NATS | Hello World
{% endembed %}

NATS WebSockets and React

{% embed url="https://www.youtube.com/watch?v=XS_Q0i6orSk" %}
NATS WebSockets and React
{% endembed %}

