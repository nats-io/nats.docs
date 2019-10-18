# NSC

NATS uses JWTs to armor the various identity and authorization artifacts. These JWTs are created with the `nsc` tool. NSC simplifies the tasks of creating and managing identities and other JWT artifacts.

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

## The NSC Environment

By default JWTs are written to ~/.nsc and secrets to ~/.nkeys. nsc also tracks a value called the "stores directory". This directory contains the operators you are currently working with. By default the stores directory is ~/.nsc/nats but you can switch it to another folder if you want to separate JWTs for use in a revision control system, or co-locate them with a project, etc..

To see the current NSC environment use the command `nsc env`:

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

As you can see there is a setting for the nkeys folder and the nsc home. By default you’ll see that generated secrets are stored in `~/.nkeys`, and configurations in `~/.nsc/nats`. All operations are assumed to be in a context of the current operator and current account. When working with multiple operators and accounts you may need to set the current one. You can easily do so by issuing the `nsc env` and provide flags to set the current operator or account. See `nsc env —help` for more details.

You can easily change the home and keys locations by setting `NSC_HOME` and `NKEYS_PATH` respectively in your environment to your desired locations. The environment itself is stored in the `NSC_HOME`. Operator folders are in the stores directory which can be inside `NSC_HOME` or external to it.

> The $NKEYS_PATH stores secrets. Since nkeys relies on cryptographic signatures to prove identity, anyone with access to your private keys will be able to assume your identity. With that said, treat them as secrets and guard them carefully.

## Creating an Operator

Let’s create an operator called `Test`:

```text
> nsc add operator -n Test
Generated operator key - private key stored “~/.nkeys/Test/Test.nk”
Success! - added operator "Test"
```

With the above incantation, the tool generated an NKEY for the operator, stored the private key safely in `~/.nkeys/Test/Test.nk`. The file contains a single line, with the seed value for the NKEY.

 > You can tell the key is a seed if it starts with the letter `S`. The type of the key is the second letter - an `O`, `A` or `U` for _Operator_, _Account_ or _User_. If the key does not start with an `S` you have instead a public key.

The tool also created a JWT with all default settings for the operator test, and stored it in `~/.nsc/nats/Test/Test.jwt`. The `~/.nsc/nats/Test` directory will also contain a directory where accounts related to this operator will live.

You can view the JWT by entering the command:

```text
> nsc describe operator
╭───────────────────────────────────────╮
│           Operator Details            │
├─────────────┬─────────────────────────┤
│ Name        │ Test                    │
│ Operator ID │ OCEWHXFL3I5I            │
│ Issuer ID   │ OCEWHXFL3I5I            │
│ Issued      │ 2019-06-11 16:25:37 UTC │
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
│ Operator ID │ OCEWHXFL3I5IWPFK2674IUQTFHRZXHI52S2DKQIQJXRXC6P6GWSINZ3H │
│ Issuer ID   │ OCEWHXFL3I5IWPFK2674IUQTFHRZXHI52S2DKQIQJXRXC6P6GWSINZ3H │
│ Issued      │ 2019-06-11 16:25:37 UTC                                  │
│ Expires     │                                                          │
╰─────────────┴──────────────────────────────────────────────────────────╯
```

The operator JWT contains two important URLs. The `account-jwt-server-url` is used by `nsc` when you want to push JWTs to an account server. The `service-url`s are used by `nsc` when you run the tool commands, like `nsc tool pub`.

With an operator, we are ready to create our first account.

## Creating an Account

Let’s create an account called `TestAccount`:

```
> nsc add account -n TestAccount
Generated account key - private key stored “~/.nkeys/Test/accounts/TestAccount/TestAccount.nk"
Success! - added account "TestAccount"
```

As we did with the operator, we can describe the account:

```text
> nsc describe account 
╭─────────────────────────────────────────────────────╮
│                   Account Details                   │
├───────────────────────────┬─────────────────────────┤
│ Name                      │ TestAccount             │
│ Account ID                │ ADM7UGD4FV52            │
│ Issuer ID                 │ OCEWHXFL3I5I            │
│ Issued                    │ 2019-06-11 16:25:57 UTC │
│ Expires                   │                         │
├───────────────────────────┼─────────────────────────┤
│ Max Connections           │ Unlimited               │
│ Max Leaf Node Connections │ Unlimited               │
│ Max Data                  │ Unlimited               │
│ Max Exports               │ Unlimited               │
│ Max Imports               │ Unlimited               │
│ Max Msg Payload           │ Unlimited               │
│ Max Subscriptions         │ Unlimited               │
│ Exports Allows Wildcards  │ True                    │
├───────────────────────────┼─────────────────────────┤
│ Imports                   │ None                    │
│ Exports                   │ None                    │
╰───────────────────────────┴─────────────────────────╯
```

Again, specifying the `-W` flag will print the complete account ID (the public key identifying the account).

Note that the issuer for the account is the ID for the operator (the public key identifying the operator).

Now we are ready to add a user.

## Creating a User

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
│ User ID         │ UBV36EUP2B3Q            │
│ Issuer ID       │ ADM7UGD4FV52            │
│ Issued          │ 2019-06-11 16:26:22 UTC │
│ Expires         │                         │
├─────────────────┼─────────────────────────┤
│ Max Messages    │ Unlimited               │
│ Max Msg Payload │ Unlimited               │
│ Network Src     │ Any                     │
│ Time            │ Any                     │
╰─────────────────┴─────────────────────────╯
```

Let’s put all of this together, and create a simple server configuration that accepts sessions from TestUser.

## Account Server Configuration

To configure a server to use accounts you need an _account resolver_. An account resolver exposes a URL where a nats-server can query for JWTs belonging to an account.

A simple built-in resolver is the `MEMORY` resolver which simply statically maps account public keys to an account JWT in the server’s configuration file. It is somewhat easier to configure because it doesn’t require another moving part, but fails to provide the needed experience of setting up an account server. Let’s setup an _Account Server_.

Installing the Account Server

```text
> go get github.com/nats-io/nats-account-server
```

The account server has options to enable you to use an nsc directory directly. Let’s start one:

```text
> nats-account-server -nsc ~/.nsc/nats/Test
```

Above we pointed the account server to our nsc data directory (more specifically to the `Test` operator that we created earlier). By default, the server listens on the localhost at port 9090.

You can also run the account server with a data directory that is not your nsc folder. In this mode you can upload account JWTs to the server. See the help for `nsc push` for more information about how to push JWTs to the account server.

We are now ready to configure the nats-server.

## NATS Server Configuration

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

## Client Testing

Let’s install some tooling:

```text
> go get github.com/nats-io/nats.go/examples/nats-pub

> go get github.com/nats-io/nats.go/examples/nats-sub
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

## User Authorization

User authorization, as expected, also works with JWT authentication. With `nsc` you can specify authorization for specific subjects to which the user can or cannot publish or subscribe. By default a user doesn't have any limits on the subjects that it can publish or subscribe to. Any message stream or message published in the account is subscribable by the user. The user can also publish to any subject or imported service. Note that authorization, if configured, must be specified on a per user basis.

When specifying limits it is important to remember that clients by default use generated "inboxes" to allow publish requests. When specifying subscribe and publish permissions, you need to enable clients to subscribe and publish to `_INBOX.>`. You can further restrict it, but you'll be responsible for segmenting the subject space so as to not break request/reply communications between clients.

Let's say you have a service that your account clients can make requests to under `req.a`. To enable the service to receive and respond to requests it requires permissions to subscribe to `req.a` and publish permissions under `_INBOX.>`:

```text
> nsc add user --name TestService --allow-pub "_INBOX.>" --allow-sub "req.a"
Generated user key - private key stored "~/.nkeys/Test/accounts/TestAccount/users/TestService.nk"
Generated user creds file "~/.nkeys/Test/accounts/TestAccount/users/TestService.creds"
Success! - added user "TestService" to "TestAccount"

> nsc describe user --name TestService
╭───────────────────────────────────────────╮
│                   User                    │
├─────────────────┬─────────────────────────┤
│ Name            │ TestService             │
│ User ID         │ UCAYGJXTF5WO            │
│ Issuer ID       │ ADM7UGD4FV52            │
│ Issued          │ 2019-06-11 16:41:03 UTC │
│ Expires         │                         │
├─────────────────┼─────────────────────────┤
│ Pub Allow       │ _INBOX.>                │
│ Sub Allow       │ req.a                   │
├─────────────────┼─────────────────────────┤
│ Max Messages    │ Unlimited               │
│ Max Msg Payload │ Unlimited               │
│ Network Src     │ Any                     │
│ Time            │ Any                     │
╰─────────────────┴─────────────────────────╯
```

As you can see this client is not limited to publishing responses to `_INBOX.>` addresses, and to subscribing to the service's request subject.

Similarly, we can limit a client:

```text
> nsc add user --name TestClient --allow-pub "req.a" --allow-sub "_INBOX.>"
Generated user key - private key stored "~/.nkeys/Test/accounts/TestAccount/users/TestClient.nk"
Generated user creds file "~/.nkeys/Test/accounts/TestAccount/users/TestClient.creds"
Success! - added user "TestClient" to "TestAccount"

> nsc describe user --name TestClient
╭───────────────────────────────────────────╮
│                   User                    │
├─────────────────┬─────────────────────────┤
│ Name            │ TestClient              │
│ User ID         │ UDJ3LCVNTYXL            │
│ Issuer ID       │ ADM7UGD4FV52            │
│ Issued          │ 2019-06-11 16:43:46 UTC │
│ Expires         │                         │
├─────────────────┼─────────────────────────┤
│ Pub Allow       │ req.a                   │
│ Sub Allow       │ _INBOX.>                │
├─────────────────┼─────────────────────────┤
│ Max Messages    │ Unlimited               │
│ Max Msg Payload │ Unlimited               │
│ Network Src     │ Any                     │
│ Time            │ Any                     │
╰─────────────────┴─────────────────────────╯
```

The client has the opposite permissions of the service. It can publish on the request subject `req.a`, and receive replies on an inbox.
