# Deploying and Migrating Accounts

`nsc` can be used to manage multiple operators. Operators can be thought of as the owners of nats-servers, and fall into two categories: local and managed. The key difference, pardon the pun, is that managed operators are ones which you don't have the nkey for. An example of a managed operator is the Synadia service called NGS. Synadia has the keys.

Accounts, as represented by their JWTs, can be available on multiple nats-servers potentially owned by different operators. Some operators may use local copies of JWTs, others may use the [nats-account-server](../nas/README.md) to manage their JWTS. Synadia uses a custom server for their JWTs that works similarly to the open-sourced account server.

Moving accounts between operators comes in three forms:

* Deployment occurs when you copy an account JWT to a new operator, often by uploading it to their account server.
* Migration is the process of copying an account to a new operator
* Importing ????

Something about push
Something about sync
