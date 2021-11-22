# Streams

The first step is to set up storage for our `ORDERS` related messages, these arrive on a wildcard of subjects all flowing into the same Stream and they are kept for 1 year.

## Creating

```shell
nats str add ORDERS
```
Output
```text
? Subjects to consume ORDERS.*
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Message count limit -1
? Message size limit -1
? Maximum message age limit 1y
? Maximum individual message size [? for help] (-1) -1
Stream ORDERS was created

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
     Maximum Messages: -1
        Maximum Bytes: -1
          Maximum Age: 8760h0m0s
 Maximum Message Size: -1
  Maximum Consumers: -1

Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 0
             LastSeq: 0
    Active Consumers: 0
```

You can get prompted interactively for missing information as above, or do it all on one command. Pressing `?` in the CLI will help you map prompts to CLI options:

```shell
nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --dupe-window="0s" --replicas 1
```

Additionally one can store the configuration in a JSON file, the format of this is the same as `$ nats str info ORDERS -j | jq .config`:

```shell
nats str add ORDERS --config orders.json
```

## Listing

We can confirm our Stream was created:

```shell
nats str ls
```
Output
```text
Streams:

    ORDERS
```

## Querying

Information about the configuration of the Stream can be seen, and if you did not specify the Stream like below, it will prompt you based on all known ones:

```shell
nats str info ORDERS
```
Output
```text
Information for Stream ORDERS created 2021-02-27T16:49:36-07:00

Configuration:

             Subjects: ORDERS.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 1y0d0h0m0s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited

State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

Most commands that show data as above support `-j` to show the results as JSON:

```shell
nats str info ORDERS -j
```
Output
```json
{
  "config": {
    "name": "ORDERS",
    "subjects": [
      "ORDERS.*"
    ],
    "retention": "limits",
    "max_consumers": -1,
    "max_msgs": -1,
    "max_bytes": -1,
    "max_age": 31536000000000000,
    "max_msg_size": -1,
    "storage": "file",
    "discard": "old",
    "num_replicas": 1,
    "duplicate_window": 120000000000
  },
  "created": "2021-02-27T23:49:36.700424Z",
  "state": {
    "messages": 0,
    "bytes": 0,
    "first_seq": 0,
    "first_ts": "0001-01-01T00:00:00Z",
    "last_seq": 0,
    "last_ts": "0001-01-01T00:00:00Z",
    "consumer_count": 0
  }
}
```

This is the general pattern for the entire `nats` utility as it relates to JetStream - prompting for needed information but every action can be run non-interactively making it usable as a CLI API. All information output like seen above can be turned into JSON using `-j`.

## Copying

A stream can be copied into another, which also allows the configuration of the new one to be adjusted via CLI flags:

```shell
nats str cp ORDERS ARCHIVE --subjects "ORDERS_ARCVHIVE.*" --max-age 2y
```
Output
```text
Stream ORDERS was created

Information for Stream ORDERS created 2021-02-27T16:52:46-07:00

Configuration:

             Subjects: ORDERS_ARCHIVE.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 1
       Discard Policy: Old
     Duplicate Window: 2m0s
     Maximum Messages: unlimited
        Maximum Bytes: unlimited
          Maximum Age: 2y0d0h0m0s
 Maximum Message Size: unlimited
    Maximum Consumers: unlimited

State:

             Messages: 0
                Bytes: 0 B
             FirstSeq: 0
              LastSeq: 0
     Active Consumers: 0
```

## Editing

A stream configuration can be edited, which allows the configuration to be adjusted via CLI flags. Here I have an incorrectly created ORDERS stream that I fix:

```shell
nats str info ORDERS -j | jq .config.subjects
```
Output
```text
[
  "ORDERS.new"
]
```

Change the subjects for the stream
```shell
nats str edit ORDERS --subjects "ORDERS.*"
```
Output
```text
Stream ORDERS was updated

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
....
```

Additionally, one can store the configuration in a JSON file, the format of this is the same as `$ nats str info ORDERS -j | jq .config`:

```shell
nats str edit ORDERS --config orders.json
```

## Publishing Into a Stream

Now let's add some messages to our Stream. You can use `nats pub` to add messages, pass the `--wait` flag to see the publish ack being returned.

You can publish without waiting for acknowledgement:

```shell
nats pub ORDERS.scratch hello
```

But if you want to be sure your messages got to JetStream and were persisted you can make a request:

```shell
nats req ORDERS.scratch hello
```
Output
```text
13:45:03 Sending request on [ORDERS.scratch]
13:45:03 Received on [_INBOX.M8drJkd8O5otORAo0sMNkg.scHnSafY]: '+OK'
```

Keep checking the status of the Stream while doing this and you'll see its stored messages increase.

```shell
nats str info ORDERS
```
Output
```text
Information for Stream ORDERS
...
Statistics:

            Messages: 3
               Bytes: 147 B
            FirstSeq: 1
             LastSeq: 3
    Active Consumers: 0
```

After putting some throwaway data into the Stream, we can purge all the data out - while keeping the Stream active:

## Deleting All Data

To delete all data in a stream use `purge`:

```shell
nats str purge ORDERS -f
```
Output
```text
...
State:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 1,000,001
             LastSeq: 1,000,000
    Active Consumers: 0
```

## Deleting A Message

A single message can be securely removed from the stream:

```shell
nats str rmm ORDERS 1 -f
```

## Deleting Sets

Finally, for demonstration purposes, you can also delete the whole Stream and recreate it. Then we're ready for creating the Consumers:

```shell
nats str rm ORDERS -f
nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --dupe-window="0s" --replicas 1
```

