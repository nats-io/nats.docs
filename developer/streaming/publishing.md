# Publishing to a Channel

The streaming client library can provide a method for publishing synchronously. These publish methods block until the ACK is returned by the server. An error or exception is used to indicate a timeout or other error.

```go
err := sc.Publish("foo", []byte("Hello World"))
```

Streaming libraries can also provide a way to publish asynchronously. An ACK callback of some kind is required. The library will publish the message and notify the callback on ACK or timeout. The global id associated with the message being sent is returned from publish so that the application can identify it on callback.

```go
ackHandler := func(ackedNuid string, err error){ ... }

nuid, err := sc.PublishAsync("foo", []byte("Hello World"), ackHandler)
```

Even in this mode, the call will still block if the library has a number of published messages without having received an ACK from the server. The default can be changed when creating the connection.

```go
sc, err := sc.Connect(clusterID, clientName, stan.MaxPubAcksInflight(1000))
```
