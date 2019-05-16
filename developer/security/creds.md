# Authenticating with an NKey

The 2.0 version of NATS server introduced the idea of JWT-based authentication. Clients interact with this new scheme using a user JWT and the private key from an NKey pair. To help make connecting with a JWT easier, the client libraries support the concept of a credentials file. This file contains both the private key and the JWT and can be generated with the `nsc` tool. Given a creds file, a client can authenticate as a specific user belonging to a specific account:

!INCLUDE "../../_examples/connect_creds.html"