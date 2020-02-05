# Authorization

The NATS server supports authorization using subject-level permissions on a per-user basis. Permission-based authorization is available with multi-user authentication via the `users` list.

Each permission specifies the subjects the user can publish to and subscribe to. The parser is generous at understanding what the intent is, so both arrays and singletons are processed. For more complex configuration, you can specify a `permission` object which explicitly allows or denies subjects. The specified subjects can specify wildcards. Permissions can make use of [variables](../README.md#variables).

You configure authorization by creating a `permissions` entry in the `authorization` object.

## Permissions Configuration Map

The `permissions` map specify subjects that can be subscribed to or published by the specified client.

| Property | Description |
| :--- | :--- |
| `publish` | subject, list of subjects, or permission map the client can publish |
| `subscribe` | subject, list of subjects, or permission map the client can subscribe |

## Permission Map

The `permission` map provides additional properties for configuring a `permissions` map. Instead of providing a list of subjects that are allowed, the `permission` map allows you to explicitly list subjects you want to`allow` or `deny`:

| Property | Description |
| :--- | :--- |
| `allow` | List of subject names that are allowed to the client |
| `deny` | List of subjects that are denied to the client |

**Important Note** NATS Authorizations can be _allow lists_, _deny lists_, or both. It is important to not break request/reply patterns. In some cases \(as shown below\) you need to add rules as above with Alice and Bob for the `_INBOX.>` pattern. If an unauthorized client publishes or attempts to subscribe to a subject that has not been _allow listed_, the action fails and is logged at the server, and an error message is returned to the client.

## Example

Here is an example authorization configuration that uses _variables_ which defines four users, three of whom are assigned explicit permissions.

```text
authorization {
  ADMIN = {
    publish = ">"
    subscribe = ">"
  }
  REQUESTOR = {
    publish = ["req.a", "req.b"]
    subscribe = "_INBOX.>"
  }
  RESPONDER = {
    subscribe = ["req.a", "req.b"]
    publish = "_INBOX.>"
  }
  DEFAULT_PERMISSIONS = {
    publish = "SANDBOX.*"
    subscribe = ["PUBLIC.>", "_INBOX.>"]
  }
  users = [
    {user: admin,   password: $ADMIN_PASS, permissions: $ADMIN}
    {user: client,  password: $CLIENT_PASS, permissions: $REQUESTOR}
    {user: service,  password: $SERVICE_PASS, permissions: $RESPONDER}
    {user: other, password: $OTHER_PASS}
  ]
}
```

> _DEFAULT\_PERMISSIONS_ is a special permissions name. If defined, it applies to all users that don't have specific permissions set.

* _admin_ has `ADMIN` permissions and can publish/subscribe on any subject. We use the wildcard `>` to match any subject.
* _client_ is a `REQUESTOR` and can publish requests on subjects `req.a` or `req.b`, and subscribe to anything that is a response \(`_INBOX.>`\).
* _service_ is a `RESPONDER` to `req.a` and `req.b` requests, so it needs to be able to subscribe to the request subjects and respond to client's that can publish requests to `req.a` and `req.b`. The reply subject is an inbox. Typically inboxes start with the prefix `_INBOX.` followed by a generated string. The `_INBOX.>` subject matches all subjects that begin with `_INBOX.`.
* _other_ has no permissions granted and therefore inherits the default permission set. You set the inherited default permissions by assigning them to the `default_permissions` entry inside of the authorization configuration block.

> Note that in the above example, any client with permissions to subscribe to `_INBOX.>` can receive _all_ responses published. More sensitive installations will want to add or subset the prefix to further limit subjects that a client can subscribe. Alternatively, [_Accounts_](auth_intro/accounts.md) allow complete isolation limiting what members of an account can see.

Here's another example, where the `allow` and `deny` options are specified:

```text
authorization: {
    users = [
        {
            user: admin
            password: secret
            permissions: {
                publish: ">"
                subscribe: ">"
            }
        }
        { 
            user: test
            password: test
            permissions: {
                publish: {
                    deny: ">"
                }, 
                subscribe: {
                    allow: "client.>"
                }
            }
        }
    ]
}
```

## Queue Permissions

Added in NATS Server v2.1.2, Queue Permissions allow you to express authorization for queue groups. As queue groups are integral to implementing horizontally scalable microservices, control of who is allowed to join a specific queue group is important to the overall security model.

A Queue Permission can be defined with the syntax `<subject> <queue>`, where the name of the queue can also use wildcards, for example the following would allow clients to join queue groups v1 and v2.\*, but won't allow plain subscriptions:

```text
allow = ["foo v1", "foo v2.*"]
```

The full wildcard can also be used, for example the following would prevent plain subscriptions on `bar` but allow the client to join any queue:

```text
allow = ["bar >"]
```

Permissions for Queue Subscriptions can be combined with plain subscriptions as well though, for example you could allow plain subscriptions on `foo` but constrain the queues to which a client can join, as well as preventing any service from using a queue subscription with the name `*.prod`:

```text
users = [
  {
    user: "foo", permissions: {
      sub: {
        # Allow plain subscription foo, but only v1 groups or *.dev queue groups
        allow: ["foo", "foo v1", "foo v1.>", "foo *.dev"]

        # Prevent queue subscriptions on prod groups
        deny: ["> *.prod"]
     }
  }
]
```


