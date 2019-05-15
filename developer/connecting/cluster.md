# Connecting to a Cluster

When connecting to a cluster, there are a few things to think about.

* Passing a URL for each cluster member (semi-optional)
* The connection algorithm
* The reconnect algorithm (discussed later)
* Server provided URLs

When a client connects to the server, the server may provide a list of URLs for additional known servers. This allows a client to connect to one server and still have other servers available during reconnect. However, the initial connection cannot depend on these additional servers. Rather, the additional connection will try to connect to each of the URLs provided in the connect call and will fail if it is unable to connect to any of them. *Note, failure behavior is library dependent, please check the documentation for your client library on information about what happens if the connect fails.*

!INCLUDE "../../_examples/connect_multiple.html"