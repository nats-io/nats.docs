# Sending Messages

NATS sends and receives messages using a protocol that includes a target subject, an optional reply subject and an array of bytes. Some libraries may provide helpers to convert other data formats to and from bytes, but the NATS server will treat all messages as opaque byte arrays. All of the NATS clients are designed to make sending a message simple. For example, to send the string “All is Well” to the “updates” subject as a UTF-8 string of bytes you would do:

!INCLUDE "../../_examples/publish_bytes.html"