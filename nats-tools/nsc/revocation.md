# Revocation

NATS supports two types of revocations. Both of these are stored in the Account JWT, so that the nats-server can see the revocations and apply them.

Users are revoked by public key and time. Access to an export, called an activation, can be revoked for a specific account at a specific time. The use of time here can be confusing, but is designed to support the primary uses of revocation.

When a user or activation is revoked at time T, it means that any user JWT or activation token created before that time is invalid. If a new user JWT or new activation token is created after T it can be used. This allows an account owner to revoke a user and renew their access at the same time.

Let's look at an example. Suppose you created a user JWT with access to the subject "billing". Later you decide you don't want that user to have access to "billing". Revoke the user, say at noon on May 1st 2019, and create a new user JWT without access to "billing". The user can no longer log in with the old JWT because it is revoked, but they can log in with the new JWT because it was created after noon May 1st 2019.

`nsc` provides a number of commands to create, remove or list revocations:

```bash
Usage:
  nsc revocations [command]

Available Commands:
  add_activation    Revoke an accounts access to an export
  add_user          Revoke a user
  delete_activation Remove an account revocation from an export
  delete_user       Remove a user revocation
  list_activations  List account revocations for an export
  list_users        List users revoked in an account
```

Both add commands take the flag `--at` which defaults to 0, for now, which can be used to set the unix timestamp as described above. By default revocations are at the current time, but you can set them in the past for situations where you know when a problem occurred and was fixed.

Deleting a revocation is permanent and can allow an old activation or user JWT to be valid again. Therefore delete should only be used if you are sure the tokens in question have expired.

### Pushing the changes to the nats servers

If your nats servers are configured to use the built-in NATS resolver, remember that you need to 'push' any account changes you may have done (locally) using `nsc revocations` to the servers for those changes to take effect.

i.e. `ncs push -i` or `nsc push -a B -u nats://localhost`

If there are any clients currently connected with as a user that gets added to the revocations, their connections will be immediately terminated as soon as you 'push' your revocations to a nats server.
