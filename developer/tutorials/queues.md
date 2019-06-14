# Explore NATS Queueing

NATS supports a form of load balancing using queue groups. Subscribers register a queue group name. A single subscriber in the group is randomly selected to receive the message.

## Prerequisites

Go and the NATS server should be installed.

### 1. Start the NATS server

```sh
nats-server
```

### 2. Clone the repositories for each client examples

```sh
go get github.com/nats-io/nats.go
git clone https://github.com/nats-io/nats.js.git
git clone https://github.com/nats-io/nats.rb.git
```

### 3. Run the Go client subscriber with queue group name

```sh
cd $GOPATH/src/github.com/nats-io/nats.go/examples
go run nats-qsub/main.go foo my-queue
```

### 4. Install and run the Node client subscriber with queue group name

```sh
npm install nats
cd nats.js/examples
node node-sub foo my-queue
```

### 5. Install and run the Ruby client subscriber with queue group name

```sh
gem install nats
nats-queue foo my-queue &
```

### 6. Run another Go client subscriber *without* the queue group.

```sh
cd $GOPATH/src/github.com/nats-io/nats.go/examples
go run nats-sub/main.go foo
```

### 7. Publish a NATS message using the Go client

```sh
cd $GOPATH/src/github.com/nats-io/nats.go/examples
go run nats-pub/main.go foo "Hello NATS!"
```

### 8. Verify message publication and receipt

You should see that the publisher sends the message: *Published [foo] : 'Hello NATS!'*

You should see that only one of the my-queue group subscribers receives the message. In addition, the Go client subscriber not in the my-queue group should also receive the message.

### 9. Publish another message

```sh
go run nats-pub/main.go foo "Hello NATS Again!"
```

You should see that a different queue group subscriber receives the message this time, chosen at random among the 3 queue group members.
