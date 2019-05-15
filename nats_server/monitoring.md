## Monitoring

To monitor the NATS messaging system, `gnatsd` provides a lightweight HTTP server on a dedicated monitoring port. The monitoring server provides several endpoints, including [varz](#/varz), [connz](#/connz), [routez](#/routez), and [subsz](#/subz). All endpoints return a JSON object.

The NATS monitoring endpoints support JSONP and CORS, making it easy to create single page monitoring web applications.

## Enabling monitoring

To enable the monitoring server, start the NATS server with the monitoring flag `-m` and the monitoring port, or turn it on in the [configuration file](/documentation/managing_the_server/configuration).

    -m, --http_port PORT             HTTP PORT for monitoring
    -ms,--https_port PORT            Use HTTPS PORT for monitoring

Example:

```sh
$ gnatsd -m 8222
[4528] 2015/08/19 20:09:58.572939 [INF] Starting gnatsd version 0.8.0
[4528] 2015/08/19 20:09:58.573007 [INF] Starting http monitor on port 8222
[4528] 2015/08/19 20:09:58.573071 [INF] Listening for client connections on 0.0.0.0:4222
[4528] 2015/08/19 20:09:58.573090 [INF] gnatsd is ready</td>
```

To test, run `gnatsd -m 8222`, then go to <a href="http://localhost:8222/" target="_blank">http://localhost:8222/</a>

## Monitoring endpoints

The following sections describe each supported monitoring endpoint: `varz`, `connz`, `routez`, and `subsz`.

### /varz

The endpoint <a href="http://localhost:8222/varz" target="_blank">http://localhost:8222/varz</a> reports various general statistics.

```json
{
  "server_id": "ec933edcd2bd86bcf71d555fc8b4fb2c",
  "version": "0.6.6",
  "go": "go1.5.0",
  "host": "0.0.0.0",
  "port": 4222,
  "auth_required": false,
  "ssl_required": false,
  "max_payload": 1048576,
  "max_connections": 65536,
  "ping_interval": 120000000000,
  "ping_max": 2,
  "http_port": 8222,
  "ssl_timeout": 0.5,
  "max_control_line": 1024,
  "start": "2015-07-14T13:29:26.426805508-07:00",
  "now": "2015-07-14T13:30:59.349179963-07:00",
  "uptime": "1m33s",
  "mem": 8445952,
  "cores": 4,
  "cpu": 0,
  "connections": 39,
  "routes": 0,
  "remotes": 0,
  "in_msgs": 100000,
  "out_msgs": 100000,
  "in_bytes": 1600000,
  "out_bytes": 1600000,
  "slow_consumers": 0
}
```

### /connz

The endpoint <a href="http://localhost:8222/connz" target="_blank">http://localhost:8222/connz</a> reports more detailed information on current connections. It uses a paging mechanism which defaults to 1024 connections.

You can control these via URL arguments (limit and offset). For example: <a href="http://localhost:8222/connz?limit=1&offset=1" target="_blank">http://localhost:8222/connz?limit=1&offset=1</a>.

You can also report detailed subscription information on a per connection basis using subs=1. For example: <a href="http://localhost:8222/connz?limit=1&offset=1&subs=1" target="_blank">http://localhost:8222/connz?limit=1&offset=1&subs=1</a>.

```json
{
  "now": "2015-07-14T13:30:59.349179963-07:00",
  "num_connections": 2,
  "offset": 0,
  "limit": 1024,
  "connections": [
    {
      "cid": 571,
      "ip": "127.0.0.1",
      "port": 61572,
      "pending_size": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "lang": "go",
      "version": "1.0.9",
      "subscriptions_list": [
        "hello.world"
      ]
    },
    {
      "cid": 574,
      "ip": "127.0.0.1",
      "port": 61577,
      "pending_size": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "lang": "ruby",
      "version": "0.5.0",
      "subscriptions_list": [
        "hello.world"
      ]
    }
  ]
}
```

### /routez

The endpoint <a href="http://localhost:8222/routez" target="_blank">http://localhost:8222/routez</a> reports information on active routes for a cluster. Routes are expected to be low, so there is no paging mechanism with this endpoint.

The `routez` endpoint does support the `subs` argument from the `/connz` endpoint. For example: <a href="http://localhost:8222/routez?subs=1" target="_blank">http://localhost:8222/routez?subs=1</a>

```json
{
  "now": "2015-07-14T13:30:59.349179963-07:00",
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

### /subsz

The endpoint <a href="http://localhost:8222/subz" target="_blank">http://localhost:8222/subz</a> reports detailed information about the current subscriptions and the routing data structure.

```json
{
  "num_subscriptions": 3,
  "num_cache": 0,
  "num_inserts": 572,
  "num_removes": 569,
  "num_matches": 200000,
  "cache_hit_rate": 0.99999,
  "max_fanout": 0,
  "avg_fanout": 0,
  "stats_time": "2015-07-14T12:55:25.564818051-07:00"
}
```

## Creating monitoring applications

NATS monitoring endpoints support [JSONP](https://en.wikipedia.org/wiki/JSONP) and [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works). You can easily create single page web applications for monitoring. To do this you simply pass the `callback` query parameter to any endpoint.

For example:

```sh
http://localhost:8222/connz?callback=cb
```

Here is a JQuery example implementation:

```javascript
$.getJSON('http://localhost:8222/connz?callback=?', function(data) {
  console.log(data);
});

```

