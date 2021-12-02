# nats CLI

A command line utility to interact with and manage NATS.

This utility replaces various past tools that were named in the form `nats-sub` and `nats-pub`, adds several new capabilities and supports full JetStream management.

Check out the repo for all the details: [github.com/nats-io/natscli](https://github.com/nats-io/natscli).

## Installing `nats`

For macOS:

```shell
brew tap nats-io/nats-tools
brew install nats-io/nats-tools/nats
```

For Arch Linux:

```shell
yay natscli
```

Binaries are also available as [GitHub Releases](https://github.com/nats-io/natscli/releases).

## Using `nats`
### Getting help
* `nats help`
* `nats help [<command>...]` or `nats [<command>...] --help`
* Remember to look at the cheat sheets!
  * `nats cheat`
  * `nats cheat --sections`
  * `nats cheat <section>>`
### Interacting with NATS
* `nats context`
* `nats account`
* `nats pub`
* `nats sub`
* `nats request`
* `nats reply`
* `nats bench`
### Monitoring NATS
* `nats events`
* `nats rtt`
* `nats server`
* `nats latency`
* `nats governor`
### Managing and interacting with streams
* `nats stream`
* `nats consumer`
* `nats backup`
* `nats restore`
### Managing and interacting with the K/V Store
* `nats kv`
### Get reference information
* `nats errors`
* `nats schema`

## Configuration Contexts

In practice, it is quite common for the administrators of a NATS service infrastructure to have to connect using various NATS URLs and security credentials, the CLI has a number of environment configuration settings that can be passed as command line arguments or set in environment variables. In order to facilitate switching between NATS environments or servers, clusters, operators, etc... nats lets you use 'contexts' that you can store and easily select.

```shell
nats --help
```
Output extract
```text
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

You can set these using the CLI flag, the environment variable - like **NATS_URL** - or using our context feature.

### NATS Contexts
A context is a named configuration that stores all of these settings, you can switch between access configurations and designate a default.

Creating one is easy, just specify the settings with `nats context save`

```shell
nats context save example --server nats://nats.example.net:4222 --description 'Example.Net Server'
nats context save local --server nats://localhost:4222 --description 'Local Host' --select 
```

Or you can use `nats context create my_context_name` and then edit the created context file (i.e. in `~/.config/nats/context/my_context_name.json`)

List your contexts
```shell
nats context ls
```
Output
```text
Known contexts:

   example             Example.Net Server
   local*              Local Host
```

We passed `--select` to the `local` one meaning it will be the default when nothing is set.

Select a context
```shell
nats context select
```

Check the round trip time to the server (using the currently selected context)

```shell
nats rtt
```
Output
```text
nats://localhost:4222:

   nats://127.0.0.1:4222: 245.115µs
       nats://[::1]:4222: 390.239µs
```

You can also specify a context directly

```shell
nats rtt --context example
```
Example output
```text
nats://nats.example.net:4222:

   nats://192.0.2.10:4222: 41.560815ms
   nats://192.0.2.11:4222: 41.486609ms
   nats://192.0.2.12:4222: 41.178009ms
```

All `nats` commands are context aware and the `nats context` command has various commands to view, edit and remove contexts.

Server URLs and Credential paths can be resolved via the `nsc` command by specifying an URL, for example to find user `new` within the `orders` account of the `acme` operator you can use this:

```shell
nats context save example --description 'Example.Net Server' --nsc nsc://acme/orders/new
```

The server list and credentials path will now be resolved via `nsc`, if these are specifically set in the context, the specific context configuration will take precedence.

## Generating bcrypted passwords

The server supports hashing of passwords and authentication tokens using `bcrypt`. To take advantage of this, simply replace the plaintext password in the configuration with its `bcrypt` hash, and the server will automatically utilize `bcrypt` as needed.

The `nats` utility has a command for creating `bcrypt` hashes. This can be used for a password or a token in the configuration.

```shell
nats server passwd
```
Output
```text
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

To use the password on the server, add the hash into the server configuration file's authorization section.

```text
  authorization {
    user: derek
    password: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
  }
```

Note the client will still have to provide the plain text version of the password, the server however will only store the hash to verify that the password is correct when supplied.

## See Also

Publish-subscribe pattern using the NATS CLI

{% embed url="https://www.youtube.com/watch?v=jLTVhP08Tq0" %}
Publish-subscribe Pattern using NATS CLI
{% endembed %}
