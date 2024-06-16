NATS is a [publish subscribe](pubsub.md) messaging system [based on subjects](../../subjects.md). Subscribers listening on a subject receive messages published on that subject. If the subscriber is not actively listening on the subject, the message is not received. Subscribers can use the wildcard tokens such as `*` and `>` to match a single token or to match the tail of a subject.

# NATS Pub/Sub Walkthrough
  
This simple walkthrough demonstrates some ways in which subscribers listen on subjects, and publishers send messages on specific subjects.  
  
![](../../../.gitbook/assets/pubsubtut.svg)

## Walkthrough prerequisites

If you have not already done so, you need to [install](../../what-is-nats/walkthrough_setup.md) the `nats` CLI Tool and optionally the nats-server on your machine.

### 1. Create Subscriber 1

In a shell or command prompt session, start a client subscriber program.  

```bash
nats sub <subject>
```
  
Here, `<subject>` is a subject to listen on. It helps to use unique and well thought-through subject strings because you need to ensure that messages reach the correct subscribers even when wildcards are used.
  
For example:  

```bash
nats sub msg.test
```

You should see the message: _Listening on \[msg.test\]_

### 2. Create a Publisher and publish a message

In another shell or command prompt, create a NATS publisher and send a message.  

```bash
nats pub <subject> <message>
```

Where `<subject>` is the subject name and `<message>` is the text to publish.

For example:

```bash
nats pub msg.test "NATS MESSAGE"
```

### 3. Verify message publication and receipt

You'll notice that the publisher sends the message and prints: _Published \[msg.test\] : 'NATS MESSAGE'_.

The subscriber receives the message and prints: _\[\#1\] Received on \[msg.test\]: 'NATS MESSAGE'_.

If the receiver does not get the message, you'll need to check if you are using the same subject name for the publisher and the subscriber.  

### 4. Try publishing another message

```bash
nats pub msg.test "NATS MESSAGE 2"
```

You'll notice that the subscriber receives the message.   
Note that a message count is incremented each time your subscribing client receives a message on that subject.  

### 5. Create Subscriber 2

In a new shell or command prompt, start a new NATS subscriber.   

```bash
nats sub msg.test
```

### 6. Publish another message using the publisher client

```bash
nats pub msg.test "NATS MESSAGE 3"
```

Verify that both subscribing clients receive the message.

### 7. Create Subscriber 3

In a new shell or command prompt session, create a new subscriber that listens on a different subject.  

```bash
nats sub msg.test.new
```

### 8. Publish another message

```bash
nats pub msg.test "NATS MESSAGE 4"
```

Subscriber 1 and Subscriber 2 receive the message, but Subscriber 3 does not. Why? Because Subscriber 3 is not listening on the message subject used by the publisher.

### 9. Alter Subscriber 3 to use a wildcard

Change the last subscriber to listen on msg.\* and run it:  

```bash
nats sub msg.*
```
  
Note: NATS supports the use of wildcard characters for message subscribers only. You cannot publish a message using a wildcard subject.

### 10. Publish another message

```bash
nats pub msg.test "NATS MESSAGE 5"
```
  
This time, all three subscribing clients should receive the message.  
  
Do try out a few more variations of substrings and wildcards to test your understanding.  


# See Also

Publish-subscribe pattern with the NATS CLI&#x20;

{% embed url="https://www.youtube.com/watch?v=jLTVhP08Tq0" %}
Publish-subscribe pattern - NATS CLI
{% endembed %}

