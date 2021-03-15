### Account Information

JetStream is multi-tenant so you will need to check that your account is enabled for JetStream and is not limited. You can view your limits as follows:

```nohighlight
$ nats account info
Connection Information:
               Client ID: 8
               Client IP: 127.0.0.1
                     RTT: 178.545µs
       Headers Supported: true
         Maximum Payload: 1.0 MiB
           Connected URL: nats://localhost:4222
       Connected Address: 127.0.0.1:4222
     Connected Server ID: NCCOHA6ONXJOGAEZP4WPU4UJ3IQP2VVXEPRKTQCGBCW4IL4YYW4V4KKL
JetStream Account Information:
           Memory: 0 B of 5.7 GiB
          Storage: 0 B of 11 GiB
          Streams: 0 of Unlimited
   Max Consumers: unlimited
```

### Streams

The first step is to set up storage for our `ORDERS` related messages, these arrive on a wildcard of subjects all flowing into the same Stream and they are kept for 1 year.

#### Creating

```nohighlight
$ nats str add ORDERS
? Subjects to consume ORDERS.*
? Storage backend file
? Retention Policy Limits
? Discard Policy Old
? Message count limit -1
? Message size limit -1
? Maximum message age limit 1y
? Maximum individual message size [? for help] (-1) -1
? Number of replicas to store 3
Stream ORDERS was created

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
     Acknowledgements: true
            Retention: File - Limits
             Replicas: 3
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

```
$ nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard old --replicas 3```

Additionally, one can store the configuration in a JSON file, the format of this is the same as `$ nats str info ORDERS -j | jq .config`:

```
$ nats str add ORDERS --config orders.json
```

#### Listing

We can confirm our Stream was created:

```nohighlight
$ nats str ls
Streams:

	ORDERS
```

#### Querying

Information about the configuration of the Stream can be seen, and if you did not specify the Stream like below, it will prompt you based on all known ones:

```nohighlight
$ nats str info ORDERS
Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
  No Acknowledgements: false
            Retention: File - Limits
             Replicas: 1
     Maximum Messages: -1
        Maximum Bytes: -1
          Maximum Age: 8760h0m0s
    Maximum Consumers: -1

Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 0
             LastSeq: 0
    Active Consumers: 0
```

Most commands that show data as above support `-j` to show the results as JSON:

```nohighlight
$ nats str info ORDERS -j
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
    "storage": "file",
    "num_replicas": 1
  },
  "stats": {
    "messages": 0,
    "bytes": 0,
    "first_seq": 0,
    "last_seq": 0,
    "consumer_count": 0
  }
}
```

This is the general pattern for the entire `nats` utility as it relates to JetStream - prompting for needed information but every action can be run non-interactively making it usable as a cli api. All information output like seen above can be turned into JSON using `-j`.

In clustered mode additional information will be included:

```nohighlight
$ nats str info ORDERS
...
Cluster Information:
                 Name: JSC
               Leader: S1
              Replica: S3, current, seen 0.04s ago
              Replica: S2, current, seen 0.04s ago
```

Here the cluster name is configured as `JSC`, there is a server `S1` that's the current leader with `S3` and `S2` are replicas. Both replicas are current and have been seen recently.

#### Copying

A stream can be copied into another, which also allows the configuration of the new one to be adjusted via CLI flags:

```nohighlight
$ nats str cp ORDERS ARCHIVE --subjects "ORDERS_ARCVHIVE.*" --max-age 2y
Stream ORDERS was created

Information for Stream ARCHIVE

Configuration:

             Subjects: ORDERS_ARCVHIVE.*
...
          Maximum Age: 17520h0m0s
...
```

#### Editing

A stream configuration can be edited, which allows the configuration to be adjusted via CLI flags.  Here I have a incorrectly created ORDERS stream that I fix:

```nohighlight
$ nats str info ORDERS -j | jq .config.subjects
[
  "ORDERS.new"
]

$ nats str edit ORDERS --subjects "ORDERS.*"
Stream ORDERS was updated

Information for Stream ORDERS

Configuration:

             Subjects: ORDERS.*
....
```

Additionally one can store the configuration in a JSON file, the format of this is the same as `$ nats str info ORDERS -j | jq .config`:

```
$ nats str edit ORDERS --config orders.json
```

#### Publishing Into a Stream

Now let's add in some messages to our Stream. You can use `nats pub` to add messages, pass the `--wait` flag to see the publish ack being returned.

You can publish without waiting for acknowledgement:

```nohighlight
$ nats pub ORDERS.scratch hello
Published [sub1] : 'hello'
```

But if you want to be sure your messages got to JetStream and were persisted you can make a request:

```nohighlight
$ nats req ORDERS.scratch hello
13:45:03 Sending request on [ORDERS.scratch]
13:45:03 Received on [_INBOX.M8drJkd8O5otORAo0sMNkg.scHnSafY]: '+OK'
```

Keep checking the status of the Stream while doing this and you'll see it's stored messages increase.

```nohighlight
$ nats str info ORDERS
Information for Stream ORDERS
...
Statistics:

            Messages: 3
               Bytes: 147 B
            FirstSeq: 1
             LastSeq: 3
    Active Consumers: 0
```

After putting some throw away data into the Stream, we can purge all the data out - while keeping the Stream active:

#### Deleting All Data

To delete all data in a stream use `purge`:

```nohighlight
$ nats str purge ORDERS -f
...
Statistics:

            Messages: 0
               Bytes: 0 B
            FirstSeq: 1,000,001
             LastSeq: 1,000,000
    Active Consumers: 0
```

#### Deleting A Message

A single message can be securely removed from the stream:

```nohighlight
$ nats str rmm ORDERS 1 -f
```

#### Deleting Sets

Finally for demonstration purposes, you can also delete the whole Stream and recreate it so then we're ready for creating the Consumers:

```
$ nats str rm ORDERS -f
$ nats str add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1
```
