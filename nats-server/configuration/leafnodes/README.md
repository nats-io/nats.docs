# Leaf Nodes

A _Leaf Node_ extends an existing NATS system of any size, optionally bridging both operator and security domains. A leafnode server will transparently route messages as needed from local clients to one or more remote NATS system(s) and vice versa. The leaf node authenticates and authorizes clients using a local policy. Messages are allowed to flow to the cluster or into the leaf node based on leaf node connection permissions of either.

Leaf nodes are useful in IoT and edge scenarios and when the local server traffic should be low RTT and local unless routed to the super cluster. NATS' queue semantics are honored across leaf connections by serving local queue consumer first.

* Clients to leaf nodes authenticate locally (or just connect if authentication is not required)
* Traffic between the leaf node and the cluster assumes the restrictions of the user configuration used to create the leaf connection.
  * Subjects that the user is allowed to publish are exported to the cluster.
  * Subjects the user is allowed to subscribe to, are imported into the leaf node.

Unlike [cluster](../clustering/) or [gateway](../gateways/) nodes, leaf nodes do not need to be reachable themselves and can be used to explicitly configure any acyclic graph topologies.

If a leaf node connects to a cluster, it is recommended to configure it with knowledge of **all** _seed servers_ and have **each** _seed server_ accept connections from leaf nodes. Should the remote cluster's configuration change, the discovery protocol will gossip peers capable of accepting leaf connections. A leaf node can have multiple remotes, each connecting to a different cluster. Each URL in a remote needs to point to the same cluster. If one node in a cluster is configured as leaf node, **all** nodes need to. Likewise, if one server in a cluster accepts leaf node connections, **all** servers need to.

> Leaf Nodes are an important component as a way to bridge traffic between local NATS servers you control and servers that are managed by a third-party. [Synadia's NGS](https://synadia.com/ngs) allows accounts to use leaf nodes, but gain accessibility to the global network to inexpensively connect geographically distributed servers or small clusters.

[LeafNode Configuration Options](leafnode_conf.md)

## LeafNode Configuration Tutorial

The main server is just a standard NATS server. Clients to the main cluster are just using token authentication, but any kind of authentication can be used. The server allows leaf node connections at port 7422 (default port):

```
leafnodes {
    port: 7422
}
authorization {
    token: "s3cr3t"
}
```

Start the server:

```bash
nats-server -c /tmp/server.conf
```
Output extract
```text
...
[5774] 2019/12/09 11:11:23.064276 [INF] Listening for leafnode connections on 0.0.0.0:7422
...
```

We create a replier on the server to listen for requests on 'q', which it will aptly respond with '42':

```bash
nats-rply -s nats://s3cr3t@localhost q 42
```

The leaf node, allows local clients to connect to through port 4111, and doesn't require any kind of authentication. The configuration specifies where the remote cluster is located, and specifies how to connect to it (just a simple token in this case):

```
listen: "127.0.0.1:4111"
leafnodes {
    remotes = [ 
        { 
          url: "nats://s3cr3t@localhost"
        },
    ]
}
```

In the case where the remote leaf connection is connecting with `tls`:

```
listen: "127.0.0.1:4111"
leafnodes {
    remotes = [ 
        { 
          url: "tls://s3cr3t@localhost"
        },
    ]
}
```

Note the leaf node configuration lists a number of `remotes`. The `url` specifies the port on the server where leaf node connections are allowed.

Start the leaf node server:

```bash
nats-server -c /tmp/leaf.conf 
```
Output extract
```text
....
[3704] 2019/12/09 09:55:31.548308 [INF] Listening for client connections on 127.0.0.1:4111
...
[3704] 2019/12/09 09:55:31.549404 [INF] Connected leafnode to "localhost"
```

Connect a client to the leaf server and make a request to 'q':

```bash
nats-req -s nats://127.0.0.1:4111 q ""
```
Output
```text
Published [q] : ''
Received  [_INBOX.Ua82OJamRdWof5FBoiKaRm.gZhJP6RU] : '42'
```

## Leaf Node Example Using a Remote Global Service

In this example, we connect a leaf node to Synadia's [NGS](https://www.synadia.com/ngs). Leaf nodes are supported on developer and paid accounts. To sign up for a developer account, you'll need the `ngs` tool which you can install by following instructions in [https://github.com/ConnectEverything/ngs-cli](https://github.com/ConnectEverything/ngs-cli).

Once you have the ngs tool installed, you can go ahead and import the synadia operator from ngs:

```bash
nsc add operator -u synadia
```
Output
```text
[ OK ] imported operator "synadia"
```

Add (or create) an account named 'leaftest'

```shell
nsc add account leaftest
```
Output
```text
[ OK ] generated and stored account key "ACR4E2VU2ZC4GPTGOLL6GLO3WHUBBIQBM2JWOGRCEJJQEV6SVXL64JWD"
[ OK ] push jwt to account server:
    [ OK ] pushed account jwt to the account server
    > NGS created a new free billing account for your JWT, leaftest [ACR4E2VU2ZC4].
    > Use the 'ngs' command to manage your billing plan.
    > If your account JWT is *not* in ~/.nsc, use the -d flag on ngs commands to locate it.
[ OK ] pull jwt from account server
[ OK ] added account "leaftest" to operator "Synadia Communications Inc."
```

In order to use leaf nodes, you'll have to upgrade the account to the developer plan. The developer plan has zero cost, but requires specifying an email and providing a credit card number:

```bash
ngs edit
```
Output
```text

Please select your new plan. For a complete description of offerings,
please visit our website at https://www.https://www.synadia.com/.

? Select a Messaging Plan Developer $0.00/month

Synadia will report service notifications and billing updates with the
email address you associate with your account. This address will be
verified if changed.

? Email natsuser@test.com

╭────────────────────────────────╮
│        Account Details         │
├────────┬───────────────────────┤
│ Email: │ natsuser@test.com     |
│ Plan:  │ Developer $0.00/month │
╰────────┴───────────────────────╯


? Check your account details OK

Your changes were sent to Synadia, but it looks like we need to verify
your email and credit card before updating your account. You should
receive a welcome email shortly.
Once the update succeeds use nsc to sync the latest version of your
synadia account JWT to disk.
```

Check your email, verify the email, and specify an credit card, after that:

```bash
nsc pull
```
Output
```text
[ OK ] pulled "leaftest" from the account server
```
Show the account info
```shell
nsc describe account
```
Example output
```text
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ leaftest                                                 │
│ Account ID                │ ACR4E2VU2ZC4GPTGOLL6GLO3WHUBBIQBM2JWOGRCEJJQEV6SVXL64JWD │
│ Issuer ID                 │ ODSKBNDIT3LTZWFSRAWOBXSBZ7VZCDQVU6TBJX3TQGYXUWRU46ANJJS4 │
│ Issued                    │ 2019-12-09 14:44:55 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ 50                                                       │
│ Max Leaf Node Connections │ 2                                                        │
│ Max Data                  │ 5.0 GB (5000000000 bytes)                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ 4.0 kB (4000 bytes)                                      │
│ Max Subscriptions         │ 50                                                       │
│ Exports Allows Wildcards  │ False                                                    │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

....
```

Note the limits on the account, specify that the account can have up-to 2 leaf node connections. Let's use them:

```bash
nsc add user leaftestuser
```
Example output
```text
[ OK ] generated and stored user key "UB5QBEU4LU7OR26JEYSG27HH265QVUFGXYVBRD7SVKQJMEFSZTGFU62F"
[ OK ] generated user creds file "~/.nkeys/creds/synadia/leaftest/leaftestuser.creds"
[ OK ] added user "leaftestuser" to account "leaftest"
```

Let's craft a leaf node connection much like we did earlier:

```
leafnodes {
    remotes = [ 
        { 
          url: "tls://connect.ngs.global"
          credentials: "/Users/alberto/.nkeys/creds/synadia/leaftest/leaftestuser.creds"
        },
    ]
}
```

The default port for leaf nodes is 7422, so we don't have to specify it.

Let's start the leaf server:

```bash
nats-server -c /tmp/ngs_leaf.conf 
```
Output
```text
...
[4985] 2019/12/09 10:55:51.577569 [INF] Listening for client connections on 0.0.0.0:4222
...
[4985] 2019/12/09 10:55:51.918781 [INF] Connected leafnode to "connect.ngs.global"
```

Again, let's connect a replier, but this time to Synadia's NGS. NSC connects specifying the credentials file:

```bash
nsc reply q 42
```

And now let's make the request from the local host:

```bash
nats-req q ""
```
Example output
```text
Published [q] : ''
Received  [_INBOX.hgG0zVcVcyr4G5KBwOuyJw.uUYkEyKr] : '42'
```

## Leaf Authorization

In some cases you may want to restrict what messages can be exported from the leaf node or imported from the leaf connection. You can specify restrictions by limiting what the leaf connection client can publish and subscribe to. See [NATS Authorization](../securing_nats/authorization.md) for how you can do this.
