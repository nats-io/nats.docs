# Structured Data

Client libraries may provide tools to help receive structured data, like JSON. The core traffic to the NATS server will always be opaque byte arrays. The server does not process message payloads in any form. For libraries that don't provide helpers, you can always encode and decode data before sending the associated bytes to the NATS client.

For example, to receive JSON you could do:

!INCLUDE "../../\_examples/subscribe\_json.html"

