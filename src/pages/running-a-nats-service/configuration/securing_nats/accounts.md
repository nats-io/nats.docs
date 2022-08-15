# Multi Tenancy using Accounts

In modern microservice architecture it is common to share infrastructure - such as NATS - between services. [Accounts](accounts.md#accounts) are securely isolated communication contexts that allow multi-tenancy in a NATS deployment. They allow users to bifurcate technology from business driven use cases, where data silos are created by design, not software limitations. Furthermore, they facilitate the [controlled exchange](accounts.md#exporting-and-importing) of information between those data silos/Tenants/Accounts.

## Accounts

_Accounts_ expand on the authorization foundation. With traditional authorization, all clients can publish and subscribe to anything unless explicitly configured otherwise. To protect clients and information, you have to carve the subject space and permission clients carefully.

_Accounts_ allow the grouping of clients, _isolating_ them from clients in other accounts, thus enabling _multi-tenancy_ in the server. With accounts, the subject space is not globally shared, greatly simplifying the messaging environment. Instead of devising complicated subject name carving patterns, clients can use short subjects without explicit authorization rules. [System Events](../sys_accounts/) are an example of this isolation at work.

Accounts configuration is done in `accounts` map. The contents of an account entry includes:

| Property | Description |
| :--- | :--- |
| `users` | a list of [user configuration maps](auth_intro/#user-configuration-map) |
| `exports` | a list of [export maps](accounts.md#export-configuration-map) |
| `imports` | a list of [import maps](accounts.md#import-configuration-map) |

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
> The user configuration map is the same as any other NATS [user configuration map](auth_intro/#user-configuration-map) . You can use:
>
> * username/password
> * nkeys
> * and add permissions
>
> While the name _account_ implies one or more users, it is much simpler and enlightening to think of one account as a messaging container for one application. Users in the account are simply the minimum number of services that must work together to provide some functionality. In simpler terms, more accounts with few \(even one\) clients is a better design topology than a large account with many users with complex authorization configuration.

## Exporting and Importing

Messaging exchange between different accounts is enabled by _exporting_ streams and services from one account and _importing_ them into another. Each account controls what is exported and imported.

* **Streams** are messages your application publishes. Importing applications won't be able to make requests from your applications but will be able to consume messages you generate.
* **Services** are messages your application can consume and act on, enabling other accounts to make requests that are fulfilled by your account.

The `exports` configuration list enable you to define the services and streams that others can import. Exported services and streams are expressed as an [Export configuration map](accounts.md#export-configuration-map). The `imports` configuration lists the services and streams that an Account imports. Imported services and streams are expressed as an [Import configuration map](accounts.md#import-configuration-map).

### Export Configuration Map

The export configuration map binds a subject for use as a `service` or `stream` and optionally defines specific accounts that can import the stream or service. Here are the supported configuration properties:

| Property | Description |
| :--- | :--- |
| `stream` | A subject or subject with wildcards that the account will publish. \(exclusive of `service`\) |
| `service` | A subject or subject with wildcards that the account will subscribe to. \(exclusive of `stream`\) |
| `accounts` | A list of account names that can import the stream or service. If not specified, the service or stream is public and any account can import it. |
| `response_type` | Indicates if a response to a `service` request consists of a `single` or a `stream` of messages. Possible values are: `single` or `stream`. \(Default value is `singleton`\) |

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
* a stream to account `B` on the wildcard subject `b.>`
* a service to account `B` on the subject `q.b`

### Import Configuration Map

An import enables an account to consume streams published by another account or make requests to services implemented by another account. All imports require a corresponding export on the exporting account. Accounts cannot do self-imports.

| Property | Description |
| :--- | :--- |
| `stream` | Stream import [source configuration](accounts.md#source-configuration-map). \(exclusive of `service`\) |
| `service` | Service import [source configuration](accounts.md#source-configuration-map) \(exclusive of `stream`\) |
| `prefix` | A local subject prefix mapping for the imported stream. \(applicable to `stream`\) |
| `to` | A local subject mapping for imported service. \(applicable to `service`\) |

The `prefix` and `to` options are optional and allow you to remap the subject that is used locally to receive stream messages from or publish service requests to. This way the importing account does not depend on naming conventions picked by another. Currently, a service import can not make use of wildcards, which is why the import subject can be rewritten. A stream import may make use of wildcards. To retain information contained in the subject, it can thus only be prefixed with `prefix`...

#### Source Configuration Map

The _source configuration map_ describes an export from a remote account by specifying the `account` and `subject` of the export being imported. This map is embedded in the [import configuration map](accounts.md#import-configuration-map):

| Property | Description |
| :--- | :--- |
| `account` | Account name owning the export. |
| `subject` | The subject under which the stream or service is made accessible to the importing account |

### Import/Export Example

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

## No Auth User

Clients connecting without authentication can be associated with a particular user within an account.

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
    }
}
no_auth_user: a
```

The above example shows how clients without authentication can be associated with the user `a` within account `A`.

> Please note that the `no_auth_user` will not work with nkeys. The user referenced can also be part of the [authorization](authorization.md) block.
>
> Despite `no_auth_user` being set, clients still need to communicate that they will not be using credentials. The [authentication timeout](auth_intro/auth_timeout.md) applies to this process as well. When your connection is slow, you may run into this timeout and the resulting `Authentication Timeout` error, despite not providing credentials.

