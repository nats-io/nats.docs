# Multi-Tenancy & Resource Management

JetStream is compatible with NATS 2.0 Multi-Tenancy using Accounts. A JetStream enabled server supports creating fully isolated JetStream environments for different accounts.

To enable JetStream in a server we have to configure it at the top level first:

```text
jetstream: enabled
```

This will dynamically determine the available resources. It's recommended that you set specific limits though:

```text
jetstream {
    store_dir: /data/jetstream
    max_mem: 1G
    max_file: 100G
}
```

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

Now the `HR` account it limited in various dimensions.

If you try to configure JetStream for an account without enabling it globally you'll get a warning and the account designated as System cannot have JetStream enabled.

### `nsc` CLI

If your setup is in operator mode, JetStream specific account configuration can be stored in account JWT.
The earlier account named HR can be configured as follows:

```bash
nsc add account --name HR
nsc edit account --name HR --js-mem-storage 1G --js-disk-storage 512M  --js-streams 10 --js-consumer 100
```
 
## `nats` CLI

As part of the JetStream efforts a new `nats` CLI has been developed to act as a single point of access to the NATS ecosystem.

This CLI has been seen throughout the guide, it's available in the Docker containers today and downloadable on the [Releases](https://github.com/nats-io/jetstream/releases) page.

### Configuration Contexts

The CLI has a number of environment configuration settings - where your NATS server is, credentials, TLS keys and more:

```text
$ nats --help
...
  -s, --server=NATS_URL         NATS servers
      --user=NATS_USER          Username of Token
      --password=NATS_PASSWORD  Password
      --creds=NATS_CREDS        User credentials
      --nkey=NATS_NKEY          User NKEY
      --tlscert=NATS_CERT       TLS public certificate
      --tlskey=NATS_KEY         TLS private key
      --tlsca=NATS_CA           TLS certificate authority chain
      --timeout=NATS_TIMEOUT    Time to wait on responses from NATS
      --context=CONTEXT         NATS Configuration Context to use for access
...
```

You can set these using the CLI flag, the environment variable - like **NATS\_URL** - or using our context feature.

A context is a named configuration that stores all of these settings, you can switch between access configurations and designate a default.

Creating one is easy, just specify the same settings to the `nats context save`

```text
$ nats context save example --server nats://nats.example.net:4222 --description 'Example.Net Server'
$ nats context save local --server nats://localhost:4222 --description 'Local Host' --select 
$ nats context ls
Known contexts:

   example             Example.Net Server
   local*              Local Host
```

We passed `--select` to the `local` one meaning it will be the default when nothing is set.

```text
$ nats rtt
nats://localhost:4222:

   nats://127.0.0.1:4222: 245.115µs
       nats://[::1]:4222: 390.239µs

$ nats rtt --context example
nats://nats.example.net:4222:

   nats://192.0.2.10:4222: 41.560815ms
   nats://192.0.2.11:4222: 41.486609ms
   nats://192.0.2.12:4222: 41.178009ms
```

The `nats context select` command can be used to set the default context.

All `nats` commands are context aware and the `nats context` command has various commands to view, edit and remove contexts.

Server URLs and Credential paths can be resolved via the `nsc` command by specifying an URL, for example to find user `new` within the `orders` account of the `acme` operator you can use this:

```text
$ nats context save example --description 'Example.Net Server' --nsc nsc://acme/orders/new
```

The server list and credentials path will now be resolved via `nsc`, if these are specifically set in the context, the specific context configuration will take precedence.

