# Consumes

Each Consumer, or related group of Consumers, of a Stream will need an Consumer defined. It's ok to define thousands of these pointing at the same Stream.

Consumers can either be `push` based where JetStream will deliver the messages as fast as possible to a subject of your choice or `pull` based for typical work queue like behavior. The rate of message delivery in both cases is subject to `ReplayPolicy`. A `ReplayInstant` Consumer will receive all messages as fast as possible while a `ReplayOriginal` Consumer will receive messages at the rate they were received, which is great for replaying production traffic in staging.

In the orders example above we have 3 Consumers. The first two select a subset of the messages from the Stream by specifying a specific subject like `ORDERS.processed`. The Stream consumes `ORDERS.*` and this allows you to receive just what you need. The final Consumer receives all messages in a `push` fashion.

Consumers track their progress, they know what messages were delivered, acknowledged, etc., and will redeliver messages they sent that were not acknowledged. When first created, the Consumer has to know what message to send as the first one. You can configure either a specific message in the set \(`StreamSeq`\), specific time \(`StartTime`\), all \(`DeliverAll`\) or last \(`DeliverLast`\). This is the starting point and from there, they all behave the same - delivering all of the following messages with optional Acknowledgement.

Acknowledgements default to `AckExplicit` - the only supported mode for pull-based Consumers - meaning every message requires a distinct acknowledgement. But for push-based Consumers, you can set `AckNone` that does not require any acknowledgement, or `AckAll` which quite interestingly allows you to acknowledge a specific message, like message `100`, which will also acknowledge messages `1` through `99`. The `AckAll` mode can be a great performance boost.

Some messages may cause your applications to crash and cause a never ending loop forever poisoning your system. The `MaxDeliver` setting allow you to set a upper bound to how many times a message may be delivered.

To assist with creating monitoring applications, one can set a `SampleFrequency` which is a percentage of messages for which the system should sample and create events. These events will include delivery counts and ack waits.

When defining Consumers the items below make up the entire configuration of the Consumer:

| Item | Description |
| :--- | :--- |
| AckPolicy | How messages should be acknowledged, `AckNone`, `AckAll` or `AckExplicit` |
| AckWait | How long to allow messages to remain un-acknowledged before attempting redelivery |
| DeliverPolicy | The initial starting mode of the consumer, `DeliverAll`, `DeliverLast`, `DeliverNew`, `DeliverByStartSequence` or `DeliverByStartTime` |
| DeliverySubject | The subject to deliver observed messages, when not set, a pull-based Consumer is created |
| Durable | The name of the Consumer |
| FilterSubject | When consuming from a Stream with many subjects, or wildcards, select only a specific incoming subjects, supports wildcards |
| MaxDeliver | Maximum amount times a specific message will be delivered.  Use this to avoid poison pills crashing all your services forever |
| OptStartSeq | When first consuming messages from the Stream start at this particular message in the set |
| ReplayPolicy | How messages are sent `ReplayInstant` or `ReplayOriginal` |
| SampleFrequency | What percentage of acknowledgements should be samples for observability, 0-100 |
| OptStartTime | When first consuming messages from the Stream start with messages on or after this time |
| RateLimit | The rate of message delivery in bits per second |
| MaxAckPending | The maximum number of messages without acknowledgement that can be outstanding, once this limit is reached message delivery will be suspended |

