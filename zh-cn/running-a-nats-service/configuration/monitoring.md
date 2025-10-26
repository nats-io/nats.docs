# 启用监控

## NATS 服务器监控

为了监控 NATS 消息系统，`nats-server` 在专用监控端口上提供了一个轻量级 HTTP 服务器。监控服务器提供多个端点，提供统计信息和其他信息。

[NATS 监控端点](../nats\_admin/monitoring/) 支持 [JSONP](https://en.wikipedia.org/wiki/JSONP) 和 [CORS](https://en.wikipedia.org/wiki/Cross-origin\_resource\_sharing#How\_CORS\_works)，使得创建单页监控 Web 应用程序变得容易。

> 警告：`nats-server` 没有对监控端点的认证/授权。当你计划将 `nats-server` 开放到互联网时，确保不要同时暴露监控端口。默认情况下监控端口绑定到每个接口 `0.0.0.0`，因此考虑将监控设置为 `localhost` 或设置适当的防火墙规则。

### 从命令行启用监控

要启用监控服务器，使用监控标志 `-m` 和监控端口启动 NATS 服务器，或在[配置文件](monitoring.md#enable-monitoring-from-the-configuration-file)中打开它。

```
-m, --http_port PORT             HTTP PORT for monitoring
-ms,--https_port PORT            Use HTTPS PORT for monitoring
```

示例：

```bash
nats-server -m 8222
```

```
[4528] 2019/06/01 20:09:58.572939 [INF] Starting nats-server version 2.0.0
[4528] 2019/06/01 20:09:58.573007 [INF] Starting http monitor on port 8222
[4528] 2019/06/01 20:09:58.573071 [INF] Listening for client connections on 0.0.0.0:4222
[4528] 2019/06/01 20:09:58.573090 [INF] nats-server is ready</td>
```

要测试，运行 `nats-server -m 8222`，然后转到 [http://localhost:8222/](http://localhost:8222/)

### 从配置文件启用监控

你也可以使用配置文件启用监控，如下所示：

```yaml
http_port: 8222
```

同时绑定到 `localhost`：

```yaml
http: localhost:8222
```

例如，要在本地监控此服务器，端点将是 [http://localhost:8222/varz](http://localhost:8222/varz)。它报告各种常规统计信息。

## 监控工具

除了编写自定义监控工具外，你还可以在 Prometheus 中监控 nats-server。[Prometheus NATS Exporter](https://github.com/nats-io/prometheus-nats-exporter) 允许你配置要在 Prometheus 中观察和存储的指标。有一个示例 [Grafana](https://grafana.com) 仪表板，你可以使用它来可视化服务器指标。
