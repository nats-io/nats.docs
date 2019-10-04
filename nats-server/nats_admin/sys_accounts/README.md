# System Accounts

NATS servers leverage [Account](../../configuration/securing_nats/auth_intro/jwt_auth.md) support and generate events such as:

* account connect/disconnect
* authentication errors
* server shutdown
* server stat summary

In addition the server supports a limitted number of requests that can be used to query for account connections, server stat summaries, and pinging servers in the cluster.

These events are only accepted and visible to _system account_ users.

## The System Events Tutorial

You can learn more about System Accounts in the [Tutorial](sys_accounts.md).

