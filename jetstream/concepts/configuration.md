### Configuration

The rest of this document introduces the `nats` utility, but for completeness and reference this is how you'd create the ORDERS scenario.  We'll configure a 1 year retention for order related messages:

```bash
$ nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard=old
$ nats con add ORDERS NEW --filter ORDERS.received --ack explicit --pull --deliver all --max-deliver=-1 --sample 100
$ nats con add ORDERS DISPATCH --filter ORDERS.processed --ack explicit --pull --deliver all --max-deliver=-1 --sample 100
$ nats con add ORDERS MONITOR --filter '' --ack none --target monitor.ORDERS --deliver last --replay instant
```