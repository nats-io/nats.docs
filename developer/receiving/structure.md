# Receiving Structured Data

In the publishing examples, we showed how to send JSON through NATS but you can receive encoded data as well. Each client library may provide tools to help with this encoding. The core traffic to the NATS server will always be byte arrays.

!INCLUDE "../../_examples/subscribe_json.html"