# Configuring JetStream

## Enabling JetStream for a nats-server

To enable JetStream in a server we have to configure it at the top level first:

```text
jetstream: enabled
```

You can also use the `-js, --jetstream` and `-sd, --store_dir <dir>` flags from the command line

# Multi-tenancy & Resource Mgmt

JetStream is compatible with NATS 2.0 Multi-Tenancy using Accounts. A JetStream enabled server supports creating fully isolated JetStream environments for different accounts.

JetStream environments in leaf nodes should be isolated in their own JetStream domain - [Leaf nodes](../leafnodes/README.md)

This will dynamically determine the available resources. It's recommended that you set specific limits though:

```text
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
    domain: acme
}
```

## Setting account resource limits 
At this point JetStream will be enabled and if you have a server that does not have accounts enabled, all users in the server would have access to JetStream

```text
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
}

accounts {
    HR: {
        jetstream: enabled
    }
}
```

Here the `HR` account would have access to all the resources configured on the server, we can restrict it:

```text
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
}

accounts {
    HR: {
        jetstream {
            max_mem: 512M
            max_file: 1G
            max_streams: 10
            max_consumers: 100
        }
    }
}
```

Now the `HR` account is limited in various dimensions.

If you try to configure JetStream for an account without enabling it globally you'll get a warning and the account designated as System cannot have JetStream enabled.

### Setting JetStream API and Max HA assets limits

Since version v2.10.21, the NATS JetStream API has a limit of 10K inflight requests after which it will start to drop requests in order to protect from memory buildup and to avoid overwhelming the JetStream service. Sometimes it might be necessary to reduce the limit further in order to reduce the possibility of an increase in JetStream traffic impacting the service.
Another important limit is `max_ha_assets` which would constrain the maximum number of supported R3 or R5 streams and consumers per server:

Example:

```
jetstream {
  request_queue_limit: 1000
    limits {
      max_ha_assets = 2000
    }
  }
```

When the request limit is reached, all pending requests are dropped, therefore it may be necessary in some situations to reduce the limit further in order to lessen the impact on applications. In the logs the following would appear reporting that requests have been dropped:

```
[WRN] JetStream API queue limit reached, dropping 1000 requests
```

For an application, this will mean that those operations will error and will have to be retried. 
This will also emit an advisory under the subject `$JS.EVENT.ADVISORY.API.LIMIT_REACHED` whenever it occurs.

### Operator mode account resources limits using the `nsc` CLI tool

If your setup is in operator mode, JetStream specific account configuration can be stored in account JWT. The earlier account named HR can be configured as follows:

```bash
nsc add account --name HR
nsc edit account --name HR --js-mem-storage 1G --js-disk-storage 512M  --js-streams 10 --js-consumer 100
```
