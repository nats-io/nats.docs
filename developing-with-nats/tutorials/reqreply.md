# Explore NATS Request/Reply

NATS supports [request/reply](../../nats-concepts/reqreply.md) messaging. In this tutorial you explore how to exchange point-to-point messages using NATS.

## Prerequisites

Go and the NATS server should be installed.

### 1. Start the NATS server

```bash
% nats-server
```

### 2. Start two terminal sessions

You will use these sessions to run the NATS request and reply clients.

### 3. Change to the examples directory

```bash
% cd $GOPATH/src/github.com/nats-io/nats.go/examples
```

### 4. In one terminal, run the reply client listener

```bash
% go run nats-rply/main.go help.please "OK, I CAN HELP!!!"
```

You should see the message: _Listening on \[help.please\]_ 

This means that the NATS receiver client is listening for requests messages on the "help.please" subject. In NATS, the receiver is a subscriber.

### 5. In the other terminal, run the request client

```bash
% go run nats-req/main.go help.please "I need help!"
```

The NATS requestor client makes a request by sending the message "I need help!" on the “help.please” subject.

The NATS receiver client receives the message, formulates the reply \("OK, I CAN HELP!!!"\), and sends it to the inbox of the requester.
