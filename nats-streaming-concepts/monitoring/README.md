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

```shell
nats-streaming-server -m 8222
```

you should see that the NATS Streaming server starts with the HTTP monitoring port enabled:

```text
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
```
Output
```JSON
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

## Monitoring a NATS Streaming channel with Grafana and Prometheus

Here you'll find examples demonstrating how to use Prometheus query expressions to monitor NATS streaming channels.

### Pending Messages from Channel Foo

```text
sum(nss_chan_subs_pending_count{channel="foo"}) by (client_id)
```

![Pending](https://user-images.githubusercontent.com/26195/54960400-b0c52e80-4f19-11e9-9e92-88fba89fd55e.png)

### Messages Per Sec Delivered on Channel Foo

In this case, `3` is the size of the quorum of NATS Streaming Server nodes. In case of a single instance backed by a relational database we would set it to `1`:

```text
sum(rate(nss_chan_msgs_total{channel="foo"}[5m])) by (channel) / 3
```

![msgs-per-sec](https://user-images.githubusercontent.com/26195/54960588-80ca5b00-4f1a-11e9-92d5-de59c81b6c63.png)

### Msgs/Sec vs Pending on Channel

Example of combining the rate of messages with the pending count to detect whether processing is getting behind:

```text
sum(rate(nss_chan_msgs_total{channel="foo"}[5m])) by (channel) / 3
sum(nss_chan_subs_pending_count{channel="foo"}) by (channel) / 3
```

![combination](https://user-images.githubusercontent.com/26195/54960992-4235a000-4f1c-11e9-8e55-47515a5d944d.png)

