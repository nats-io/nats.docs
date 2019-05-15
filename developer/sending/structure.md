# Sending Structured Data

Some client libraries provide helpers to send structured data while others depend on the application to perform any encoding and decoding and just take byte arrays for sending. The following example shows how to send JSON but this could easily be altered to send a protocol buffer, YAML or some other format. JSON is a text format so we also have to encode the string in most languages to bytes. We are using UTF-8, the JSON standard encoding.

Take a simple _stock ticker_ that sends the symbol and price of each stock:

!INCLUDE "../../_examples/publish_json.html"