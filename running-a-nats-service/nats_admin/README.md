# Managing A NATS Server

Managing a NATS Server is simple, typical lifecycle operations include:

* Using the [`nats`](/using-nats/nats-tools/nats%20CLI/readme.md) CLI tool to check server cluster connectivity and latencies, as well as get account information, and manage and interact with streams (and other NATS applications). Try the following examples to learn about the most common ways to use `nats`.
  * `nats cheat`
  * `nats cheat server`
  * `nats stream --help` to monitor, manage and interact with streams
  * `nats consumer --help` to monitor, manage stream consumers
  * `nats context --help` if you need to switch between servers, clusters or user credentials
* Using the [`nsc`](/using-nats/nats-tools/nsc/README.md) CLI tool when using JWT based authentication and authorization, to create, revoke operators, accounts, and user (i.e. client applications) JWTs and keys.
* [Sending signals](signals.md) to a server to reload a configuration or rotate log files
* [Upgrading](upgrading_cluster.md) a server \(or cluster\)
* Understanding [slow consumers](slow_consumers.md)
* Monitoring the server via:
  * The monitoring [endpoint](/running-a-nats-service/nats_admin/monitoring/readme.md) and tools like [nats-top](/using-nats/nats-tools/nats_top) 
  * By subscribing to [system events](/running-a-nats-service/configuration/sys_accounts/README.md)
* Gracefully shut down a server with [Lame Duck Mode](lame_duck_mode.md)


