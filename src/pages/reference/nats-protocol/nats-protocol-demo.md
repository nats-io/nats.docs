# Protocol Demo

## Protocol Demo

The virtues of the NATS protocol manifest quickly when you experience how easy it is to use NATS. Because the NATS protocol is text-based, you can use NATS across virtually any platform or language. In the following demo we use [Telnet](https://en.wikipedia.org/wiki/Telnet).

On the wire you can publish and subscribe using a simple [set of protocol commands](nats-protocol/).

## Instructions

**1. Open a terminal session.**

You'll use this terminal as the subscriber.

**2. Connect to NATS.**

```shell
telnet demo.nats.io 4222
```

Expected result:

```text
Trying 107.170.221.32...
Connected to demo.nats.io.
Escape character is '^]'.
INFO {"server_id":"NCXMJZYQEWUDJFLYLSTTE745I2WUNCVG3LJJ3NRKSFJXEG6RGK7753DJ","version":"2.0.0","proto":1,"go":"go1.11.10","host":"0.0.0.0","port":4222,"max_payload":1048576,"client_id":5089}
```

**3. Run the subscriber.**

Subscribe to the wildcard subject `foo.*` with subject ID of `90`.

```text
sub foo.* 90
```

Subscriber result: `+OK` indicating successful interest registration.

```text
sub foo.* 90
+OK
```

**4. Open a second terminal window.**

You'll use this terminal for the publisher.

**5. Connect to NATS.**

```shell
telnet demo.nats.io 4222
```

Expected result:

```text
Trying 107.170.221.32...
Connected to demo.nats.io.
Escape character is '^]'.
INFO {"server_id":"NCXMJZYQEWUDJFLYLSTTE745I2WUNCVG3LJJ3NRKSFJXEG6RGK7753DJ","version":"2.0.0","proto":1,"go":"go1.11.10","host":"0.0.0.0","port":4222,"max_payload":1048576,"client_id":5089}
```

**6. Publish a message.**

The message includes the command \(`pub`\), subject \(`foo.bar`\), and length of the payload \(`5`\). Press enter and provide the payload \(`hello`\), then press enter again.

```text
pub foo.bar 5
hello
```

Publisher result: `+OK` indicating message publication.

```text
pub foo.bar 5
hello
+OK
```

Subscriber result: `MSG` + subject name + subscription ID + message payload size + message payload `hello`.

```text
sub foo.* 90
+OK
MSG foo.bar 90 5
hello
```

**7. Publish another message with reply subject.**

```text
pub foo.bar optional.reply.subject 5
hello
+OK
```

Subscriber result: `MSG` indicating message receipt.

```text
MSG foo.bar 90 optional.reply.subject 5
hello
```

**8. Unsubscribe from interest in the subject.**

You can use the `UNSUB` command to unsubscribe from a message.

Run the subscriber to unsubscribe:

```text
unsub 90
```

Subscriber result: `+OK` indicating successful deregistration of interest.

```text
unsub 90
+OK
```

**9. Reconnect to server and subscribe.**

```shell
telnet demo.nats.io 4222
```

```text
sub foo.* 90
```

**10. Explore the ping/pong interval.**

If you leave your telnet session open for a few minutes, you may notice that your clients receives `ping` requests from the server. If your client is not active, or does not respond to the server pings within the ping/pong interval, the server disconnects the client. The error message is `-ERR 'Stale Connection'`.

You can send a `ping` request to the serve and receive a `PONG` reply. For example:

```text
Connected to demo.nats.io.
Escape character is '^]'.
INFO {"server_id":"NCXMJZYQEWUDJFLYLSTTE745I2WUNCVG3LJJ3NRKSFJXEG6RGK7753DJ","version":"2.0.0","proto":1,"go":"go1.11.10","host":"0.0.0.0","port":4222,"max_payload":1048576,"client_id":5089}

ping
PONG
```

