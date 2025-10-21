# NATS 性能分析

在调查和调试 NATS 服务器的性能问题（例如，CPU 或内存使用率异常升高）时，您可能需要收集并提供部署中的性能分析数据以进行故障排查。这些性能分析数据对于了解 CPU 时间和内存消耗的位置至关重要。

请注意，性能分析是仅为开发人员准备的高级操作。服务器运维应使用 [监控端口](/running-a-nats-service/nats_admin/monitoring) 来监控日常运行统计信息。

### 通过 NATS CLI

NATS CLI 可以从 NATS 服务器请求性能分析数据，**但仅限连接到系统账户时**。默认情况下，性能分析数据会以文件形式输出到当前工作目录，您可以将这些文件发送给相关人员或使用 [`go tool pprof`](https://pkg.go.dev/net/http/pprof) 进行检查。

#### 内存分析

`--name`、`--tags` 和 `--cluster` 选择器可以单独使用，也可以组合使用，以便从特定服务器请求性能分析数据。内存分析数据会立即返回。示例如下：

| 命令                                                    | 描述                                                                                   |
|------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `nats server request profile allocs`                       | Request a memory profile from all servers in the system                                       |
| `nats server request profile allocs ./profiles`            | Request a memory profile from all servers in the system and write to the `profiles` directory |
| `nats server request profile allocs --name=servername1`    | Request a memory profile from `servername1` only                                              |
| `nats server request profile allocs --tags=aws`            | Request a memory profile from all servers tagged as `aws`                                     |
| `nats server request profile allocs --cluster=aws-useast2` | Request a memory profile from all servers in the cluster named `aws-useast2` only             |

#### CPU 分析

`--name`、`--tags` 和 `--cluster` 选择器可以单独使用，也可以组合使用，以便从特定服务器请求性能分析数据。此外，还可以通过 `--timeout` 选项指定 CPU 分析数据的运行时间，默认为 5 秒。示例如下：

| 命令                                                    | 描述                                                                                |
|------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| `nats server request profile cpu`                          | Request a CPU profile from all servers in the system                                       |
| `nats server request profile cpu ./profiles`               | Request a CPU profile from all servers in the system and write to the `profiles` directory |
| `nats server request profile cpu --timeout=10s`            | Request a CPU profile from all servers in the system over a 10 second period               |
| `nats server request profile cpu --name=servername1`       | Request a CPU profile from `servername1` only                                              |
| `nats server request profile cpu --tags=aws`               | Request a CPU profile from all servers tagged as `aws`                                     |
| `nats server request profile cpu --cluster=aws-useast2`    | Request a CPU profile from all servers in the cluster named `aws-useast2` only             |

### 通过性能分析端口

{% hint style="warning" %}
`nats-server` 不会对性能分析端点进行身份验证/授权。如果您计划将 `nats-server` 暴露到公网，请确保不要同时暴露性能分析端口。默认情况下，性能分析绑定到所有接口 `0.0.0.0`，因此请考虑将性能分析端口设置为 `localhost`，或者配置适当的防火墙规则。
{% endhint %}

NATS 服务器可以暴露一个 HTTP `pprof` 性能分析端口，但必须在 NATS 服务器配置文件中设置 `prof_port` 才会启用该端口。请注意，性能分析端口未经过身份验证，其不应向客户端、公网等公开。例如，要在 TCP/65432 上启用性能分析端口：

```
prof_port = 65432
```

请注意，此选项不支持 [配置热重载](../configuration/#configuration-reloading)，因此必须重启服务器才能使配置更改生效。

启用性能分析端口后，您可以按照下文获取性能分析数据。这些性能分析数据可以使用 [`go tool pprof`](https://pkg.go.dev/net/http/pprof) 进行检查。

要查看所有可用的性能分析数据，请访问 [http://localhost:65432/debug/pprof/](http://localhost:65432/debug/pprof/)。

#### 内存分析

`http://localhost:65432/debug/pprof/allocs`

此端点会立即返回。

例如，要从运行在同一台机器上的 NATS 下载分配分析数据：

```shell
curl -o mem.prof http://localhost:65432/debug/pprof/allocs
```

性能分析数据将保存到 `mem.prof` 文件中。

#### CPU 分析

`http://localhost:65432/debug/pprof/profile?seconds=30`

此端点会阻塞指定的时间段，然后返回。您可以通过调整 URL 中的 `?seconds=` 参数来指定不同的采样时间长度，以获取更短或更长时间的性能分析数据。

例如，要从运行在同一台机器上的 NATS 下载一个 30 秒窗口的 CPU 分析数据：

```shell
curl -o cpu.prof http://localhost:65432/debug/pprof/profile?seconds=30
```

性能分析数据将保存到 `cpu.prof` 文件中。