# Acknowledgements

In a system with at-most-once semantics, there are times when messages can be lost. If your application is doing request-reply it should use timeouts to handle any network or application failures. It is always a good idea to place a timeout on a requests and have code that deals with timeouts. When you are publishing an event or data stream, one way to ensure message delivery is to turn it into a request-reply with the concept of an acknowledgement message, or ACKs. In NATS an ACK can simply be an empty message, a message with no payload.

![acks](/assets/images/acks.svg)

Because the ACK can be empty it can take up very little network bandwidth, but the idea of the ACK turns a simple fire-and-forget into a fire-and-know world where the sender can be sure that the message was received by the other side, or with a [scatter-gather pattern](reqreply.md), several other sides.
