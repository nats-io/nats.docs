# Connecting to a Cluster

When connecting to a cluster, there are a few things to think about.

* Passing a URL for each cluster member (semi-optional)
* The connection algorithm
* The reconnect algorithm (discussed later)
* Server provided URLs

When a client library first tries to connect it will use the list of URLS provided to the connection options or function. These URLS are checked, usually in order, and the first successful connection is used.

After a client connects to the server, the server may provide a list of URLs for additional known servers. This allows a client to connect to one server and still have other servers available during reconnect.

To insure the initial connection, your code should include a list of reasonable _front line_ servers. Those servers may know about other members of the cluster, and may tell the client about those members. But you don't have to configure the client to pass every valid member of the cluster in the connect method.

By providing the ability to pass multiple connect options NATS can handle the possibility of a machine going down or being unavailable to a client. By adding the ability of the server to feed clients a list of known servers as part of the client-server protocol the mesh created by a cluster can grow and change organically while the clients are running.

*Note, failure behavior is library dependent, please check the documentation for your client library on information about what happens if the connect fails.*

!INCLUDE "../../_examples/connect_multiple.html"