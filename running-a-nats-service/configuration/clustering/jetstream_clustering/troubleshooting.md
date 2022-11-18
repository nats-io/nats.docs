# Troubleshooting NATS JetStream clusters

Diagnosing problems in NATS JetStream clusters requires:
* knowledge of [JetStream concepts](../../../../nats-concepts/jetstream/readme.md)
* knowledge of the [NATS Command Line Interface (CLI)](https://github.com/nats-io/natscli#the-nats-command-line-interface)

The following tips and commands (while not an exhaustive list) can be useful when diagnosing problems in NATS JetStream clusters:

## Troubleshooting tips

1. Look at [nats-server](https://github.com/nats-io/nats-server#readme) logs
2. Make sure that in the [NATS JetStream configuration](./README.md#configuration), at least one system user is configured in this section: `{ $SYS { users } }`.

### `nats account` commands

| Command | Description |
| :--- | :--- |
| [`nats account info`](../../../nats_admin/jetstream_admin/account.md) | Verify that JetStream is enabled on account |

###  Basic `nats server` commands

| Command | Description |
| :--- | :--- |
| `nats server ls` | List known servers |
|  `nats server ping`  |    Ping all servers |
|  `nats server info`  |    Show information about a single server |
|  [`nats server check`](../../../clients.md#testing-your-setup) | Health check for NATS servers |

### `nats server report` commands

| Command | Description |
| :--- | :--- |
| `nats server report connections` |  Report on connections |
| `nats server report accounts` | Report on account activity |
| [`nats server report jetstream`](./administration.md#viewing-the-cluster-state) | Report on JetStream activity |

### `nats server request` commands

| Command | Description |
| :--- | :--- |
|  [`nats server request jetstream`](./administration.md#viewing-the-cluster-state) | Show JetStream details |
|  `nats server request subscriptions` |  Show subscription information |
|  `nats server request variables`   |   Show runtime variables |
|  `nats server request connections` |   Show connection details |
|  `nats server request routes`      |   Show route details |
|  `nats server request gateways`    |  Show gateway details |
|  `nats server request leafnodes`   |  Show leafnode details |
|  `nats server request accounts`    |  Show account details |

### `nats server raft` commands

| Command | Description |
| :--- | :--- |
| [`nats server raft step-down`](./administration.md#forcing-stream-and-consumer-leader-election) | Force a new leader election by standing down the current meta leader |
| [`nats server raft peer-remove`](./administration.md#evicting-a-peer) |  Removes a server from a JetStream cluster |

### Experimental commands

| Command | Description |
| :--- | :--- |
|  [`nats traffic`](https://github.com/nats-io/natscli/blob/main/cli/traffic_command.go) |  Monitor NATS traffic. (**Experimental command**) |

## Further troubleshooting references

* [Testing your setup](../../../clients.md#testing-your-setup)
