# Automatic Reconnections

Most, if not all, of the client libraries will reconnect to the NATS system if they are disconnected for any reason. The reconnect logic can differ by library, so check your client library's documentation.

In general, the client will try to re-connect to one of the servers it knows about, either through the URLs provided in the `connect` call or the URLs provided by the NATS system during earlier connects. This feature allows NATS applications and the NATS system itself to self heal and reconfigure itself with no additional configuration or intervention. The library may have several options to help control reconnect behavior, notify about reconnect state and inform about new server.