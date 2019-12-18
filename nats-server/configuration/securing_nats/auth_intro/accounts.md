# Accounts

## Accounts

_Accounts_ expand on the authentication foundation. With traditional authentication \(except for JWT authentication\), all clients can publish and subscribe to anything unless explicitly configured otherwise. To protect clients and information, you have to carve the subject space and permission clients carefully.

_Accounts_ allow the grouping of clients, _isolating_ them from clients in other accounts, thus enabling _multi-tenancy_ in the server. With accounts, the subject space is not globally shared, greatly simplifying the messaging environment. Instead of devising complicated subject name carving patterns, clients can use short subjects without explicit authorization rules.

Accounts configuration is done in `accounts` map. The contents of an account entry includes:

| Property | Description |
| :--- | :--- |
| `users` | a list of [user configuration maps](./#user-configuration-map) |
| `exports` | a list of export maps |
| `imports` | a list of import maps |

The `accounts` list is a map, where the keys on the map are an account name.

```text
accounts: {
    A: {
        users: [
            {user: a, password: a}
        ]
    },
    B: {
        users: [
            {user: b, password: b}
        ]
    },
}
```

> In the most straightforward configuration above you have an account named `A` which has a single user identified by the username `a` and the password `a`, and an account named `B` with a user identified by the username `b` and the password `b`.
>
> These two accounts are isolated from each other. Messages published by users in `A` are not visible to users in `B`.
>
> The user configuration map is the same as any other NATS [user configuration map](./#user-configuration-map). You can use:
>
> * username/password
> * nkeys
> * and add permissions
>
> While the name _account_ implies one or more users, it is much simpler and enlightening to think of one account as a messaging container for one application. Users in the account are simply the minimum number of services that must work together to provide some functionality. In simpler terms, more accounts with few \(even one\) clients is a better design topology than a large account with many users with complex authorization configuration.

### Exporting and Importing

Messaging exchange between different accounts is enabled by _exporting_ streams and services from one account and _importing_ them into another. Each account controls what is exported and imported.

The `exports` configuration list enable you to define the services and streams that others can import. Services and streams are expressed as an [Export configuration map](accounts.md#export-configuration-map).

### Streams

Streams are messages your application publishes. Importing applications won't be able to make requests from your applications but will be able to consume messages you generate.

### Services

Services are messages your application can consume and act on, enabling other accounts to make requests that are fulfilled by your account.

### Export Configuration Map

The export configuration map binds a subject for use as a `service` or `stream` and optionally defines specific accounts that can import the stream or service. Here are the supported configuration properties:

| Property | Description |
| :--- | :--- |
| `stream` | A subject or subject with wildcards that the account will publish. \(exclusive of `service`\) |
| `service` | A subject or subject with wildcards that the account will subscribe to. \(exclusive of `stream`\) |
| `accounts` | A list of account names that can import the stream or service. If not specified, the service or stream is public and any account can import it. |

Here are some example exports:

```text
accounts: {
    A: {
        users: [
            {user: a, password: a}
        ]
        exports: [
            {stream: puba.>}
            {service: pubq.>}
            {stream: b.>, accounts: [B]}
            {service: q.b, accounts: [B]}
        ]
    }
    ...
}
```

Here's what `A` is exporting:

* a public stream on the wildcard subject `puba.>`
* a public service on the wildcard subject `pubq.>`
* a stream to account `B` on the wildcard subject `a.>`
* a service to account `B` on the subject `q.b`

## Source Configuration Map

The _source configuration map_ describes an export from a remote account by specifying the `account` and `subject` of the export being imported. This map is embedded in the [import configuration map](accounts.md#import-configuration-map):

| Property | Description |
| :--- | :--- |
| `account` | Account name owning the export. |
| `subject` | The subject under which the stream or service is made accessible to the importing account |

### Import Configuration Map

An import enables an account to consume streams published by another account or make requests to services implemented by another account. All imports require a corresponding export on the exporting account. Accounts cannot do self-imports.

| Property | Description |
| :--- | :--- |
| `stream` | Stream import source configuration. \(exclusive of `service`\) |
| `service` | Service import source configuration \(exclusive of `stream`\) |
| `prefix` | A local subject prefix mapping for the imported stream. |
| `to` | A local subject mapping for imported service. |

The `prefix` and `to` options allow you to remap the subject that is used locally to receive stream messages or publish service requests.

```text
accounts: {
    A: {
        users: [
            {user: a, password: a}
        ]
        exports: [
            {stream: puba.>}
            {service: pubq.>}
            {stream: b.>, accounts: [B]}
            {service: q.b, accounts: [B]}
        ]
    },
    B: {
        users: [
            {user: b, password: b}
        ]
        imports: [
            {stream: {account: A, subject: b.>}}
            {service: {account: A, subject: q.b}}
        ]
    }
    C: {
        users: [
            {user: c, password: c}
        ]
        imports: [
            {stream: {account: A, subject: puba.>}, prefix: from_a}
            {service: {account: A, subject: pubq.C}, to: Q}
        ]
    }
}
```

Account `B` imports:

* the private stream from `A` that only `B` can receive on `b.>`
* the private service from `A` that only `B` can send requests on `q.b`

Account `C` imports the public service and stream from `A`, but also:

* remaps the `puba.>` stream to be locally available under `from_a.puba.>`. The messages will have their original subjects prefixed by `from_a`.
* remaps the `pubq.C` service to be locally available under `Q`. Account `C` only needs to publish to `Q` locally.

It is important to reiterate that:

* stream `puba.>` from `A` is visible to all external accounts that imports the stream.
* service `pubq.>` from `A` is available to all external accounts so long as they know the full subject of where to send the request. Typically an account will export a wildcard service but then coordinate with a client account on specific subjects where requests will be answered. On our example, account `C` access the service on `pubq.C` \(but has mapped it for simplicity to `Q`\).
* stream `b.>` is private, only account `B` can receive messages from the stream.
* service `q.b` is private; only account `B` can send requests to the service.
* When `C` publishes a request to `Q`, local `C` clients will see `Q` messages. However, the server will remap `Q` to `pubq.C` and forward the requests to account `A`.

