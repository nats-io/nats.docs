# Set the Number of Reconnect Attempts

Applications can set the maximum reconnect attempts. Generally, this will limit the actual number of attempts total, but check your library documentation. For example, in Java, if the client knows about 3 servers and the maximum reconnects is set to 2, it will not try all of the servers. On the other hand, if the maximum is set to 6 it will try all of the servers twice before considering the reconnect a failure and closing.

!INCLUDE "../../\_examples/reconnect\_10x.html"

