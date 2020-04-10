# Persistence

By default, the NATS Streaming Server stores its state in memory, which means that if the streaming server is stopped, all state is lost. On server restart, since no connection information is recovered, running applications will stop receiving messages and new published messages will be rejected with an `invalid publish request` error. Client libraries that support and set the `Connection Lost` handler \(refer to [this](https://github.com/nats-io/stan.go#connection-status) for more information\) will be notified that the connection is lost with the error `client has been replaced or is no longer registered`.  
 Still, this level of persistence allows applications to stop and later resume the stream of messages, and protect against applications disconnect \(network or applications crash\).

* [File Store](file_store.md)
* [SQL Store ](sql_store.md)

