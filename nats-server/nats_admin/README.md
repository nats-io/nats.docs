# Managing A NATS Server

Managing a NATS server is simple, typical lifecycle operations include:

* [Sending signals](signals.md) to a server to reload a configuration or rotate log files
* [Upgrading](upgrading_cluster.md) a server \(or cluster\)
* Understanding [slow consumers](slow_consumers.md)
* Monitoring the server via:
   * The monitoring [endpoint](../configuration/monitoring.md) and tools like [nats-top](../../nats-tools/nats_top/README.md) 
   * By subscribing to [system events](../configuration/sys_accounts/sys_accounts.md)
