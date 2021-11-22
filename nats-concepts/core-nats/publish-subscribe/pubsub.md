# Publish-Subscribe

NATS implements a publish-subscribe message distribution model for one-to-many communication. A publisher sends a message on a subject and any active subscriber listening on that subject receives the message. Subscribers can also register interest in wildcard subjects that work a bit like a regular expression \(but only a bit\). This one-to-many pattern is sometimes called fan-out.

![](../../../.gitbook/assets/pubsub.svg)

# Messages
Messages are composed of a subject, a payload in the form of a byte array, any number of header fields, as well as an optional 'reply' address field. Messages have a maximum size (which is set in the server configuration with `max_payload`) which is set to 1 MB by default, but can be increased up to 64 MB if needed (though we recommend keeping the max message size to something more reasonable like 8 MB).