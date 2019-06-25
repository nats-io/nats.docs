## Monitoring NATS

To monitor the NATS messaging system, `nats-server` provides a lightweight HTTP server on a dedicated monitoring port. The monitoring server provides several endpoints, including [varz](#/varz), [connz](#/connz), [routez](#/routez), and [subsz](#/subz). All endpoints return a JSON object.

The NATS monitoring endpoints support JSONP and CORS, making it easy to create single page monitoring web applications.

### Enabling monitoring from the command line

To enable the monitoring server, start the NATS server with the monitoring flag `-m` and the monitoring port, or turn it on in the [configuration file](configuration.md#configuration-properties).

    -m, --http_port PORT             HTTP PORT for monitoring
    -ms,--https_port PORT            Use HTTPS PORT for monitoring

Example:

```sh
$ nats-server -m 8222
[4528] 2019/06/01 20:09:58.572939 [INF] Starting nats-server version 2.0.0
[4528] 2019/06/01 20:09:58.573007 [INF] Starting http monitor on port 8222
[4528] 2019/06/01 20:09:58.573071 [INF] Listening for client connections on 0.0.0.0:4222
[4528] 2019/06/01 20:09:58.573090 [INF] nats-server is ready</td>
```

To test, run `nats-server -m 8222`, then go to <a href="http://localhost:8222/" target="_blank">http://localhost:8222/</a>

### Enable monitoring from the configuration file

You can also enable monitoring using the configuration file as follows:

```yaml
http_port: 8222
```

## Monitoring endpoints

The following sections describe each supported monitoring endpoint: `varz`, `connz`, `routez`, and `subsz`.

### /varz

The endpoint <a href="http://localhost:822/varz" target="_blank">http://localhost:8222/varz</a> reports various general statistics.

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
  "cpu": 0,
  "connections": 0,
  "total_connections": 0,
  "routes": 0,
  "remotes": 0,
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

### /connz

The endpoint <a href="http://localhost:8222/connz" target="_blank">http://localhost:8222/connz</a> reports more detailed information on current connections. It uses a paging mechanism which defaults to 1024 connections.

You can control these via URL arguments (limit and offset). For example: <a href="http://localhost:8222/connz?limit=1&offset=1" target="_blank">http://localhost:8222/connz?limit=1&offset=1</a>.

You can also report detailed subscription information on a per connection basis using subs=1. For example: <a href="http://localhost:8222/connz?limit=1&offset=1&subs=1" target="_blank">http://localhost:8222/connz?limit=1&offset=1&subs=1</a>.

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

### /routez

The endpoint <a href="http://localhost:8222/routez" target="_blank">http://localhost:8222/routez</a> reports information on active routes for a cluster. Routes are expected to be low, so there is no paging mechanism with this endpoint.

The `routez` endpoint does support the `subs` argument from the `/connz` endpoint. For example: <a href="http://localhost:8222/routez?subs=1" target="_blank">http://localhost:8222/routez?subs=1</a>

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

### /subsz

The endpoint <a href="http://localhost:8222/subz" target="_blank">http://localhost:8222/subz</a> reports detailed information about the current subscriptions and the routing data structure.

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

## Monitoring Tools

In addition to writing custom monitoring tools, you can monitor nats-server in Prometheus. The [Prometheus NATS Exporter](https://github.com/nats-io/prometheus-nats-exporter) allows you to configure the metrics you want to observe and store in Prometheus. There's a sample [Grafana](https://grafana.com) dashboard that you can use to visualize the server metrics.
