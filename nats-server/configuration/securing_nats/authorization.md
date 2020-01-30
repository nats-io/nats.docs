# Authorization

The NATS server supports authorization using subject-level permissions on a per-user basis. Permission-based authorization is available with multi-user authentication via the `users` list.

Each permission specifies the subjects the user can publish to and subscribe to. The parser is generous at understanding what the intent is, so both arrays and singletons are processed. For more complex configuration, you can specify a `permission` object which explicitly allows or denies subjects. The specified subjects can specify wildcards. Permissions can make use of [variables](../#variables).

You configure authorization by creating a `permissions` entry in the `authorization` object.

## Permissions Configuration Map

The `permissions` map specify subjects that can be subscribed to or published by the specified client.

| Property | Description |
| :--- | :--- |
| `publish` | subject, list of subjects, or permission map the client can publish |
| `subscribe` | subject, list of subjects, or permission map the client can subscribe |
| `allow_responses` | boolean or object |


## Permission Map

The `permission` map provides additional properties for configuring a `permissions` map. Instead of providing a list of subjects that are allowed, the `permission` map allows you to explicitly list subjects you want to`allow` or `deny`:

| Property | Description |
| :--- | :--- |
| `allow` | List of subject names that are allowed to the client |
| `deny` | List of subjects that are denied to the client |

**Important Note** NATS Authorizations can be _allow lists_, _deny lists_, or both. It is important to not break request/reply patterns. In some cases \(as shown below\) you need to add rules as above with Alice and Bob for the `_INBOX.>` pattern. If an unauthorized client publishes or attempts to subscribe to a subject that has not been _allow listed_, the action fails and is logged at the server, and an error message is returned to the client.

## Allow Responses Map

The `allow_responses` option dynamically allows publishing to reply subjects and works well for service responders.
When set to `true`, excepting any `publish` permissions, implicitly all publish permissions are denied unless it is the reply subject in a request received by the client.

The `allow_responses` map also allows you to configure a maximum number of responses and how long to allow the dynamic permission after a message is received.

| Property | Description |
| :--- | :--- |
|  `max` | The maximum number of response messages that can be returned to a request. |
| `expires` | The duration of time to allow a response. Values such as `1s`, `1m`, `1h` (1 second, minute, hour) etc can be specified. |

If `allow_responses` is set to `true` rather than a specific configuration, it defaults to the equivalent of `{ max: 1 }`.

**Important Note** When using `nsc` to configure your users, you can specify the `--allow-pub-response` and `--response-ttl` to control these settings.

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

Here's an example with `allow_responses`:

```text
authorization: {
	users: [
		{ user: a, password: a },
		{ user: b, password: b, permissions: {subscribe: "q", allow_responses: true } },
		{ user: c, password: c, permissions: {subscribe: "q", allow_responses: { max: 5, expires: "1m" } } }
	]
}
```

User `a` has no restrictions. User `b` can listen on `q` for requests. If the received request has a reply subject it can reply at most with one message. User `c` can also listen on `q` for requests, but is able to return at most 5 reply messages, and the reply subject can be published at most for `1` minute.


