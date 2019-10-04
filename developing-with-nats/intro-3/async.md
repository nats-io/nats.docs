# Asynchronous Subscriptions

Asynchronous subscriptions use callbacks of some form to notify an application when a message arrives. These subscriptions are usually easier to work with, but do represent some form of internal work and resource usage, i.e. threads, by the library. Check your library's documentation for any resource usage associated with asynchronous subscriptions.

The following example subscribes to the subject `updates` and handles the incoming messages:

!INCLUDE "../../\_examples/subscribe\_async.html"

