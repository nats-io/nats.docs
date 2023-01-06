# Profiling NATS

When investigating and debugging a performance issue with the NATS Server (i.e. unexpectedly high CPU or RAM utilisation), it may be necessary for you to collect and provide profiles from your deployment for troublshooting. These profiles are crucial to understand where CPU time and memory are being spent.

Note that profiling is an advanced operation for development purposes only. Server operators should use the [monitoring port](/running-a-nats-service/nats_admin/monitoring) instead for monitoring day-to-day runtime statistics.

{% hint style="warning" %}
`nats-server` does not have authentication/authorization for the profiling endpoint. When you plan to open your `nats-server` to the internet make sure to not expose the profiling port as well. By default, profiling binds to every interface `0.0.0.0` so consider setting profiling to `localhost` or have appropriate firewall rules.
{% endhint %}

### Enabling profiling

The NATS Server has `pprof` profiling support built-in, although it must be enabled by setting the `prof_port` in your NATS Server configuration file. For example, to enable the profiling port on TCP/65432:

```
prof_port = 65432
```

Once the profiling port has been enabled, you can download profiles as per the following sections.

These profiles can be inspected using `go tool pprof`, as per the [Go documentation](https://pkg.go.dev/net/http/pprof).

### Memory profile

`http://localhost:65432/debug/pprof/allocs`

This endpoint will return instantly.

For example, to download an allocation profile from NATS running on the same machine:

```shell
curl -o mem.prof http://localhost:65432/debug/pprof/allocs
```

The profile will be saved into `mem.prof`.

### CPU profile

`http://localhost:65432/debug/pprof/profile?seconds=30`

This endpoint will block for the specified duration and then return. You can specify a different duration by adjusting `?seconds=` in the URL if you want to sample a shorter or longer period of time.

For example, to download a CPU profile from NATS running on the same machine with a 30 second window:

```shell
curl -o cpu.prof http://localhost:65432/debug/pprof/profile?seconds=30
```

The profile will be saved into `cpu.prof`.
