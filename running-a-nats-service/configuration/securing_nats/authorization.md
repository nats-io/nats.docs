# Authorization

The NATS server supports authorization using subject-level permissions on a per-user basis. Permission-based authorization is available with multi-user authentication via the `users` list.

Each permission specifies the subjects the user can publish to and subscribe to. The parser is generous at understanding what the intent is, so both arrays and singletons are processed. For more complex configuration, you can specify a `permission` object which explicitly allows or denies subjects. The specified subjects can specify wildcards as well. Permissions can make use of [variables](/running-a-nats-service/configuration/securing_nats/authorization.md#variables).

A special field inside the authorization map is `default_permissions`. When present, it contains permissions that apply to users that do not have permissions associated with them.

## Permissions Configuration Map

The `permissions` map specify subjects that can be subscribed to or published by the specified client.

| Property          | Description                                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `publish`         | subject, list of subjects, or [permission map](authorization.md#permission-map) the client can publish                                                                                                                                                                                                 |
| `subscribe`       | subject, list of subjects, or [permission map](authorization.md#permission-map) the client can subscribe to. In this context it is possible to provide an optional queue name: `<subject> <queue>` to express queue group permissions. These permissions can also use wildcards such as `v2.*` or `>`. |
| `allow_responses` | boolean or [responses map](authorization.md#allow-responses-map), default is `false`                                                                                                                                                                                                                   |

## Permission Map

The `permission` map provides additional properties for configuring a `permissions` map. Instead of providing a list of allowable subjects and optional queues, the `permission` map allows you to explicitly list those you want to`allow` or `deny`. Both lists can be provided. In case of overlap `deny` has priority.

| Property | Description                                          |
| -------- | ---------------------------------------------------- |
| `allow`  | List of subject names that are allowed to the client |
| `deny`   | List of subjects that are denied to the client       |

**Important Note** It is important to not break request/reply patterns. In some cases (as shown [below](authorization.md#variables)) you need to add rules for the `_INBOX.>` pattern. If an unauthorized client publishes or attempts to subscribe to a subject that has not been _allow listed_, the action fails and is logged at the server, and an error message is returned to the client. The [allow responses](authorization.md#allow-responses-map) option can simplify this.

## Allow Responses Map

The `allow_responses` option dynamically allows publishing to reply subjects and works well for service responders. When set to `true`, only one response is allowed, meaning the permission to publish to the reply subject defaults to only once. The `allow_responses` map allows you to configure a maximum number of responses and how long the permission is valid.

| Property  | Description                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `max`     | The maximum number of response messages that can be published.                                                                                                |
| `expires` | The amount of time the permission is valid. Values such as `1s`, `1m`, `1h` (1 second, minute, hour) etc can be specified. Default doesn't have a time limit. |

When `allow_responses` is set to `true`, it defaults to the equivalent of `{ max: 1 }` and no time limit.

**Important Note** When using `nsc` to configure your users, you can specify the `--allow-pub-response` and `--response-ttl` to control these settings.

## Examples

### Variables

Here is an example authorization configuration that uses _variables_ which defines four users, three of whom are assigned explicit permissions.

```
authorization {
  default_permissions = {
    publish = "SANDBOX.*"
    subscribe = ["PUBLIC.>", "_INBOX.>"]
  }
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
  users = [
    {user: admin,   password: $ADMIN_PASS, permissions: $ADMIN}
    {user: client,  password: $CLIENT_PASS, permissions: $REQUESTOR}
    {user: service,  password: $SERVICE_PASS, permissions: $RESPONDER}
    {user: other, password: $OTHER_PASS}
  ]
}
```

> `default_permissions` is a special entry. If defined, it applies to all users that don't have specific permissions set.

* _admin_ has `ADMIN` permissions and can publish/subscribe on any subject. We use the wildcard `>` to match any subject.
* _client_ is a `REQUESTOR` and can publish requests on subjects `req.a` or `req.b`, and subscribe to anything that is a response (`_INBOX.>`).
* _service_ is a `RESPONDER` to `req.a` and `req.b` requests, so it needs to be able to subscribe to the request subjects and respond to client's that can publish requests to `req.a` and `req.b`. The reply subject is an inbox. Typically inboxes start with the prefix `_INBOX.` followed by a generated string. The `_INBOX.>` subject matches all subjects that begin with `_INBOX.`.
* _other_ has no permissions granted and therefore inherits the default permission set.&#x20;

> Note that in the above example, any client with permissions to subscribe to `_INBOX.>` can receive _all_ responses published. More sensitive installations will want to add or subset the prefix to further limit subjects that a client can subscribe. Alternatively, [_Accounts_](accounts.md) allow complete isolation limiting what members of an account can see.

### Allow/Deny Specified

Here's an example without variables, where the `allow` and `deny` options are specified:

```
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

### allow_responses

Here's an example with `allow_responses`:

```
authorization: {
    users: [
        { user: a, password: a },
        { user: b, password: b, permissions: {subscribe: "q", allow_responses: true } },
        { user: c, password: c, permissions: {subscribe: "q", allow_responses: { max: 5, expires: "1m" } } }
    ]
}
```

User `a` has no restrictions. User `b` can listen on `q` for requests and can only publish once to reply subjects. All other subjects will be denied. User `c` can also listen on `q` for requests, but is able to return at most 5 reply messages, and the reply subject can be published at most for `1` minute.

### Queue Permissions

User `a` can ony subscribe to `foo` as part of the queue subscriptions `queue`. User `b` has permissions for queue subscriptions as well as plain subscriptions. You can allow plain subscriptions on `foo` but constrain the queues to which a client can join, as well as preventing any service from using a queue subscription with the name `*.prod`:

```
users = [
  {
    user: "a", password: "a", permissions: {
      sub: {
        allow: ["foo queue"]
     }
  }
  {
    user: "b", password: "b", permissions: {
      sub: {
        # Allow plain subscription foo, but only v1 groups or *.dev queue groups
        allow: ["foo", "foo v1", "foo v1.>", "foo *.dev"]

        # Prevent queue subscriptions on prod groups
        deny: ["> *.prod"]
     }
  }
]
```
