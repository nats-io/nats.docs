# nsc

NATS account configurations are built using the `nsc` tool. The NSC tool allows you to:

* Create and edit Operators, Accounts, Users
* Manage publish and subscribe permissions for Users
* Define Service and Stream exports from an account
* Reference Service and Streams from another account 
* Generate Activation tokens that grants access to a private service or stream
* Generate User credential files
* Describe Operators, Accounts, Users, and Activations
* Push and pull account JWTs to an account JWTs server

## Installation

Installing `nsc` is easy:

```shell
curl -L https://raw.githubusercontent.com/nats-io/nsc/master/install.py | python
```

The script will download the latest version of `nsc` and install it into your system.

In case NSC is not initialized already do `nsc init`

Output of `tree -L 2 nsc/`
```text
nsc/
├── accounts
│   ├── nats
│   └── nsc.json
└── nkeys
    ├── creds
    └── keys
5 directories, 1 file
```

**IMPORTANT**: `nsc` version 2.2.0 has been released. This version of nsc only supports `nats-server` v2.2.0 and `nats-account-server` v1.0.0. For more information please refer to the [nsc 2.2.0 release notes](https://github.com/nats-io/nsc/releases/tag/2.2.0).

## Tutorials

You can find various task-oriented tutorials to working with the tool here:

* [Basic Usage](basics.md)
* [Configuring Account Streams Import/Export](streams.md)
* [Configuring Account Services Import/Export](services.md)
* [Signing Keys](signing_keys.md)
* [Revoking Users or Activations](revocation.md)
* [Working with Managed Operators](managed.md)

## Tool Documentation

For more specific browsing of the tool syntax, check out the `nsc` tool documentation. It can be found within the tool itself:

```shell
nsc help
```

Or an online version [here](https://nats-io.github.io/nsc).

