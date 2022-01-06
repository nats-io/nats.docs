# Memory Resolver Tutorial

The `MEMORY` resolver is a server built-in resolver for account JWTs. If there are a small number of accounts, or they do not change too often this can be a simpler configuration that does not require an external account resolver. Server configuration reload is supported, meaning the preloads can be updated in the server configuration and reloaded without a server restart.

The basic configuration for the server requires:

* The operator JWT
* `resolver` set to `MEMORY`
* `resolver_preload` set to an object where account public keys are mapped to account JWTs.

## Create Required Entities

Let's create the setup:

```shell
nsc add operator -n memory
```

Output

```
Generated operator key - private key stored "~/.nkeys/memory/memory.nk"
Success! - added operator "memory"
```

Add an account 'A'

```shell
nsc add account --name A
```

Output

```
Generated account key - private key stored "~/.nkeys/memory/accounts/A/A.nk"
Success! - added account "A"
```

Describe the account

```shell
nsc describe account -W
```

Output

```
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ACSU3Q6LTLBVLGAQUONAGXJHVNWGSKKAUA7IY5TB4Z7PLEKSR5O6JTGR │
│ Issuer ID                 │ ODWZJ2KAPF76WOWMPCJF6BY4QIPLTUIY4JIBLU4K3YDG3GHIWBVWBHUZ │
│ Issued                    │ 2019-04-30 20:21:34 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Imports                   │ None                                                     │
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯
```

Create a new user 'TA'

```shell
nsc add user --name TA
```

Output

```
Generated user key - private key stored "~/.nkeys/memory/accounts/A/users/TA.nk"
Generated user creds file "~/.nkeys/memory/accounts/A/users/TA.creds"
Success! - added user "TA" to "A"
```

## Create the Server Config

The `nsc` tool can generate a configuration file automatically. You provide a path to the server configuration. The `nsc` tool will generate the server config for you:

```shell
nsc generate config --mem-resolver --config-file /tmp/server.conf 
```

If you require additional settings, you may want to consider using [`include`](/running-a-nats-service/configuration/README.md#include-directive) in your main configuration, to reference the generated files. Otherwise, you can start a server and reference the generated configuration:

```shell
nats-server -c /tmp/server.conf
```

You can then [test it](mem_resolver.md#testing-the-configuration).

## Manual Server Config

While generating a configuration file is easy, you may want to craft one by hand to know the details. With the entities created, and a standard location for the `.nsc` directory. You can reference the operator JWT and the account JWT in a server configuration or the JWT string directly. Remember that your configuration will be in `$NSC_HOME/nats/<operator_name>/<operator_name>.jwt` for the operator. The account JWT will be in `$NSC_HOME/nats/<operator_name>/accounts/<account_name>/<account_name>.jwt`

For the configuration you'll need:

* The path to the operator JWT
* A copy of the contents of the account JWT file

The format of the file is:

```
operator: <path to the operator jwt or jwt itself>
resolver: MEMORY
resolver_preload: {
    <public key for an account>: <contents of the account jwt>
    ### add as many accounts as you want
    ...
}
```

In this example this translates to:

```
operator: /Users/synadia/.nsc/nats/memory/memory.jwt
resolver: MEMORY
resolver_preload: {
ACSU3Q6LTLBVLGAQUONAGXJHVNWGSKKAUA7IY5TB4Z7PLEKSR5O6JTGR: eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJPRFhJSVI2Wlg1Q1AzMlFJTFczWFBENEtTSDYzUFNNSEZHUkpaT05DR1RLVVBISlRLQ0JBIiwiaWF0IjoxNTU2NjU1Njk0LCJpc3MiOiJPRFdaSjJLQVBGNzZXT1dNUENKRjZCWTRRSVBMVFVJWTRKSUJMVTRLM1lERzNHSElXQlZXQkhVWiIsIm5hbWUiOiJBIiwic3ViIjoiQUNTVTNRNkxUTEJWTEdBUVVPTkFHWEpIVk5XR1NLS0FVQTdJWTVUQjRaN1BMRUtTUjVPNkpUR1IiLCJ0eXBlIjoiYWNjb3VudCIsIm5hdHMiOnsibGltaXRzIjp7InN1YnMiOi0xLCJjb25uIjotMSwibGVhZiI6LTEsImltcG9ydHMiOi0xLCJleHBvcnRzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJ3aWxkY2FyZHMiOnRydWV9fX0._WW5C1triCh8a4jhyBxEZZP8RJ17pINS8qLzz-01o6zbz1uZfTOJGvwSTS6Yv2_849B9iUXSd-8kp1iMXHdoBA
}
```

Save the config at server.conf and start the server:

```shell
nats-server -c server.conf
```

You can then [test it](mem_resolver.md#testing-the-configuration).

## Testing the Configuration

To test the configuration, simply use one of the standard tools:

```shell
nats pub --creds ~/.nkeys/creds/memory/A/TA.creds hello world
```
