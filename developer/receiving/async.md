# Asynchronous Subscriptions

Asynchronous subscriptions use callbacks of some form to notify an application when a message arrives. These subscriptions are usually easier to work with, but do represent some form of internal work and resource usage by the library. Check your libraries documentation for any resource usage associated with asynchronous subscriptions. The following example is the same as the previous one only with asynchronous code:

!INCLUDE "../../_examples/subscribe_async.html"