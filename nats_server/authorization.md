## Authorization

The NATS server supports authorization using subject-level permissions on a per-user basis. Permission-based authorization is available with [multi-user authentication](/documentation/managing_the_server/authentication/).

Each permission grant is an object with two fields: what subject(s) the authenticated user can publish to, and what subject(s) the authenticated user can subscribe to. The parser is generous at understanding what the intent is, so both arrays and singletons are processed. Subjects themselves can contain wildcards. Permissions can make use of [variables](/documentation/managing_the_server/configuration).

You set permissions by creating an entry inside of the `authorization` configuration block that conforms to the following syntax:

```ascii
authorization {
  PERMISSION_NAME = {
    publish = "singleton" or ["array", ...]
    subscribe = "singleton" or ["array", ...]
  }
}
```

**Important Note** NATS Authorizations are whitelist only, meaning in order to not break request/reply patterns you need to add rules as above with Alice and Bob for the `_INBOX.>` pattern. If an unauthorized client publishes or attempts to subscribe to a subject that has not been whitelisted, the action fails and is logged at the server, and an error message is returned to the client.

### Example

Here is an example authorization configuration that defines four users, three of whom are assigned explicit permissions.

```ascii
authorization {
  ADMIN = {
    publish = ">"
    subscribe = ">"
  }
  REQUESTOR = {
    publish = ["req.foo", "req.bar"]
    subscribe = "_INBOX.>"
  }
  RESPONDER = {
    subscribe = ["req.foo", "req.bar"]
    publish = "_INBOX.>"
  }
  DEFAULT_PERMISSIONS = {
    publish = "SANDBOX.*"
    subscribe = ["PUBLIC.>", "_INBOX.>"]
  }
  PASS: abcdefghijklmnopqrstuvwxwz0123456789
  users = [
    {user: joe,     password: foo,   permissions: $ADMIN}
    {user: alice,   password: bar,   permissions: $REQUESTOR}
    {user: bob,     password: $PASS, permissions: $RESPONDER}
    {user: charlie, password: bar}
  ]
}
```

Since Joe is an ADMIN he can publish/subscribe on any subject. We use the wildcard `>` to match any subject.

Alice is a REQUESTOR and can publish requests on subjects `req.foo` or `req.bar`, and subscribe to anything that is a response (`_INBOX.>`).

Charlie has no permissions granted and therefore inherits the default permission set. You set the inherited default permissions by assigning them to the default_permissions entry inside of the authorization configuration block.

Bob is a RESPONDER to any of Alice's requests, so Bob needs to be able to subscribe to the request subjects and respond to Alice's reply subject which will be an `_INBOX.>`.