# Model Deep Dive

The Orders example touched on a lot of features, but some like different Ack models and message limits, need a bit more detail. This section will expand on the above and fill in some blanks.

## Stream Limits, Retention Modes and Discard Policy

Streams store data on disk, but we cannot store all data forever so we need ways to control their size automatically.

There are 3 features that come into play when Streams decide how long they store data.

The `Retention Policy` describes based on what criteria a set will evict messages from its storage:

| Retention Policy | Description |
| :--- | :--- |
| `LimitsPolicy` | Limits are set for how many messages, how big the storage and how old messages may be |
| `WorkQueuePolicy` | Messages are kept until they were consumed by any one single observer and then removed |
| `InterestPolicy` | Messages are kept as long as there are Consumers active for them |

In all Retention Policies the basic limits apply as upper bounds, these are `MaxMsgs` for how many messages are kept in total, `MaxBytes` for how big the set can be in total and `MaxAge` for what is the oldest message that will be kept. These are the only limits in play with `LimitsPolicy` retention.

One can then define additional ways a message may be removed from the Stream earlier than these limits. In `WorkQueuePolicy` the messages will be removed as soon as any Consumer received an Acknowledgement. In `InterestPolicy` messages will be removed as soon as there are no more Consumers.

In both `WorkQueuePolicy` and `InterestPolicy` the age, size and count limits will still apply as upper bounds.

A final control is the Maximum Size any single message may have. NATS have it's own limit for maximum size \(1 MiB by default\), but you can say a Stream will only accept messages up to 1024 bytes using `MaxMsgSize`.

The `Discard Policy` sets how messages are discarded when limits set by `LimitsPolicy` are reached. The `DiscardOld` option removes old messages making space for new, while `DiscardNew` refuses any new messages.

The `WorkQueuePolicy` mode is a specialized mode where a message, once consumed and acknowledged, is discarded from the Stream. In this mode, there are a few limits on consumers. Inherently it's about 1 message to one consumer, this means you cannot have overlapping consumers defined on the Stream - needs unique filter subjects.

## Message Deduplication

JetStream support idempotent message writes by ignoring duplicate messages as indicated by the `Nats-Msg-Id` header.

```text
% nats req -H Nats-Msg-Id:1 ORDERS.new hello1
% nats req -H Nats-Msg-Id:1 ORDERS.new hello2
% nats req -H Nats-Msg-Id:1 ORDERS.new hello3
% nats req -H Nats-Msg-Id:1 ORDERS.new hello4
```

Here we set a `Nats-Msg-Id:1` header which tells JetStream to ensure we do not have duplicates of this message - we only consult the message ID not the body.

```text
$ nats str info ORDERS
....
State:

            Messages: 1
               Bytes: 67 B
```

The default window to track duplicates in is 2 minutes, this can be set on the command line using `--dupe-window` when creating a stream, though we would caution against large windows.

## Acknowledgement Models

Streams support acknowledging receiving a message, if you send a `Request()` to a subject covered by the configuration of the Stream the service will reply to you once it stored the message. If you just publish, it will not. A Stream can be set to disable Acknowledgements by setting `NoAck` to `true` in it's configuration.

Consumers have 3 acknowledgement modes:

| Mode | Description |
| :--- | :--- |
| `AckExplicit` | This requires every message to be specifically acknowledged, it's the only supported option for pull-based Consumers |
| `AckAll` | In this mode if you acknowledge message `100` it will also acknowledge message `1`-`99`, this is good for processing batches and to reduce ack overhead |
| `AckNone` | No acknowledgements are supported |

To understand how Consumers track messages we will start with a clean `ORDERS` Stream and `DISPATCH` Consumer.

```text
$ nats str info ORDERS
...
Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 0
             LastSeq: 0
    Active Consumers: 1
```

The Set is entirely empty

```text
$ nats con info ORDERS DISPATCH
...
State:

  Last Delivered Message: Consumer sequence: 1 Stream sequence: 1
    Acknowledgment floor: Consumer sequence: 0 Stream sequence: 0
        Pending Messages: 0
    Redelivered Messages: 0
```

The Consumer has no messages outstanding and has never had any \(Consumer sequence is 1\).

We publish one message to the Stream and see that the Stream received it:

```text
$ nats pub ORDERS.processed "order 4"
Published 7 bytes to ORDERS.processed
$ nats str info ORDERS
...
Statistics:

            Messages: 1
               Bytes: 53 B
            FirstSeq: 1
             LastSeq: 1
    Active Consumers: 1
```

As the Consumer is pull-based, we can fetch the message, ack it, and check the Consumer state:

```text
$ nats con next ORDERS DISPATCH
--- received on ORDERS.processed
order 4

Acknowledged message

$ nats con info ORDERS DISPATCH
...
State:

  Last Delivered Message: Consumer sequence: 2 Stream sequence: 2
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 0
    Redelivered Messages: 0
```

The message got delivered and acknowledged - `Acknowledgement floor` is `1` and `1`, the sequence of the Consumer is `2` which means its had only the one message through and got acked. Since it was acked, nothing is pending or redelivering.

We'll publish another message, fetch it but not Ack it this time and see the status:

```text
$ nats pub ORDERS.processed "order 5"
Published 7 bytes to ORDERS.processed

$ nats con next ORDERS DISPATCH --no-ack
--- received on ORDERS.processed
order 5

$ nats con info ORDERS DISPATCH
State:

  Last Delivered Message: Consumer sequence: 3 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 1
    Redelivered Messages: 0
```

Now we can see the Consumer has processed 2 messages \(obs sequence is 3, next message will be 3\) but the Ack floor is still 1 - thus 1 message is pending acknowledgement. Indeed this is confirmed in the `Pending messages`.

If I fetch it again and again do not ack it:

```text
$ nats con next ORDERS DISPATCH --no-ack
--- received on ORDERS.processed
order 5

$ nats con info ORDERS DISPATCH
State:

  Last Delivered Message: Consumer sequence: 4 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 1
    Redelivered Messages: 1
```

The Consumer sequence increases - each delivery attempt increases the sequence - and our redelivered count also goes up.

Finally, if I then fetch it again and ack it this time:

```text
$ nats con next ORDERS DISPATCH 
--- received on ORDERS.processed
order 5

Acknowledged message
$ nats con info ORDERS DISPATCH
State:

  Last Delivered Message: Consumer sequence: 5 Stream sequence: 3
    Acknowledgment floor: Consumer sequence: 1 Stream sequence: 1
        Pending Messages: 0
    Redelivered Messages: 0
```

Having now Acked the message there are no more pending.

Additionally, there are a few types of acknowledgements:

| Type | Bytes | Description |
| :--- | :--- | :--- |
| `AckAck` | nil, `+ACK` | Acknowledges a message was completely handled |
| `AckNak` | `-NAK` | Signals that the message will not be processed now and processing can move onto the next message, NAK'd message will be retried |
| `AckProgress` | `+WPI` | When sent before the AckWait period indicates that work is ongoing and the period should be extended by another equal to `AckWait` |
| `AckNext` | `+NXT` | Acknowledges the message was handled and requests delivery of the next message to the reply subject. Only applies to Pull-mode. |
| `AckTerm` | `+TERM` | Instructs the server to stop redelivery of a message without acknowledging it as successfully processed |

So far all of the examples were the `AckAck` type of acknowledgement, by replying to the Ack with the body as indicated in `Bytes` you can pick what mode of acknowledgement you want.

All of these acknowledgement modes, except `AckNext`, support double acknowledgement - if you set a reply subject when acknowledging the server will in turn acknowledge having received your ACK.

The `+NXT` acknowledgement can have a few formats: `+NXT 10` requests 10 messages and `+NXT {"no_wait": true}` which is the same data that can be sent in a Pull Request.

## Exactly Once Delivery

JetStream supports Exactly Once delivery by combining Message Deduplication and double acks.

On the publishing side you can avoid duplicate message ingestion using the [Message Deduplication](model_deep_dive.md#message-deduplication) feature.

Consumers can be 100% sure a message was correctly processed by requesting the server Acknowledge having received your acknowledgement by setting a reply subject on the Ack. If you receive this response you will never receive that message again.

## Consumer Starting Position

When setting up a Consumer you can decide where to start, the system supports the following for the `DeliverPolicy`:

| Policy | Description |
| :--- | :--- |
| `all` | Delivers all messages that are available |
| `last` | Delivers the latest message, like a `tail -n 1 -f` |
| `new` | Delivers only new messages that arrive after subscribe time |
| `by_start_time` | Delivers from a specific time onward.  Requires `OptStartTime` to be set |
| `by_start_sequence` | Delivers from a specific stream sequence. Requires `OptStartSeq` to be set |

Regardless of what mode you set, this is only the starting point. Once started it will always give you what you have not seen or acknowledged. So this is merely how it picks the very first message.

Let's look at each of these, first we make a new Stream `ORDERS` and add 100 messages to it.

Now create a `DeliverAll` pull-based Consumer:

```text
$ nats con add ORDERS ALL --pull --filter ORDERS.processed --ack none --replay instant --deliver all 
$ nats con next ORDERS ALL
--- received on ORDERS.processed
order 1

Acknowledged message
```

Now create a `DeliverLast` pull-based Consumer:

```text
$ nats con add ORDERS LAST --pull --filter ORDERS.processed --ack none --replay instant --deliver last
$ nats con next ORDERS LAST
--- received on ORDERS.processed
order 100

Acknowledged message
```

Now create a `MsgSetSeq` pull-based Consumer:

```text
$ nats con add ORDERS TEN --pull --filter ORDERS.processed --ack none --replay instant --deliver 10
$ nats con next ORDERS TEN
--- received on ORDERS.processed
order 10

Acknowledged message
```

And finally a time-based Consumer. Let's add some messages a minute apart:

```text
$ nats str purge ORDERS
$ for i in 1 2 3
do
  nats pub ORDERS.processed "order ${i}"
  sleep 60
done
```

Then create a Consumer that starts 2 minutes ago:

```text
$ nats con add ORDERS 2MIN --pull --filter ORDERS.processed --ack none --replay instant --deliver 2m
$ nats con next ORDERS 2MIN
--- received on ORDERS.processed
order 2

Acknowledged message
```

## Ephemeral Consumers

So far, all the Consumers you have seen were Durable, meaning they exist even after you disconnect from JetStream. In our Orders scenario, though the `MONITOR` a Consumer could very well be a short-lived thing there just while an operator is debugging the system, there is no need to remember the last seen position if all you are doing is wanting to observe the real-time state.

In this case, we can make an Ephemeral Consumer by first subscribing to the delivery subject, then creating a durable and giving it no durable name. An Ephemeral Consumer exists as long as any subscription is active on its delivery subject. It is automatically be removed, after a short grace period to handle restarts, when there are no subscribers.

Ephemeral Consumers can only be push-based.

Terminal 1:

```text
$ nats sub my.monitor
```

Terminal 2:

```text
$ nats con add ORDERS --filter '' --ack none --target 'my.monitor' --deliver last --replay instant --ephemeral
```

The `--ephemeral` switch tells the system to make an Ephemeral Consumer.

## Consumer Message Rates

Typically what you want is if a new Consumer is made the selected messages are delivered to you as quickly as possible. You might want to replay messages at the rate they arrived though, meaning if messages first arrived 1 minute apart and you make a new Consumer it will get the messages a minute apart.

This is useful in load testing scenarios etc. This is called the `ReplayPolicy` and have values of `ReplayInstant` and `ReplayOriginal`.

You can only set `ReplayPolicy` on push-based Consumers.

```text
$ nats con add ORDERS REPLAY --target out.original --filter ORDERS.processed --ack none --deliver all --sample 100 --replay original
...
     Replay Policy: original
...
```

Now let's publish messages into the Set 10 seconds apart:

```text
$ for i in 1 2 3                                                                                                                                                      <15:15:35
do
  nats pub ORDERS.processed "order ${i}"
  sleep 10
done
Published [ORDERS.processed] : 'order 1'
Published [ORDERS.processed] : 'order 2'
Published [ORDERS.processed] : 'order 3'
```

And when we consume them they will come to us 10 seconds apart:

```text
$ nats sub -t out.original
Listening on [out.original]
2020/01/03 15:17:26 [#1] Received on [ORDERS.processed]: 'order 1'
2020/01/03 15:17:36 [#2] Received on [ORDERS.processed]: 'order 2'
2020/01/03 15:17:46 [#3] Received on [ORDERS.processed]: 'order 3'
^C
```

## Stream Templates

When you have many similar streams it can be helpful to auto-create them, let's say you have a service by client and they are on subjects `CLIENT.*`, you can construct a template that will auto-generate streams for any matching traffic.

```text
$ nats str template add CLIENTS --subjects "CLIENT.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size 2048 --max-streams 1024 --discard old
Stream Template CLIENTS was created

Information for Stream Template CLIENTS

Configuration:

             Subjects: CLIENT.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
     Maximum Messages: -1
        Maximum Bytes: -1
          Maximum Age: 8760h0m0s
 Maximum Message Size: 2048
    Maximum Consumers: -1
      Maximum Streams: 1024

Managed Streams:

  No Streams have been defined by this template
```

You can see no streams currently exist, let's publish some data:

```text
$ nats pub CLIENT.acme hello
```

And we'll have 1 new Stream:

```text
$ nats str ls
Streams:

        CLIENTS_acme
```

When the template is deleted all the streams it created will be deleted too.

## Ack Sampling

In the earlier sections we saw that samples are being sent to a monitoring system. Let's look at that in depth; how the monitoring system works and what it contains.

As messages pass through a Consumer you'd be interested in knowing how many are being redelivered and how many times but also how long it takes for messages to be acknowledged.

Consumers can sample Ack'ed messages for you and publish samples so your monitoring system can observe the health of a Consumer. We will add support for this to [NATS Surveyor](https://github.com/nats-io/nats-surveyor).

### Configuration

You can configure a Consumer for sampling bypassing the `--sample 80` option to `nats consumer add`, this tells the system to sample 80% of Acknowledgements.

When viewing info of a Consumer you can tell if it's sampled or not:

```text
$ nats con info ORDERS NEW
...
     Sampling Rate: 100
...
```

### Consuming

Samples are published to `$JS.EVENT.METRIC.CONSUMER_ACK.<stream>.<consumer>` in JSON format containing `api.ConsumerAckMetric`. Use the `nats con events` command to view samples:

```text
$ nats con events ORDERS NEW
Listening for Advisories on $JS.EVENT.ADVISORY.*.ORDERS.NEW
Listening for Metrics on $JS.EVENT.METRIC.*.ORDERS.NEW

15:08:31] [Ph0fsiOKRg1TS0c2k0mMz2] Acknowledgement Sample
             Consumer: ORDERS > NEW
      Stream Sequence: 40
    Consumer Sequence: 161
           Deliveries: 1
                Delay: 1.009ms
```

```text
$ nats con events ORDERS NEW --json
{
  "stream": "ORDERS",
  "consumer": "NEW",
  "consumer_seq": 155,
  "stream_seq": 143,
  "ack_time": 5387000,
  "delivered": 1
}
{
  "stream": "ORDERS",
  "consumer": "NEW",
  "consumer_seq": 156,
  "stream_seq": 144,
  "ack_time": 5807800,
  "delivered": 1
}
```

## Storage Overhead

JetStream file storage is very efficient, storing as little extra information about the message as possible.

**NOTE:** This might change once clustering is supported.

We do store some message data with each message, namely:

* Message headers
* The subject it was received on
* The time it was received
* The message payload
* A hash of the message
* The message sequence
* A few other bits like the length of the subject and the length of headers

Without any headers the size is:

```text
length of the message record (4bytes) + seq(8) + ts(8) + subj_len(2) + subj + msg + hash(8)
```

A 5 byte `hello` message without headers will take 39 bytes.

With headers:

```text
length of the message record (4bytes) + seq(8) + ts(8) + subj_len(2) + subj + hdr_len(4) + hdr + msg + hash(8)
```

So if you are publishing many small messages the overhead will be, relatively speaking, quite large, but for larger messages the overhead is very small. If you publish many small messages it's worth trying to optimize the subject length.

