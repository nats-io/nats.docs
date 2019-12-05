# NSC

NSC allows you to manage identities. Identities take the form of _nkeys_. Nkeys are a public-key signature system based on Ed25519 for the NATS ecosystem.

The nkey identities are associated with NATS configuration in the form of a Jason Web Token (JWT). These JWT are digitally signed by the private key of an issuer forming a chain of trust. The `nsc` tool creates and manages these identities and allows you to deploy them to a JWT account server, which in turn makes the configurations available to nats-servers.

There’s a logical hierarchy to the entities:

- `Operators` are responsible for running nats-servers, and issue account JWTs. Operators set the limits on what an account can do, such as the number of connections, data limits, etc.

- `Accounts` are responsible for issuing user JWTs. An account defines streams and services that can be exported to other accounts. Likewise, they import streams and services from other accounts.

- `Users` are issued by an account, and encode limits regarding usage and authorization over the account's subject space.

NSC allows you to create, edit, delete these entities, and will be central to all account-based configuration.

In this guide, you’ll run end-to-end on some of the configuration scenarios:

- Generate NKey identities and their associated JWTs
- Make JWTs accessible to a nats-server
- Configure a nats-server to use JWTs

Let’s run through the process of creating some identities and JWTs and work through the process.

## Creating an Operator, Account and User

Let’s create an operator called `O`:

```bash
> nsc add operator O
[ OK ] generated and stored operator key "OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG"
[ OK ] added operator "O"
```

With the above incantation, the tool generated an NKEY for the operator, stored the private key safely in it's keystore.

Lets add a service URL to the operator. Service URLs specify where the nats-server is listening. Tooling such as `nsc` can make use of that configuration:

```bash
> nsc edit operator --service-url nats://localhost:4222
[ OK ] added service url "nats://localhost:4222"
[ OK ] edited operator "O"
```


Creating an account is just as easy:

```bash
> nsc add account A
[ OK ] generated and stored account key "ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE"
[ OK ] added account "A"
```

As expected, the tool generated an NKEY representing the account, and stored the private key safely in the keystore.

Finally, let's create a user:

```bash
> nsc add user U
[ OK ] generated and stored user key "UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7"
[ OK ] generated user creds file "~/.nkeys/creds/O/A/U.creds"
[ OK ] added user "U" to account "A"
```

As expected, the tool generated an NKEY representing the user, and stored the private key safely in the keystore. In addition, the tool generated a _credentials_ file. A credentials file contains the JWT for the user and the private key for the user. Credential files are used by nats-clients to identify themselves to the system. The client will extract and present the JWT to the nats-server and use the private key to verify its identity.


### NSC Assets

NSC manages three different directories:

- The nsc home directory which stores nsc related data. By default nsc home lives in `~/.nsc` and can be changed via the `$NSC_HOME` environment variable.
- An _nkeys_ directory, which stores all the private keys. This directory by default lives in `~/.nkeys` and can be changed via the `$NKEYS_PATH` environment variable. The contents of the nkeys directory should be treated as secrets.
- A _stores_ directory, which contains JWTs representing the various entities. This directory lives in `$NSC_HOME/nats`, and can be changed using the command `nsc env -s <dir>`. The stores directory can stored under revision control. The JWTs themselves do not contain any secrets.

#### The NSC Stores Directory

The stores directory contains a number of directories. Each named by an operator in question, which in turn contains all accounts and users:

```bash
tree ~/.nsc/nats
/Users/aricart/.nsc/nats
└── O
    ├── O.jwt
    └── accounts
        └── A
            ├── A.jwt
            └── users
                └── U.jwt
```

These JWTs are the same artifacts that nats-servers will use to validate if an account is valid and its limits as well as the JWTs that are presented by clients when they connect to the nats-server.

#### The NKEYS Directory

The nkeys directory contains all the private keys and credential files. As mentioned before, care must be taken to keep these files secure.

The structure keys directory is machine friendly. All keys are sharded by their kind `O` for operators, `A` for accounts, `U` for users. These prefixes are also part of the public key. The second and third letters in the public key are used to create directories where other like-named keys are stored.

```
tree ~/.nkeys
/Users/aricart/.nkeys
├── creds
│   └── O
│       └── A
│           └── U.creds
└── keys
    ├── A
    │   └── DE
    │       └── ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE.nk
    ├── O
    │   └── AF
    │       └── OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG.nk
    └── U
        └── DB
            └── UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7.nk
```

The `nk` files themselves are named after the complete public key, and store a single string - the private key in question:
```bash
cat ~/.nkeys/keys/U/DB/UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7.nk 
SUAG35IAY2EF5DOZRV6MUSOFDGJ6O2BQCZHSRPLIK6J3GVCX366BFAYSNA
```

The private keys are encoded into a string, and always begin with an `S` for _seed_. The second letter starts with the type of key in question. `O` for operators, `A` for accounts, `U` for users.

In addition to containing keys, the nkeys directory contains a `creds` directory. This directory is organized in a way friendly to humans. It stores user credential files or `creds` files for short. A credentials file contains a copy of the user JWT and the private key for the user. These files are used by nats-clients to connect to a nats-server:


```bash
> cat ~/.nkeys/creds/O/A/U.creds
-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJTVERPU0NJSzNNUFRQNkxXSjdMMjVNRFRRNEFPU0cyU1lZRFpSQ01GQjZFUzIyQ1FGTk9BIiwiaWF0IjoxNTc1NDY5Mzg4LCJpc3MiOiJBREVUUFQzNldCSUJVS00zSUJDVk00QTVZVVNEWEZFSlBXNE02R0dWQllDQlc3UlJORlRWNU5HRSIsIm5hbWUiOiJVIiwic3ViIjoiVURCRDVGTlFQU0xJTzZDRE1JUzVENEVCTkZLWVdWRE5VTFFURlRVWkpYV0ZOWUxHRkY1MlZaTjciLCJ0eXBlIjoidXNlciIsIm5hdHMiOnsicHViIjp7fSwic3ViIjp7fX19.xRzBaOwJZ7RJNVSpputYvG2U6a0QTfh-Srs47Z9dIfVk3JHVg-znPPWxJ5BAYvkW8Fa1R1S7O5WR_ZnIob9aDw
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAG35IAY2EF5DOZRV6MUSOFDGJ6O2BQCZHSRPLIK6J3GVCX366BFAYSNA
------END USER NKEY SEED------

*************************************************************
```

### Listing Keys

You can list the current entities you are working with by doing:

```bash
nsc list keys
╭──────────────────────────────────────────────────────────────────────────────────────────╮
│                                           Keys                                           │
├────────┬──────────────────────────────────────────────────────────┬─────────────┬────────┤
│ Entity │ Key                                                      │ Signing Key │ Stored │
├────────┼──────────────────────────────────────────────────────────┼─────────────┼────────┤
│ O      │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │             │ *      │
│  A     │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │             │ *      │
│   U    │ UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7 │             │ *      │
╰────────┴──────────────────────────────────────────────────────────┴─────────────┴────────╯
```

The different entity names are listed along with their public key, and weather the key is stored. Stored keys are those that are found in the nkeys directory.

In some cases you may want to view the private keys:


```
> nsc list keys --show-seeds
╭───────────────────────────────────────────────────────────────────────────────────╮
│                                    Seeds Keys                                     │
├────────┬────────────────────────────────────────────────────────────┬─────────────┤
│ Entity │ Private Key                                                │ Signing Key │
├────────┼────────────────────────────────────────────────────────────┼─────────────┤
│ O      │ SOAFQM2X42LW26R6WRSC45AUVUEUQTITYUF7UBGG6MMAB4X54AS6YBBY7Q │             │
│  A     │ SAAJBXIGQL5IKNVTZMFZSNRSSAQGHQJWVOXIIPCXWTXCRWIQIXCI67MBYE │             │
│   U    │ SUAG35IAY2EF5DOZRV6MUSOFDGJ6O2BQCZHSRPLIK6J3GVCX366BFAYSNA │             │
╰────────┴────────────────────────────────────────────────────────────┴─────────────╯
[ ! ] seed is not stored
[ERR] error reading seed
```

If you don't have the seed (perhaps you don't control the operator), nsc will decorate the row with a `!`.
If you have more than one account, you can show them all by specifying the `--all` flag.

## The Operator JWT

You can view a human readable version of the JWT by using `nsc`:

```bash
> nsc describe operator
╭──────────────────────────────────────────────────────────────────────────────────╮
│                                 Operator Details                                 │
├───────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                  │ O                                                        │
│ Operator ID           │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issuer ID             │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                │ 2019-12-04 14:12:52 UTC                                  │
│ Expires               │                                                          │
│ Operator Service URLs │ nats://localhost:4222                                    │
╰───────────────────────┴──────────────────────────────────────────────────────────╯
```

Since the operator JWT is just a JWT you can use other tools, such as jwt.io to decode a JWT an inspect it's contents. All jwts have a header, payload, and signature:
```json
{
  "typ": "jwt",
  "alg": "ed25519"
}
{
  "jti": "ZP2X3T2R57SLXD2U5J3OLLYIVW2LFBMTXRPMMGISQ5OF7LANUQPQ",
  "iat": 1575468772,
  "iss": "OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG",
  "name": "O",
  "sub": "OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG",
  "type": "operator",
  "nats": {
    "operator_service_urls": [
      "nats://localhost:4222"
    ]
  }
}
```

For NATS JWTs all well use the `algorithm` ed25519 for signature.
The payload will list different things, on our basically empty operator we only standard JWT `claim` fields:

`jti` - a jwt id
`iat` - the timestamp when the JWT was issued in UNIX time
`iss` - the issuer of the JWT, in this case the operator's public key
`sub` - the subject or identity represented by the JWT, in this case the same operator
`type` - since this is an operator JWT, `operator` is the type

NATS specific is the `nats` object, which is where we add NATS specific JWT configuration to the JWT claim.

Because the issuer and subject are one and the same, this JWT is self-signed.

### The Account JWT

Again we can inspect the account:

```bash
> nsc describe account
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-04 14:21:05 UTC                                  │
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

### The User JWT

Finally the user JWT:

```bash
> nsc describe user
╭─────────────────────────────────────────────────────────────────────────────────╮
│                                      User                                       │
├──────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                 │ U                                                        │
│ User ID              │ UDBD5FNQPSLIO6CDMIS5D4EBNFKYWVDNULQTFTUZJXWFNYLGFF52VZN7 │
│ Issuer ID            │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issued               │ 2019-12-04 14:23:08 UTC                                  │
│ Expires              │                                                          │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Response Permissions │ Not Set                                                  │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Messages         │ Unlimited                                                │
│ Max Msg Payload      │ Unlimited                                                │
│ Network Src          │ Any                                                      │
│ Time                 │ Any                                                      │
╰──────────────────────┴──────────────────────────────────────────────────────────╯
```

The user id is the public key for the user, the issuer is the account. This user can publish and subscribe to anything, as no limits are set.

When a user connects to a nats-server, it presents it's user JWT and signs an nonce using its private key. The server verifies the user is who they say they are by validating that the nonce was signed using the private key associated with the public key representing the identify of the user. Next, the server fetches the issuer account and validates that the account was issued by a trusted operator completing the chain of trust verification.


Let’s put all of this together, and create a simple server configuration that accepts sessions from `U`.

## Account Server Configuration

To configure a server to use accounts, you need an _account resolver_. An account resolver exposes a URL where a nats-server can query for JWTs belonging to an account.

A simple built-in resolver is the `MEMORY` resolver, which statically maps account public keys to an account JWT in the server’s configuration file. It is somewhat easier to configure because it doesn’t require another moving part, but fails to provide the needed experience of setting up an account server. Let’s set up an _Account Server_.

Installing the Account Server

```text
> go get github.com/nats-io/nats-account-server
```

The account server has options to enable you to use an nsc directory directly. Let’s start one:

```text
> nats-account-server -nsc ~/.nsc/nats/O
```

Above, we pointed the account server to our nsc data directory (more specifically to the `O` operator that we created earlier). By default, the server listens on the localhost at port 9090.

You can also run the account server with a data directory that is not your nsc folder. In this mode, you can upload account JWTs to the server. See the help for `nsc push` for more information about how to push JWTs to the account server.

We are now ready to configure the nats-server.

## NATS Server Configuration

If you don’t have a nats-server installed, let’s do that now:

```text
> go get github.com/nats-io/nats-server
```

Let’s create a configuration that references our operator JWT and the nats-account-server as a resolver:

```yaml
operator: $HOME/.nsc/nats/O/O.jwt
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

At minimum, the server requires the `operator` JWT, which we have pointed at directly, and a resolver. The resolver has two options `MEM` and `URL`. We are interested in the `URL` since we want the nats-server to talk to the account server. Note we put the URL of the server with the path `/jwt/v1/accounts`. Currently, this is where the account server expects requests for account information.

## Client Testing

Let’s install some tooling:

```text
> go get github.com/nats-io/nats.go/examples/nats-pub

> go get github.com/nats-io/nats.go/examples/nats-sub
```

Create a subscriber:

```text
nats-sub -creds ~/.nkeys/creds/O/A/U.creds ">"
Listening on [>]
```

Publish a message:

```text
nats-pub -creds ~/.nkeys/creds/O/A/U.creds hello NATS 
Published [hello] : 'NATS'
```

Subscriber shows:

```text
[#1] Received on [hello]: ’NATS’
```


### NSC Embeds NATS tooling

To make it easier to work, you can use the nats clients built right into NSC. These tools know how to find the credential files in the keyring.
For convenience, the tools are aliased to `sub`, `pub`, `req`, `reply`:

```bash
nsc sub --user U ">"
...

nsc pub --user U hello NATS
...

```

See `nsc tool -h` for more detailed information.


## User Authorization

User authorization, as expected, also works with JWT authentication. With `nsc` you can specify authorization for specific subjects to which the user can or cannot publish or subscribe. By default a user doesn't have any limits on the subjects that it can publish or subscribe to. Any message stream or message published in the account is subscribable by the user. The user can also publish to any subject or imported service. Note that authorization, if configured, must be specified on a per user basis.

When specifying limits it is important to remember that clients by default use generated "inboxes" to allow publish requests. When specifying subscribe and publish permissions, you need to enable clients to subscribe and publish to `_INBOX.>`. You can further restrict it, but you'll be responsible for segmenting the subject space so as to not break request/reply communications between clients.

Let's say you have a service that your account clients can make requests to under `q`. To enable the service to receive and respond to requests it requires permissions to subscribe to `q` and publish permissions under `_INBOX.>`:

```bash
> nsc add user s --allow-pub "_INBOX.>" --allow-sub q
[ OK ] generated and stored user key "UDJETJR7SVL7JSSO6G6XXKFKDETYSDCMLNKIH2U2ABS2M4F3OBMUFM4A"
[ OK ] generated user creds file "~/.nkeys/creds/O/A/s.creds"
[ OK ] added user "s" to account "A"

> nsc describe user s
╭─────────────────────────────────────────────────────────────────────────────────╮
│                                      User                                       │
├──────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                 │ s                                                        │
│ User ID              │ UDJETJR7SVL7JSSO6G6XXKFKDETYSDCMLNKIH2U2ABS2M4F3OBMUFM4A │
│ Issuer ID            │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issued               │ 2019-12-04 15:41:45 UTC                                  │
│ Expires              │                                                          │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Pub Allow            │ _INBOX.>                                                 │
│ Sub Allow            │ q                                                        │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Response Permissions │ Not Set                                                  │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Messages         │ Unlimited                                                │
│ Max Msg Payload      │ Unlimited                                                │
│ Network Src          │ Any                                                      │
│ Time                 │ Any                                                      │
╰──────────────────────┴──────────────────────────────────────────────────────────╯
```

As you can see this client is not limited to publishing responses to `_INBOX.>` addresses, and to subscribing to the service's request subject.

Similarly, we can limit a client:

```bash
> nsc add user c --allow-pub q --allow-sub "_INBOX.>"
[ OK ] generated and stored user key "UDOJHZKLOQJHDVBCPTR3AATK76HZMCIFBSEJKRSSB2ANO6F3PGNAYYOH"
[ OK ] generated user creds file "~/.nkeys/creds/O/A/c.creds"
[ OK ] added user "c" to account "A"

> nsc describe user c
╭─────────────────────────────────────────────────────────────────────────────────╮
│                                      User                                       │
├──────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                 │ c                                                        │
│ User ID              │ UDOJHZKLOQJHDVBCPTR3AATK76HZMCIFBSEJKRSSB2ANO6F3PGNAYYOH │
│ Issuer ID            │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issued               │ 2019-12-04 15:44:17 UTC                                  │
│ Expires              │                                                          │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Pub Allow            │ q                                                        │
│ Sub Allow            │ _INBOX.>                                                 │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Response Permissions │ Not Set                                                  │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Messages         │ Unlimited                                                │
│ Max Msg Payload      │ Unlimited                                                │
│ Network Src          │ Any                                                      │
│ Time                 │ Any                                                      │
╰──────────────────────┴──────────────────────────────────────────────────────────╯
```

The client has the opposite permissions of the service. It can publish on the request subject `q`, and receive replies on an inbox.


## The NSC Environment

As your projects become more involved, you may work with one or more accounts. Nsc tracks your current operator and account. If you are not in a directory containing an operator, account or user, it will use the last operator/account context.

To view your current environment:

```bash
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
│ Default Operator │     │ O               │
│ Default Account  │     │ A               │
╰──────────────────┴─────┴─────────────────╯
```

If you have multiple accounts, you can `nsc env --account <account name>` to set the account as the current default. If you have defined `NKEYS_PATH` or `NSC_HOME` in the environment, you'll also see their current effective values. Finally, if you want to set the stores directory to anything else other than the default, you can do `nsc env --store <dir containing an operator>`. If you have multiple accounts, you can try having multiple terminals, each in a directory for a different account.
