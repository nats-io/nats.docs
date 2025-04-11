# NATS JetStream Walkthrough

The following is a small walkthrough on creating a stream and a consumer and interacting with the stream using the [nats cli](https://github.com/nats-io/natscli).


## Prerequisite: enabling JetStream

If you are running a local `nats-server` stop it and restart it with JetStream enabled using `nats-server -js` (if that's not already done)

You can then check that JetStream is enabled by using

```shell
nats account info
```
```text
Account Information

                           User: 
                        Account: $G
                        Expires: never
                      Client ID: 5
                      Client IP: 127.0.0.1
                            RTT: 128µs
              Headers Supported: true
                Maximum Payload: 1.0 MiB
                  Connected URL: nats://127.0.0.1:4222
              Connected Address: 127.0.0.1:4222
            Connected Server ID: NAMR7YBNZA3U2MXG2JH3FNGKBDVBG2QTMWVO6OT7XUSKRINKTRFBRZEC
       Connected Server Version: 2.11.0-dev
                 TLS Connection: no

JetStream Account Information:

Account Usage:

                        Storage: 0 B
                         Memory: 0 B
                        Streams: 0
                      Consumers: 0

Account Limits:

            Max Message Payload: 1.0 MiB

  Tier: Default:

      Configuration Requirements:

        Stream Requires Max Bytes Set: false
         Consumer Maximum Ack Pending: Unlimited

      Stream Resource Usage Limits:

                               Memory: 0 B of Unlimited
                    Memory Per Stream: Unlimited
                              Storage: 0 B of Unlimited
                   Storage Per Stream: Unlimited
                              Streams: 0 of Unlimited
                            Consumers: 0 of Unlimited
```

If you see the below then JetStream is _not_ enabled

```text
JetStream Account Information:

   JetStream is not supported in this account
```

## 1. Creating a stream

Let's start by creating a stream to capture and store the messages published on the subject "foo".

Enter `nats stream add <Stream name>` (in the examples below we will name the stream "my_stream"), then enter "foo" as the subject name and hit return to use the defaults for all the other stream attributes:

```shell
nats stream add my_stream
```
```text
? Subjects foo
? Storage file
? Replication 1
? Retention Policy Limits
? Discard Policy Old
? Stream Messages Limit -1
? Per Subject Messages Limit -1
? Total Stream Size -1
? Message TTL -1
? Max Message Size -1
? Duplicate tracking time window 2m0s
? Allow message Roll-ups No
? Allow message deletion Yes
? Allow purging subjects or the entire stream Yes
Stream my_stream was created

Information for Stream my_stream created 2024-06-07 12:29:36

              Subjects: foo
              Replicas: 1
               Storage: File

Options:

             Retention: Limits
       Acknowledgments: true
        Discard Policy: Old
      Duplicate Window: 2m0s
            Direct Get: true
     Allows Msg Delete: true
          Allows Purge: true
        Allows Rollups: false

Limits:

      Maximum Messages: unlimited
   Maximum Per Subject: unlimited
         Maximum Bytes: unlimited
           Maximum Age: unlimited
  Maximum Message Size: unlimited
     Maximum Consumers: unlimited

State:

              Messages: 0
                 Bytes: 0 B
        First Sequence: 0
         Last Sequence: 0
      Active Consumers: 0
```

You can then check the information about the stream you just created:

```shell
nats stream info my_stream
```
```text
Information for Stream my_stream created 2024-06-07 12:29:36

              Subjects: foo
              Replicas: 1
               Storage: File

Options:

             Retention: Limits
       Acknowledgments: true
        Discard Policy: Old
      Duplicate Window: 2m0s
            Direct Get: true
     Allows Msg Delete: true
          Allows Purge: true
        Allows Rollups: false

Limits:

      Maximum Messages: unlimited
   Maximum Per Subject: unlimited
         Maximum Bytes: unlimited
           Maximum Age: unlimited
  Maximum Message Size: unlimited
     Maximum Consumers: unlimited

State:

              Messages: 0
                 Bytes: 0 B
        First Sequence: 0
         Last Sequence: 0
      Active Consumers: 0
```

## 2. Publish some messages into the stream

Let's now start a publisher

```shell
nats pub foo --count=1000 --sleep 1s "publication #{{.Count}} @ {{.TimeStamp}}"
```

As messages are being published on the subject "foo" they are also captured and stored in the stream, you can check that by using `nats stream info my_stream` and even look at the messages themselves using `nats stream view my_stream` or `nats stream get my_stream`

## 3. Creating a consumer

Now at this point if you create a 'Core NATS' (i.e. non-streaming) subscriber to listen for messages on the subject 'foo', you will _only_ receive the messages being published after the subscriber was started, this is normal and expected for the basic 'Core NATS' messaging. In order to receive a 'replay' of all the messages contained in the stream (including those that were published in the past) we will now create a 'consumer'

We can administratively create a consumer using the 'nats consumer add <Consumer name>' command, in this example we will name the consumer "pull_consumer", and we will leave the delivery subject to 'nothing' (i.e. just hit return at the prompt) because we are creating a 'pull consumer' and select `all` for the start policy, you can then just use the defaults and hit return for all the other prompts. The stream the consumer is created on should be the stream 'my_stream' we just created above.

```shell
nats consumer add
```
```text
? Consumer name pull_consumer
? Delivery target (empty for Pull Consumers) 
? Start policy (all, new, last, subject, 1h, msg sequence) all
? Acknowledgment policy explicit
? Replay policy instant
? Filter Stream by subjects (blank for all) 
? Maximum Allowed Deliveries -1
? Maximum Acknowledgments Pending 0
? Deliver headers only without bodies No
? Add a Retry Backoff Policy No
? Select a Stream my_stream
Information for Consumer my_stream > pull_consumer created 2024-06-07T12:32:09-05:00

Configuration:

                    Name: pull_consumer
               Pull Mode: true
          Deliver Policy: All
              Ack Policy: Explicit
                Ack Wait: 30.00s
           Replay Policy: Instant
         Max Ack Pending: 1,000
       Max Waiting Pulls: 512

State:

  Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
    Acknowledgment Floor: Consumer sequence: 0 Stream sequence: 0
        Outstanding Acks: 0 out of maximum 1,000
    Redelivered Messages: 0
    Unprocessed Messages: 74
           Waiting Pulls: 0 of maximum 512
```

You can check on the status of any consumer at any time using `nats consumer info` or view the messages in the stream using `nats stream view my_stream` or `nats stream get my_stream`, or even remove individual messages from the stream using `nats stream rmm`

## 3. Subscribing from the consumer

Now that the consumer has been created and since there are messages in the stream we can now start subscribing to the consumer:

```shell
nats consumer next my_stream pull_consumer --count 1000
```

This will print out all the messages in the stream starting with the first message (which was published in the past) and continuing with new messages as they are published until the count is reached.

Note that in this example we are creating a pull consumer with a 'durable' name, this means that the consumer can be shared between as many consuming processes as you want. For example instead of running a single `nats consumer next` with a count of 1000 messages you could have started two instances of `nats consumer` each with a message count of 500 and you would see the consumption of the messages from the consumer distributed between those instances of `nats`

#### Replaying the messages again

Once you have iterated over all the messages in the stream with the consumer, you can get them again by simply creating a new consumer or by deleting that consumer (`nats consumer rm`) and re-creating it (`nats consumer add`).

## 4. Cleaning up

You can clean up a stream (and release the resources associated with it (e.g. the messages stored in the stream)) using `nats stream purge`

You can also delete a stream (which will also automatically delete all of the consumers that may be defined on that stream) using `nats stream rm`
