# Configuration

The following is a short tutorial on how you can activate a system account to:

* receive periodic updates from the server
* send requests to the server
* send an account update to the server

## Events and Services

The system account publishes messages under well known subject patterns.

Server initiated events:

* `$SYS.ACCOUNT.<id>.CONNECT` \(client connects\)
* `$SYS.ACCOUNT.<id>.DISCONNECT` \(client disconnects\)
* `$SYS.SERVER.ACCOUNT.<id>.CONNS` \(connections for an account changed\)
* `$SYS.SERVER.<id>.CLIENT.AUTH.ERR` \(authentication error\)
* `$SYS.ACCOUNT.<id>.LEAFNODE.CONNECT` \(leaf node connnects\)
* `$SYS.ACCOUNT.<id>.LEAFNODE.DISCONNECT` \(leaf node disconnects\)
* `$SYS.SERVER.<id>.STATSZ` \(stats summary\)

In addition other tools with system account privileges, can initiate requests:

* `$SYS.REQ.SERVER.<id>.STATSZ` \(request server stat summary\)
* `$SYS.REQ.SERVER.PING` \(discover servers - will return multiple messages\)

Servers like `nats-account-server` publish system account messages when a claim is updated, the nats-server listens for them, and updates its account information accordingly:

* `$SYS.ACCOUNT.<id>.CLAIMS.UPDATE`

With these few messages you can build fairly surprisingly useful monitoring tools:

* health/load of your servers
* client connects/disconnects
* account connections
* authentication errors

## Enabling System Events

To enable and access system events, you'll have to:

* Create an Operator, Account and User
* Run a NATS Account Server \(or Memory Resolver\)

### Create an Operator, Account, User

Let's create an operator, system account and system account user:

```text
# Create an operator if you 
> nsc add operator -n SAOP
Generated operator key - private key stored "~/.nkeys/SAOP/SAOP.nk"
Success! - added operator "SAOP"

# Add the system account
> nsc add account -n SYS
Generated account key - private key stored "~/.nkeys/SAOP/accounts/SYS/SYS.nk"
Success! - added account "SYS"

# Add a system account user
> nsc add user -n SYSU
Generated user key - private key stored "~/.nkeys/SAOP/accounts/SYS/users/SYSU.nk"
Generated user creds file "~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds"
Success! - added user "SYSU" to "SYS"
```

By default, the operator JWT can be found in `~/.nsc/nats/<operator_name>/<operator.name>.jwt`.

### Nats-Account-Server

To vend the credentials to the nats-server, we'll use a [nats-account-server](../../../nats-tools/nas/). Let's start a nats-account-server to serve the JWT credentials:

```text
> nats-account-server -nsc ~/.nsc/nats/SAOP
```

The server will by default vend JWT configurations on the an endpoint at: `http(s)://<server_url>/jwt/v1/accounts/`.

### NATS Server Configuration

The server configuration will need:

* The operator JWT - \(`~/.nsc/nats/<operator_name>/<operator.name>.jwt`\)
* The URL where the server can resolve accounts \(`http://localhost:9090/jwt/v1/accounts/`\)
* The public key of the `system_account`

The only thing we don't have handy is the public key for the system account. We can get it easy enough:

```text
> nsc list accounts -W
╭─────────────────────────────────────────────────────────────────╮
│                            Accounts                             │
├──────┬──────────────────────────────────────────────────────────┤
│ Name │ Public Key                                               │
├──────┼──────────────────────────────────────────────────────────┤
│ SYS  │ ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF │
╰──────┴──────────────────────────────────────────────────────────╯
```

Because the server has additional resolver implementations, you need to enclose the server url like: `URL(<url>)`.

Let's create server config with the following contents and save it to `server.conf`:

```text
operator: /Users/synadia/.nsc/nats/SAOP/SAOP.jwt
system_account: ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

Let's start the nats-server:

```text
> nats-server -c server.conf
```

## Inspecting Server Events

Let's add a subscriber for all the events published by the system account:

```text
> nats-sub -creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds ">"
```

Very quickly we'll start seeing messages from the server as they are published by the NATS server. As should be expected, the messages are just JSON, so they can easily be inspected even if just using a simple `nats-sub` to read them.

To see an an account update:

```text
> nats-pub -creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds foo bar
```

The subscriber will print the connect and disconnect:

```text
  "server": {
    "host": "0.0.0.0",
    "id": "NBTGVY3OKDKEAJPUXRHZLKBCRH3LWCKZ6ZXTAJRS2RMYN3PMDRMUZWPR",
    "ver": "2.0.0-RC5",
    "seq": 32,
    "time": "2019-05-03T14:53:15.455266-05:00"
  },
  "acc": "ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF",
  "conns": 1,
  "total_conns": 1
}'
  "server": {
    "host": "0.0.0.0",
    "id": "NBTGVY3OKDKEAJPUXRHZLKBCRH3LWCKZ6ZXTAJRS2RMYN3PMDRMUZWPR",
    "ver": "2.0.0-RC5",
    "seq": 33,
    "time": "2019-05-03T14:53:15.455304-05:00"
  },
  "client": {
    "start": "2019-05-03T14:53:15.453824-05:00",
    "host": "127.0.0.1",
    "id": 6,
    "acc": "ADWJVSUSEVC2GHL5GRATN2LOEOQOY2E6Z2VXNU3JEIK6BDGPWNIW3AXF",
    "user": "UACPEXCAZEYWZK4O52MEGWGK4BH3OSGYM3P3C3F3LF2NGNZUS24IVG36",
    "name": "NATS Sample Publisher",
    "lang": "go",
    "ver": "1.7.0",
    "stop": "2019-05-03T14:53:15.45526-05:00"
  },
  "sent": {
    "msgs": 1,
    "bytes": 3
  },
  "received": {
    "msgs": 0,
    "bytes": 0
  },
  "reason": "Client Closed"
}'
```

## `$SYS.REQ.SERVER.PING` - Discovering Servers

To discover servers in the cluster, and get a small heath summary, publish a request to `$SYS.REQ.SERVER.PING`. Note that while the example below uses `nats-req`, only the first answer for the request will be printed. You can easily modify the example to wait until no additional responses are received for a specific amount of time, thus allowing for all responses to be collected.

```text
> nats-req -creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds \$SYS.REQ.SERVER.PING ""
Published [$SYS.REQ.SERVER.PING] : ''
Received  [_INBOX.G5mbsf0k7l7nb4eWHa7GTT.omklmvnm] : '{
  "server": {
    "host": "0.0.0.0",
    "id": "NCZQDUX77OSSTGN2ESEOCP4X7GISMARX3H4DBGZBY34VLAI4TQEPK6P6",
    "ver": "2.0.0-RC9",
    "seq": 47,
    "time": "2019-05-02T14:02:46.402166-05:00"
  },
  "statsz": {
    "start": "2019-05-02T13:41:01.113179-05:00",
    "mem": 12922880,
    "cores": 20,
    "cpu": 0,
    "connections": 2,
    "total_connections": 2,
    "active_accounts": 1,
    "subscriptions": 10,
    "sent": {
      "msgs": 7,
      "bytes": 2761
    },
    "received": {
      "msgs": 0,
      "bytes": 0
    },
    "slow_consumers": 0
  }
}'
```

## `$SYS.SERVER.<id>.STATSZ` - Requesting Server Stats Summary

If you know the server id for a particular server \(such as from a response to `$SYS.REQ.SERVER.PING`\), you can query the specific server for its health information:

```text
nats-req -creds ~/.nkeys/SAOP/accounts/SYS/users/SYSU.creds \$SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.STATSZ ""
Published [$SYS.REQ.SERVER.NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL.STATSZ] : ''
Received  [_INBOX.DQD44ugVt0O4Ur3pWIOOD1.WQOBevoq] : '{
  "server": {
    "host": "0.0.0.0",
    "id": "NC7AKPQRC6CIZGWRJOTVFIGVSL7VW7WXTQCTUJFNG7HTCMCKQTGE5PUL",
    "ver": "2.0.0-RC5",
    "seq": 25,
    "time": "2019-05-03T14:34:02.066077-05:00"
  },
  "statsz": {
    "start": "2019-05-03T14:32:19.969037-05:00",
    "mem": 11874304,
    "cores": 20,
    "cpu": 0,
    "connections": 2,
    "total_connections": 4,
    "active_accounts": 1,
    "subscriptions": 10,
    "sent": {
      "msgs": 26,
      "bytes": 9096
    },
    "received": {
      "msgs": 2,
      "bytes": 0
    },
    "slow_consumers": 0
  }
}'
```

