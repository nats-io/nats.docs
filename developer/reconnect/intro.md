# Reconnecting

Most, if not all, of the client libraries will reconnect to the server if they are disconnected due to a network problem. The reconnect logic can differ by library, so check your client library's documentation.

In general, the client will try to connect to all of the servers it knows about, either through the URLs provided in `connect` or the URLs provided by its most recent server. The library may have several options to help control reconnect behavior.

The list of servers used during reconnect is library dependent, but generally is constructed from the list of servers passed to the connect function/options and the list of servers provided by the most recent connected server.

One, sometimes important, detail is that the server URLS provided to clients by servers will use addresses, while the URLS provided to the connect function will usually be host names. As a result, it is possible, on reconnect, for the same server to be tried multiple times without the client knowing about the match.