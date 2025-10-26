# 根文件系统
Nex 在其启动的 Firecracker 虚拟机中 使用的根文件系统是一个 ext4（64位文件系统）[块设备](https://linux-kernel-labs.github.io/refs/heads/master/labs/block_device_drivers.html)。简单来说，它基本上就是一个代表整个文件系统的单个文件。

## 构建根文件系统
#### 使用 `nex` CLI
截至 2024 年 4 月，Nex CLI 已具备构建根文件系统（一个 `.ext4` 文件）的功能。要构建根文件系统，请运行以下命令：

```bash
└─❯ nex rootfs --help
usage: nex rootfs [<flags>]

Build custom rootfs

Flags:
  --script=script.sh                   Additional boot script ran during initialization
  --image="synadia/nex-rootfs:alpine"  Base image for rootfs build
  --agent=../path/to/nex-agent         Path to agent binary
  --size=157286400                     Size of rootfs filesystem
```

您至少需要包含 `--agent` 标志。  
请注意，您需要确保根文件系统足够大，以容纳稍后通过 `nex run` 运行的任何二进制文件。默认大小为 150MB，这通常足以支持约 20MB 的二进制文件。

#### 土法手动构建
从编程到脚本化，有无数种方式可以填充一个 ext4 文件系统。尽管我们当前的 CI 管道更多是基于编程的方式，但基本原理仍然适用。

构建根文件系统的步骤如下：

1. 创建一个给定大小的空 `rootfs.ext4` 文件，并填充空块。
2. 使用 `mkfs.ext4` 工具将该块设备转换为一个 `ext4` 文件系统。
3. 根据需要向该文件系统中添加文件。

一个意外但非常有用的小技巧是，我们可以使用 Docker 来完成第 3 步。我们可以将块设备挂载为一个文件夹，然后将该文件夹映射到 Docker 镜像内的某个文件夹。如果我们在 Docker 镜像内运行设置脚本，然后卸载文件系统，那么我们的 `rootfs.ext4` 文件就会成为 Docker 镜像完成时的状态快照。

以下是一个示例脚本，实现了上述功能：

```bash
#!/bin/bash

set -xe

dd if=/dev/zero of=rootfs.ext4 bs=1M count=100
mkfs.ext4 rootfs.ext4
mkdir -p /tmp/my-rootfs
mount rootfs.ext4 /tmp/my-rootfs

docker run -i --rm \
    -v /tmp/my-rootfs:/my-rootfs \
    -v "$(pwd)/nex-agent/agent:/usr/local/bin/agent" \
    -v "$(pwd)/openrc-service.sh:/etc/init.d/agent" \
    alpine sh <setup-alpine.sh

umount /tmp/my-rootfs
```

这里我们使用公共的 `alpine` Docker 镜像来运行一个脚本 `setup-alpine.sh`，该脚本会修改文件系统以构建我们需要的内容。请注意，我们实际上将 `openrc-service.sh` 脚本挂载到了 `/etc/init.d/agent`。这有效地将该文件复制到新的根文件系统中，从而设置好我们的 OpenRC 服务。

让我们看看 `setup-alpine.sh` 可能是什么样子：

```bash
#!/bin/sh

set -xe

apk add --no-cache openrc
apk add --no-cache util-linux

ln -s agetty /etc/init.d/agetty.ttyS0
echo ttyS0 >/etc/securetty
rc-update add agetty.ttyS0 default

echo "root:root" | chpasswd

echo "nameserver 1.1.1.1" >>/etc/resolv.conf

addgroup -g 1000 -S nex && adduser -u 1000 -S nex -G nex

rc-update add devfs boot
rc-update add procfs boot
rc-update add sysfs boot

# 这是我们运行 nex-agent 的脚本
rc-update add agent boot

for d in bin etc lib root sbin usr; do tar c "/$d" | tar x -C /my-rootfs; done
for dir in dev proc run sys var tmp; do mkdir /my-rootfs/${dir}; done

chmod 1777 /my-rootfs/tmp
mkdir -p /my-rootfs/home/nex/
chown 1000:1000 /my-rootfs/home/nex/
```

此脚本首先向基础的 `alpine` 镜像中添加了 `openrc` 和 `util-linux`，然后使用 `rc-update` 添加 `agent` 脚本到启动阶段。

目前，我们结合代码和脚本自动构建经过验证的根文件系统，可以通过 `nex preflight` 命令自动下载。