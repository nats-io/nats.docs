# Configuring JetStream

## Enabling JetStream for a nats-server

To enable JetStream in a server we have to configure it at the top level first:

```text
jetstream: enabled
```

You can also use the `-js, --jetstream` and `-sd, --store_dir <dir>` flags from the command line

# Multi-tenancy & Resource Mgmt

JetStream is compatible with NATS 2.0 Multi-Tenancy using Accounts. A JetStream enabled server supports creating fully isolated JetStream environments for different accounts.

This will dynamically determine the available resources. It's recommended that you set specific limits though:

```text
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
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



### Operator mode account resources limits using the `nsc` CLI tool

If your setup is in operator mode, JetStream specific account configuration can be stored in account JWT. The earlier account named HR can be configured as follows:

```bash
nsc add account --name HR
nsc edit account --name HR --js-mem-storage 1G --js-disk-storage 512M  --js-streams 10 --js-consumer 100
```