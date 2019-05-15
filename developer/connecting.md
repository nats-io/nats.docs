# Connecting to NATS

Most client libraries provide several ways to connect to the NATS server, gnatsd. The server itself is identified by a standard URL with the `nats` protocol. Throughout these examples we will rely on a test server, provided by [nats.io](https://nats.io), at `nats://demo.nats.io:4222`, where `4222` is the default port for NATS. 

## Connecting to a Specific Server

For example, to connect to the demo server with a URL:

!INCLUDE "examples/connect_url.html"

## Connecting to the Default Server

Some libraries also provide a special way to connect to a *default* url, which is general `nats://localhost:4222`:

!INCLUDE "examples/connect_default.html"

## Setting a Connect Timeout

Each library has its own, language preferred way, to pass connection options. For example, to set the maximum time to connect to a server to 10 seconds:

!INCLUDE "examples/connect_options.html"

The available options are discussed more below, in other pages, and in the documentation for your client library.

## Connecting to a Cluster

When connecting to a cluster, there are a few things to think about.

* Passing a URL for each cluster member (semi-optional)
* The connection algorithm
* The reconnect algorithm (discussed later)
* Server provided URLs

When a client connects to the server, the server may provide a list of URLs for additional known servers. This allows a client to connect to one server and still have other servers available during reconnect. However, the initial connection cannot depend on these additional servers. Rather, the additional connection will try to connect to each of the URLs provided in the connect call and will fail if it is unable to connect to any of them. *Note, failure behavior is library dependent, please check the documentation for your client library on information about what happens if the connect fails.*

!INCLUDE "examples/connect_multiple.html"

## Reconnecting

Most, if not all, of the client libraries will reconnect to the server if they are disconnected due to a network problem. The reconnect logic can differ by library, so check your client libraries. In general, the client will try to connect to all of the servers it knows about, either through the URLs provided in `connect` or the URLs provided by its most recent server. The library may have several options to help control reconnect behavior.

### Disable Reconnect

For example, you can disable reconnect:

!INCLUDE "examples/reconnect_none.html"

### Set the Number of Reconnect Attempts

Applications can set the maximum reconnect attempts. Generally, this will limit the actual number of attempts total, but check your library documentation. For example, in Java, if the client knows about 3 servers and the maximum reconnects is set to 2, it will not try all of the servers. On the other hand, if the maximum is set to 6 it will try all of the servers twice before considering the reconnect a failure and closing.

!INCLUDE "examples/reconnect_10x.html"

### Pausing Between Reconnect Attempts

It doesn’t make much sense to try to connect to the same server over and over. To prevent this sort of thrashing, and wasted reconnect attempts, libraries provide a wait setting. This setting will pause the reconnect logic if the same server is being tried multiple times. In the previous example, if you have 3 servers and 6 attempts, the Java library would loop over the three servers. If none were connectable, it will then try all three again. However, the Java client doesn’t wait between each attempt, only when trying the same server again, so in that example the library may never wait. If on the other hand, you only provide a single server URL and 6 attempts, the library will wait between each attempt.

!INCLUDE "examples/reconnect_10s.html"

### Avoiding the Thundering Herd

When a server goes down, there is a possible anti-pattern called the *Thundering Herd* where all of the clients try to reconnect immediately creating a denial of service attack. In order to prevent this, most NATS client libraries randomize the servers they attempt to connect to. This setting has no effect if only a single server is used, but in the case of a cluster, randomization, or shuffling, will ensure that no one server bears the brunt of the client reconnect attempts.

!INCLUDE "examples/reconnect_no_random.html"

### Listening for Reconnect Events

Because reconnect is primarily under the covers many libraries provide an event listener you can use to be notified of reconnect events. This event can be especially important for applications sending a lot of messages.

!INCLUDE "examples/reconnect_event.html"


### Buffering Messages During Reconnect Attempts

There is another setting that comes in to play during reconnection. This setting controls how much memory the client library will hold in the form of outgoing messages while it is disconnected. During a short reconnect, the client will generally allow applications to publish messages but because the server is offline, will be cached in the client. The library will then send those messages on reconnect. When the maximum reconnect buffer is reached, messages will no longer be publishable by the client.

!INCLUDE "examples/reconnect_5mb.html"

> *As mentioned throughout this document, each client library may behave slightly differently. Please check the documentation for the library you are using.*