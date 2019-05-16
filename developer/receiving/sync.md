
# Synchronous Subscriptions

Synchronous subscriptions require the application to poll for messages. This type of subscription is easy to set-up and use, but requires the application to deal with looping if multiple messages are expected. For situations where a single message is expected, synchronous subscriptions are sometimes easier to manage, depending on the language.

For example, to subscribe to the subject `updates` and receive a single message you could do:

!INCLUDE "../../_examples/subscribe_sync.html"