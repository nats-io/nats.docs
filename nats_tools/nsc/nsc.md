## NSC

NATS uses JWTs to armor the various identity and authorization artifacts. These JWTs are created with the `nsc` tool. NSC simplifies the tasks of creating and managing  identities and other JWT artifacts.

There’s a logical hierarchy to the entities:

- `Operators` are responsible for running nats-servers, and signing account JWTs that set the limits on what an account can do, such as the number of connections, data limits, etc.

- `Accounts` are responsible for issuing user JWTs, and for declaring what subjects can be exported to other accounts, and what subjects they import from other accounts and what the local subjects for those imports are.

- `Users` are issued by an account, and encode limits regarding usage and authorization over the subject space.

NSC allows you to create, edit, delete these entities, and will be central to all account based configuration.

In this guide, you’ll run end-to-end on some of the configuration scenarios:

- generate JWTs
- make JWTs accessible to a nats-server
- configure a nats-server to use JWTs

Let’s run through the process of creating some identities and JWTs and work through the process.

By default JWTs are written to `~/.nsc` and secrets to `~/.nkeys`. You can easily change those locations by setting `NSC_HOME` and `NKEYS_PATH` respectively in your environment to your desired locations.

> The $NKEYS_PATH stores secrets. Since nkeys relies on cryptographic signatures to prove identity, anyone with access to your private keys will be able to assume your identity. With that said, treat them as secrets and guard them carefully.

Let’s see what settings `nsc` has in its environment:

```text
> nsc env
╭──────────────────────────────────────────╮
│             NSC Environment              │
├──────────────────┬─────┬─────────────────┤
│ Setting          │ Set │ Effective Value │
├──────────────────┼─────┼─────────────────┤
│ $NKEYS_PATH      │ No  │ ~/.nkeys        │
│ $NSC_HOME        │ No  │ ~/.nsc          │
│ Config           │     │ ~/.nsc/nsc.json │
├──────────────────┼─────┼─────────────────┤
│ Stores Dir       │     │ ~/.nsc/nats     │
│ Default Operator │     │                 │
│ Default Account  │     │                 │
│ Default Cluster  │     │                 │
╰──────────────────┴─────┴─────────────────╯
```

By default you’ll see that generated secrets are stored in `~/.nkeys`, and configurations in `~/.nsc/nats`. All operations are assumed to be in a context of the current operator and current account. When working with multiple operators and accounts you may need to set the current one. You can easily do so by issuing the `nsc env` and provide flags to set the current operator or account. See `nsc env —help` for more details.


#### Creating an Operator

Let’s create an operator called `Test`:

```text
> nsc add operator -n Test
Generated operator key - private key stored “~/.nkeys/Test/Test.nk”
Success! - added operator "Test"
```

With the above incantation, the tool generated an NKEY for the operator, stored the private key safely in `~/.nkeys/Test/Test.nk`. The file contains a single line, with the seed value for the NKEY.

 > You can tell the key is a seed if it starts with the letter `S`. The type of the key is will be the second letter an `O`, `A` or `U` for _Operator_, _Account_ or _User_. If the key does not start with an `S` you have instead a public key.

The tool also created a JWT with all default settings for the operator test, and stored it in `~/.nsc/nats/Test/Test.jwt`. The `~/.nsc/nats/Test` directory will also contain a directory where accounts related to this operator will live.

You can view the JWT by entering the command:

```text
> nsc describe operator
╭───────────────────────────────────────╮
│           Operator Details            │
├─────────────┬─────────────────────────┤
│ Name        │ Test                    │
│ Operator ID │ OAYI3YUZSWDN            │
│ Issuer ID   │ OAYI3YUZSWDN            │
│ Issued      │ 2019-04-24 19:48:55 UTC │
│ Expires     │                         │
╰─────────────┴─────────────────────────╯
```

Note that the Operator ID is truncated to simplify the output, to get the full ID, do:

```text
> nsc describe operator -W
╭────────────────────────────────────────────────────────────────────────╮
│                            Operator Details                            │
├─────────────┬──────────────────────────────────────────────────────────┤
│ Name        │ Test                                                     │
│ Operator ID │ OAYI3YUZSWDNMERD2IN3HZSIP3JA2E3VDTXSTEVOIII273XL2NABJP64 │
│ Issuer ID   │ OAYI3YUZSWDNMERD2IN3HZSIP3JA2E3VDTXSTEVOIII273XL2NABJP64 │
│ Issued      │ 2019-04-24 19:48:55 UTC                                  │
│ Expires     │                                                          │
╰─────────────┴──────────────────────────────────────────────────────────╯
```

With an operator, we are ready to create our first account.

#### Creating an Account

Let’s create an account called `TestAccount`:

```
> nsc add account -n TestAccount
Generated account key - private key stored “~/.nkeys/Test/accounts/TestAccount/TestAccount.nk"
Success! - added account "TestAccount"
```

As we did with the operator, we can describe the account:

```text
> nsc describe account 
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ TestAccount             │
│ Account ID               │ AC7PO3MREV26            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-24 19:58:01 UTC │
│ Expires                  │                         │
├──────────────────────────┼─────────────────────────┤
│ Max Connections          │ Unlimited               │
│ Max Data                 │ Unlimited               │
│ Max Exports              │ Unlimited               │
│ Max Imports              │ Unlimited               │
│ Max Msg Payload          │ Unlimited               │
│ Max Subscriptions        │ Unlimited               │
│ Exports Allows Wildcards │ True                    │
├──────────────────────────┼─────────────────────────┤
│ Imports                  │ None                    │
│ Exports                  │ None                    │
╰──────────────────────────┴─────────────────────────╯
```

Again, specifying the `-W` flag will print the complete account ID (the public key identifying the account).

Note that the issuer for the account is the ID for the operator (the public key identifying the operator).

Now we are ready to add a user.

#### Creating a User

Let’s add a user named ‘TestUser’:

```text
> nsc add user -n TestUser
Generated user key - private key stored "~/.nkeys/Test/accounts/TestAccount/users/TestUser.nk"
Generated user creds file "~/.nkeys/Test/accounts/TestAccount/users/TestUser.creds"
Success! - added user "TestUser" to "TestAccount"
```

Note that when we added the user, we got a message telling us about a `.creds` file being created. The `.creds` file contains the JWT describing the user, and the private  (seed) key for the user. This file is formatted in a special way for use by nats client libraries. Client libraries can extract the JWT and seed key, and connect to a server expecting JWT authentication, provide the JWT and use the private key to sign the nonce to verify its identity.

And let’s describe it:

```text
> nsc describe user
╭───────────────────────────────────────────╮
│                   User                    │
├─────────────────┬─────────────────────────┤
│ Name            │ TestUser                │
│ User ID         │ UCQB7NONBKRC            │
│ Issuer ID       │ AC7PO3MREV26            │
│ Issued          │ 2019-04-24 20:36:25 UTC │
│ Expires         │                         │
├─────────────────┼─────────────────────────┤
│ Max Messages    │ Unlimited               │
│ Max Msg Payload │ Unlimited               │
│ Network Src     │ Any                     │
│ Time            │ Any                     │
╰─────────────────┴─────────────────────────╯
```

Let’s put all of this together, and create a simple server configuration that accepts sessions from TestUser.

### Account Server Configuration

To configure a server to use accounts you need an _account resolver_. An account resolver exposes a URL where a nats-server can query for JWTs belonging to an account.

A simple built-in resolver is the `MEMORY` resolver which simply statically maps account public keys to an account JWT in the server’s configuration file. It is somewhat easier to configure because it doesn’t require another moving part, but fails provide the needed experience of setting up an account server. Let’s setup an _Account Server_.

Installing the Account Server

```text
> go get github.com/nats-io/nats-account-server
```

The account server has options to enable you to use an nsc directory directly. Let’s start one:

```text
> nats-account-server -nsc ~/.nsc/nats/Test
```

Above we pointed the account server to our nsc data directory (more specifically to the `Test` operator that we created earlier). By default, the server listens on the localhost at port 9090.

We are now ready to configure the nats-server

### NATS Server Configuration

If you don’t have a nats-server installed, let’s do that now:

```text
> go get github.com/nats-io/nats-server
```

Let’s create a configuration that references our operator JWT and the nats-account-server as a resolver:

```yaml
operator: /Users/synadia/.nsc/nats/Test/Test.jwt
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

At minimum the server requires the `operator` JWT, which we have pointed at directly, and a resolver. The resolver has two types `MEM` and `URL`. We are interested in the `URL` since we want the nats-server to talk to the account server. Note we put the URL of the server with the path `/jwt/v1/accounts`. Currently this is where the account server expects requests for account information.

### Client Testing

Let’s install some tooling:

```text
> go get github.com/nats-io/go-nats/examples/nats-pub

> go get github.com/nats-io/go-nats/examples/nats-sub
```

Create a subscriber:
```text
nats-sub -creds ~/.nkeys/Test/accounts/TestAccount/users/TestUser.creds ">"
Listening on [>]
```

Publish a message:
```text
nats-pub -creds ~/.nkeys/Test/accounts/TestAccount/users/TestUser.creds hello NATS 
Published [hello] : 'NATS'
```

Subscriber shows:
```text
[#1] Received on [hello]: ’NATS’
```

