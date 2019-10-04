# Pausing Between Reconnect Attempts

It doesn’t make much sense to try to connect to the same server over and over. To prevent this sort of thrashing, and wasted reconnect attempts, libraries provide a wait setting. This setting will pause the reconnect logic if the same server is being tried multiple times **in a row**. In the previous example, if you have 3 servers and 6 attempts, the Java library would loop over the three servers. If none were connectable, it will then try all three again. However, the Java client doesn’t wait between each attempt, only when trying the same server again, so in that example the library may never wait. If on the other hand, you only provide a single server URL and 6 attempts, the library will wait between each attempt.

!INCLUDE "../../\_examples/reconnect\_10s.html"

