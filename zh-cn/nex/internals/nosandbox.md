# 在没有 Firecracker 的情况下运行工作负载
Firecracker 为 Nex 运维人员提供了安全可靠地运行不受信任工作负载的信心。然而，当开发人员在迭代其应用程序代码时，如果希望在此过程中通过 Nex 部署，那么要求使用 Firecracker 可能会带来不便。Firecracker 仅适用于 64 位 Linux 机器，并且这些机器的内核中需要启用特定的虚拟化选项。

这不仅限制了不能够使用沙盒的开发者工作站，而且许多云虚拟机类型也不支持这种虚拟化方式。

为了在开发过程中更方便地使用，以及允许 Nex 在边缘设备、小型设备甚至 Windows 上管理工作负载，您可以在“无沙盒”模式下运行 Nex。

以下是一个配置文件示例，其中展示了 `no_sandbox` 字段的使用。将 `no_sandbox` 设置为 `true` 看起来可能有些奇怪，但这种命名约定是故意的，这样做是为了几乎完全避免意外启动一个没有沙盒的 Nex 节点。

#### 示例配置文件
```json
{
    "kernel_filepath": "/path/to/vmlinux-5.10",
    "rootfs_filepath": "/path/to/rootfs.ext4",
    "machine_pool_size": 1,
    "cni": {
        "network_name": "fcnet",
        "interface_name": "veth0"
    },
    "machine_template": {
        "vcpu_count": 1,
        "memsize_mib": 256
    },
    "tags": {
        "simple": "true"
    },
    "no_sandbox": true
}
```

#### Nex Agent
在 `no_sandbox` 模式下运行时，Nex 节点将直接在您的机器上运行工作负载。为此，它会启动 `nex-agent`，将其作为子进程。为了确保 Nex 节点能够找到 `nex-agent` ，您需要将其放置到 PATH 环境变量中的某个位置。

# 生产环境使用
我们强烈建议在生产环境中使用 Firecracker 沙盒，并建议仅在开发和测试环境，或者那些无法运行 Firecracker 的环境（例如 macOS、Windows 或边缘设备）中使用不安全模式。