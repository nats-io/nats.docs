# Publish-Subscribe

NATS implements a publish-subscribe message distribution model for one-to-many communication. A publisher sends a message on a subject and any active subscriber listening on that subject receives the message. Subscribers can also register interest in wildcard subjects that work a bit like a regular expression \(but only a bit\). This one-to-many pattern is sometimes called a fan-out.

![](../../../.gitbook/assets/pubsub.svg)

# Messages
Messages are composed of:  
1. A subject.  
2. A payload in the form of a byte array.  
3. Any number of header fields.  
4. An optional 'reply' address field.  
  
Messages have a maximum size (which is set in the server configuration with `max_payload`). The size is set to 1 MB by default, but can be increased up to 64 MB if needed (though we recommend keeping the max message size to something more reasonable like 8 MB).
