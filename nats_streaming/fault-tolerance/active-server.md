# Active Server

There is a single Active server in the group. This server was the first to obtain the exclusive lock for storage. For the `FileStore` implementation, it means trying to get an advisory lock for a file located in the shared datastore. For the `SQLStore` implementation, a special table is used in which the owner of the lock updates a column. Other instances will steal the lock if the column is not updated for a certain amount of time.

If the elected server fails to grab this lock because it is already locked, it will go back to standby.

***Only the active server accesses the store and service all clients.***
