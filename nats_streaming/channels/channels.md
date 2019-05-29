# Channels

Channels are at the heart of the NATS Streaming Server. Channels are subjects clients send data to and consume from.

***Note: NATS Streaming server does not support wildcard for channels, that is, one cannot subscribe on `foo.*`, or `>`, etc...***

The number of channels can be limited (and is by default) through configuration. Messages produced to a channel are stored in a message log inside this channel.