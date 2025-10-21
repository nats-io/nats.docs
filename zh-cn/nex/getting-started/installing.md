# 安装 Nex
您使用 Nex 所需的所有功能都已方便地封装在一个命令行工具中。要安装它，请在终端中运行以下命令：

```
curl -sSf https://nex.synadia.com/install.sh | sh
```

根据您的操作系统和用户权限，您可能需要将 `sh` 更改为 `sudo sh`，以便脚本可以将 `nex` 二进制文件放置到您的路径中。

如果您不习惯运行此命令，也可以手动安装 Nex：从 [releases](https://github.com/synadia-io/nex/releases) 页面下载最新版本，并将 `nex` 二进制文件放置到您的路径中的某个位置即可。

{% hint style="info" %}
**注意**：虽然 `nex` 二进制文件可以在任何操作系统上运行，但由于 [Firecracker](https://firecracker-microvm.github.io) 的要求，某些节点功能可能仅在 64 位 Linux 上可用。另外请注意，在 Docker 中运行 Linux 并不能满足这些要求。
{% endhint %}

安装完成后，您应该能够通过 `nex --version` 检查 CLI 版本。当您可以通过 `nex` 命令获取帮助信息和版本号后，就可以继续进行本指南的下一步。

## 执行启动前检查
启动一个 Nex 节点可能涉及使用 Linux 内核、`firecracker` 二进制文件、CNI 配置文件、一个 `ext4` 根文件系统、机器配置以及其他一些内容。这么多内容需要跟踪，因此 Nex 已经提供了一个便捷的 _preflight check_（_启动前检查_） 功能。不过，在执行启动前检查之前，您需要创建一个节点配置文件。

### 创建节点配置文件
创建节点配置文件最简单的方法是从 Nex 示例文件夹中复制一个，例如 [simple.json](https://github.com/synadia-io/nex/blob/main/examples/nodeconfigs/simple.json) 文件，其中包含以下 JSON：

```json
{
    "default_resource_dir":"/tmp/wd",
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
    }
}
```

{% hint style="warning" %}
请注意，如果您最终把 `/tmp/wd` 用作资源目录，那么重启后所有内容都会消失，到时候您得再次运行启动前检查。
{% endhint %}

此配置文件将在默认资源目录中查找 Linux 内核文件（`vmlinux`）和根文件系统（`rootfs.ext4`）。您可以通过提供 `kernel_file` 或 `rootfs_file` 字段来覆盖这些文件名。

您可以将此配置文件放在任何位置，但默认情况下 `preflight` 会读取 `./config.json`。对于每个未找到的依赖项，`preflight` 可以创建默认配置文件，并下载缺失的依赖项，例如 `firecracker` 二进制文件、Linux 内核以及我们经过验证的根文件系统。

运行 `preflight` 并下载所有缺失组件后，再运行一次以确保输出与下面所示类似。每个检查项应显示绿色勾号。请务必确认一切正常后再继续。

```
$ nex node preflight --config=../examples/nodeconfigs/simple.json
Validating - Required CNI Plugins [/opt/cni/bin]
	✅ Dependency Satisfied - /opt/cni/bin/host-local [host-local CNI plugin]
	✅ Dependency Satisfied - /opt/cni/bin/ptp [ptp CNI plugin]
	✅ Dependency Satisfied - /opt/cni/bin/tc-redirect-tap [tc-redirect-tap CNI plugin]

Validating - Required binaries [/usr/local/bin]
	✅ Dependency Satisfied - /usr/local/bin/firecracker [Firecracker VM binary]

Validating - CNI configuration requirements [/etc/cni/conf.d]
	✅ Dependency Satisfied - /etc/cni/conf.d/fcnet.conflist [CNI Configuration]

Validating - User provided files []
	✅ Dependency Satisfied - /tmp/wd/vmlinux [VMLinux Kernel]
	✅ Dependency Satisfied - /tmp/wd/rootfs.ext4 [Root Filesystem Template]
```

有了正在运行的 NATS 服务器、通过了启动前检查，您就可以开始在 NATS 上运行工作负载啦！