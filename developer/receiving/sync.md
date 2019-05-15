
# Synchronous Subscriptions

Synchronous subscriptions require the application to poll for messages. This type of subscription is easy to set-up and use, but requires the application to deal with looping if multiple messages are expected. For example, to subscribe to the subject `updates` and receive a single message you could do:

!INCLUDE "../../_examples/subscribe_sync.html"