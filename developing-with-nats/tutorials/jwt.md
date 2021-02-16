# JWT in NATS - Deep Dive

This document provides a step by step deep dive into JWT usage within NATS. 
Starting with related concepts it will introduce JWT and how the can be used in NATS.
This will NOT list every JWT/nsc option. Instead it focuses on important ones and concepts.

- [Concepts](#concepts)
  - [What are Accounts?](#what-are-accounts)
    - [Key Takeaways](#key-takeaways)
  - [What are NKEYs?](#what-are-nkeys)
    - [Key Takeaways](#key-takeaways-1)
- [JSON Web Tokens (JWT)](#json-web-tokens-jwt)
  - [Motivation for JWT](#motivation-for-jwt)
    - [Key Takeaways](#key-takeaways-2)
  - [Decentralized Authentication/Authorization using JWT](#decentralized-authenticationauthorization-using-jwt)
    - [Key Takeaways](#key-takeaways-3)
  - [Hierarchical JWT](#hierarchical-jwt)
    - [Decentralized Chain of Trust](#decentralized-chain-of-trust)
      - [Obtain an Account JWT](#obtain-an-account-jwt)
      - [JWTs and Chain of Trust Verification](#jwt-and-chain-of-trust-verification)
      - [Obtain a User JWT - Client Connect](#obtain-a-user-jwt---client-connect)
    - [Key Takeaways](#key-takeaways-4)
  - [Deployment Models Enabled by Chain of Trust](#deployment-models-enabled-by-chain-of-trust)
    - [Key Takeaways](#key-takeaways-5)
- [Accounts Re-visited](#accounts-re-visited)
  - [Key Takeaways](#key-takeaways-6)
- [Tooling And Key Management](#tooling-and-key-management)
  - [nsc](#nsc)
    - [Environment](#environment)
      - [Backup](#backup)
        - [NKEYS store directory](#nkeys-store-directory)
        - [JWT store directory](#jwt-store-directory)
      - [Names in JWT](#names-in-jwt)
    - [Setup an Operator](#setup-an-operator)
      - [Create/Edit Operator - Operator Environment - All Deployment modes](#createedit-operator---operator-environment---all-deployment-modes)
      - [Import Operator - Non Operator/Administrator Environment - Decentralized/Self Service Deployment Modes](#import-operator---non-operatoradministrator-environment---decentralizedself-service-deployment-modes)
      - [Import Operator - Self Service Deployment Modes](#import-operator---self-service-deployment-modes)
    - [Setup an Account](#setup-an-account)
      - [Create/Edit Account - All Environments - All Deployment modes](#createedit-account---all-environments---all-deployment-modes)
      - [Export Account - Non Operator/Administrator Environment - Decentralized Deployment Modes](#export-account---non-operatoradministrator-environment---decentralized-deployment-modes)
      - [Export Account - Non Operator/Administrator Environment - Self Service Deployment Modes](#export-account---non-operatoradministrator-environment---self-service-deployment-modes)
    - [Publicize an Account with Push - Operator Environment/Environment with push permissions - All Deployment Modes](#publicize-an-account-with-push---operator-environmentenvironment-with-push-permissions---all-deployment-modes)
      - [nats-resolver setup and push example - Operator Environment/Environment with push permissions - All Deployment Modes](#nats-resolver-setup-and-push-example---operator-environmentenvironment-with-push-permissions---all-deployment-modes)
    - [Setup User](#setup-user)
      - [Create/Edit Account - All Environments - All Deployment modes](#createedit-account---all-environments---all-deployment-modes-1)
  - [Automated sign up services - JWT and NKEY libraries](#automated-sign-up-services---jwt-and-nkey-libraries)
    - [Simple user creation](#simple-user-creation)
      - [Create user NKEY](#create-user-nkey)
      - [Create user JWT](#create-user-jwt)
      - [Distributed User Creation](#distributed-user-creation)
    - [User creation using NATS](#user-creation-using-nats)
      - [Straight forward Setup](#straight-forward-setup)
      - [Account based Setup](#account-based-setup)
  - [System Account](#system-account)
    - [Event Subjects](#event-subjects)
    - [Service Subjects](#service-subjects)
      - [Subjects always available](#subjects-always-available)
      - [Subjects available when using nats-based resolver](#subjects-available-when-using-nats-based-resolver)
      - [Old Subjects](#old-subjects)
    - [Leaf Node Connections - Outgoing](#leaf-node-connections---outgoing)
      - [Non Operator Mode](#non-operator-mode)
      - [Operator Mode](#operator-mode)
  - [Connecting Accounts](#connecting-accounts)
    - [Exports](#exports)
    - [Imports](#imports)
      - [Import Subjects](#import-subjects)
      - [Import Remapping](#import-remapping)
      - [Visualizing Export/Import Relationships](#visualizing-exportimport-relationships)
  - [Managing Keys](#managing-keys)
    - [Protect Identity NKEYs](#protect-identity-nkeys)
    - [Reissue Identity NKEYs](#reissue-identity-nkeys)
      - [Operator](#operator)
      - [Account](#account)
    - [Revocations](#revocations)
      - [User](#user)
      - [Activations](#activations)
      - [Accounts](#accounts)
      - [Signing keys](#signing-keys)
  
To exercise listed examples please have the following installed:
* nats-server: https://github.com/nats-io/nats-server
* nats (cli): https://github.com/nats-io/natscli
* nk (cli & library): https://github.com/nats-io/nkeys
* nsc (cli): https://github.com/nats-io/nsc
* jwt (library): https://github.com/nats-io/jwt 

## Concepts

### What are Accounts?

Accounts are the NATS isolation context. 

```text 
accounts: {
    A: {
        users: [{user: a, password: a}]
    },
    B: {
        users: [{user: b, password: b}]
    },
}
``` 

Messages published in one account won't be received in another.

```text
> nats -s nats://a:a@localhost:4222 sub ">" &
[1] 28199
17:56:40 Subscribing on >
> nats -s nats://b:b@localhost:4222 pub "foo" "user b"
17:56:56 Published 6 bytes to "foo"
> nats -s nats://a:a@localhost:4222 pub "foo" "user a"
17:57:06 [#1] Received on "foo"
user a

17:57:06 Published 6 bytes to "foo"
>
```

As indicated by the absence of a `Received on` print, the above example shows no message flow between user `a` associated with account `A` and user `b` in account `B`. Messages are delivered only within the same account. That is, unless you explicitly define it.

```text
accounts: {
    A: {
        users: [{user: a, password: a}]
        imports: [{stream: {account: B, subject: "foo"}}]
    },
    B: {
        users: [{user: b, password: b}]
        exports: [{stream: "foo"}] 
    },
}
```

Here is a similar example, this time with messages crossing explicit account boundaries.

```text
> nats -s nats://a:a@localhost:4222 sub ">" &
[1] 28552
18:28:18 Subscribing on >
> nats -s nats://b:b@localhost:4222 pub "foo" "user b"
18:28:25 [#1] Received on "foo"
user b

18:28:25 Published 6 bytes to "foo"
> nats -s nats://a:a@localhost:4222 pub "foo" "user a"
18:28:30 [#2] Received on "foo"
user a

18:28:30 Published 6 bytes to "foo"
>
```

Accounts are a lot more powerful than what has been demonstrated here. 
For a complete documentation of look at [accounts](https://docs.nats.io/nats-server/configuration/securing_nats/accounts) and the [users](https://docs.nats.io/nats-server/configuration/securing_nats/auth_intro) associated with them.
All of this is in a plain nats config file. (Copy the above config and try it using this command: `nats-server -c <filename>`)
In order to make any changes, every participating nats-server config file in the same security domain has to change.
This configuration is typically controlled by one organization or the administrator.

#### Key Takeaways

* Accounts are isolated from each other
* One can selectively combine accounts
* Need to modify a config file to add/remove/modify accounts and user

### What are NKEYs?

NKEYs are decorated, Base32 encoded, CRC16 check-summed, [Ed25519](https://ed25519.cr.yp.to/) keys.

Ed25519 is:
* a public key signature system. (can sign and verify signatures)
* resistant to side channel attacks (no conditional jumps in algorithm)

Nats server can be configured with public NKEYs as user (identities).
When a client connects the nats-server sends a challenge for the client to sign in order to proof it is in possession of the corresponding private key.
The nats-server then verifies the signed challenge. Unlike with a password based scheme, the secret never left the client.

To ease what type of key one is looking at, in config or logs, they are decorated as follows:
* Public Keys, have a one byte prefix: `O`, `A`, `U` for various types. `U` meaning user. 
* Private Keys, have a two byte prefix `SO`, `SA`, `SU`. `S` stands for seed. The remainder is same as for public keys.

NKEYs are generated as follows:

```text
> nk -gen user -pubout > a.nk
> cat a.nk
SUAAEZYNLTEA2MDTG7L5X7QODZXYHPOI2LT2KH5I4GD6YVP24SE766EGPA
UC435ZYS52HF72E2VMQF4GO6CUJOCHDUUPEBU7XDXW5AQLIC6JZ46PO5
> nk -gen user -pubout > b.nk
> cat b.nk
SUANS4XLL5NWBTM57GSVHLN4TMFW55WGGWNI5YXXSIOYFJQYFVNHJK5GFY
UARZVI6JAV7YMJTPRANXANOOW4K3ZCD45NYP6S7C7XKCBHPVN2TFZ7ZC
>
```

Replacing the user/password with NKEY in account config example:

```text
accounts: {
    A: {
        users: [{nkey:UC435ZYS52HF72E2VMQF4GO6CUJOCHDUUPEBU7XDXW5AQLIC6JZ46PO5}]
        imports: [{stream: {account: B, subject: "foo"}}]
    },
    B: {
        users: [{nkey:UARZVI6JAV7YMJTPRANXANOOW4K3ZCD45NYP6S7C7XKCBHPVN2TFZ7ZC}]
        exports: [{stream: "foo"}]
    },
}
```

Simple example:

```text
> nats -s nats://localhost:4222 sub --nkey=a.nk ">"  &
[1] 94745
11:50:41 Subscribing on >
>nats -s nats://localhost:4222 pub --nkey=b.nk "foo" "nkey"
11:56:30 [#1] Received on "foo"
nkey

11:56:30 Published 4 bytes to "foo"
>
```

When the nats-server was started with `-V` tracing, you can see the signature in the `CONNECT` message (formatting added manually).

```text
[95184] 2020/10/26 12:15:44.350577 [TRC] [::1]:55551 - cid:2 - <<- [CONNECT {
    "echo": true,
    "headers": true,
    "lang": "go",
    "name": "NATS CLI",
    "nkey": "UC435ZYS52HF72E2VMQF4GO6CUJOCHDUUPEBU7XDXW5AQLIC6JZ46PO5",
    "no_responders": true,
    "pedantic": false,
    "protocol": 1,
    "sig": "lopzgs98JBQYyRdw1zT_BoBpSFRDCfTvT4le5MYSKrt0IqGWZ2OXhPW1J_zo2_sBod8XaWgQc9oWohWBN0NdDg",
    "tls_required": false,
    "verbose": false,
    "version": "1.11.0"
}]
```

On connect, clients are instantly sent the nonce to sign as part of the `INFO` message (formatting added manually). 
Since `telnet` will not authenticate, the server closes the connection after hitting the [authorization](https://docs.nats.io/nats-server/configuration/securing_nats/auth_intro#authorization-map) timeout.

```text
> telnet localhost 4222
Trying ::1...
Connected to localhost.
Escape character is '^]'.
INFO {
    "auth_required": true,
    "client_id": 3,
    "client_ip": "::1",
    "go": "go1.14.1",
    "headers": true,
    "host": "0.0.0.0",
    "max_payload": 1048576,
    "nonce": "-QPTE1Jsk8kI3rE",
    "port": 4222,
    "proto": 1,
    "server_id": "NBSHIXACRHUODC4FY2Z3OYXSZSRUBRH6VWIKQNGVPKOTA7H4YTXWJRTO",
    "server_name": "NBSHIXACRHUODC4FY2Z3OYXSZSRUBRH6VWIKQNGVPKOTA7H4YTXWJRTO",
    "version": "2.2.0-beta.26"
}
-ERR 'Authentication Timeout'
Connection closed by foreign host.
```

#### Key Takeaways

* NKEYS are a secure way to authenticate clients
* Private keys are never accessed or stored in the NATS server
* The public key still needs to be configured

## JSON Web Tokens (JWT) 

### Motivation for JWT

In a large organization the centralized config approach can lead to less flexibility/resistance to change when controlled by one entity.
Alternatively, instead of operating one infrastructure, it can be deployed more often (say per team) thus making import/export relationships harder as they have to bridge separate systems.
In order to make accounts truly powerful, they should ideally be configured separately from the infrastructure, only constrained by limits.
This is similar for user. An account contains the user but this relationship could be a reference as well, such that alterations to user do not alter the account. 
User of the same account should be able to connect from anywhere in the same infrastructure and be able to exchange messages as long as they are in the same authentication domain.

#### Key Takeaways

* Configuration is broken up into separate artifacts manageable by different entities
* Separate accounts from config and user from accounts
* Accounts do NOT correspond to infrastructure, they correspond to teams or applications. 
* Connect to any cluster in the same infrastructure and be able to communicate with all other user in your account.
* Infrastructure and its topology have nothing to do with Accounts and where an Account's User connect from.

### Decentralized Authentication/Authorization using JWT

Account and User creation managed as separate artifacts in a decentralized fashion using NKEYs.
Relying on a hierarchial chain of trust between three distinct NKEYs and associated roles:

1. Operator: corresponds to operator of a set of nats-server in the same authentication domain (entire topology, crossing gateways and leaf nodes) 
2. Account: corresponds to the set of a single account's configuration
3. User: corresponds to one user's configuration

Each NKEY is referenced, with additional configuration in a JWT document.
Each JWT has a subject field and its value is the public portion of an NKEY and serves as identity.
Names exist in JWT but as of now are only used by tooling, `nats-server` does not read this value.
The referenced NKEY's role determines the JWT content.

1. Operator JWT: Contain server [config](https://github.com/nats-io/jwt/blob/e11ce317263cef69619fc1ca743b195d02aa1d8a/operator_claims.go#L28) applicable throughout all operated nats-server
2. Account JWTs contain Account specific [configuration](https://github.com/nats-io/jwt/blob/e11ce317263cef69619fc1ca743b195d02aa1d8a/account_claims.go#L57) such as exports, imports, limits, and default user permissions
3. User JWT: Contain User specific [configuration](https://github.com/nats-io/jwt/blob/e11ce317263cef69619fc1ca743b195d02aa1d8a/user_claims.go#L25) such as Permissions/Limits

In addition, JWTs can contain settings related to their decentralized nature, such as expiration/revocation/signing.
At no point will a JWT contain the private portion of an NKEY.  Signatures are verified with public NKEY.
JWT content can be viewed as public, although the content may reveal which subjects/limits/permissions exist.

#### Key Takeaways

* JWTs are hierarchically organized in operator, account and user.
* Carry corresponding configuration and config dedicated to decentralized nature of NATS JWT usage

### Hierarchical JWT

#### Decentralized Chain of Trust

A `nats-server` is configured to trust an operator. 
Meaning, the Operator JWT is part of its server configuration and requires a restart or `nats-server --signal reload` once changed.
It is also configured with a way to obtain account JWT in one of 3 ways (explained below).
Clients provide a user JWT on connect. Again the server or Account JWT is not configured with them.
They also possess the private NKEY corresponding the the JWT identity so they can proof their identity as described [above](#what-are-nkeys).

Through NKEY signature verification involved JWT are validated and the hierarchy between them can be verified.

##### Obtain an Account JWT

To obtain an Account JWT, the nats-server is configured with one of three [resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver) types.
Which one to pick depends on your needs:
* [mem-resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#memory): Very few or very static accounts
  * You are comfortable changing the server config if operator or accounts change.
  * You can generate user programmatically using NKEY and JWT library (more about that later).
  * User do not need to be known by nats-server.
* [url-resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#url-resolver): Very large volume of accounts
  * Same as `mem-resolver`, except you do not have to modify server config if accounts are added/changed.
  * Changes to the operator still require reloading (only few operations that require that).
  * Will download Accounts from a web server.
    * Allows for easy publication of account JWT programmatically generated using NKEY and JWT library (more about that later).
    * The [`nats-account-server`](https://docs.nats.io/nats-tools/nas) is such a webserver. When set up correctly will inform `nats-server` of Account JWT changes.
  * Depending on configuration, requires read and/or write access to persistent storage.
* `nats-resolver`: Same as `url-resolver`, just uses nats instead of http
  * No separate binary to run/config/monitor.
  * Easier clustering when compared to `nats-account-server`. Will eventually converge on the union of all account JWT known to every participating `nats-server`.
  * Requires persistent storage in form of a NON-NTFS directory for `nats-server` to exclusively write into.
  * Optionally, directly supports Account JWT removal.
  * Between this and `url-resolver`, the `nats-resolver` is the clear recommendation

If your setup has few Accounts and User and/or you are comfortable reloading server configs when accounts/user change.
Then safe yourself the complexity and do not use JWT. Regular config - possibly with NKEYs - will work just fine for you.

##### JWT and Chain of Trust Verification

Each JWT document has a subject it represents. This is the public identity NKEY represented by the JWT document.
JWT documents contain an `issueAt` time when it was signed. 
This time is in seconds since Unix epoch. It is also used to determine which two JWT for the same subject is more recent.
Furthermore JWT documents have an issuer, this may be an (identity) NKEY or a dedicated signing NKEY above it in the trust hierarchy.
A key is a signing key if it is listed as such in the JWT (above). 
Signing NKEYs adhere to same NKEY roles and are additional keys that unlike identity NKEY may change over time.
In the hierarchy, signing keys can only be used to sign JWT for the role right below them. 
User JWTs have no signing keys for this reason.
To modify one role's set of signing keys, the identity NKEY needs to be used.

Each JWT is signed as follows: `jwt.sig = sign(hash(jwt.header+jwt.body), private-key(jwt.issuer))` (jwt.issuer is part of jwt.body)
If a JWT is valid, the JWT above it are validated as well.
If all ot them are valid, the chain of trust between them is tested top down as follows:

| Type     | Trust Rule | Obtained |
| -------  | ---------- | -------- |
| Operator | `jwt.issuer == jwt.subject (self signed)` | configured to trust |
| Account  | `jwt.issuer == trusted issuing operator (signing/identity) key` | configured to obtain |
| User     | `jst.issuer == trusted issuing account (signing/identity) key && jwt.issuedAt > issuing account revocations[jwt.subject]` | provided on connect |

This is a conceptual view. While all these checks happen, they may not happen always.
If the Operator/Account is trusted already and the JWT did not change since, no reason to re-evaluate.

Below are examples of decoded JWT. (`iss` == `issuer`, `sub` == `subject`, `iat` == `issuedAt`)

```text
> nsc describe operator --json
{
 "iat": 1603473819,
 "iss": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
 "jti": "57BWRLW67I6JTVYMQAZQF54G2G37DJB5WG5IFIPVYI4PEYNX57ZQ",
 "name": "DEMO",
 "nats": {
  "account_server_url": "nats://localhost:4222",
  "system_account": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5"
 },
 "sub": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
 "type": "operator"
}
> nsc describe account -n demo-test --json
{
 "iat": 1603474600,
 "iss": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
 "jti": "CZDE4PM7MGFNYHRZSE6INTP6QDU4DSLACVHPQFA7XEYNJT6R6LLQ",
 "name": "demo-test",
 "nats": {
  "limits": {
   "conn": -1,
   "data": -1,
   "exports": -1,
   "imports": -1,
   "leaf": -1,
   "payload": -1,
   "subs": -1,
   "wildcards": true
  }
 },
 "sub": "ADKGAJU55CHYOIF5H432K2Z2ME3NPSJ5S3VY5Q42Q3OTYOCYRRG7WOWV",
 "type": "account"
}
> nsc describe user -a demo-test -n alpha --json
{
 "iat": 1603475001,
 "iss": "ADKGAJU55CHYOIF5H432K2Z2ME3NPSJ5S3VY5Q42Q3OTYOCYRRG7WOWV",
 "jti": "GOOPXCFDWVMEU3U6I6MT344Z56MGBYIS42GDXMUXDFA3NYDR2RUQ",
 "name": "alpha",
 "nats": {
  "pub": {},
  "sub": {}
 },
 "sub": "UC56LV5NNMP5FURQZ7HZTGWCRRTWSMHZNNELQMHDLH3DCYNGX57B2TN6",
 "type": "user"
}
>
```

##### Obtain a User JWT - Client Connect

When a client connects, the steps below have to succeed. The following nats-server configuration is used (for ease of understanding using url-resolver):
```text
operator: ./trustedOperator.jwt
resolver: URL(http://localhost:9090/jwt/v1/accouts/)
```

1. Client connects and the `nats-server` responds with `INFO` ([identical to NKEYs](#what-are-nkeys)) and a containing nonce. 
    ```text
    > telnet localhost 4222
    Trying 127.0.0.1...
    Connected to localhost.
    Escape character is '^]'.
    INFO {
        "auth_required": true,
        "client_id": 5,
        "client_ip": "127.0.0.1",
        "go": "go1.14.1",
        "headers": true,
        "host": "localhost",
        "max_payload": 1048576,
        "nonce": "aN9-ZtS7taDoAZk",
        "port": 4222,
        "proto": 1,
        "server_id": "NCIK6FX5MRIEPMEK22YL2ECLIWVJBH2SWFD5EQWSI5XRDQPKZXWKX3VP",
        "server_name": "NCIK6FX5MRIEPMEK22YL2ECLIWVJBH2SWFD5EQWSI5XRDQPKZXWKX3VP",
        "tls_required": true,
        "version": "2.2.0-beta.26"
    }
    Connection closed by foreign host.
    ```
    For ease of use the nats cli uses a creds file that is the concatenation of JWT and private user identity/NKEY.
    ```text
    > cat user.creds
    -----BEGIN NATS USER JWT-----
    eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJXNkFYSFlSS1RHVTNFUklQM0dSRDdNV0FQTzQ2VzQ2Vzc3R1JNMk5SWFFIQ0VRQ0tCRjJRIiwiaWF0IjoxNjAzNDczNzg4LCJpc3MiOiJBQUFYQVVWU0dLN1RDUkhGSVJBUzRTWVhWSjc2RVdETU5YWk02QVJGR1hQN0JBU05ER0xLVTdBNSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVRE5ZMktLUFRJQVBQTk9OT0xBVE5SWlBHTVBMTkZXSFFQS1VYSjZBMllUQTQ3Tk41Vk5GSU80NSIsInR5cGUiOiJ1c2VyIiwibmF0cyI6eyJwdWIiOnt9LCJzdWIiOnt9fX0.ae3OvcapjQgbXhI2QbgIs32AWr3iBb2UFRZbXzIg0duFHNPQI5LsprR0OQoSlc2tic6e3sn8YM5x0Rt34FryDA
    ------END NATS USER JWT------

    ************************* IMPORTANT *************************
    NKEY Seed printed below can be used to sign and prove identity.
    NKEYs are sensitive and should be treated as secrets.

    -----BEGIN USER NKEY SEED-----
    SUAAZU5G7UOUR7VXQ7DBD5RQTBW54O2COGSXAVIYWVZE4GCZ5C7OCZ5JLY
    ------END USER NKEY SEED------

    *************************************************************
    ```
    ```text
    > nats -s localhost:4222 "--creds=user.creds" pub "foo" "hello world"
    ```
2. The Client responds with a `CONNECT` message (formatting added manually), containing JWT and signed nonce. (output copied from `nats-server` started with `-V`)  
    ```text
    [98019] 2020/10/26 16:07:53.861612 [TRC] 127.0.0.1:56830 - cid:4 - <<- [CONNECT {
        "echo": true,
        "headers": true,
        "jwt": "eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJXNkFYSFlSS1RHVTNFUklQM0dSRDdNV0FQTzQ2VzQ2Vzc3R1JNMk5SWFFIQ0VRQ0tCRjJRIiwiaWF0IjoxNjAzNDczNzg4LCJpc3MiOiJBQUFYQVVWU0dLN1RDUkhGSVJBUzRTWVhWSjc2RVdETU5YWk02QVJGR1hQN0JBU05ER0xLVTdBNSIsIm5hbWUiOiJzeXMiLCJzdWIiOiJVRE5ZMktLUFRJQVBQTk9OT0xBVE5SWlBHTVBMTkZXSFFQS1VYSjZBMllUQTQ3Tk41Vk5GSU80NSIsInR5cGUiOiJ1c2VyIiwibmF0cyI6eyJwdWIiOnt9LCJzdWIiOnt9fX0.ae3OvcapjQgbXhI2QbgIs32AWr3iBb2UFRZbXzIg0duFHNPQI5LsprR0OQoSlc2tic6e3sn8YM5x0Rt34FryDA",
        "lang": "go",
        "name": "NATS CLI",
        "no_responders": true,
        "pedantic": false,
        "protocol": 1,
        "sig": "VirwM--xq5i2RI9VEQiFYv_6JBs-IR4oObypglR7qVxYtXDUtIKIr1qXW_M54iHFB6Afu698J_in5CfBRjuVBg",
        "tls_required": true,
        "verbose": false,
        "version": "1.11.0"
    }]
    ```
3. Server verifies if JWT returned is a user JWT and if it is consistent: `sign(jwt.sig, jwt.issuer) == hash(jwt.header+jwt.body)` (issuer is part of body)
4. Server verifies if nonce matches JWT.subject, thus proving client's possession of private user NKEY.
5. Server either knows referenced account or downloads it from `http://localhost:9090/jwt/v1/accouts/AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5`
6. Server verifies downloaded JWT is an account JWT and if it is consistent: `sign(jwt.sig, jwt.issuer) == hash(jwt.header+jwt.body)` (issuer is part of body) 
7. Server verifies if account JWT issuer is in configured list of trusted operator keys (derived from operator JWT in configuration).
8. Server verifies that user JWT subject is not in the account's revoked list, or if jwt.issuedAt field has a higher value.
9. Server verifies that user JWT issuer is either identical to account JWT subject or part of account JWT signing keys.
10. If all of the above holds true, the above invocation will succeed, Only if the user JWT does not contain permissions or limits restricting the operation otherwise.
    ```text
    > nats -s localhost:4222 "--creds=user.creds" pub "foo" "hello world"
    16:56:02 Published 11 bytes to "foo"
    >
    ```text
11. Output if `user.creds` where to contain a JWT where the maximum message payload is limited to 5 bytes
    ```text
    > nats -s localhost:4222 "--creds=user.creds" pub "foo" "hello world"
    nats: error: nats: Maximum Payload Violation, try --help
    >
    ```

#### Key Takeaways

* JWTs are secure 
* JWTs carry configuration corresponding to Operator/Accounts/User
* Basis for operating one nats-infrastructure to serve separate yet optionally connected entities without introducing separate systems
* Account resolver are way to obtain unknown Account JWT
* On connect clients provide User JWT
* JWTs can be issued programmatically
  
### Deployment Models Enabled by Chain of Trust

Depending on which entity has has access to private Operator/Account identity or signing NKEYs, different deployment models are enabled. When picking one, it is important to pick the simplest deployment model that enables what you need it to do. Everything beyond just results in unnecessary configuration and steps.

1. Centralized config: one (set of) user(s) has access to all private operator and account NKEYs.
    Administrator operating the shared infrastructure call all the shots
2. Decentralized config (with multiple nsc environments, explained later): 
    1. Administrator/Operator(s) have access to private operator NKEYs to sign accounts.
        By signing or not signing account JWT, Administrators can enforce constraints (say limits).
    2. Other sets of user (teams) have access to their respective private account identity/signing NKEYs and can issue/sign user JWT.

    This can also be used by a single entity to not mix up nsc environments as well.
3. Self-service, decentralized config (shared dev cluster):
    Is similar to 2, but sets of users 2.i have access to an operator private signing NKEY.
    This allows teams to add/modify their own accounts.
    Since administrators give up control over limits, there needs to be an organizational mechanisms to prevent unchecked usage.
    Administrators operating the infrastructure can add/revoke access by controlling the set of operator signing keys. 
4. Mix of the above - as needed: separate sets of user (with multiple nsc environments).
    For some user/teams the Administrator operates everything.

Signing keys can not only be used by individuals in one or more `nsc` environments, but also by programs facilitating [JWT](https://github.com/nats-io/jwt) and [NKEY](https://github.com/nats-io/nkeys) libraries.
This allows the implementation of sign-up services.
* Account signing key enabled on the fly:
  *  user generation (explained later)
  *  export activation generation (explained later)
* Operator signing key enables on the fly account generation.

#### Key Takeaways

* JWTs and the associated chain of trust allows for centralized, decentralized, or self-service account configuration
* It is important to pick the deployment model that fits your needs, NOT the most complicated one.
* Distributing Operator/Account JWT NKEYs between Administrators and teams enable these deployment model
* Sign up services for Accounts/User can be implemented by programs in possession of signing keys

## Accounts Re-visited

A deeper understanding of accounts will help you to best setup NATS JWT based security.

* What entity do accounts correspond to:
    Our official suggestion is to scope accounts by application/service offered.
    This is very fine grained and will require some configuration.
    This is why some users gravitate to accounts per team. One account for all Applications of a team.
    It is possible to start out with less granular accounts and as applications grow in importance or scale become more fine grained.
* Compared to file based config, Imports and Exports change slightly.
    To control who gets to import an export, activation tokens are introduced. 
    These are JWTs that an importer can embed. 
    They comply to similar verification rules as user JWT, thus enabling a `nats-server` to check if the exporting account gave explicit consent. 
    Due to the use of a token the exporting account's JWT does not have to be modified.
* Updates of JWTs are applied as `nats-server` discover them. 
  * How this is done depends on the resolver.
    * `mem-resolver` require `nats-server --signal reload` to re-read all configured account JWTs.
      * `url-resolver` and `nats-resolver` listen on a dedicated update subject of the system account and applied if the file is valid.
    * `nats-resolver` will also also update the corresponding JWT file and compensate in case the update message was not received due to temporary disconnect.
  * User JWTs do only depend on the issuing Account NKEY only, they do NOT depend on a particular version of an Account JWT.
  * Depending on the change, the internal Account representation will be updated and existing connections re-evaluated.
* The System Account is the account under which `nats-server` offer (administrative) services and monitoring events. (more detail later) 
  
### Key Takeaways

* Accounts can be arbitrarily scoped, from Application to Team
* Account Exports can be restricted by requiring use of activation tokens 
* Receiving a more recent Account JWT causes the nats-server to apply changes and re evaluate existing connections.

## Tooling And Key Management

This section will introduce `nsc` cli to generate and manage operator/accounts/user.
Even if you intend to primarily generate your Accounts/User programmatically, in all likelihood, you won't do so for an operator or all accounts.
Key Management and how to do so using `nsc` will also be part of this section.

### nsc

#### Environment

`nsc` is a tool that uses the [JWT](https://github.com/nats-io/jwt) and [NKEY](https://github.com/nats-io/nkeys) libraries to create NKEYs (if asked to) and all types of JWT.
It then stores these artefact in separate directories.

It keeps track of the last operator/account used. Most commands provide 
Because of this, commands do not need to reference operator/accounts but can be instructed to do so. (recommended for scripts)
It supports an interactive mode when `-i` is provided. When used, referencing accounts/keys is easier.

`nsc env` will show where NKEYS/JWT are stored and what current defaults are.
For testing you may want to switch between nsc environments:
Changing the (JWT) store directory: `nsc env --store <different folder>`
Changing the (NKEY) store directory by having an environment variable set: `export NKEYS_PATH=<different folder>`

Subsequent sections will refer to different environments in context of different [deployment modes](#deployment-models-enabled-by-chain-of-trust).
As such you can skip over all mentions for modes not of interest to you.
The mixed deployment mode is not mentioned and left as an exercise to the reader.

##### Backup

###### NKEYS store directory

Possessing NKEYS gives access to the system. 
Backups should therefore best be offline and access to them be severely restricted.
In cases where regenerating all/parts of the operator/accounts is not an option, signing keys must be used and identity NKEYS must be removed from the original store directory as to avoid them being leaked accidentally. 
Thus, depending on your scenario, relevant identity NKEYS need to only exist in very secure offline backup(s).

###### JWT store directory

The store directory contains JWTs for operators, accounts, and users.  It does not contain private keys.
Therefore it is ok to back these up or even store them in a VCS such as git.
But be aware that depending on content, JWT may reveal which permissions/subjects/public-nkeys exist.
Knowing the content of a JWT does not grant access; only private keys will.
However, organization may not wish to make those public outright and thus has to make sure that these external systems are secured appropriately.

When restoring an older version, be aware that:
* All changes made since will be lost. Specifically revocations may be undone.
* Time has moved on and thus JWTs that were once valid at the time of the backup or commit may be expired now. Thus
    You may have to be edit them to match your expectations again.
* NKEYS are stored in a separate directory, so to not restore a JWT for which the NKEY has been deleted since:
  * Either keep all keys around or 
  * Restore the nkey directory in tandem

##### Names in JWT

JWT allow to specify names. But Names do NOT represent an identity, they are only used to ease referencing of identities in our tooling.
At no point are these names used to reference each other.
Only the public identity NKEY are used for that. 
The `nats-server` does not read them at all.
Because names do not relate to identity, they may collide. 
Therefore, when using `nsc`, these names need to be keep unique.

#### Setup an Operator

##### Create/Edit Operator - Operator Environment - All Deployment modes

Create operator with system account and system account user: `nsc add operator -n <operator-name> --sys` 
The command `nsc edit operator [flags]` can subsequently be used to modify the operator. 
For example if you are setting the account server url (used by `url-resolver` and `nats-resolver`), `nsc` does not require them being specified on subsequent commands.
`nsc edit operator --account-jwt-server-url "nats://localhost:4222"`

We always recommend using signing keys for an operator. Generate one for an operator (`-o`) and store it in the key directory (`--store`)
The output will display the public portion of the signing key, use that to assign it to the operator (`--sk O...`).
`nsc generate nkey -o --store` followed by `nsc edit operator --sk OB742OV63OE2U55Z7UZHUB2DUVGQHRA5QVR4RZU6NXNOKBKJGKF6WRTZ `.
To pick the operator signing key for account generation, provide the `-i` option when doing so. 

The system account is the account under which `nats-server` offer system services and will be explained in the [system-account](#system-account) section.
To access these services a user with credentials for the system account is needed. 
Unless this user is restricted with appropriate permissions, this user is essentially the admin user.
They are create like any other user. 

*For cases where signing keys are generated and immediately added `--sk generate` will create an NKEY on the fly and assign it as signing NKEY.*

##### Import Operator - Non Operator/Administrator Environment - Decentralized/Self Service Deployment Modes

In order to import an Operator JWT, such as the one just created, into a separate nsc environment maintained by a different entity/team the following has to happen:
1. Obtain the operator JWT using: `nsc describe operator --raw` and store the output in a file named `operator.jwt`. The option `--raw` causes the raw JWT to be emitted.
2. Exchange that file or it's content any way you like, email works fine.
3. Import the operator JWT into the second `nsc add operator -u operator.jwt`
   
Should the operator change and an update is required, simply repeat these steps but provide the `--force` option during the last step.
This will overwrite the stored operator JWT.

##### Import Operator - Self Service Deployment Modes 

In addition to the [previous step](#import-operator---non-operatoradministrator-environment---decentralizedself-service-deployment-modes), self service deployments require an operator signing key and a system account user.
Ideally you would want an operator signing key per entity to distribute a signing key too.
Simply repeat the command shown [earlier](#create-operator---operator-environment---all-deployment-modes) but:
1. Perform `nsc generate nkey -o --store` in this environment instead
2. Exchange the public key with the Administrator/Operator via a way that assures you sent the public key and not someone elses.
3. Perform `nsc edit operator --sk` in the operator environment
4. Refresh the operator jwt in this environment by performing the [import steps using `--force`](#import-operator---non-operatoradministrator-environment---decentralizedself-service-deployment-modes) 

To import the system account user needed for administrative purposes as well as monitoring, perform these steps:
1. Perform `nsc describe account -n SYS --raw` and store the output in a file named `SYS.jwt`. The option `-n` specifies the (system) account named `SYS`.
2. Exchange the file.
3. Import the account `nsc import account --file  SYS.jwt`
4. Perform `nsc generate nkey -u --store` in this environment
5. Exchange the public key printed by the command with the Administrator/Operator via a way that assures you sent the public key and not someone elses.
6. Create a system account user named (`-n`) any way you like (here named `sys-non-op`) providing (`-k`) the exchanged public key `nsc add user -a SYS -n sys-non-op -k UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2` in the operator environment. (`-a` references the Account `SYS`.)
7. If desired edit the user
8. Export the user `nsc describe user -a SYS -n sys-non-op --raw` from the operator environment and store it in a file named `sys.jwt`. (`-n` references the user `sys-non-op`)
9. Exchange the file
10. Import the user in this environment using `nsc import user --file sys.jwt`

As a result of these operations, your operator environment should have these keys and signing keys:
```
> nsc list keys --all
+------------------------------------------------------------------------------------------------+
|                                              Keys                                              |
+--------------+----------------------------------------------------------+-------------+--------+
| Entity       | Key                                                      | Signing Key | Stored |
+--------------+----------------------------------------------------------+-------------+--------+
| DEMO         | OD5FHU4LXGDSGDHO7UNRMLW6I36QX5VPJXRQHFHMRUIKSHOPEDSHVPBB |             | *      |
| DEMO         | OBYAIG4T4PVR6GVYDERN74RRW7VBKRWBTI7ULLMM6BRHUID4AAQL7SGA | *           |        |
|  ACC         | ADRB4JJYFDLWKIMX4DH6MX2DMKA3TENJWGMNVM5ILYLZTT6BN7QIF5ZX |             |        |
|  SYS         | AAYVLZJC2ULKSH5HNSKMIKFMCEHCNU5VOV5KG56IRL7ENHLBUGZ27CZT |             | *      |
|   sys        | UBVZYLLCAFMHBXBUDKKKFKH62T4AW7Q5MAAE3R3KKAIRCZNYITZPDQZ3 |             | *      |
|   sys-non-op | UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2 |             |        |
+--------------+----------------------------------------------------------+-------------+--------+
```
And your account the following ones:
```
> nsc list keys --all
+------------------------------------------------------------------------------------------------+
|                                              Keys                                              |
+--------------+----------------------------------------------------------+-------------+--------+
| Entity       | Key                                                      | Signing Key | Stored |
+--------------+----------------------------------------------------------+-------------+--------+
| DEMO         | OD5FHU4LXGDSGDHO7UNRMLW6I36QX5VPJXRQHFHMRUIKSHOPEDSHVPBB |             |        |
| DEMO         | OBYAIG4T4PVR6GVYDERN74RRW7VBKRWBTI7ULLMM6BRHUID4AAQL7SGA | *           | *      |
|  SYS         | AAYVLZJC2ULKSH5HNSKMIKFMCEHCNU5VOV5KG56IRL7ENHLBUGZ27CZT |             |        |
|   sys-non-op | UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2 |             | *      |
+--------------+----------------------------------------------------------+-------------+--------+
```
Between the two outputs, compare the `Stored` column.

Alternatively if the administrator is willing to exchange private keys and the exchange can be done securely, a few of these steps fall away.
The signing key and system account user can be generated in the administrator/operator environment, omitting `--store` to avoid unnecessary key copies.
Then the public/private signing NKEYS are exchanged together with the system account user as creds file.
A creds file can be generated with `nsc generate creds -a SYS -n sys-non-op` and imported into this environment with `nsc import user --file sys.jwt`.
If the signing key is generated before the operator is imported into this environment, operator update falls away.

#### Setup an Account

##### Create/Edit Account - All Environments - All Deployment modes

Create an account as follows: `nsc add account -n <account name> -i`
In case you have multiple operator signing keys `-i` will prompt you to select one.
`nsc edit account [flags]` can subsequently be used to modify the account. (Edit is also applicable to the system account)

Similar to the operator signing keys are recommended.
Generate signing key for an account (`-a`) and store it in the key directory maintained by nsc (`--store`)
The output will display the public portion of the signing key, use that to assign it to the account (`--sk A...`)
`nsc generate nkey -a --store`
`nsc edit account --sk ACW2QC262CIQUX4ACGOOS5XLKSZ2BY2QFBAAOF3VOP7AWAVI37E2OQZX`
To pick the signing key for user generation, provide the `-i` option when doing so. 

##### Export Account - Non Operator/Administrator Environment - Decentralized Deployment Modes

In this mode, the created account is self signed.
To have it signed by the operator perform these steps:
1. In this environment export the created account as JWT like this `nsc describe account -n <account name> --raw`. Store the output in a file named `import.jwt`.
2. Exchange the file with the Administrator/Operator via a way that assures it is your JWT and not someone elses.
3. In the operator environment import the account with `nsc import account --file import.jwt`. 
   This step also resigns the JWT so that it is no longer self signed.
4. The Administrator/operator can now modify the account with `nsc edit account [flags]`

Should the account change and an update is required, simply repeat these steps but provide the `--force` option during the last step.
This will overwrite the stored account JWT.

##### Export Account - Non Operator/Administrator Environment - Self Service Deployment Modes

This environment is set up with a signing key, thus the account is already [created properly signed](#createedit-account---all-environments---all-deployment-modes).
The only step that is needed is to push the Account into the nats network.
However, this depends on your ability to do so. 
If you have no permissions, you have to perform the same steps as for the [decentralized deployment mode](#export-account---non-operatoradministrator-environment---decentralized-deployment-modes).
The main difference is that upon import, the account won't be re-signed.

#### Publicize an Account with Push - Operator Environment/Environment with push permissions - All Deployment Modes

How accounts can be publicized wholly depends on the resolver you are using:
* [mem-resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#memory): The operator has to have all accounts imported and generate a new config.
* [url-resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#url-resolver): `nsc push` will send an HTTP POST request to the hosting webserver or `nats-account-server`.
* `nats-resolver`: Every environment with a system account user that has permissions to send properly signed account JWT as requests to:
  * `$SYS.REQ.CLAIMS.UPDATE` can upload and update all accounts. Currently, `nsc push` uses this subject.
  * `$SYS.REQ.ACCOUNT.*.CLAIMS.UPDATE` can upload and update specific accounts.

`nsc generate config <resolver-type>` as a utility that generates the relevant nats config. 
Where `<resolver-type>` can be `--mem-resolver` or `--nats-resolver` for the corresponding resolver.
Typically the generated output is stored in a file that is then [included](link to doc) by the nats config.
Every server within the same authentication domain needs to be configured with this configuration

##### nats-resolver setup and push example - Operator Environment/Environment with push permissions - All Deployment Modes 

This is a quick demo of the nats-based resolver from operator creation to publishing a message.
Please be aware that the ability to push is only relates to permissions to dos so and does not require an account keys.
Thus, how accounts to be pushed came to be in the environment (outright creation/import) does not matter.
For simplicity, this example uses the operator environment.

Operator Setup
```
> nsc add operator -n DEMO --sys
[ OK ] generated and stored operator key "ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6"
[ OK ] added operator "DEMO"
[ OK ] created system_account: name:SYS id:AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27
[ OK ] created system account user: name:sys id:UABM73CE5F3ZYFNC3ZDODAF7GIB62W2WXV5DOLMYLGEW4MEHYBC46PN4
[ OK ] system account user creds file stored in `~/test/demo/env1/keys/creds/DEMO/SYS/sys.creds`
> nsc edit operator --account-jwt-server-url nats://localhost:4222
[ OK ] set account jwt server url to "nats://localhost:4222"
[ OK ] edited operator "DEMO"
```

Inspect the setup
```
> nsc list keys --all
+------------------------------------------------------------------------------------------+
|                                           Keys                                           |
+--------+----------------------------------------------------------+-------------+--------+
| Entity | Key                                                      | Signing Key | Stored |
+--------+----------------------------------------------------------+-------------+--------+
| DEMO   | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |             | *      |
|  SYS   | AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27 |             | *      |
|   sys  | UABM73CE5F3ZYFNC3ZDODAF7GIB62W2WXV5DOLMYLGEW4MEHYBC46PN4 |             | *      |
+--------+----------------------------------------------------------+-------------+--------+
> nsc describe operator
+-------------------------------------------------------------------------------+
|                               Operator Details                                |
+--------------------+----------------------------------------------------------+
| Name               | DEMO                                                     |
| Operator ID        | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |
| Issuer ID          | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |
| Issued             | 2020-11-04 19:25:25 UTC                                  |
| Expires            |                                                          |
| Account JWT Server | nats://localhost:4222                                    |
| System Account     | AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27 |
+--------------------+----------------------------------------------------------+
> nsc describe account
+--------------------------------------------------------------------------------------+
|                                   Account Details                                    |
+---------------------------+----------------------------------------------------------+
| Name                      | SYS                                                      |
| Account ID                | AA6W5MRDIFIQWE6UE6D4YWQT5L4YZG7ZRHSKYCPF2VIEMUHRZH3VQZ27 |
| Issuer ID                 | ODHUVOUVUA3XIBV25XSQS2NM2UN4IKJYLAMCGLWRFAV7F7KUWADCM4K6 |
| Issued                    | 2020-11-04 19:24:41 UTC                                  |
| Expires                   |                                                          |
+---------------------------+----------------------------------------------------------+
| Max Connections           | Unlimited                                                |
| Max Leaf Node Connections | Unlimited                                                |
| Max Data                  | Unlimited                                                |
| Max Exports               | Unlimited                                                |
| Max Imports               | Unlimited                                                |
| Max Msg Payload           | Unlimited                                                |
| Max Subscriptions         | Unlimited                                                |
| Exports Allows Wildcards  | True                                                     |
+---------------------------+----------------------------------------------------------+
| Imports                   | None                                                     |
| Exports                   | None                                                     |
+---------------------------+----------------------------------------------------------+
>
```
Generate the config and start the server in the background.
Also, inspect the generated config. It consists of the mandatory operator, explicitly lists the system account and corresponding JWT.
```
> nsc generate config --nats-resolver > nats-res.cfg
> nats-server -c nats-res.cfg --addr localhost --port 4222 &
[2] 30129
[30129] 2020/11/04 14:30:14.062132 [INF] Starting nats-server version 2.2.0-beta.26
[30129] 2020/11/04 14:30:14.062215 [INF] Git commit [not set]
[30129] 2020/11/04 14:30:14.062219 [INF] Using configuration file: nats-res.cfg
[30129] 2020/11/04 14:30:14.062220 [INF] Trusted Operators
[30129] 2020/11/04 14:30:14.062224 [INF]   System  : ""
[30129] 2020/11/04 14:30:14.062226 [INF]   Operator: "DEMO"
[30129] 2020/11/04 14:30:14.062241 [INF]   Issued  : 2020-11-04 14:25:25 -0500 EST
[30129] 2020/11/04 14:30:14.062244 [INF]   Expires : 1969-12-31 19:00:00 -0500 EST
[30129] 2020/11/04 14:30:14.062652 [INF] Managing all jwt in exclusive directory /demo/env1/jwt
[30129] 2020/11/04 14:30:14.065888 [INF] Listening for client connections on localhost:4222
[30129] 2020/11/04 14:30:14.065896 [INF] Server id is NBQ6AG5YIRC6PRCUPCAUSVCSCQWAAWW2XQXIM6UPW5AFPGZBUKZJTRRS
[30129] 2020/11/04 14:30:14.065898 [INF] Server name is NBQ6AG5YIRC6PRCUPCAUSVCSCQWAAWW2XQXIM6UPW5AFPGZBUKZJTRRS
[30129] 2020/11/04 14:30:14.065900 [INF] Server is ready
>
```
Add an account and a user for testing.
```
> nsc add account -n TEST
[ OK ] generated and stored account key "ADXDDDR2QJNNOSZZX44C2HYBPRUIPJSQ5J3YG2XOUOOEOPOBNMMFLAIU"
[ OK ] added account "TEST"
> nsc add user -a TEST -n foo
[ OK ] generated and stored user key "UA62PGBNKKQQWDTILKP5U4LYUYF3B6NQHVPNHLS6IZIPPQH6A7XSRWE2"
[ OK ] generated user creds file `/DEMO/TEST/foo.creds`
[ OK ] added user "foo" to account "TEST"
>
```
Without having pushed the account the user can't be used yet.
```
> nats -s nats://localhost:4222 pub --creds=/DEMO/TEST/foo.creds  "hello" "world"
nats: error: read tcp 127.0.0.1:60061->127.0.0.1:4222: i/o timeout, try --help
[9174] 2020/11/05 16:49:34.331078 [WRN] Account [ADI4H2XRYMT5ENVBBS3UKYC2FBLGB3NF4VV5L57HUZIO4AMYROB4LMYF] fetch took 2.000142625s
[9174] 2020/11/05 16:49:34.331123 [WRN] Account fetch failed: fetching jwt timed out
[9174] 2020/11/05 16:49:34.331182 [ERR] 127.0.0.1:60061 - cid:5 - "v1.11.0:go:NATS CLI Version development" - authentication error
[9174] 2020/11/05 16:49:34.331258 [WRN] 127.0.0.1:60061 - cid:5 - "v1.11.0:go:NATS CLI Version development" - Readloop processing time: 2.000592801s
```
Push the account, or push all accounts
```
> nsc push -a TEST
[ OK ] push to nats-server "nats://localhost:4222" using system account "SYS" user "sys":
       [ OK ] push TEST to nats-server with nats account resolver:
              [ OK ] pushed "TEST" to nats-server NBQ6AG5YIRC6PRCUPCAUSVCSCQWAAWW2XQXIM6UPW5AFPGZBUKZJTRRS: jwt updated
              [ OK ] pushed to a total of 1 nats-server
> nsc push --all
[ OK ] push to nats-server "nats://localhost:4222" using system account "SYS" user "sys":
       [ OK ] push SYS to nats-server with nats account resolver:
              [ OK ] pushed "SYS" to nats-server NBENVYIBPNQGYVP32Y3P6WLGBOISORNAZYHA6SCW6LTBE42ORTIQMWHX: jwt updated
              [ OK ] pushed to a total of 1 nats-server
       [ OK ] push TEST to nats-server with nats account resolver:
              [ OK ] pushed "TEST" to nats-server NBENVYIBPNQGYVP32Y3P6WLGBOISORNAZYHA6SCW6LTBE42ORTIQMWHX: jwt updated
              [ OK ] pushed to a total of 1 nats-server
```
For the nats resolver, each `nats-server` responds will be listed. 
In case you get fewer responses than you have server or a server reports an error it is best practice to resolve this issue and retry.
The nats resolver will gossip missing JWT in an eventual consistent way. 
Server without a copy will perform a lookup from server that do.
If during an initial push only one server responds there is a window where this server goes down or worse, loses it's disk. During that time the pushed account is not available to the network at large.
Because of this, it is important to make sure that initially more servers respond than what you are comfortable with losing in such a way at once.

Once the account is pushed, it's user can be used:
```
> nats -s nats://localhost:4222 pub --creds=/DEMO/TEST/foo.creds  "hello" "world"
16:50:51 Published 5 bytes to "hello"
>
```

#### Setup User

##### Create/Edit Account - All Environments - All Deployment modes

Create an user as follows: `nsc add user --account <account name> --name <user name> -i`
`nsc edit user [flags]` can subsequently be used to modify the user.
In case you have multiple account signing keys, for either command, `-i` will prompt you to select one in .
 
In case you generate a user on behalf of another entity that has no nsc environment, you may want to consider not exchanging the NKEY.
1. To do this, have the other entity generate an user NKEY pair like this: `nsc generate nkey -u` (`--store` is omitted to not have an unnecessary copy of the key)
2. Exchange the public key printed by the command via a way that assures what is used is not someone elses.
3. Create the user by providing (`-k`) the exchanged public key `nsc add user --account SYS -n sys-non-op -k UDJKPL7H6QY4KP4LISNHENU6Z434G6RLDEXL2C64YZXDABNCEOAZ4YY2` in your environment. ([system account user example](#import-operator---self-service-deployment-modes))
4. If desired edit the user
5. Export the user `nsc describe user --account SYS -n sys-non-op --raw` from your environment and store the output in a JWT file.
6. Exchange the JWT file
7. Use the JWT file and the NKEY pair in your application.

### Automated sign up services - JWT and NKEY libraries

`nsc` essentially uses the [NKEY](https://github.com/nats-io/nkeys) and [JWT](https://github.com/nats-io/jwt) libraries to generate operator/accounts/users.
You can use these libraries to generate the necessary artifacts as too.
Generating the operator makes little sense, Accounts only if you need them dynamically, say for everyone of your customer. 
Dynamically provision user and integrate that process with your existing infrastructure, say LDAP, is the most common use case for these libraries.

The next sub sections demonstrate dynamic user generation.
The mechanisms shown are applicable to dynamic account creation as well.
For dynamic user/account creation, signing keys are highly recommended.

**By generating user or accounts dynamically, it becomes YOUR RESPONSIBILITY to properly authenticate incoming requests for these users or accounts**

**For sign up service issued jwt, ALWAYS set the SHORTEST POSSIBLE EXPIRATION**

#### Simple user creation

This example illustrates the linear flow of the algorithm and how to use the generated artifacts.
In a real world application you would want this algorithm to be distributed over multiple processes. 
For simplicity of the examples, keys may be hard coded and error handling is omitted.

```go
func GetAccountSigningKey() nkeys.KeyPair {
	// Content of the account signing key seed can come from a file or an environment variable as well
	accSeed := []byte("SAAJGCAHPHHM6AVJJWQ2YAS3I4NETXMWVQSTCQMJ7VVTGAJF5UCN3IX7J4")
	accountSigningKey, err := nkeys.ParseDecoratedNKey(accSeed)
	if err != nil {
		panic(err)
	}
	return accountSigningKey
}

func RequestUser() {
    // Setup! Obtain the account signing key! 
    accountSigningKey := GetAccountSigningKey()
	userPublicKey, userSeed, userKeyPair := generateUserKey()
	userJWT := generateUserJWT(userPublicKey, accountSigningKey)
	// userJWT and userKeyPair can be used in conjunction with this nats.Option
	var jwtAuthOption nats.Option
    jwtAuthOption = nats.UserJWT(func() (string, error) {
            return userJWT, nil
        },
        func(bytes []byte) ([]byte, error) {
            return userKeyPair.Sign(bytes)
        },
    )
	// Alternatively you can create a creds file and use it as nats.Option
	credsContent, err := jwt.FormatUserConfig(userJWT, userSeed);
	if err != nil {
		panic(err)
	}
	ioutil.WriteFile("my.creds", credsContent, 0644)
	jwtAuthOption = nats.UserCredentials("my.creds")
	// use in a connection as desired
    nc, err := nats.Connect("nats://localhost:4222", jwtAuthOption)
    // ...
}
```

##### Create user NKEY

```go
func generateUserKey() (userPublicKey string, userSeed []byte, userKeyPair nkeys.KeyPair) {
	kp, err := nkeys.CreateUser()
	if err != nil {
		return "", nil, nil
	}
	if userSeed, err = kp.Seed(); err != nil {
		return "", nil, nil
	} else if userPublicKey, err = kp.PublicKey(); err != nil {
		return "", nil, nil
	}
	return
}
```

##### Create user JWT

```go
func generateUserJWT(userPublicKey string, accountSigningKey nkeys.KeyPair) (userJWT string) {
	uc := jwt.NewUserClaims(userPublicKey)
	uc.Pub.Allow.Add("subject.foo") // only allow publishing to subject.foo
	uc.Expires = time.Now().Add(time.Hour).Unix() // expire in an hour
	var err error
	uc.IssuerAccount, err = accountSigningKey.PublicKey()
	if err != nil {
		return ""
	}
	vr := jwt.ValidationResults{}
	uc.Validate(&vr)
	if vr.IsBlocking(true) {
		panic("Generated user claim is invalid")
	}
	userJWT, err = uc.Encode(accountSigningKey)
	if err != nil {
		return ""
	}
	return
}
```

Inspect the [user claim](https://github.com/nats-io/jwt/blob/master/user_claims.go#L39-L45) for all available properties/limits/permissions to set.
When using a [account claim](https://github.com/nats-io/jwt/blob/057ba30017beca2abb0ba35e7db6442be3479c5d/account_claims.go#L107-L114) instead, you can dynamically generate accounts.
Additional steps are to push the new account as outlined [here](#publicize-an-account-with-push---operator-environmentenvironment-with-push-permissions---all-deployment-modes).
Depending on your needs, you may want to consider exchanging the accounts identity NKEY in a similar way than the users key is exchanged in the [next section](#distributed-user-creation). 

##### Distributed User Creation

As mentioned earlier this example needs to be distributed. 
This example makes uses of go channels to encode the same algorithm, uses closures to encapsulate functionalities and go routines to show which processes exist.
Sending and receiving from channels basically illustrates the information flow. To realize this, you can pick `HTTP`, nats itself etc... 
(For simplicity, properly closing channels, error handling, waiting for go routines to finish is omitted.)

The above example did not need authentication mechanisms, `RequestUser` possessed the signing key. 
How you decide to trust an incoming request is completely up to you. Here are a few examples:
* everyone
* username/password
* 3rd party authentication token

In this example, this logic is encapsulated as placeholder closures `ObtainAuthorizationToken` and `IsTokenAuthorized` that do nothing.

```go
func ObtainAuthorizationToken() interface{} {
	// whatever you want, 3rd party token/username&password
	return ""
}

func IsTokenAuthorized(token interface{}) bool {
	// whatever logic to determine if the input authorizes the requester to obtain a user jwt
	return token.(string) == ""
}

// request struct to exchange data
type userRequest struct {
	UserJWTResponseChan chan string
	UserPublicKey       string
	AuthInfo            interface{}
}

func startUserProvisioningService(isAuthorizedCb func(token interface{}) bool) chan userRequest {
	userRequestChan := make(chan userRequest) // channel to send requests for jwt to
	go func() {
		accountSigningKey := GetAccountSigningKey() // Setup, obtain account signing key
		for {
			req := <-userRequestChan // receive request
			if !isAuthorizedCb(req.AuthInfo) {
				fmt.Printf("Request is not authorized to receive a JWT, timeout on purpose")
			} else if userJWT := generateUserJWT(req.UserPublicKey, accountSigningKey); userJWT != "" {
				req.UserJWTResponseChan <- userJWT // respond with jwt
			}
		}
	}()
	return userRequestChan
}

func startUserProcess(userRequestChan chan userRequest, obtainAuthorizationCb func() interface{}) {
	requestUser := func(userRequestChan chan userRequest, authInfo interface{}) (jwtAuthOption nats.Option) {
		userPublicKey, _, userKeyPair := generateUserKey()
		respChan := make(chan string)
		// request jwt
		userRequestChan <- userRequest{
			respChan,
			userPublicKey,
			authInfo,
		}
		userJWT := <-respChan // wait for response
		// userJWT and userKeyPair can be used in conjunction with this nats.Option
		jwtAuthOption = nats.UserJWT(func() (string, error) {
			return userJWT, nil
		},
			func(bytes []byte) ([]byte, error) {
				return userKeyPair.Sign(bytes)
			},
		)
		// Alternatively you can create a creds file and use it as nats.Option
		return
	}
	go func() {
		jwtAuthOption := requestUser(userRequestChan, obtainAuthorizationCb())
		nc, err := nats.Connect("nats://localhost:4222", jwtAuthOption)
		if err != nil {
			return
		}
		defer nc.Close()
		time.Sleep(time.Second) // simulate work one would want to do
	}()
}

func RequestUserDistributed() {
	reqChan := startUserProvisioningService(IsTokenAuthorized)
	defer close(reqChan)
	// start multiple user processes
	for i := 0; i < 4; i++ {
		startUserProcess(reqChan, ObtainAuthorizationToken)
	}
	time.Sleep(5 * time.Second)
}
```

In this example the users NKEY is generated by the requesting process and the public key is sent to the user sign up service. 
This way the service does not need to know or send the private key. 
Furthermore, any process receiving the initial request or even response, may have the user JWT but will not be able to proof possession of private NKEY.
However, you can have the provisioning service generate the NKEY pair and respond with the NKEY pair and the user JWT.
This is less secure but would enable a less complicated protocol where permissable.

#### User creation using NATS

The [previous example](#distributed-user-creation) used go channels to demonstrate data flows.
You can use all sorts of protocols to achieve this data flow and pick whatever fits best in your existing infrastructure.
However, you can use NATS for this purpose as well.

##### Straight forward Setup

You can replace send and receive `<-` with nats publish and subscribe or - for added redundancy on the sign up service - queue subscribe.
To do so, you will be needing connections that enable the sign up service as well as the requestor to exchange messages.
The sign up service uses the same connection all the time and (queue) subscribes to a well known subject.
The requestor uses the connection and sends a request to the well known subject.
Once the response is received the first connection is closed and the obtained JWT is used to establish a new connection.

There lays a chicken and egg problem. The first connection to request the JWT itself needs credentials.
The simplest approach is to set up a different nats server/cluster that does not require authentication, connect first to cluster 1 and keep requesting the user JWT. 
Once obtained disconnect from cluster 1 and connect to cluster 2 using the obtained JWT.

##### Account based Setup

The [earlier setup](#straight-forward-setup) can be simplified by using accounts instead of separate server/clusters.
But a JWT/operator based setup requires JWT authentication. 
Thus, would be, connections to different cluster are replaced by connections to the same cluster but different accounts.
* Cluster 1 translates to connections to a `signup` account.
* Cluster 2 translates to connections to accounts to who's signing keys have been used to sign the user JWT. (This happens the first setup as well)

Connections to the `signup` accounts use two kinds of credentials.
1. Sign up service(s) use(s) credentials generated for it/them.
2. All requestors use the same JWT and NKEY, both of which are not used for actual authentication.
    * That JWT is probably generated using `nsc` itself.
    * Do not use this JWT/NKEY for anything else but contacting the sign up service.
    * You want to allow publish only to the well known subject.
    * Depending on your deployment you need to back up the account (signing) NKEY so that the account can be re generated without invalidating deployed requestors (which may be hard to replace).

### System Account

The system account is the account under which nats-server offer services.
To use it either the operator JWT has to specify it, which happens during `nsc init` or when providing `--sys` to `nsc add operator`.
Alternatively you can encode it in the server configuration by providing `system_account` with the public NKEY of the account you want to be the system account.

``` text
system_account: AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5
```

It is NOT recommended to use this account to facilitate communication between your own applications.
It's sole purpose is to facilitate communication with and between `nats-server`

#### Event Subjects
 
Events are published as they happen. But you MUST NOT rely on a particular ordering or due the possibility of loss, events matching.
Say, `CONNECT` for a client always matching a `DISCONNECT` for the same client. 
Your subscriber may simply be disconnected when either event happens.
Some messages carry aggregate data and are periodically emitted. 
There, missing a message for one reason or another is compensated by the next one.

| Subjects to subscribe on                     | Description                              | Repeats          | 
| :------------------------------------------- | :--------------------------------------- | :--------------- |  
| `$SYS.SERVER.<server-id>.SHUTDOWN`           | Sent when a server shuts down            |                  |        
| `$SYS.SERVER.<server-id>.CLIENT.AUTH.ERR`    | Sent when client fails to authenticate   |                  |        
| `$SYS.SERVER.<server-id>.STATSZ`             | Basic server stats                       | Periodically     |        
| `$SYS.ACCOUNT.<account-id>.LEAFNODE.CONNECT` | Sent when Leafnode connected             |                  |        
| `$SYS.ACCOUNT.<account-id>.CONNECT`          | Sent when client connected               |                  |        
| `$SYS.ACCOUNT.<account-id>.DISCONNECT`       | Sent when Client disconnected            |                  |        
| `$SYS.ACCOUNT.<account-id>.SERVER.CONNS`     | Sent when an accounts connections change |                  |        

The subject `$SYS.SERVER.ACCOUNT.<account-id>.CONNS` is still used but it is recommended to subscribe to it's new name `$SYS.ACCOUNT.<account-id>.SERVER.CONNS`.

#### Service Subjects

##### Subjects always available

| Subjects to publish requests to        | Description                                                                             | Message Output        |
| :------------------------------------- | :-------------------------------------------------------------------------------------- | :-------------------- |
| `$SYS.REQ.SERVER.PING.STATZ`           | Exposes the `STATZ` HTTP monitoring endpoint, each server will respond with one message | Same as HTTP endpoint |
| `$SYS.REQ.SERVER.PING.VARZ`            | - same as above for - `VARZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.PING.SUBZ`            | - same as above for - `SUBZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.PING.CONNZ`           | - same as above for - `CONNZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.PING.ROUTEZ`          | - same as above for - `ROUTEZ`                                                          | - same as above -     |
| `$SYS.REQ.SERVER.PING.GATEWAYZ`        | - same as above for - `GATEWAYZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.PING.LEAFZ`           | - same as above for - `LEAFZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.PING.ACCOUNTZ`        | - same as above for - `ACCOUNTZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.PING.JSZ`             | - same as above for - `JSZ`                                                             | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.STATZ`    | Exposes the `STATZ` HTTP monitoring endpoint, only requested server responds            | Same as HTTP endpoint |
| `$SYS.REQ.SERVER.<server-id>.VARZ`     | - same as above for - `VARZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.SUBZ`     | - same as above for - `SUBZ`                                                            | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.CONNZ`    | - same as above for - `CONNZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.ROUTEZ`   | - same as above for - `ROUTEZ`                                                          | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.GATEWAYZ` | - same as above for - `GATEWAYZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.LEAFZ`    | - same as above for - `LEAFZ`                                                           | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.ACCOUNTZ` | - same as above for - `ACCOUNTZ`                                                        | - same as above -     |
| `$SYS.REQ.SERVER.<server-id>.JSZ`      | - same as above for - `JSZ`                                                             | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.SUBSZ`  | Exposes the `SUBSZ` HTTP monitoring endpoint, filtered by account-id.                   | Same as HTTP endpoint |
| `$SYS.REQ.ACCOUNT.<account-id>.CONNZ`  | - same as above for `CONNZ` -                                                           | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.LEAFZ`  | - same as above for `LEAFZ` -                                                           | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.JSZ`    | - same as above for `JSZ` -                                                             | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.CONNS`  | Exposes the event `$SYS.ACCOUNT.<account-id>.SERVER.CONNS` as request                   | - same as above -     |
| `$SYS.REQ.ACCOUNT.<account-id>.INFO`   | Exposes account specific information similar to `ACCOUNTZ`                              | Similar to `ACCOUNTZ` |

Each of the subjects can be used without any input.
However, for each request type (`STATZ`, `VARZ`, `SUBSZ`, `CONNS`, `ROUTEZ`, `GATEWAYZ`, `LEAFZ`, `ACCOUNTZ`, `JSZ`) a json with type specific options can be sent.
Furthermore do all subjects allow for filtering by providing these values as json:

| Option | Effect  |
| :------| :------ |
| `server_name`| Only server with matching server name will respond. |
| `cluster` | Only server with matching cluster name will respond. |
| `host` | Only server running on that host will respond. |
| `tags` | Filter responders by tags. All tags must match. |

##### Subjects available when using nats-based resolver

| Subject                                       | Description                                                                              | Input                                                                                       | Output                                                                                            |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| `$SYS.REQ.ACCOUNT.<account-id>.CLAIMS.UPDATE` | Update a particular account JWT (only possible if properly signed)                       | JWT body                                                                                    |                                                                                                   |
| `$SYS.REQ.ACCOUNT.<account-id>.CLAIMS.LOOKUP` | Responds with requested JWT                                                              |                                                                                             | JWT body                                                                                          |
| `$SYS.REQ.CLAIMS.PACK`                        | Single responder compares input, sends all JWT if different.                             | xor of all sha256(stored-jwt). Send empty message to download all JWT.                      | If different, responds with all stored JWT (one message per JWT).<br>Empty message to signify EOF |
| `$SYS.REQ.CLAIMS.LIST`                        | Each server responds with list of account ids it stores                                  |                                                                                             | list of account ids separated by newline                                                          |
| `$SYS.REQ.CLAIMS.UPDATE`                      | Exposes $SYS.REQ.ACCOUNT.<account-id>.CLAIMS.UPDATE without the need for `<account-id>`  | JWT body                                                                                    |                                                                                                   |
| `$SYS.REQ.CLAIMS.DELETE`                      | When the resolver is configured with `allow_delete: true`, deleting accounts is enabled. | Generic operator signed JWT claim with a field `accounts` containing a list of account ids. |                                                                                                   |

##### Old Subjects

| Subject                                   | Alternative Mapping                           |
| :---------------------------------------- | :-------------------------------------------- |
| `$SYS.REQ.SERVER.PING`                    | `$SYS.REQ.SERVER.PING.STATZ`                  |
| `$SYS.ACCOUNT.<account-id>.CLAIMS.UPDATE` | `$SYS.REQ.ACCOUNT.<account-id>.CLAIMS.LOOKUP` | 

#### Leaf Node Connections - Outgoing

It is important to understand that leaf nodes do not multiplex between accounts. 
Every account that you wish connect across a leaf node connection needs to be explicitly listed.
Thus, the system account is not automatically connected, even if both ends of a leaf node connection use the same system account.
For leaf nodes connecting into a cluster or super cluster, the system account needs to be explicitly connected as separate `remote` to the same url(s) used for the other account(s).
The system account user used by providing `credentials` can be heavily restricted and for example, only allow publishing on some subjects.
This holds also true when you don't use the system account yourself, but indirectly need it for nats based account resolver or centralized monitoring.

Examples in sub sections below assume that the cluster to connect into is in operator mode. 

##### Non Operator Mode

Outgoing connection is not in Operator mode. Thus it's system account account differs. This shows how to connect them still.
Credentials files provided have to contain credentials that are valid server/cluster reachable by `url`.
In the example no accounts are explicitly configured, yet some are referenced. These are the default Account `$G` and the default system account `$SYS`

```text
leafnodes {
    remotes = [ 
        { 
          url: "nats-leaf://localhost:4222"
          credentials: "./your-account.creds"
        },
        {
          url: "nats-leaf://localhost:4222"
          account: "$SYS"
          credentials: "./system-account.creds"
        },
    ]
}
```

##### Operator Mode

Outgoing connection is in operator mode as well. 
This example assumes usage of the same operator and thus system account. 
However, using different operator would look almost identical. 
Only the credentials would be issued by accounts of the other operator.

```text
operator: ./trustedOperator.jwt
system_account: AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5
leafnodes {
    remotes = [ 
        { 
          url: "nats-leaf://localhost:4222"
          account: "ADKGAJU55CHYOIF5H432K2Z2ME3NPSJ5S3VY5Q42Q3OTYOCYRRG7WOWV"
          credentials: "./your-account.creds"
        },
        { 
          url: "nats-leaf://localhost:4222"
          account: "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5"
          credentials: "./system-account.creds"
        },
    ]
}
```

### Connecting Accounts 

As shown in [what are accounts](#what-are-accounts), they can be connected via exports and imports.
While in configuration files this is straight forward, this becomes a bit more complicated when using JWTs
In part this is due to the addition of new concepts such as public/private/activation tokens that do not make sense in a config based context.

#### Exports

Add an export with: `nsc add export --name <export name> --subject <export subject>` 
This will export a public stream that can be imported by any account.
To alter the export to be a service add `--service`.

To have more control over which account is allowed to import provide the option `--private`.
When doing so only accounts for which you generate tokens can add the matching import.
A token can be generated and stored in a file as follows: `nsc generate activation --account <account name> --subject <export subject> --output-file <token file> --target-account <account identity public NKEY>`
The resulting file can then be exchanged with the importer.

#### Imports

To add an import for a public export use `nsc add import --account <account name> --src-account <account identity public NKEY> --remote-subject <subject of export>`. To import a service provide the option `--service`.

To add an import for a private export use `nsc add import --account <account name> --token <token file or url>`
*If your nsc environment contains operator and account signing NKEY, `nsc add import -i` will generate token to embed on the fly*

##### Import Subjects

Between export/import/activation token there are many subjects in use. Their relationship is as follows:
* Import subject is identical to or a subset of the exported subject.
* An activation tokes subject is identical to or a subset of the exported subject.
* An activation tokens subject is also identical to or a subset of the import subject of the account it is embedded in.

##### Import Remapping

In order to be independent of subject names chosen by the exporter, importing allows to remap the imported subject.
To do sos provide the option `--remote-subject <subject name>` to the import command.

This example will change the subject name the importing account uses locally from the exporter picked subject `foo` to `bar`.

```text
> nsc add import --account test --src-account ACJ6G45BE7LLOFCVAZSZR3RY4XELXQ32BOQRI7KQMQLICXXXJRP4P45Q --remote-subject blo --local-subject bar
[ OK ] added stream import "blo"
>
```

##### Visualizing Export/Import Relationships

Nsc can generate diagrams of inter account relationships using: `nsc generate diagram component --output-file test.uml`
The generated file contains a [plantuml](https://plantuml.com/) component diagram of all accounts connected through their exports/imports. 
To turn the file into a png execute: `plantuml -tpng test.uml` 
If the diagram is cut off, increase available memory and image size limit with these options: `-Xmx2048m -DPLANTUML_LIMIT_SIZE=16384`

### Managing Keys

Not every key used in ngs is equally important. 
Their importance generally follows the chain of trust with operator keys being more important than account keys.
Furthermore identity keys are more important than signing keys. 

In the instances where regenerating a completely new identity key of either type is not an option, such as a) too many devices deployed b) too much institutional overhead c) ..., we suggest to backup identity nkeys, take them offline and use exchangeable signing keys instead.
Depending on which key got compromised, you may have to exchange signing keys and re-sign all JWT signed with the compromised key.
The compromised key may also have to be revoked.

Wether you simply plan to regenerate new NKEY/JWT or exchange signing NKEYs and resign JWT, in either case, you need to prepare and try this out beforehand and not wait until disaster strikes. 

#### Protect Identity NKEYs

Usage of signing keys for Operator and Account have been shown in the [`nsc`](#nsc) section. 
This shows how to take an identity key offline.
Identity NKEY of the operator/account is the only one allowed to modify the corresponding JWT and thus add/remove signing keys.
Thus, initial signing keys are best created and assigned prior to removing the private identity NKEY.

Basic strategy: take them offline & delete in [`nsc`](#nsc) NKEY directory

Use `nsc env` to determine your NKEY directory. (Assuming `~/.nkeys` for this example)
`nsc list keys --all` lists all keys under your operator and indicates if they are present and if they are signing keys.

Keys for your Operator/Account can be found under `<nkyesdir>/keys/O/../<public-nkey>.nk` or `<nkyesdir>/keys/A/../<public-nkey>.nk`
The operator identity NKEY ODMFND7EIJ2MBHNPO2JHCKOZIAY6NAK7OT4V2ZT2C5O6LEB3DPKYV3QL would reside under `~/.nkeys/keys/O/DM/ODMFND7EIJ2MBHNPO2JHCKOZIAY6NAK7OT4V2ZT2C5O6LEB3DPKYV3QL.nk`

*Please note that key storage is sharded by the 2nd and 3rd letter in the key*

Once these files are backed up and deleted `nsc list keys --all` will show them as not stored.
You can continue as normal, `nsc` will pick up signing keys instead.

Since you typically distribute user keys or creds files to your applications, there is no need for `nsc` to hold on to them in the first place.
Credentials files are a concatenated user JWT and the corresponding private key, so don't forget to delete that as well.

Key and creds can be found under `<nkyesdir>/keys/U/../<public-nkey>.nk` and `<nkyesdir>/creds/<operator-name>/<account-name>/<user-name>.creds`

#### Reissue Identity NKEYs

If you can easily re-deploy all necessary keys and jwt, simply re-generating a new account/user (possibly operator) this will be the simplest solution.
The steps necessary are identical to the initial setup, which is why it would be preferred.
In fact, for user NKEYs and JWT, generating and distributing now ones to affected applications it is the best option.

Even if regeneration of an account or operator is not your first choice, it may be your method of last resort. 
Below sections outline the steps this would entail.

##### Operator

In order to reissue an operator identity NKEY use `nsc reissue operator`.
It will generate a new identity NKEY and use it to sign the operator.
`nsc` will also resign all accounts signed by the original identity NKEY. 
Accounts signed by operator signing keys will remain untouched.

The altered operator JWT will have to be deployed to all affected `nats-server` (one server at a time).
Once all `nats-server` have been restarted with the new operator, push the altered accounts.
Depending on your deployment mode you may have to distribute the operator JWT and altered account JWT to all other [`nsc`](#nsc) environments.

This process will be a lot easier when operator signing keys where used throughout and no account will be re signed because of this.
If they where not, you can convert the old identity NKEY into a signing key using `nsc reissue operator --convert-to-signing-key`.
On your own time - you can then remove the then signing NKEY using `nsc edit operator --rm-sk O.. ` and re deploy the operator jwt to all `nats-server`.

##### Account

Unlike with the operator, account identity NKEYs can not be changed as easily. 
User JWT explicitly reference the account identity NKEY such that the `nats-server` can download them via a resolver.
This complicates reissuing these kind of NKEYs, which is why we strongly suggest sticking to signing keys.

The basic approach is to:
1. generate a new account with similar settings - including signing NKEYs
2. resign all user that used to be signed by the old identity NKEY
3. push the account and
4. deploy the new user JWT to all programs running inside the account

When signing keys where used, the account identity NKEY would only be needed to self sign the account JWT exchange with an administrators/operators [`nsc`](#nsc) environment.

#### Revocations

JWT for user, activations and accounts can be explicitly revoked. 
Furthermore can signing keys be removed, thus invalidating all JWT signed by the removed NKEY.

##### User

To revoke all JWT for a user in a account issue `nsc revocations add-user --account <account name> --name <user name>`.
With the argument `--at` you can specify a time different than now.
Use `nsc revocations list-users --account <account name>` to inspect the result or `nsc revocations delete-user --account <account name> --name <user name>` to remove the revocation.

```text
> nsc revocations add-user --account SYS --name sys
[ OK ] revoked user "UCL5YXXUKCEO4HDTTYUOHDMHP4JJ6MGE3SVQBDWFZUGJUMUKE24DEUCU"
> nsc revocations list-users
+------------------------------------------------------------------------------------------+
|                                 Revoked Users for test5                                  |
+----------------------------------------------------------+-------------------------------+
| Public Key                                               | Revoke Credentials Before     |
+----------------------------------------------------------+-------------------------------+
| UAX7KQJJNL5NIRTSQSANKE3DNBHLLFUYKRXCD5QRKI75XBEHQOA4ZZGV | Wed, 10 Feb 2021 12:51:09 EST |
+----------------------------------------------------------+-------------------------------+
```

Please note that the revocation created only applies to JWT issued before the time listed. 
User created or edited after, will be valid as they are outside of the revocation time.
Please be also aware that adding a revocation will modify the account and therefore has to be pushed in order to publicize the revocation.

##### Activations

To revoke all activations of the export, identified by `--account` and `--subject` (`--stream` it the export is a stream), issued for a given Account identity NKEY use: `nsc revocations add-activation --account <account name> --subject <export name> --target-account <account identity public NKEY>`
Use `nsc revocations list-activations --account SYS` to inspect the result or `nsc revocations delete_activation --account <account name> --subject <export name> --target-account <account identity public NKEY>` to remove the revocation.

```text
> nsc revocations add-activation --account SYS --subject foo --target-account AAUDEW26FB4TOJAQN3DYMDLCVXZMNIJWP2EMOAM5HGKLF6RGMO2PV7WP
[ OK ] revoked activation "foo" for account AAUDEW26FB4TOJAQN3DYMDLCVXZMNIJWP2EMOAM5HGKLF6RGMO2PV7WP
> nsc revocations list-activations --account SYS
+------------------------------------------------------------------------------------------+
|                             Revoked Accounts for stream foo                              |
+----------------------------------------------------------+-------------------------------+
| Public Key                                               | Revoke Credentials Before     |
+----------------------------------------------------------+-------------------------------+
| AAUDEW26FB4TOJAQN3DYMDLCVXZMNIJWP2EMOAM5HGKLF6RGMO2PV7WP | Wed, 10 Feb 2021 13:22:11 EST |
+----------------------------------------------------------+-------------------------------+
```

Please note that the revocation created only applies to JWT issued before the time listed. 
Activations created or edited after, will be valid as they are outside of the revocation time.
Please be also aware that adding a revocation will modify the account and therefore has to be pushed in order to publicize the revocation.

##### Accounts

Account identity NKEYS can not be revoked like user or activations. 
Instead lock out all users by setting the connection count to 0 using `nsc edit account --name <account name> --conns 0` and pushing the change using `nsc push --all`.

Alternatively you can also remove the account using `nsc delete account --name` and keep it from found by the account resolver. How to do this depends on your resolver type:
* [mem-resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#memory): Remove the JWT from the configuration field `resolver_preload` and restart all `nats-server`
* [url-resolver](https://docs.nats.io/nats-server/configuration/securing_nats/jwt/resolver#url-resolver): Manually delete the JWT from the `nats-account-server` store directory.
* `nats-resolver`: Prune removed accounts using: `nsc push --all --prune`. For this to work, the resolver has to have deletion enabled (`allow_delete: true`) and you need to be in possession of an operator signing key.

##### Signing keys

Accounts/Activations/User can be revoked in bulk by removing the respective signing key.

Remove an operator signing key: `nsc edit operator --rm-sk <signing key>`
As a modification of the operator, in order to take effect, all dependent [`nsc`](#nsc) installations as well as `nats-server` will need this new version of the operator jwt.

Remove an account signing key: `nsc edit account --name <account name> --rm-sk <signing key>` 
In order to take effect, a modification of an account needs to be pushed: `nsc push --all` 
