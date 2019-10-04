# Authenticating with an NKey

The 2.0 version of NATS server introduces a new challenge response authentication option. This challenge response is based on a wrapper we call NKeys which uses [Ed25519](https://ed25519.cr.yp.to/) signing. The server can use these keys in several ways for authentication. The simplest is for the server to be configured with a list of known public keys and for the clients to respond to the challenge by signing it with its private key. This challenge-response ensures security by ensuring that the client has the private key, but also protects the private key from the server which never has to actually see it.

Handling challenge response may require more than just a setting in the connection options, depending on the client library.

!INCLUDE "../../\_examples/connect\_nkey.html"

