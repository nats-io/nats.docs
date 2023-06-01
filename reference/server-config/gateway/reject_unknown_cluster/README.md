# reject_unknown_cluster

If true, gateway will reject connections from cluster that are
not configured in gateways. It does so by checking if the cluster
name, provided by the incomming connection, exists as named gateway.
This effectively disables gossiping of new cluster. It does not
restrict a configured gateway, thus cluster, from dynamically growing.

*Default value*: `false`
