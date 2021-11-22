# Monitoring

## Monitoring NATS

To monitor the NATS messaging system, `nats-server` provides a lightweight HTTP server on a dedicated monitoring port. The monitoring server provides several endpoints, providing statistics and other information about the following:

* [General Server Information](readme.md#general-information)
* [Connections](readme.md#connection-information)
* [Routing](readme.md#route-information)
* [Leaf Nodes](readme.md#leaf-nodes-information)
* [Subscription Routing](readme.md#subscription-routing-information)
* [Account Information](readme.md#account-information)
* [JetStream Information](readme.md#jetstream-information)

All endpoints return a JSON object.

The NATS monitoring endpoints support [JSONP](https://en.wikipedia.org/wiki/JSONP) and [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works), making it easy to create single page monitoring web applications. Part of the NATS ecosystem is a tool called [nats-top](/using-nats/nats-tools/nats_top) that visualizes data from these endpoints on the command line.

See 
> Warning: `nats-server` does not have authentication/authorization for the monitoring endpoint. When you plan to open your `nats-server` to the internet make sure to not expose the monitoring port as well. By default monitoring binds to every interface `0.0.0.0` so consider setting monitoring to `localhost` or have appropriate firewall rules.
>
> In other words don't do what `http://demo.nats.io:8222/` does! It is done on purpose to simplify the examples below.

### Enabling monitoring from the command line

To enable the monitoring server, start the NATS server with the monitoring flag `-m` and the monitoring port, or turn it on in the [configuration file](readme.md#enable-monitoring-from-the-configuration-file).

```text
-m, --http_port PORT             HTTP PORT for monitoring
-ms,--https_port PORT            Use HTTPS PORT for monitoring
```

Example:

```bash
nats-server -m 8222
```
Output
```text
[4528] 2019/06/01 20:09:58.572939 [INF] Starting nats-server version 2.0.0
[4528] 2019/06/01 20:09:58.573007 [INF] Starting http monitor on port 8222
[4528] 2019/06/01 20:09:58.573071 [INF] Listening for client connections on 0.0.0.0:4222
[4528] 2019/06/01 20:09:58.573090 [INF] nats-server is ready</td>
```

To test, run `nats-server -m 8222`, then go to [http://localhost:8222/](http://localhost:8222/)

### Enable monitoring from the configuration file

You can also enable monitoring using the configuration file as follows:

```yaml
http_port: 8222
```

Binding to `localhost` as well:

```yaml
http: localhost:8222
```

For example, to monitor this server locally, the endpoint would be [http://localhost:8222/varz](http://localhost:8222/varz). It reports various general statistics.

## Monitoring Endpoints

The following sections describe each supported monitoring endpoint: `varz`, `connz`, `routez`, `subsz`, `gatewayz`, `leafz`, `accountz`, and `jsz`. There are not any required arguments, however use of arguments can let you tailor monitoring to your environment and tooling.

### General Information

The `/varz` endpoint returns general information about the server state and configuration.

**Endpoint:** `http://server:port/varz`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

N/A

#### Example

[http://demo.nats.io:8222/varz](http://demo.nats.io:8222/varz)

#### Response

```json
{
  "server_id": "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
  "version": "2.0.0",
  "proto": 1,
  "go": "go1.12",
  "host": "0.0.0.0",
  "port": 4222,
  "max_connections": 65536,
  "ping_interval": 120000000000,
  "ping_max": 2,
  "http_host": "0.0.0.0",
  "http_port": 8222,
  "https_port": 0,
  "auth_timeout": 1,
  "max_control_line": 4096,
  "max_payload": 1048576,
  "max_pending": 67108864,
  "cluster": {},
  "gateway": {},
  "leaf": {},
  "tls_timeout": 0.5,
  "write_deadline": 2000000000,
  "start": "2019-06-24T14:24:43.928582-07:00",
  "now": "2019-06-24T14:24:46.894852-07:00",
  "uptime": "2s",
  "mem": 9617408,
  "cores": 4,
  "gomaxprocs": 4,
  "cpu": 0,
  "connections": 0,
  "total_connections": 0,
  "routes": 0,
  "remotes": 0,
  "leafnodes": 0,
  "in_msgs": 0,
  "out_msgs": 0,
  "in_bytes": 0,
  "out_bytes": 0,
  "slow_consumers": 0,
  "subscriptions": 0,
  "http_req_stats": {
    "/": 0,
    "/connz": 0,
    "/gatewayz": 0,
    "/routez": 0,
    "/subsz": 0,
    "/varz": 1
  },
  "config_load_time": "2019-06-24T14:24:43.928582-07:00"
}
```

### Connection Information

The `/connz` endpoint reports more detailed information on current and recently closed connections. It uses a paging mechanism which defaults to 1024 connections.

**Endpoint:** `http://server:port/connz`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

| Argument | Values | Description |
| :--- | :--- | :--- |
| sort | \(_see sort options_\) | Sorts the results.  Default is connection ID. |
| auth | true, 1, false, 0 | Include username.  Default is false. |
| subs | true, 1, false, 0 or `detail` | Include subscriptions.  Default is false. When set to `detail` a list with more detailed subscription information will be returned. |
| offset | number &gt; 0 | Pagination offset.  Default is 0. |
| limit | number &gt; 0 | Number of results to return.  Default is 1024. |
| cid | number, valid id | Return a connection by it's id |
| state | open, \*closed,  any | Return connections of particular state.  Default is open. |
| mqtt_client | string | Filter the connection with this MQTT client ID. |

_The server will default to holding the last 10,000 closed connections._

**Sort Options**

| Option | Sort by |
| :--- | :--- |
| cid | Connection ID |
| start | Connection start time, same as CID |
| subs | Number of subscriptions |
| pending | Amount of data in bytes waiting to be sent to client |
| msgs_to | Number of messages sent |
| msgs_from | Number of messages received |
| bytes_to | Number of bytes sent |
| bytes_from | Number of bytes received |
| last | Last activity |
| idle | Amount of inactivity |
| uptime | Lifetime of the connection |
| stop | Stop time for a closed connection |
| reason | Reason for a closed connection |

#### Examples

Get up to 1024 connections: [http://demo.nats.io:8222/connz](http://demo.nats.io:8222/connz)

Control limit and offset: [http://demo.nats.io:8222/connz?limit=16&offset=128](http://demo.nats.io:8222/connz?limit=16&offset=128).

Get closed connection information: [http://demo.nats.io:8222/connz?state=closed](http://demo.nats.io:8222/connz?state=closed).

You can also report detailed subscription information on a per connection basis using subs=1. For example: [http://demo.nats.io:8222/connz?limit=1&offset=1&subs=1](http://demo.nats.io:8222/connz?limit=1&offset=1&subs=1).

#### Response

```json
{
  "server_id": "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
  "now": "2019-06-24T14:28:16.520365-07:00",
  "num_connections": 2,
  "total": 2,
  "offset": 0,
  "limit": 1024,
  "connections": [
    {
      "cid": 5,
      "kind": "Client",
      "type": "nats",
      "ip": "127.0.0.1",
      "port": 62714,
      "start": "2021-09-09T23:16:43.040862Z",
      "last_activity": "2021-09-09T23:16:43.042364Z",
      "rtt": "95µs",
      "uptime": "5s",
      "idle": "5s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "name": "NATS Benchmark",
      "lang": "go",
      "version": "1.12.1"
    },
    {
      "cid": 6,
      "kind": "Client",
      "type": "nats",
      "ip": "127.0.0.1",
      "port": 62715,
      "start": "2021-09-09T23:16:43.042557Z",
      "last_activity": "2021-09-09T23:16:43.042811Z",
      "rtt": "100µs",
      "uptime": "5s",
      "idle": "5s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "name": "NATS Benchmark",
      "lang": "go",
      "version": "1.12.1"
    },
    {
      "cid": 7,
      "kind": "Client",
      "type": "mqtt",
      "ip": "::1",
      "port": 62718,
      "start": "2021-09-09T23:16:45.391459Z",
      "last_activity": "2021-09-09T23:16:45.395869Z",
      "rtt": "0s",
      "uptime": "2s",
      "idle": "2s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 2,
      "mqtt_client": "mqtt_sub"
    }
  ]
}
```

### Route Information

The `/routez` endpoint reports information on active routes for a cluster. Routes are expected to be low, so there is no paging mechanism with this endpoint.

**Endpoint:** `http://server:port/routez`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

| Argument | Values | Description |
| :--- | :--- | :--- |
| subs | true, 1, false, 0 or `detail` | Include subscriptions. Default is false. When set to `detail` a list with more detailed subscription information will be returned. |

As noted above, the `routez` endpoint does support the `subs` argument from the `/connz` endpoint. For example: [http://demo.nats.io:8222/routez?subs=1](http://demo.nats.io:8222/routez?subs=1)

#### Example

* Get route information:  [http://demo.nats.io:8222/routez?subs=1](http://demo.nats.io:8222/routez?subs=1)

#### Response

```json
{
  "server_id": "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
  "now": "2019-06-24T14:29:16.046656-07:00",
  "num_routes": 1,
  "routes": [
    {
      "rid": 1,
      "remote_id": "de475c0041418afc799bccf0fdd61b47",
      "did_solicit": true,
      "ip": "127.0.0.1",
      "port": 61791,
      "pending_size": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 0
    }
  ]
}
```

### Gateway Information

The `/gatewayz` endpoint reports information about gateways used to create a NATS supercluster. Like routes, the number of gateways are expected to be low, so there is no paging mechanism with this endpoint.

**Endpoint:** `http://server:port/gatewayz`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

| Argument | Values | Description |
| :--- | :--- | :--- |
| accs | true, 1, false, 0 | Include account information.  Default is false. |
| gw_name | string | Return only remote gateways with this name. |
| acc_name | string | Limit the list of accounts to this account name. |

#### Examples

* Retrieve Gateway Information: [http://demo.nats.io:8222/gatewayz](http://demo.nats.io:8222/gatewayz)

#### Response

```json
{
  "server_id": "NANVBOU62MDUWTXWRQ5KH3PSMYNCHCEUHQV3TW3YH7WZLS7FMJE6END6",
  "now": "2019-07-24T18:02:55.597398-06:00",
  "name": "region1",
  "host": "2601:283:4601:1350:1895:efda:2010:95a1",
  "port": 4501,
  "outbound_gateways": {
    "region2": {
      "configured": true,
      "connection": {
        "cid": 7,
        "ip": "127.0.0.1",
        "port": 5500,
        "start": "2019-07-24T18:02:48.765621-06:00",
        "last_activity": "2019-07-24T18:02:48.765621-06:00",
        "uptime": "6s",
        "idle": "6s",
        "pending_bytes": 0,
        "in_msgs": 0,
        "out_msgs": 0,
        "in_bytes": 0,
        "out_bytes": 0,
        "subscriptions": 0,
        "name": "NCXBIYWT7MV7OAQTCR4QTKBN3X3HDFGSFWTURTCQ22ZZB6NKKJPO7MN4"
      }
    },
    "region3": {
      "configured": true,
      "connection": {
        "cid": 5,
        "ip": "::1",
        "port": 6500,
        "start": "2019-07-24T18:02:48.764685-06:00",
        "last_activity": "2019-07-24T18:02:48.764685-06:00",
        "uptime": "6s",
        "idle": "6s",
        "pending_bytes": 0,
        "in_msgs": 0,
        "out_msgs": 0,
        "in_bytes": 0,
        "out_bytes": 0,
        "subscriptions": 0,
        "name": "NCVS7Q65WX3FGIL2YQRLI77CE6MQRWO2Y453HYVLNMBMTVLOKMPW7R6K"
      }
    }
  },
  "inbound_gateways": {
    "region2": [
      {
        "configured": false,
        "connection": {
          "cid": 9,
          "ip": "::1",
          "port": 52029,
          "start": "2019-07-24T18:02:48.76677-06:00",
          "last_activity": "2019-07-24T18:02:48.767096-06:00",
          "uptime": "6s",
          "idle": "6s",
          "pending_bytes": 0,
          "in_msgs": 0,
          "out_msgs": 0,
          "in_bytes": 0,
          "out_bytes": 0,
          "subscriptions": 0,
          "name": "NCXBIYWT7MV7OAQTCR4QTKBN3X3HDFGSFWTURTCQ22ZZB6NKKJPO7MN4"
        }
      }
    ],
    "region3": [
      {
        "configured": false,
        "connection": {
          "cid": 4,
          "ip": "::1",
          "port": 52025,
          "start": "2019-07-24T18:02:48.764577-06:00",
          "last_activity": "2019-07-24T18:02:48.764994-06:00",
          "uptime": "6s",
          "idle": "6s",
          "pending_bytes": 0,
          "in_msgs": 0,
          "out_msgs": 0,
          "in_bytes": 0,
          "out_bytes": 0,
          "subscriptions": 0,
          "name": "NCVS7Q65WX3FGIL2YQRLI77CE6MQRWO2Y453HYVLNMBMTVLOKMPW7R6K"
        }
      },
      {
        "configured": false,
        "connection": {
          "cid": 8,
          "ip": "127.0.0.1",
          "port": 52026,
          "start": "2019-07-24T18:02:48.766173-06:00",
          "last_activity": "2019-07-24T18:02:48.766999-06:00",
          "uptime": "6s",
          "idle": "6s",
          "pending_bytes": 0,
          "in_msgs": 0,
          "out_msgs": 0,
          "in_bytes": 0,
          "out_bytes": 0,
          "subscriptions": 0,
          "name": "NCKCYK5LE3VVGOJQ66F65KA27UFPCLBPX4N4YOPOXO3KHGMW24USPCKN"
        }
      }
    ]
  }
}
```

### Leaf Node Information

The `/leafz` endpoint reports detailed information about the leaf node connections.

**Endpoint:** `http://server:port/leafz`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

| Argument | Values | Description |
| :--- | :--- | :--- |
| subs | true, 1, false, 0 | Include internal subscriptions.  Default is false. |

As noted above, the `leafz` endpoint does support the `subs` argument from the `/connz` endpoint. For example: [http://demo.nats.io:8222/leafz?subs=1](http://demo.nats.io:8222/leafz?subs=1)

#### Example

* Get leaf nodes information:  [http://demo.nats.io:8222/leafz?subs=1](http://demo.nats.io:8222/leafz?subs=1)

#### Response

```json
{
  "server_id": "NC2FJCRMPBE5RI5OSRN7TKUCWQONCKNXHKJXCJIDVSAZ6727M7MQFVT3",
  "now": "2019-08-27T09:07:05.841132-06:00",
  "leafnodes": 1,
  "leafs": [
    {
      "account": "$G",
      "ip": "127.0.0.1",
      "port": 6223,
      "rtt": "200µs",
      "in_msgs": 0,
      "out_msgs": 10000,
      "in_bytes": 0,
      "out_bytes": 1280000,
      "subscriptions": 1,
      "subscriptions_list": [
        "foo"
      ]
    }
  ]
}
```

### Subscription Routing Information

The `/subsz` endpoint reports detailed information about the current subscriptions and the routing data structure. It is not normally used.

**Endpoint:** `http://server:port/subsz`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

| Argument | Values | Description |
| :--- | :--- | :--- |
| subs | true, 1, false, 0 | Include subscriptions.  Default is false. |
| offset | integer &gt; 0 | Pagination offset.  Default is 0. |
| limit | integer &gt; 0 | Number of results to return.  Default is 1024. |
| test | subject | Test whether a subsciption exists. |

#### Example

* Get subscription routing information:  [http://demo.nats.io:8222/subsz](http://demo.nats.io:8222/subsz)

#### Response

```json
{
  "num_subscriptions": 2,
  "num_cache": 0,
  "num_inserts": 2,
  "num_removes": 0,
  "num_matches": 0,
  "cache_hit_rate": 0,
  "max_fanout": 0,
  "avg_fanout": 0
}
```

### Account Information

The `/accountz` endpoint reports information on a server's active accounts. The default behavior is to return a list of all accounts known to the server.

**Endpoint:** `http://server:port/accountz`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

| Argument | Value | Description |
| :--- | :--- | :--- |
| acc | account name | Include metrics for the specified account. Default is empty. When not set, a list of all accounts is included. |

#### Example

* Get list of all accounts:  [http://demo.nats.io:8222/accountz](http://demo.nats.io:8222/accountz)
* Get details for specific account `$G`:  [http://demo.nats.io:8222/accountz?acc=$G](http://demo.nats.io:8222/accountz?acc=$G)

#### Response

Default behavior:

```json
{
  "server_id": "NAB2EEQ3DLS2BHU4K2YMXMPIOOOAOFOAQAC5NQRIEUI4BHZKFBI4ZU4A",
  "now": "2021-02-08T17:31:29.551146-05:00",
  "system_account": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
  "accounts": [
    "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
    "$G"
  ]
}
```

Retrieve specific account:

```json
{
  "server_id": "NAB2EEQ3DLS2BHU4K2YMXMPIOOOAOFOAQAC5NQRIEUI4BHZKFBI4ZU4A",
  "now": "2021-02-08T17:37:55.80856-05:00",
  "system_account": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
  "account_detail": {
    "account_name": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
    "update_time": "2021-02-08T17:31:22.390334-05:00",
    "is_system": true,
    "expired": false,
    "complete": true,
    "jetstream_enabled": false,
    "leafnode_connections": 0,
    "client_connections": 0,
    "subscriptions": 42,
    "exports": [
      {
        "subject": "$SYS.DEBUG.SUBSCRIBERS",
        "type": "service",
        "response_type": "Singleton"
      }
    ],
    "jwt": "eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJVVlU2VEpXRU8zS0hYWTZVMkgzM0RCVklET1A3U05DTkJPMlM0M1dPNUM2T1RTTDNVSUxBIiwiaWF0IjoxNjAzNDczNzg4LCJpc3MiOiJPQlU1TzVGSjMyNFVEUFJCSVZSR0Y3Q05FT0hHTFBTN0VZUEJUVlFaS1NCSElJWklCNkhENjZKRiIsIm5hbWUiOiJTWVMiLCJzdWIiOiJBQUFYQVVWU0dLN1RDUkhGSVJBUzRTWVhWSjc2RVdETU5YWk02QVJGR1hQN0JBU05ER0xLVTdBNSIsInR5cGUiOiJhY2NvdW50IiwibmF0cyI6eyJsaW1pdHMiOnsic3VicyI6LTEsImNvbm4iOi0xLCJsZWFmIjotMSwiaW1wb3J0cyI6LTEsImV4cG9ydHMiOi0xLCJkYXRhIjotMSwicGF5bG9hZCI6LTEsIndpbGRjYXJkcyI6dHJ1ZX19fQ.CeGo16i5oD0b1uBJ8UdGmLH-l9dL8yNqXHggkAt2T5c88fM7k4G08wLguMAnlvzrdlYvdZvOx_5tHLuDZmGgCg",
    "issuer_key": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
    "name_tag": "SYS",
    "decoded_jwt": {
      "jti": "UVU6TJWEO3KHXY6U2H33DBVIDOP7SNCNBO2S43WO5C6OTSL3UILA",
      "iat": 1603473788,
      "iss": "OBU5O5FJ324UDPRBIVRGF7CNEOHGLPS7EYPBTVQZKSBHIIZIB6HD66JF",
      "name": "SYS",
      "sub": "AAAXAUVSGK7TCRHFIRAS4SYXVJ76EWDMNXZM6ARFGXP7BASNDGLKU7A5",
      "nats": {
        "limits": {
          "subs": -1,
          "data": -1,
          "payload": -1,
          "imports": -1,
          "exports": -1,
          "wildcards": true,
          "conn": -1,
          "leaf": -1
        },
        "default_permissions": {
          "pub": {},
          "sub": {}
        },
        "type": "account",
        "version": 1
      }
    },
    "sublist_stats": {
      "num_subscriptions": 42,
      "num_cache": 6,
      "num_inserts": 42,
      "num_removes": 0,
      "num_matches": 6,
      "cache_hit_rate": 0,
      "max_fanout": 1,
      "avg_fanout": 0.8333333333333334
    }
  }
}
```

### JetStream Information

The `/jsz` endpoint reports more detailed information on JetStream. For accounts, it uses a paging mechanism that defaults to 1024 connections.

**Endpoint:** `http://server:port/jsz`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

| Argument | Values | Description |
| :--- | :--- | :--- |
| acc | account name | Include metrics for the specified account. Default is unset. |
| accounts | true, 1, false, 0 | Include account specific JetStream information. Default is false. |
| streams | true, 1, false, 0 | Include streams. When set, implies `accounts=true`. Default is false. |
| consumers | true, 1, false, 0 | Include consumer. When set, implies `streams=true`. Default is false. |
| config | true, 1, false, 0 | When stream or consumer are requested, include their respective configuration. Default is false. |
| leader-only | true, 1, false, 0 | Only the leader responds. Default is false. |
| offset | number &gt; 0 | Pagination offset. Default is 0. |
| limit | number &gt; 0 | Number of results to return. Default is 1024. |

#### Examples

Get basic JetStream information: [http://demo.nats.io:8222/jsz](http://demo.nats.io:8222/jsz)

Request accounts and control limit and offset: [http://demo.nats.io:8222/jsz?accounts=true&limit=16&offset=128](http://demo.nats.io:8222/jsz?accounts=true&limit=16&offset=128).

You can also report detailed consumer information on a per connection basis using consumer=true. For example: [http://demo.nats.io:8222/jsz?consumers=true](http://demo.nats.io:8222/jsz/consumer=true).

#### Response

```json
{
  "server_id": "NCVIDODSZ45C5OD67ZD7EJUIJPQDP6CM74SJX6TJIF2G7NLYS5LCVYHS",
  "now": "2021-02-08T19:08:30.555533-05:00",
  "config": {
    "max_memory": 10485760,
    "max_storage": 10485760,
    "store_dir": "/var/folders/9h/6g_c9l6n6bb8gp331d_9y0_w0000gn/T/srv_7500251552558"
  },
  "memory": 0,
  "storage": 66,
  "api": {
    "total": 5,
    "errors": 0
  },
  "total_streams": 1,
  "total_consumers": 1,
  "total_messages": 1,
  "total_message_bytes": 33,
  "meta_cluster": {
    "name": "cluster_name",
    "replicas": [
      {
        "name": "server_5500",
        "current": false,
        "active": 2932926000
      }
    ]
  },
  "account_details": [
    {
      "name": "BCC_TO_HAVE_ONE_EXTRA",
      "id": "BCC_TO_HAVE_ONE_EXTRA",
      "memory": 0,
      "storage": 0,
      "api": {
        "total": 0,
        "errors": 0
      }
    },
    {
      "name": "ACC",
      "id": "ACC",
      "memory": 0,
      "storage": 66,
      "api": {
        "total": 5,
        "errors": 0
      },
      "stream_detail": [
        {
          "name": "my-stream-replicated",
          "cluster": {
            "name": "cluster_name",
            "replicas": [
              {
                "name": "server_5500",
                "current": false,
                "active": 2931517000
              }
            ]
          },
          "state": {
            "messages": 1,
            "bytes": 33,
            "first_seq": 1,
            "first_ts": "2021-02-09T00:08:27.623735Z",
            "last_seq": 1,
            "last_ts": "2021-02-09T00:08:27.623735Z",
            "consumer_count": 1
          },
          "consumer_detail": [
            {
              "stream_name": "my-stream-replicated",
              "name": "my-consumer-replicated",
              "created": "2021-02-09T00:08:27.427631Z",
              "delivered": {
                "consumer_seq": 0,
                "stream_seq": 0
              },
              "ack_floor": {
                "consumer_seq": 0,
                "stream_seq": 0
              },
              "num_ack_pending": 0,
              "num_redelivered": 0,
              "num_waiting": 0,
              "num_pending": 1,
              "cluster": {
                "name": "cluster_name",
                "replicas": [
                  {
                    "name": "server_5500",
                    "current": false,
                    "active": 2933232000
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Creating Monitoring Applications

NATS monitoring endpoints support [JSONP](https://en.wikipedia.org/wiki/JSONP) and [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works). You can easily create single page web applications for monitoring. To do this you simply pass the `callback` query parameter to any endpoint.

For example:

```text
http://demo.nats.io:8222/connz?callback=cb
```

Here is a JQuery example implementation:

```javascript
$.getJSON('http://demo.nats.io:8222/connz?callback=?', function(data) {
  console.log(data);
});
```

## Monitoring Tools

In addition to writing custom monitoring tools, you can monitor nats-server in Prometheus. The [Prometheus NATS Exporter](https://github.com/nats-io/prometheus-nats-exporter) allows you to configure the metrics you want to observe and store in Prometheus. There's a sample [Grafana](https://grafana.com) dashboard that you can use to visualize the server metrics.

