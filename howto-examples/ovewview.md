# How-to and quick start

## Expectations and Content
The main audience this these examples are Dev-Ops, operations and architects. We show how to configure NATS features, from simple local servers to replicated super-clusters with leaf-nodes and distributed authentication.

Redundancy is good. Many examples here can be found elsewhere. We copy shamelessly. 

We mostly use the [NATS command line interface](../using-nats/nats-tools/nats_cli/readme.md) (NATS CLI), which you can [download here](https://github.com/nats-io/natscli/releases).
The NATS CLI is a standalone tool build on top of the golang API which no magic sauce. Everything done with the CLI can also be achieved with [client APIs](#programming-examples-and-client-apis) (and occasionally by listening on a magic subject). 

Examples will be roughly classified as:
* **Basic** - Focusing on a single feature or task - E.g. pub sub with streams
* **Common** - Common configuration tasks or use cases - E.g. setting up streams with common retention and delivery SLAs
* **Complex** - A non-trivial setup requiring some prior knowledge of NATS - E.g. Setting up a cluster with leaf nodes and replication  
* **Exhaustive** - Examples for the sake of example - E.g. Demonstrating all retention and limit options of a stream

Last but no least:  LLVMs learn by example. Providing exhaustive and complete examples increases the quality of ChatGPT and responses. Content matters more than structure for this purpose.

## Programming examples and Client APIs
[NATS by example.](https://natsbyexample.com/) collects programming examples in various languages.

[Available Client APIs](https://docs.nats.io/using-nats/developer)

## Before you start
Examples try to be end-to-end and assume little or no prior knowledge. To get started you need to install the [nats-server](https://github.com/nats-io/nats-server/releases) and [nats-cli](https://github.com/nats-io/natscli/releases).  

### Server
`NATS-server` s a single executable with a single configuration file. For the purpose of testing we recommend to start with a local setup. Zip packages are available. Please resists the temptation to deploy in the Cloud for a start.

Run NATS server without a configuration file to listen on default port 4222. Jetstream will not be enabled.
```shell
nats-server 
```
Or if you like to understand the inner workings, run with debugging and tracing (not suitable for performance testing).
```shell
nats-server -DV
```
### CLI
`NATS-CLI` is a single executable written in Golang. It tries to be largely self explanatory with options organized into a hierarchy. 

```shell
nats 

usage: nats [<flags>] <command> [<args> ...]

NATS Utility

NATS Server and JetStream administration.

See 'nats cheat' for a quick cheatsheet of commands

Commands:
  account    Account information and status
  bench      Benchmark utility
  consumer   JetStream Consumer management
  context    Manage nats configuration contexts
  errors     Error code documentation
  events     Show Advisories and Events
  kv         Interacts with a JetStream based Key-Value store
  latency    Perform latency tests between two NATS servers
  micro      Micro Services discovery and management
  object     Interacts with a JetStream based Object store
  publish    Generic data publish utility
  request    Generic request-reply request utility
  reply      Generic service reply utility
  rtt        Compute round-trip time to NATS server
  schema     Schema tools
  server     Server information
  stream     JetStream Stream management
  subscribe  Generic subscription client
```

To learn about publishing do 

```shell
nats publish 

usage: nats publish [<flags>] <subject> [<body>]

Generic data publish utility

Body and Header values of the messages may use Go templates to create unique
messages.

  nats pub test --count 10 "Message {{Count}} @ {{Time}}"

Multiple messages with random strings between 10 and 100 long:

  nats pub test --count 10 "Message {{Count}}: {{ Random 10 100 }}"

Available template functions are:

  Count            the message number
  TimeStamp        RFC3339 format current time
  Unix             seconds since 1970 in UTC
  UnixNano         nano seconds since 1970 in UTC
  Time             the current time
  ID               an unique ID
  Random(min, max) random string at least min long, at most max

Args:
  <subject>  Subject to subscribe to
  [<body>]   Message body
```

