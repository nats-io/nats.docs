# Reconnecting

Most, if not all, of the client libraries will reconnect to the NATS system if they are disconnected for any reason. The reconnect logic can differ by library, so check your client library's documentation.

In general, the client will try to connect to all of the servers it knows about, either through the URLs provided in the `connect` call or the URLs provided by the NATS system itself. The NATS system will inform clients of new endpoints that can be used to reconnect. The library may have several options to help control reconnect behavior.

The list of servers used during reconnect is library dependent, but generally is constructed from connect function/options and the list of servers provided by the NATS system itself. This feature allows NATS applications and the NATS system itself to self heal and reconfigure itself with no additional configuration or intervention.
