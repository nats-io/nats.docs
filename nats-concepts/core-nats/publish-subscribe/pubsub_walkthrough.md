# NATS Pub/Sub Walkthrough

NATS is a [publish subscribe](pubsub.md) messaging system [based on subjects](../../subjects.md). Subscribers listening on a subject receive messages published on that subject. If the subscriber is not actively listening on the subject, the message is not received. Subscribers can use the wildcard tokens such as `*` and `>` to match a single token or to match the tail of a subject.

![](../../../.gitbook/assets/pubsubtut.svg)

### Walkthrough prerequisites

If you have not already done so, you need to [install](../../what-is-nats/walkthrough_setup.md) the `nats` CLI Tool and optionally the nats-server on your machine.

## 1. Run the client subscriber program

In a shell or command prompt session start a subscriber

```bash
nats sub <subject>
```

Where `<subject>` is a subject to listen on. A valid subject is a string that is unique in the system.

For example:

```bash
nats sub msg.test
```

You should see the message: _Listening on \[msg.test\]_

## 2. Start another shell or command prompt session

You will use this session to run a NATS publisher client.

## 3. Publish a NATS message

```bash
nats pub <subject> <message>
```

Where `<subject>` is the subject name and `<message>` is the text to publish.

For example:

```bash
nats pub msg.test hello
```

## 4. Verify message publication and receipt

You should see that the publisher sends the message and prints: _Published \[msg.test\] : 'NATS MESSAGE'_

And that the subscriber receives the message and prints: _\[\#1\] Received on \[msg.test\]: 'NATS MESSAGE'_

Note that if the receiver does not get the message, check that you are using the same subject name for the publisher and the subscriber.

## 5. Publish another message

```bash
nats pub msg.test "NATS MESSAGE 2"
```

You should see that the subscriber receives message 2. Note that the message count is incremented each time your subscribing client receives a message on that subject:

## 6. Start another shell or command prompt session

You will use this session to run a second NATS subscriber.

## 7. Start a second client subscriber program

```bash
nats sub msg.test
```

## 8. Publish another message using the publisher client

```bash
nats pub msg.test "NATS MESSAGE 3"
```

Verify that both subscribing clients receive the message.

## 9. Start another shell or command prompt session

You will use this session to run a third NATS subscriber.

## 10. Subscribe to a different subject

```bash
nats sub msg.test.new
```

All the but last subscriber receives the message. Why? Because that subscriber is not listening on the message subject used by the publisher.

## 11. Update the last subscriber to use a wildcard

NATS supports the use of wildcard characters for message subscribers only. You cannot publish a message using a wildcard subject.

Change the last subscriber the listen on msg.\* and run it:

```bash
nats sub msg.*
```

## 12. Publish another message

This time, all three subscribing clients should receive the message.


# See Also

Publish-subscribe pattern with the NATS CLI&#x20;

{% embed url="https://www.youtube.com/watch?v=jLTVhP08Tq0" %}
Publish-subscribe pattern - NATS CLI
{% endembed %}
