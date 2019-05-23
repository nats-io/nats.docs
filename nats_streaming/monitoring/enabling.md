### Enabling

To enable the monitoring server, start the NATS Streaming Server with the monitoring flag -m (or -ms) and specify the monitoring port.

Monitoring options
```
-m, --http_port PORT             HTTP PORT for monitoring
-ms,--https_port PORT            Use HTTPS PORT for monitoring (requires TLS cert and key)
```
To enable monitoring via the configuration file, use `http: "host:port"` or `https: "host:port"` (there is no explicit configuration flag for the monitoring interface).

For example, after running this:
```
nats-streaming-server -m 8222
```
you should see that the NATS Streaming server starts with the HTTP monitoring port enabled:

```
(...)
[53359] 2017/12/18 17:44:31.594407 [INF] Starting http monitor on 0.0.0.0:8222
[53359] 2017/12/18 17:44:31.594462 [INF] Listening for client connections on 0.0.0.0:4222
(...)
```
You can then point your browser (or curl) to [http://localhost:8222/streaming](http://localhost:8222/streaming)
