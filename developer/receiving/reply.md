# Replying to a Message

Incoming messages have an optional reply-to field. If that field is set, it will contain a subject to which a reply is expected. In the publishing examples we sent a request for the current time. The following code will listen for that request and respond with the time.

!INCLUDE "../../_examples/subscribe_w_reply.html"