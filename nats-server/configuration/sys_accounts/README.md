# System Events

NATS servers leverage [Accounts](../securing_nats/accounts.md) support and generate events such as:

* account connect/disconnect
* authentication errors
* server shutdown
* server stat summary

In addition the server supports a limited number of requests that can be used to query for account connections, server stat summaries, and pinging servers in the cluster.

These events are enabled by configuring `system_account` and [subscribing/requesting](./#available-events-and-services) using a _system account_ user.

[Accounts](../securing_nats/accounts.md) are used so that subscriptions from your applications, say `>`, do not receive system events and vice versa. Using accounts requires either:

* [Configuring authentication locally](./#local-configuration) and listing one of the accounts in `system_account`
* Or by using decentralized authentication and authorization via [jwt](../securing_nats/jwt/) as shown in this [Tutorial](sys_accounts.md). In this case `system_account` contains the account public key.

## Available Events and Services

The system account publishes messages under well known subject patterns.

Server initiated events:

* `$SYS.ACCOUNT.<id>.CONNECT` \(client connects\)
* `$SYS.ACCOUNT.<id>.DISCONNECT` \(client disconnects\)
* `$SYS.SERVER.ACCOUNT.<id>.CONNS` \(connections for an account changed\)
* `$SYS.SERVER.<id>.CLIENT.AUTH.ERR` \(authentication error\)
* `$SYS.ACCOUNT.<id>.LEAFNODE.CONNECT` \(leaf node connnects\)
* `$SYS.ACCOUNT.<id>.LEAFNODE.DISCONNECT` \(leaf node disconnects\)
* `$SYS.SERVER.<id>.STATSZ` \(stats summary\)

In addition other tools with system account privileges, can initiate requests \(Examples can be found [here](sys_accounts.md#system-services)\):

* `$SYS.REQ.SERVER.<id>.STATSZ` \(request server stat summary\)
* `$SYS.REQ.SERVER.PING` \(discover servers - will return multiple messages\)

[Monitoring endpoints](../monitoring.md) as listed in the table below are accessible as system services using the following subject pattern:

* `$SYS.REQ.SERVER.<id>.<endpoint-name>` \(request server monitoring endpoint corresponding to endpoint name.\)
* `$SYS.REQ.SERVER.PING.<endpoint-name>` \(from all server, request server monitoring endpoint corresponding to endpoint name - will return multiple messages\)

| Endpoint | Endpoint Name |
| :--- | :--- |
| [General Server Information](../monitoring.md#general-information) | `VARZ` |
| [Connections](../monitoring.md#connection-information) | `CONNZ` |
| [Routing](../monitoring.md#route-information) | `ROUTEZ` |
| [Gateways](../monitoring.md#gateway-information) | `GATEWAYZ` |
| [Leaf Nodes](../monitoring.md#leaf-nodes-information) | `LEAFZ` |
| [Subscription Routing](../monitoring.md#subscription-routing-information) | `SUBSZ` |
| [JetStream](../monitoring.md#jetstream-information) | `JSZ` |
| [Accounts](../monitoring.md#account-information) | `ACCOUNTZ` |

* `"$SYS.REQ.ACCOUNT.<account-id>.<endpoint-name>`\(from all server, request account specific monitoring endpoint corresponding to account id and endpoint name - will return multiple messages\)

| Endpoint | Endpoint Name |
| :--- | :--- |
| [Connections](../monitoring.md#connection-information) | `CONNZ` |
| [Leaf Nodes](../monitoring.md#leaf-nodes-information) | `LEAFZ` |
| [Subscription Routing](../monitoring.md#subscription-routing-information) | `SUBSZ` |
| [JetStream](../monitoring.md#jetstream-information) | `JSZ` |
| [Account](../monitoring.md#account-information) | `INFO` |

Servers like `nats-account-server` publish system account messages when a claim is updated, the nats-server listens for them, and updates its account information accordingly:

* `$SYS.ACCOUNT.<id>.CLAIMS.UPDATE`

With these few messages you can build useful monitoring tools:

* health/load of your servers
* client connects/disconnects
* account connections
* authentication errors

## Local Configuration

To make use of System events, just using accounts, your configuration can look like this:

```text
accounts: {
    USERS: {
        users: [
            {user: a, password: a}
        ]
    },
    SYS: { 
        users: [
            {user: admin, password: changeit}
           ]
    },
}
system_account: SYS
```

Please note that applications now have to authenticate such that a connection can be associated with an account. In this example username and password were chosen for simplicity of the demonstration. Subscribe to all system events like this `nats sub -s nats://admin:changeit@localhost:4222 ">"` and observe what happens when you do something like `nats pub -s "nats://a:a@localhost:4222" foo bar`. Examples on how to use system services can be found [here](sys_accounts.md#system-services).

