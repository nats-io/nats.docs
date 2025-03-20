# NATS API Reference

The normal way to use JetStream is through the NATS client libraries which expose a set of JetStream functions that you can use directly in your programs. But that is not the only way you can interact with the JetStream infrastructure programmatically. Just like core NATS has a wire protocol on top of TCP, the JetStream enabled nats-server(s) expose a set of Services over core NATS.

## Reference

All of these subjects are found as constants in the NATS Server source, so for example the subject `$JS.API.STREAM.LIST` is represented by `api.JSApiStreamList` constant in the nats-server source. Tables below will reference these constants and payload related data structures.

Note that if the resources you're trying to access have a JetStream [domain](https://docs.nats.io/running-a-nats-service/configuration/leafnodes/jetstream_leafnodes#leaf-nodes) associated with them, then the subject prefix will be `$JS.{domain}.API` rather than `$JS.API`.

## Error Handling

The APIs used for administrative tools all respond with standardised JSON and these include errors.

```shell
nats req '$JS.API.STREAM.INFO.nonexisting' ''
```
```text
Published 11 bytes to $JS.API.STREAM.INFO.nonexisting
Received  [_INBOX.lcWgjX2WgJLxqepU0K9pNf.mpBW9tHK] : {
  "type": "io.nats.jetstream.api.v1.stream_info_response",
  "error": {
    "code": 404,
    "description": "stream not found"
  }
}
```

```shell
nats req '$JS.STREAM.INFO.ORDERS' ''
```
```text
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

Subjects that end in `T` like `api.JSApiConsumerCreateT` are formats and would need to have the Stream Name and in some cases also the Consumer name interpolated into them. In this case `t := fmt.Sprintf(api.JSApiConsumerCreateT, streamName)` to get the final subject.

The command `nats events` will show you an audit log of all API access events which includes the full content of each admin request, use this to view the structure of messages the `nats` command sends.

The API uses JSON for inputs and outputs, all the responses are typed using a `type` field which indicates their Schema. A JSON Schema repository can be found in `nats-io/jsm.go/schemas`.

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

### Consumers

| Subject                               | Constant | Description                                                                     | Request Payload | Response Payload |
|:--------------------------------------| :--- |:--------------------------------------------------------------------------------| :--- | :--- |
| `$JS.API.CONSUMER.CREATE.<stream>`           | `api.JSApiConsumerCreateT` | Create an ephemeral consumer                                                    | `api.ConsumerConfig` | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.DURABLE.CREATE.<stream>.<consumer>` | `api.JSApiDurableCreateT` | Create a consumer                                                              | `api.ConsumerConfig` | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.CREATE.<stream>.<consumer>.<filter>` | `api.JSApiConsumerCreateExT` | Create a consumer (server 2.9+) | `api.CreateConsumerRequest` | `api.JSApiConsumerCreateResponse` |
| `$JS.API.CONSUMER.LIST.<stream>`             | `api.JSApiConsumerListT` | Paged list of known consumers including their current info for a given stream | `api.JSApiConsumerListRequest` | `api.JSApiConsumerListResponse` |
| `$JS.API.CONSUMER.NAMES.<stream>`            | `api.JSApiConsumerNamesT` | Paged list of known consumer names for a given stream | `api.JSApiConsumerNamesRequest` | `api.JSApiConsumerNamesResponse` |
| `$JS.API.CONSUMER.INFO.<stream>.<consumer>`           | `api.JSApiConsumerInfoT` | Information about a specific consumer by name | empty payload | `api.JSApiConsumerInfoResponse` |
| `$JS.API.CONSUMER.DELETE.<stream>.<consumer>` | `api.JSApiConsumerDeleteT` | Deletes a Consumer                                                             | empty payload | `api.JSApiConsumerDeleteResponse` |
| `$JS.FC.<stream>.>` | N/A | Consumer to subscriber flow control replies for `PUSH` consumer. Also used for sourcing and mirroring, which are implemented as `PUSH` consumers . If this subject is not forwarded, the consumer my stall under high load.| empty payload |  N/A |
| `$JSC.R.<uid>` | N/A | Reply subject used by source and mirror consumer create request | Consumer info |  N/A |
| `$JS.S.<uid>` | N/A | Default delivery subject for sourced streams. Can be overwritten by the `deliver` attribute in the source configuration. | Message data |  N/A |
| `$JS.M.<uid>` | N/A | Default delivery subject for mirroed streams. Can be overwritten by the `deliver` attribute in the source configuration. | Message data |  N/A |
| `$JS.ACK.<stream>.>` | N/A | Acknowledgments for `PULL` consumers. When this subject is not forwarded, `PULL` consumers in acknowledgment modes `all` or `explicit` will fail. | empty payload |  reply subject |


### Stream Source and Mirror

Sourcing and mirroring streams uses 3 inbound and 2 outbound subject to establish and control the data flow. When setting permissions or creating export/import agreements all 5 subjects may need to be considered.

Notes:
* There are two variants to the consumer create subject dpending on the number of filters.
* Is some setup a domain prefix may be present e.g. `$JS.<domain>.API.CONSUMER.CREATE.<stream>.>`


 Subject                               | Direction | Description                                                                     | Reply | 
|:--------------------------------------| :--- |:--------------------------------------------------------------------------------| :--- | :--- |
| `$JS.API.CONSUMER.CREATE.<stream>.>`  and/or  `$JS.API.CONSUMER.CREATE.<stream>`     | outbound | Create an ephemeral consumer to deliver pending messages. Note that this subject may be prefixed with a jetstream domain  `$JS.<domain>.API.CONSUMER.CREATE.<stream>.<consumer>`. <br>The consumer create comes in 2 flavors depending on the number of filter subjects:<BR>* `$JS.API.CONSUMER.CREATE.<stream>` - When there are no filter or mutliple filters. * `$JS.API.CONSUMER.CREATE.<stream>.<consumer>.<filter subject>` - When there is exactly one filter subject                              | service request with `$JSC.R.<uid>` as reply subject |
|`$JS.FC.<stream>.>`  | outbound | Flow control messages. Will on slow routes or when the target cannot keep up with the message flow.   | service request with `$JSC.R.<uid>` as reply subject |
|`$JSC.R.<uid>`           | inbound | Reply to consumer creation request  | reply message to service request |
|`$JS.S.<uid>` (source) OR `$JS.M.<uid>` (mirror) OR `<custom deliver subject>`          | inbound | Message data and heartbeats  | message stream|

#### Heartbeats and Retries
The stream from which data is sourced/mirrored MAY NOT be reachable. It may not have been created yet OR the route may be down. This does not prevent the source/mirror agreement from being created.
* The target stream will try to create a consumer every 10s to 60s. (This value may change in the future or may be configurable). Note that delivery may therefore only resume are a short delay.
* For active consumers heartbeats are send at a rate of 1/s.


#### Constraints and Limitation
* Do not delete and recreate the origin stream! Please flush/purge the stream instead. The target stream remember the last sequence id to be delivered. A delete will reset the sequence ID.
* `$JS.FC.<stream>.>` - The flow control subject is NOT prefixed with a Jetstream domain. This create a limitation where identically named stream in different domains cannot be reliably sourced/mirrored into the same account. Please create unique stream names to avoid this limitation.

### ACLs

When using the subjects based ACL please note the patterns in the subjects grouped by purpose below.

General information

```text
$JS.API.INFO
```

Stream Admin
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
```
Consumer Admin
```text
$JS.API.CONSUMER.CREATE.<stream>
$JS.API.CONSUMER.DURABLE.CREATE.<stream>.<consumer>
$JS.API.CONSUMER.DELETE.<stream>.<consumer>
$JS.API.CONSUMER.INFO.<stream>.<consumer>
$JS.API.CONSUMER.LIST.<stream>
$JS.API.CONSUMER.NAMES.<stream>
```

Consumer message flow

```text
$JS.API.CONSUMER.MSG.NEXT.<stream>.<consumer>
$JS.SNAPSHOT.RESTORE.<stream>.<msg id>
$JS.ACK.<stream>.<consumer>.x.x.x
$JS.SNAPSHOT.ACK.<stream>.<msg id>
$JS.FC.<stream>.>
```

Optional Events and Advisories :

```text
$JS.EVENT.METRIC.CONSUMER_ACK.<stream>.<consumer>
$JS.EVENT.ADVISORY.CONSUMER.MAX_DELIVERIES.<stream>.<consumer>
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

JetStream and the consumer (including sourced and mirrored streams) may exchange flow control messages. A message with the header: `NATS/1.0 100 FlowControl Request` must be replied to, otherwise the consumer may stall. The reply subjects looks like: `$JS.FC.orders.6i5h0GiQ.ep3Y`

In all of the Synadia maintained API's you can simply do `msg.Respond(nil)` \(or language equivalent\) which will send nil to the reply subject.

## Fetching The Next Message From a Pull-based Consumer

If you have a pull-based Consumer you can send a standard NATS Request to `$JS.API.CONSUMER.MSG.NEXT.<stream>.<consumer>`, here the format is defined in `api.JetStreamRequestNextT` and requires populating using `fmt.Sprintf()`.

```shell
nats req '$JS.API.CONSUMER.MSG.NEXT.ORDERS.test' '1'
```
```text
Published 1 bytes to $JS.API.CONSUMER.MSG.NEXT.ORDERS.test
Received  [js.1] : 'message 1'
```

Here we ask for just 1 message - `nats req` only shows 1 - but you can fetch a batch of messages by varying the argument. This combines well with the `AckAll` Ack policy.

The above request for the next message will stay in the server for as long as the client is connected and future pulls from the same client will accumulate on the server, meaning if you ask for 1 message 100 times and 1000 messages arrive you'll get sent 100 messages not 1.

This is often not desired, pull consumers support a mode where a JSON document is sent describing the pull request.

```json
{
  "expires": 7000000000,
  "batch": 10
}
```

This requests 10 messages and asks the server to keep this request for 7 seconds, this is useful when you poll the server frequently and do not want the pull requests to accumulate on the server. Set the expire time to now + your poll frequency.

```json
{
  "batch": 10,
  "no_wait": true
}
```

Here we see a second format of the Pull request that will not store the request on the queue at all but when there are no messages to deliver will send a nil bytes message with a `Status` header of `404`, this way you can know when you reached the end of the stream for example. A `409` is returned if the Consumer has reached `MaxAckPending` limits.

```shell
nats req '$JS.API.CONSUMER.MSG.NEXT.ORDERS.NEW' '{"no_wait": true, "batch": 10}'
 ```
```text
13:45:30 Sending request on "$JS.API.CONSUMER.MSG.NEXT.ORDERS.NEW"
13:45:30 Received on "_INBOX.UKQGqq0W1EKl8inzXU1naH.XJiawTRM" rtt 594.908µs
13:45:30 Status: 404
13:45:30 Description: No Messages
```

## Fetching From a Stream By Sequence

If you know the Stream sequence of a message you can fetch it directly, this does not support acks. Do a Request\(\) to `$JS.API.STREAM.MSG.GET.ORDERS` sending it the message sequence as payload. Here the prefix is defined in `api.JetStreamMsgBySeqT` which also requires populating using `fmt.Sprintf()`.

```shell
nats req '$JS.API.STREAM.MSG.GET.ORDERS' '{"seq": 1}'
```
```text
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
