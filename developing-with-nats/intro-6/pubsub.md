# Explore NATS Pub/Sub

NATS is a publish subscribe messaging system. Subscribers listening on a subject receive messages on that subject. If the subscriber is not actively listening on the subject, the message is not received. Subscribers can use the wildcard tokens such as `*` and `>` to match a single token or to match the tail of a subject.

![](../../.gitbook/assets/pubsubtut.svg)

## Prerequisites

Go and the NATS server should be installed. Optionally you can use the demo server located at `nats://demo.nats.io`

### 1. Start the NATS server

```bash
% nats-server
```

When the server starts successfully, you will see the following messages:

```bash
[1] 2019/31/05 15:18:22.301550 [INF] Starting nats-server version 2.0.0
[1] 2019/31/05 15:18:22.301762 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/31/05 15:18:22.301769 [INF] nats-server is ready
```

The NATS server listens for client connections on TCP Port 4222.

### 2. Start a shell or command prompt session

You will use this session to run an example NATS client subscriber program.

### 3. CD to the Go client examples directory

```bash
% cd $GOPATH/src/github.com/nats-io/nats.go/examples
```

### 4. Run the client subscriber program

```bash
% go run nats-sub/main.go <subject>
```

Where `<subject>` is a subject to listen on. A valid subject is a string that is unique in the system.

For example:

```bash
% go run nats-sub/main.go msg.test
```

You should see the message: _Listening on \[msg.test\]_

### 5. Start another shell or command prompt session

You will use this session to run a NATS publisher client.

## 6. CD to the examples directory

```bash
% cd $GOPATH/src/github.com/nats-io/nats.go/examples
```

### 7. Publish a NATS message

```bash
% go run nats-pub/main.go <subject> <message>
```

Where `<subject>` is the subject name and `<message>` is the text to publish.

For example:

```bash
% go run nats-pub/main.go msg.test hello
```

or

```bash
% go run nats-pub/main.go msg.test "NATS MESSAGE"
```

### 8. Verify message publication and receipt

You should see that the publisher sends the message: _Published \[msg.test\] : 'NATS MESSAGE'_

And that the subscriber receives the message: _\[\#1\] Received on \[msg.test\]: 'NATS MESSAGE'_

Note that if the receiver does not get the message, check that you are using the same subject name for the publisher and the subscriber.

### 9. Publish another message

```bash
% go run nats-pub/main.go msg.test "NATS MESSAGE 2"
```

You should see that the subscriber receive message 2. Note that the message count is incremented each time your subscribing client receives a message on that subject:

### 10. Start another shell or command prompt session

You will use this session to run a second NATS subscriber.

### 11. CD to the examples directory

```bash
% cd $GOPATH/src/github.com/nats-io/nats.go/examples
```

### 12. Subscribe to the message

```bash
% go run nats-sub/main.go msg.test
```

### 13. Publish another message using the publisher client

```bash
% go run nats-pub/main.go msg.test "NATS MESSAGE 3"
```

Verify that both subscribing clients receive the message.

### 14. Start another shell or command prompt session

You will use this session to run a third NATS subscriber.

### 15. CD to the examples directory

```bash
% cd $GOPATH/src/github.com/nats-io/nats.go/examples
```

### 16. Subscribe to a different message

```bash
% go run nats-sub/main.go msg.test.new
```

All the but last subscriber receives the message. Why? Because that subscriber is not listening on the message subject used by the publisher.

### 17. Update the last subscriber to use a wildcard

NATS supports the use of wildcard characters for message subscribers. You cannot publish a message using a wildcard subject.

Change the last subscriber the listen on msg.\* and run it:

```bash
% go run nats-sub/main.go msg.*
```

### 18. Publish another message

This time, all three subscribing clients should receive the message.

