# Monitoring

To monitor the NATS Streaming system, a lightweight HTTP server is used on a dedicated monitoring port. The monitoring server provides several endpoints, all returning a JSON object.

## Enabling from the command line

To enable the monitoring server, start the NATS Streaming Server with the monitoring flag -m \(or -ms\) and specify the monitoring port.

Monitoring options

```text
-m, --http_port PORT             HTTP PORT for monitoring
-ms,--https_port PORT            Use HTTPS PORT for monitoring (requires TLS cert and key)
```

To enable monitoring via the configuration file, use `http: "host:port"` or `https: "host:port"`. There is no explicit configuration flag for the monitoring interface.

For example, after running this:

```text
nats-streaming-server -m 8222
```

you should see that the NATS Streaming server starts with the HTTP monitoring port enabled:

```bash
[19339] 2019/06/24 15:02:38.251091 [INF] STREAM: Starting nats-streaming-server[test-cluster] version 0.15.1
[19339] 2019/06/24 15:02:38.251238 [INF] STREAM: ServerID: 0Z2HXClEM6BPsGaKcoHg5N
[19339] 2019/06/24 15:02:38.251243 [INF] STREAM: Go version: go1.12
[19339] 2019/06/24 15:02:38.251862 [INF] Starting nats-server version 2.0.0
[19339] 2019/06/24 15:02:38.251873 [INF] Git commit [not set]
[19339] 2019/06/24 15:02:38.252173 [INF] Starting http monitor on 0.0.0.0:8222
[19339] 2019/06/24 15:02:38.252248 [INF] Listening for client connections on 0.0.0.0:4222
(...)
```

You can then point your browser \(or curl\) to [http://localhost:8222/streaming](http://localhost:8222/streaming)

## Enabling from the configuration file

To start via the configuration file you can define the monitoring port as follows:

```text
http_port = 8222
```

Then use the `-sc` flag to customize the NATS Streaming configuration:

```bash
nats-streaming-server -sc nats-streaming.conf -ns nats://demo.nats.io:4222 -SDV
```

Confirm that the monitoring endpoint is enabled by sending a request:

```bash
curl 127.0.0.1:8222/streaming/channelsz
{
  "cluster_id": "test-cluster",
  "server_id": "dXUsNRef1z25NpcFmZhBNj",
  "now": "2019-06-24T15:18:37.388938-07:00",
  "offset": 0,
  "limit": 1024,
  "count": 0,
  "total": 0
}
```

