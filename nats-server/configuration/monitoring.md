# Monitoring

## Monitoring NATS

To monitor the NATS messaging system, `nats-server` provides a lightweight HTTP server on a dedicated monitoring port. The monitoring server provides several endpoints, providing statistics and other information about the following:

* [General Server Information](monitoring.md#general-information)
* [Connections](monitoring.md#connection-information)
* [Routing](monitoring.md#route-information)
* [Gateways](monitoring.md#gateway-information)
* [Leaf Nodes](monitoring.md#leaf-nodes-information)
* [Subscription Routing](monitoring.md#subscription-routing-information)

All endpoints return a JSON object.

The NATS monitoring endpoints support [JSONP](https://en.wikipedia.org/wiki/JSONP) and [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works), making it easy to create single page monitoring web applications. Part of the NATS ecosystem is a tool called [nats-top](../../nats-tools/nats_top/) that visualizes data from these endpoints on the command line.

> Warning: `nats-server` does not have authentication/authorization for the monitoring endpoint. When you plan to open your `nats-server` to the internet make sure to not expose the monitoring port as well. By default monitoring binds to every interface `0.0.0.0` so consider setting monitoring to `localhost` or have appropriate firewall rules.
>
> In other words don't do what `http://demo.nats.io:8222/` does! It is done on purpose to simplify the examples below.

### Enabling monitoring from the command line

To enable the monitoring server, start the NATS server with the monitoring flag `-m` and the monitoring port, or turn it on in the [configuration file](monitoring.md#enable-monitoring-from-the-configuration-file).

```text
-m, --http_port PORT             HTTP PORT for monitoring
-ms,--https_port PORT            Use HTTPS PORT for monitoring
```

Example:

```bash
$ nats-server -m 8222
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

## Monitoring endpoints

The following sections describe each supported monitoring endpoint: `varz`, `connz`, `routez`, `subsz`, `gatewayz`, and `leafz`. There are not any required arguments, however use of arguments can let you tailor monitoring to your environment and tooling.

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

```javascript
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

_The server will default to holding the last 10,000 closed connections._

**Sort Options**

| Option | Sort by |
| :--- | :--- |
| cid | Connection ID |
| start | Connection start time, same as CID |
| subs | Number of subscriptions |
| pending | Amount of data in bytes waiting to be sent to client |
| msgs\_to | Number of messages sent |
| msgs\_from | Number of messages received |
| bytes\_to | Number of bytes sent |
| bytes\_from | Number of bytes received |
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

```javascript
{
  "server_id": "NACDVKFBUW4C4XA24OOT6L4MDP56MW76J5RJDFXG7HLABSB46DCMWCOW",
  "now": "2019-06-24T14:28:16.520365-07:00",
  "num_connections": 2,
  "total": 2,
  "offset": 0,
  "limit": 1024,
  "connections": [
    {
      "cid": 1,
      "ip": "127.0.0.1",
      "port": 49764,
      "start": "2019-06-24T14:27:25.94611-07:00",
      "last_activity": "2019-06-24T14:27:25.954046-07:00",
      "rtt": "275µs",
      "uptime": "50s",
      "idle": "50s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "name": "NATS Sample Subscriber",
      "lang": "go",
      "version": "1.8.1",
      "subscriptions_list": [
        "hello.world"
      ]
    },
    {
      "cid": 2,
      "ip": "127.0.0.1",
      "port": 49767,
      "start": "2019-06-24T14:27:43.403923-07:00",
      "last_activity": "2019-06-24T14:27:43.406568-07:00",
      "rtt": "96µs",
      "uptime": "33s",
      "idle": "33s",
      "pending_bytes": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "name": "NATS Sample Subscriber",
      "lang": "go",
      "version": "1.8.1",
      "subscriptions_list": [
        "foo.bar"
      ]
    }
  ]
}
```

### JetStream Information

The `/jsz` endpoint reports information about the JetStream subsystem.

**Endpoint:** `http://server:port/jsm`

| Result | Return Code |
| :--- | :--- |
| Success | 200 \(OK\) |
| Error | 400 \(Bad Request\) |

#### Arguments

| Argument | Values | Description |
| :--- | :--- | :--- |
| acc | account name | Provide information for a specfic account |
| accounts | true, 1, false, 0 | Provide information for all accounts. The default is false. |
| streams | true, 1, false, 0 | Include stream information. The default is false. |
| consumers | true, 1, false, 0 | Include consumer information. The default is false. |
| config | true, false | Include configuration with streams and consumers. The default is false. |
| offset | integer &gt; 0 | Pagination offset.  Default is 0. |
| limit | integer &gt; 0 | Number of results to return.  Default is 1024. |
| leader-only | true, false | TODO |

As noted above, the `routez` endpoint does support the `subs` argument from the `/connz` endpoint. For example: [http://demo.nats.io:8222/routez?subs=1](http://demo.nats.io:8222/jsz?accounts=1&streams=1&consumers=1&config=1)

#### Example

* Get JetStream information:  [http://host:port/jsz?accounts=1&streams=1&consumers=1&config=1](http://host:port/jsz?accounts=1&streams=1&consumers=1&config=1)

#### Response

```javascript
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

```javascript
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
| gw\_name | string | Return only remote gateways with this name. |
| acc\_name | string | Limit the list of accounts to this account name. |

#### Examples

* Retrieve Gateway Information: [http://demo.nats.io:8222/gatewayz](http://demo.nats.io:8222/gatewayz)

#### Response

```javascript
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

### Leaf Nodes Information

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

```javascript
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

```javascript
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

## Creating Monitoring Applications

NATS monitoring endpoints support [JSONP](https://en.wikipedia.org/wiki/JSONP) and [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works). You can easily create single page web applications for monitoring. To do this you simply pass the `callback` query parameter to any endpoint.

For example:

```bash
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

