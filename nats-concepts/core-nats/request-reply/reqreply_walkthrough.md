# NATS Request/Reply Walkthrough

NATS supports [request/reply](reqreply.md) messaging. In this tutorial you explore how to exchange point-to-point messages using NATS.

### Walkthrough prerequisites

If you have not already done so, you need to [install](/nats-concepts/what-is-nats/walkthrough_setup.md) the `nats` CLI Tool and optionally the nats-server on your machine.

## 1. Start two terminal sessions

You will use these sessions to run the NATS request and reply clients.

## 2. In one terminal, run the reply client listener

```bash
nats reply help.please "OK, I CAN HELP!!!"
```

You should see the message: _Listening on \[help.please\]_

This means that the NATS receiver client is listening for requests messages on the "help.please" subject. In NATS, the receiver is a subscriber.

## 3. In the other terminal, run the request client

```bash
nats request help.please "I need help!"
```

The NATS requestor client makes a request by sending the message "I need help!" on the “help.please” subject.

The NATS receiver client receives the message, formulates the reply \("OK, I CAN HELP!!!"\), and sends it to the inbox of the requester.

