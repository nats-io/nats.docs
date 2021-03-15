# NATS API Reference

Thus far we saw a lot of CLI interactions. The CLI works by sending and receiving specially crafted messages over core NATS to configure the JetStream system. In time we will look to add file based configuration but for now the only method is the NATS API.

**NOTE:** Some NATS client libraries may need to enable an option to use old style requests when interacting withe JetStream server. Consult the libraries README's for more information.

## Reference

All of these subjects are found as constants in the NATS Server source, so for example the `$JS.API.STREAM.LIST` is a constant in the nats-server source `api.JetStreamListStreams` tables below will reference these constants and likewise data structures in the server for payloads.

## Error Handling

The APIs used for administrative tools all respond with standardised JSON and these include errors.

```text
$ nats req '$JS.API.STREAM.INFO.nonexisting' ''
Published 11 bytes to $JS.API.STREAM.INFO.nonexisting
Received  [_INBOX.lcWgjX2WgJLxqepU0K9pNf.mpBW9tHK] : {
  "type": "io.nats.jetstream.api.v1.stream_info_response",
  "error": {
    "code": 404,
    "description": "stream not found"
  }
}
```

```text
$ nats req '$JS.STREAM.INFO.ORDERS' ''
Published 6 bytes to $JS.STREAM.INFO.ORDERS
Received  [_INBOX.fwqdpoWtG8XFXHKfqhQDVA.vBecyWmF] : '{
  "type": "io.nats.jetstream.api.v1.stream_info_response",
  "config": {
    "name": "ORDERS",
  ...
}
```

Here the responses include a `type` which can be used to find the JSON Schema for each response.

Non admin APIs - like those for adding a message to the stream will respond with `-ERR` or `+OK` with an optional reason after.

## Admin API

All the admin actions the `nats` CLI can do falls in the sections below. The API structure are kept in the `api` package in the `jsm.go` repository.

Subjects that and in `T` like `api.JSApiConsumerCreateT` are formats and would need to have the Stream Name and in some cases also the Consumer name interpolated into them. In this case `t := fmt.Sprintf(api.JSApiConsumerCreateT, streamName)` to get the final subject.

The command `nats events` will show you an audit log of all API access events which includes the full content of each admin request, use this to view the structure of messages the `nats` command sends.

The API uses JSON for inputs and outputs, all the responses are typed using a `type` field which indicates their Schema. A JSON Schema repository can be found in `nats-io/jetstream/schemas`.

### General Info

| Subject | Constant | Description | Request Payload | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `$JS.API.INFO` | `api.JSApiAccountInfo` | Retrieves stats and limits about your account | empty payload | `api.JetStreamAccountStats` |

### Streams

| Subject | Constant | Description | Request Payload | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `$JS.API.STREAM.LIST` | `api.JSApiStreamList` | Paged list known Streams including all their current information | `api.JSApiStreamListRequest` | `api.JSApiStreamListResponse` |
| `$JS.API.STREAM.NAMES` | `api.JSApiStreamNames` | Paged list of Streams | `api.JSApiStreamNamesRequest` | `api.JSApiStreamNamesResponse` |
| `$JS.API.STREAM.CREATE.*` | `api.JSApiStreamCreateT` | Creates a new Stream | `api.StreamConfig` | `api.JSApiStreamCreateResponse` |
| `$JS.API.STREAM.UPDATE.*` | `api.JSApiStreamUpdateT` | Updates an existing Stream with new config | `api.StreamConfig` | `api.JSApiStreamUpdateResponse` |
| `$JS.API.STREAM.INFO.*` | `api.JSApiStreamInfoT` | Information about config and state of a Stream | empty payload, Stream name in subject | `api.JSApiStreamInfoResponse` |
| `$JS.API.STREAM.DELETE.*` | `api.JSApiStreamDeleteT` | Deletes a Stream and all its data | empty payload, Stream name in subject | `api.JSApiStreamDeleteResponse` |
| `$JS.API.STREAM.PURGE.*` | `api.JSApiStreamPurgeT` | Purges all of the data in a Stream, leaves the Stream | empty payload, Stream name in subject | `api.JSApiStreamPurgeResponse` |
| `$JS.API.STREAM.MSG.DELETE.*` | `api.JSApiMsgDeleteT` | Deletes a specific message in the Stream by sequence, useful for GDPR compliance | `api.JSApiMsgDeleteRequest` | `api.JSApiMsgDeleteResponse` |
| `$JS.API.STREAM.MSG.GET.*` | `api.JSApiMsgGetT` | Retrieves a specific message from the stream | `api.JSApiMsgGetRequest` | `api.JSApiMsgGetResponse` |
| `$JS.API.STREAM.SNAPSHOT.*` | `api.JSApiStreamSnapshotT` | Initiates a streaming backup of a streams data | `api.JSApiStreamSnapshotRequest` | `api.JSApiStreamSnapshotResponse` |
| `$JS.API.STREAM.RESTORE.*` | `api.JSApiStreamRestoreT` | Initiates a streaming restore of a stream | `{}` | `api.JSApiStreamRestoreResponse` |

### Stream Templates

| Subject | Constant | Description | Request Payload | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `$JS.API.STREAM.TEMPLATE.CREATE.*` | `api.JSApiTemplateCreateT` | Creates a Stream Template | `api.StreamTemplateConfig` | `api.JSApiStreamTemplateCreateResponse` |
| `$JS.API.STREAM.TEMPLATE.NAMES` | `api.JSApiTemplateNames` | Paged list all known templates | `api.JSApiStreamTemplateNamesRequest` | `api.JSApiStreamTemplateNamesResponse` |
| `$JS.API.STREAM.TEMPLATE.INFO.*` | `api.JSApiTemplateInfoT` | Information about the config and state of a Stream Template | empty payload, Template name in subject | `api.JSApiStreamTemplateInfoResponse` |
| `$JS.API.STREAM.TEMPLATE.DELETE.*` | `api.JSApiTemplateDeleteT` | Delete a specific Stream Template **and all streams created by this template** | empty payload, Template name in subject | `api.JSApiStreamTemplateDeleteResponse` |

### Consumers

| Subject | Constant | Description | Request Payload | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `$JS.API.CONSUMER.CREATE.*` | `api.JSApiConsumerCreateT` | Create an ephemeral Consumer | `api.ConsumerConfig`, Stream name in subject | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.DURABLE.CREATE.*` | `api.JSApiDurableCreateT` | Create an Consumer | `api.ConsumerConfig`, Stream name in subject | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.LIST.*` | `api.JSApiConsumerListT` | Paged list of known Consumers including their current info | `api.JSApiConsumerListRequest` | `api.JSApiConsumerListResponse` |
| `$JS.API.CONSUMER.NAMES.*` | `api.JSApiConsumerNamesT` | Paged list of known Consumer names | `api.JSApiConsumerNamesRequest` | `api.JSApiConsumerNamesResponse` |
| `$JS.API.CONSUMER.INFO.*.*` | `api.JSApiConsumerInfoT` | Information about an Consumer | empty payload, Stream and Consumer names in subject | `api.JSApiConsumerInfoResponse` |
| `$JS.API.CONSUMER.DELETE.*.*` | `api.JSApiConsumerDeleteT` | Deletes an Consumer | empty payload, Stream and Consumer names in subject | `api.JSApiConsumerDeleteResponse` |

### ACLs

It's hard to notice here but there is a clear pattern in these subjects, lets look at the various JetStream related subjects:

General information

```text
$JS.API.INFO
```

Stream and Consumer Admin

```text
$JS.API.STREAM.CREATE.<stream>
$JS.API.STREAM.UPDATE.<stream>
$JS.API.STREAM.DELETE.<stream>
$JS.API.STREAM.INFO.<stream>
$JS.API.STREAM.PURGE.<stream>
$JS.API.STREAM.LIST
$JS.API.STREAM.NAMES
$JS.API.STREAM.MSG.DELETE.<stream>
$JS.API.STREAM.MSG.GET.<stream>
$JS.API.STREAM.SNAPSHOT.<stream>
$JS.API.STREAM.RESTORE.<stream>
$JS.API.CONSUMER.CREATE.<stream>
$JS.API.CONSUMER.DURABLE.CREATE.<stream>.<consumer>
$JS.API.CONSUMER.DELETE.<stream>.<consumer>
$JS.API.CONSUMER.INFO.<stream>.<consumer>
$JS.API.CONSUMER.LIST.<stream>
$JS.API.CONSUMER.MSG.NEXT.<stream>.<consumer>
$JS.API.CONSUMER.NAMES.<stream>
$JS.API.STREAM.TEMPLATE.CREATE.<stream template>
$JS.API.STREAM.TEMPLATE.DELETE.<stream template>
$JS.API.STREAM.TEMPLATE.INFO.<stream template>
$JS.API.STREAM.TEMPLATE.NAMES
```

Stream and Consumer Use

```text
$JS.API.CONSUMER.MSG.NEXT.<stream>.<consumer>
$JS.ACK.<stream>.<consumer>.x.x.x
$JS.SNAPSHOT.ACK.<stream>.<msg id>
$JS.SNAPSHOT.RESTORE.<stream>.<msg id>
```

Events and Advisories:

```text
$JS.EVENT.METRIC.CONSUMER_ACK.<stream>.<consumer>
$JS.EVENT.ADVISORY.MAX_DELIVERIES.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.MSG_TERMINATED.<stream>.<consumer>
$JS.EVENT.ADVISORY.STREAM.CREATED.<stream>
$JS.EVENT.ADVISORY.STREAM.DELETED.<stream>
$JS.EVENT.ADVISORY.STREAM.UPDATED.<stream>
$JS.EVENT.ADVISORY.CONSUMER.CREATED.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.DELETED.<stream>.<consumer>
$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_CREATE.<stream>
$JS.EVENT.ADVISORY.STREAM.SNAPSHOT_COMPLETE.<stream>
$JS.EVENT.ADVISORY.STREAM.RESTORE_CREATE.<stream>
$JS.EVENT.ADVISORY.STREAM.RESTORE_COMPLETE.<stream>
$JS.EVENT.ADVISORY.STREAM.LEADER_ELECTED.<stream>
$JS.EVENT.ADVISORY.STREAM.QUORUM_LOST.<stream>
$JS.EVENT.ADVISORY.CONSUMER.LEADER_ELECTED.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.QUORUM_LOST.<stream>.<consumer>
$JS.EVENT.ADVISORY.API
```

This design allows you to easily create ACL rules that limit users to a specific Stream or Consumer and to specific verbs for administration purposes. For ensuring only the receiver of a message can Ack it we have response permissions ensuring you can only Publish to Response subject for messages you received.

## Acknowledging Messages

Messages that need acknowledgement will have a Reply subject set, something like `$JS.ACK.ORDERS.test.1.2.2`, this is the prefix defined in `api.JetStreamAckPre` followed by `<stream>.<consumer>.<delivered count>.<stream sequence>.<consumer sequence>.<timestamp>.<pending messages>`.

In all of the Synadia maintained API's you can simply do `msg.Respond(nil)` \(or language equivalent\) which will send nil to the reply subject.

## Fetching The Next Message From a Pull-based Consumer

If you have a pull-based Consumer you can send a standard NATS Request to `$JS.API.CONSUMER.MSG.NEXT.<stream>.<consumer>`, here the format is defined in `api.JetStreamRequestNextT` and requires populating using `fmt.Sprintf()`.

```text
$ nats req '$JS.API.CONSUMER.MSG.NEXT.ORDERS.test' '1'
Published 1 bytes to $JS.API.CONSUMER.MSG.NEXT.ORDERS.test
Received  [js.1] : 'message 1'
```

Here we ask for just 1 message - `nats req` only shows 1 - but you can fetch a batch of messages by varying the argument. This combines well with the `AckAll` Ack policy.

The above request for the next message will stay in the server for as long as the client is connected and future pulls from the same client will accumulate on the server, meaning if you ask for 1 message 100 times and 1000 messages arrive you'll get sent 100 messages not 1.

This is often not desired, pull consumers support a mode where a JSON document is sent describing the pull request.

```javascript
{
  "expires": "2020-11-10T12:41:00.075933464Z",
  "batch": 10,
}
```

This requests 10 messages and asks the server to keep this request until the specific `expires` time, this is useful when you poll the server frequently and do not want the pull requests to accumulate on the server. Set the expire time to now + your poll frequency.

```javascript
{
  "batch": 10,
  "no_wait": true
}
```

Here we see a second format of the Pull request that will not store the request on the queue at all but when there are no messages to deliver will send a nil bytes message with a `Status` header of `404`, this way you can know when you reached the end of the stream for example. A `409` is returned if the Consumer has reached `MaxAckPending` limits.

```text
[rip@dev1]% nats req '$JS.API.CONSUMER.MSG.NEXT.ORDERS.NEW' '{"no_wait": true, "batch": 10}'
 test --password test
13:45:30 Sending request on "$JS.API.CONSUMER.MSG.NEXT.ORDERS.NEW"
13:45:30 Received on "_INBOX.UKQGqq0W1EKl8inzXU1naH.XJiawTRM" rtt 594.908µs
13:45:30 Status: 404
13:45:30 Description: No Messages
```

## Fetching From a Stream By Sequence

If you know the Stream sequence of a message you can fetch it directly, this does not support acks. Do a Request\(\) to `$JS.API.STREAM.MSG.GET.ORDERS` sending it the message sequence as payload. Here the prefix is defined in `api.JetStreamMsgBySeqT` which also requires populating using `fmt.Sprintf()`.

```text
$ nats req '$JS.API.STREAM.MSG.GET.ORDERS' '{"seq": 1}'
Published 1 bytes to $JS.STREAM.ORDERS.MSG.BYSEQ
Received  [_INBOX.cJrbzPJfZrq8NrFm1DsZuH.k91Gb4xM] : '{
  "type": "io.nats.jetstream.api.v1.stream_msg_get_response",
  "message": {
    "subject": "x",
    "seq": 1,
    "data": "aGVsbG8=",
    "time": "2020-05-06T13:18:58.115424+02:00"
  }
}'
```

The Subject shows where the message was received, Data is base64 encoded and Time is when it was received.

## Consumer Samples

Samples are published to a specific subject per Consumer, something like `$JS.EVENT.METRIC.CONSUMER_ACK.<stream>.<consumer>` you can just subscribe to that and get `api.ConsumerAckMetric` messages in JSON format. The prefix is defined in `api.JetStreamMetricConsumerAckPre`.

