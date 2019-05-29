# Failover

When the active server fails, all standby servers will try to activate. The process consists of trying to get an exclusive lock on the storage.

The first server that succeeds will become active and go through the process of recovering the store and service clients. It is as if a server in standalone mode was automatically restarted.

All other servers that failed to get the store lock will go back to standby mode and stay in this mode until they stop receiving heartbeats from the current active server.

It is possible that a standby trying to activate is not able to immediately acquire the store lock. When that happens, it goes back into standby mode, but if it fails to receive heartbeats from an active server, it will try again to acquire the store lock. The interval is random but as of now set to a bit more than a second.
