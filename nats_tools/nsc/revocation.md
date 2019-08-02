# Revocation

NATS supports two types of revocations. Both of these are stored in the Account JWT, so that the nats-server can see the revocations and apply them.

Users are revoked by public key and time. Access to an export, called an activation, can be revoked for a specific account at a specific time. The use of time here can be confusing, but is designed to support the primary uses of revocation.

When a user or activation is revoked at time T, it means that any user JWT or activation token created before that time is invalid. If a new user JWT or new activation token is created after T it can be used. This allows an account owner to revoke a user and renew their access at the same time.

Let's look at an example. Suppose you created a user JWT with access to the subject "billing". Later you decide you don't want that user to have access to "billing". Revoke the user, say at noon on May 1st 2019, and create a new user JWT without access to "billing". The user can no longer log in with the old JWT because it is revoked, but they can log in with the new JWT because it was created after noon May 1st 2019.

More ....