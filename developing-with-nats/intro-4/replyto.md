# Including a Reply Subject

The optional reply-to field when publishing a message can be used on the receiving side to respond. The reply-to subject is often called an _inbox_, and most libraries may provide a method for generating unique inbox subjects. Most libraries also provide for the request-reply pattern with a single call. For example to send a request to the subject `time`, with no content for the messages, you might:

!INCLUDE "../../\_examples/publish\_with\_reply.html"

