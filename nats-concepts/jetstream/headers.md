# Headers

Message headers are used in a variety of JetStream contexts, such de-duplication, auto-purging of messages, metadata from republished messages, and more.

## Publish

Headers that can be set by a client when a message being published.

| Name                                  | Description                                                                                                                                                                                                       | Example                                | Version |
| :------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------- | :------ |
| `Nats-Msg-Id`                         | Client-defined unique identifier for a message that will be used by the server apply de-duplication within the configured `Duplicate Window`.                                                                     | `9f01ccf0-8c34-4789-8688-231a2538a98b` | 2.2.0   |
| `Nats-Expected-Stream`                | Used to assert the published message is received by some expected stream.                                                                                                                                         | `my-stream`                            | 2.2.0   |
| `Nats-Expected-Last-Msg-Id`           | Used to apply optimistic concurrency control at the stream-level. The value is the last expected `Nats-Msg-Id` and the server will reject a publish if the current ID does not match.                             | `9f01ccf0-8c34-4789-8688-231a2538a98b` | 2.2.0   |
| `Nats-Expected-Last-Sequence`         | Used to apply optimistic concurrency control at the stream-level. The value is the last expected sequence and the server will reject a publish if the current sequence does not match.                            | `328`                                  | 2.2.0   |
| `Nats-Expected-Last-Subject-Sequence` | Used to apply optimistic concurrency control at the subject-level. The value is the last expected sequence and the server will reject a publish if the current sequence does not match for the message's subject. | `38`                                   | 2.3.1   |
| `Nats-Rollup`                         | Used to apply a purge of all prior messages in the stream or at the subject-level.                                                                                                                                | `all` for stream, `sub` for subject    | 2.6.2   |

## RePublish

Headers set messages that are republished.

| Name                 | Description                                                                                                            | Example                       | Version |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------- | :---------------------------- | :------ |
| `Nats-Stream`        | Name of the stream the message was republished from.                                                                   | `Nats-Stream: my-stream`      | 2.8.3   |
| `Nats-Subject`       | The original subject of the message.                                                                                   | `events.mouse_clicked`        | 2.8.3   |
| `Nats-Time-Stamp`    | The original timestamp of the message.                                                                                 | `2023-08-23T19:53:05.762416Z` | 2.8.3   |
| `Nats-Sequence`      | The original sequence of the message.                                                                                  | `193`                         | 2.8.3   |
| `Nats-Last-Sequence` | The last sequence of the message having the same subject, otherwise zero if this is the first message for the subject. | `190`                         | 2.8.3   |

## Sources

Headers that are implicitly added to messages sourced from other streams.

| Name                 | Description                                                 | Example     | Version |
| :------------------- | :---------------------------------------------------------- | :---------- | :------ |
| `Nats-Stream-Source` | Specifies the origin stream name, the subject and the sequence number plus the subject filter and destination transform of the message being sourced. | `my-stream` | 2.2.0   |

## Headers-only

Headers added to messages when the consumer is configured to be "headers only" omitting the body.

| Name            | Description                          | Example | Version |
| :-------------- | :----------------------------------- | :------ | :------ |
| `Nats-Msg-Size` | Indicates the message size in bytes. | `1024`  | 2.6.2   |

## Mirror

Headers used for internal flow-control messages for a mirror.

| Name                    | Description | Example | Version |
| :---------------------- | :---------- | :------ | :------ |
| `Nats-Last-Consumer`    |             |         | 2.2.1   |
| `Nats-Last-Stream`      |             |         | 2.2.1   |
| `Nats-Consumer-Stalled` |             |         | 2.4.0   |
| `Nats-Response-Type`    |             |         | 2.6.4   |
