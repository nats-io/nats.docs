
# Authenticating with a Token

Tokens are basically random strings, much like a password, and can provide a simple authentication mechanism in some situations. However, tokens are only as safe as they are secret so other authentication schemes can provide more security in large installations.

For this example, start the server using:

```sh
> gnatsd --auth mytoken
```

The code uses localhost:4222 so that you can start the server on your machine to try them out.

## Connecting with a Token

!INCLUDE "../../_examples/connect_token.html"

## Connecting with a Token in the URL

Some client libraries will allow you to pass the token as part of the server URL using the form:

> nats://_token_@server:port

Again, once you construct this URL you can connect as if this was a normal URL.

!INCLUDE "../../_examples/connect_token_url.html"