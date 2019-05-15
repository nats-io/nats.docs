# Including a Reply Subject

The optional reply-to field when publishing a message can be used on the receiving side to respond. The reply-to subject is often called an _inbox_, and some libraries may provide a method for generating unique inbox subjects. For example to send a request to the subject `time`, with no content for the messages, you might:

!INCLUDE "../../_examples/publish_with_reply.html"