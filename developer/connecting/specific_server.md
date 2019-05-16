# Connecting to a Specific Server

The NATS client libraries can take a full URL, `nats://demo.nats.io:4222`, to specify a specific server host and port to connect to.

Libraries are removing the requirement for an explicit protocol and may allow `nats://demo.nats.io:4222` or just `demo.nats.io:4222`. Check with your specific client library's documentation to see what URL formats are supported.

For example, to connect to the demo server with a URL you can use:

!INCLUDE "../../_examples/connect_url.html"