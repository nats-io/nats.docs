# Explore NATS Request/Reply

NATS supports request/reply messaging. In this tutorial you explore how to exchange point-to-point messages using NATS.

## Prerequisites

Go and the NATS server should be installed.

### 1. Start the NATS server

```sh
% nats-server
```

### 2. Start two terminal sessions

You will use these sessions to run the NATS request and reply clients.

### 3. Change to the examples directory

```sh
% cd $GOPATH/src/github.com/nats-io/nats/examples
```

### 4. In one terminal, run the reply client listener

```sh
% go run nats-rply.go foo "this is my response"
```

You should see the message `Receiver is listening`, and that the NATS receiver client is listening on the "help.please" subject. The reply client acts as a receiver, listening for message requests. In NATS, the receiver is a subscriber.

### 5. In the other terminal, run the request client

```sh
% go run nats-req.go foo "request payload"
```

The NATS requestor client makes a request by sending the message "some message" on the “help.please” subject.

The NATS receiver client receives the message, formulates the reply ("OK, I CAN HELP!!!), and sends it to the inbox of the requester.
