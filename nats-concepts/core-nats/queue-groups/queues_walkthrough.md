# NATS Queueing Walkthrough

NATS supports a form of load balancing using [queue groups](queue.md). Subscribers register a queue group name. A single subscriber in the group is randomly selected to receive the message.

### Walkthrough prerequisites

If you have not already done so, you need to [install](/nats-concepts/what-is-nats/walkthrough_setup.md) the `nats` CLI Tool and optionally the nats-server on your machine.

## 1. Start the first member of the queue group

The `nats reply` instances don't just subscribe to the subject but also automatically join a queue group (`"NATS-RPLY-22"` by default)

```bash
nats reply foo "service instance A Reply# {{Count}}"
```

## 2. Start a second member of the queue-group

In a new window

```bash
nats reply foo "service instance B Reply# {{Count}}"
```

## 3. Start a third member of the queue-group

In a new window

```bash
nats reply foo "service instance C Reply# {{Count}}"
```

## 4. Publish a NATS message

```bash
nats request foo "Simple request"
```

## 5. Verify message publication and receipt

You should see that only one of the my-queue group subscribers receives the message and replies it, and you can also see which one of the available queue-group subscribers processed the request from the reply message received (i.e. service instance A, B or C)

## 6. Publish another message

```bash
nats pub foo "Another simple request"
```

You should see that a different queue group subscriber receives the message this time, chosen at random among the 3 queue group members.

You can also send any number of requests back-to-back and see from the received messages the distribution of the those requests amongst the members of the queue-group (e.g. ) `nats request foo --count 10 "Request {{Count}}"`

## 7. Stop/start queue-group members

You can at any time start yet another service instance, or kill one and see how the queue-group automatically takes care of adding/removing those instances from the group.


## See Also

Queue groups using the NATS CLI

{% embed url="https://youtu.be/jLTVhP08Tq0?t=101" %}
Queue Groups NATS CLI
{% endembed %}
