# Fault Tolerance

To minimize the single point of failure, NATS Streaming server can be run in Fault Tolerance mode. It works by having a group of servers with one acting as the active server (accessing the store) and handling all communication with clients, and all others acting as standby servers. 

It is important to note that is not possible to run Nats Stream as Fault Tolerance mode and Clustering mode at the same time.

To start a server in Fault Tolerance (FT) mode, you specify an FT group name.

Here is an example on how starting 2 servers in FT mode running on the same host and embedding the NATS servers:

```
nats-streaming-server -store file -dir datastore -ft_group "ft" -cluster nats://localhost:6222 -routes nats://localhost:6223 -p 4222

nats-streaming-server -store file -dir datastore -ft_group "ft" -cluster nats://localhost:6223 -routes nats://localhost:6222 -p 4223
```