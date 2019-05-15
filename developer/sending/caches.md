# Caches, Flush and Ping

For performance reasons, most if not all, of the client libraries will cache outgoing data so that bigger chunks can be written to the network at one time. This may be as simple as a byte buffer that stores up a few messages before being pushed to the network. It is the libraries job to make sure messages flow in a high performance manner. But there may be times when an application needs to know that a message has "hit the wire." In this case, applications can use a flush call to tell the library to move data through the system.

!INCLUDE "../../_examples/flush.html"

## Flush and Ping/Pong

Many of the client libraries use the PING/PONG interaction built into the NATS protocol to insure that flush pushed all of the cached messages to the server. When an application calls flush, in this case, the library will put a PING on the outgoing queue of messages, and wait for the server to send PONG before saying that the flush was successful.