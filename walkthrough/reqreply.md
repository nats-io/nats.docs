# NATS Request/Reply Walkthrough

NATS supports [request/reply](../nats-concepts/reqreply.md) messaging. In this tutorial you explore how to exchange point-to-point messages using NATS.

### Walkthrough prerequisites

If you have not already done so, you need to [install](/walkthrough/walkthrough_setup.md) the `nats` CLI Tool and optionally the nats-server on your machine.

### 1. Start the NATS server if needed

If you are going to run a server locally you need to first start it. Alternatively if you are going to use a remote server you only need to pass the server URL to `nats` using the `-s` or preferably create a context using `nats context add` to specify the server URL(s) and credentials file containing your user JWT.

To start a simple demonstration server locally just use:

```bash
% nats-server
```

When the server starts successfully, you will see the following messages:

```bash
[9013] 2021/10/11 15:08:52.573742 [INF] Starting nats-server
[9013] 2021/10/11 15:08:52.573844 [INF]   Version:  2.6.1
[9013] 2021/10/11 15:08:52.573847 [INF]   Git:      [not set]
[9013] 2021/10/11 15:08:52.573849 [INF]   Name:     NBP3KW36QXLRMVQZMKPIMQHUT6TA23XX2W5Q3DFU2TFPWXWEASC4YU4Q
[9013] 2021/10/11 15:08:52.573851 [INF]   ID:       NBP3KW36QXLRMVQZMKPIMQHUT6TA23XX2W5Q3DFU2TFPWXWEASC4YU4Q
[9013] 2021/10/11 15:08:52.574507 [INF] Listening for client connections on 0.0.0.0:4222
[9013] 2021/10/11 15:08:52.574728 [INF] Server is ready
```

The NATS server listens for client connections on TCP Port 4222.

### 2. Start two terminal sessions

You will use these sessions to run the NATS request and reply clients.

### 3. In one terminal, run the reply client listener

```bash
% nats reply help.please "OK, I CAN HELP!!!"
```

You should see the message: _Listening on \[help.please\]_

This means that the NATS receiver client is listening for requests messages on the "help.please" subject. In NATS, the receiver is a subscriber.

### 4. In the other terminal, run the request client

```bash
% nats request help.please "I need help!"
```

The NATS requestor client makes a request by sending the message "I need help!" on the “help.please” subject.

The NATS receiver client receives the message, formulates the reply \("OK, I CAN HELP!!!"\), and sends it to the inbox of the requester.

