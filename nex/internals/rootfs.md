# Root File System
The root file system used by Nex in its spawned Firecracker virtual machines is an ext4 (64-bit file system) [block device](https://linux-kernel-labs.github.io/refs/heads/master/labs/block_device_drivers.html). In oversimplified terms, it's basically a single file that represents an entire file system.

## Building a Root File System
There are countless ways to populate an ext4 file, from programmatic to scripted. While our current CI pipelines are more programmatic than scripted, the same underlying principles still apply.

To build a root file system:

1. Create an empty `rootfs.ext4` file of a given size with empty blocks
2. Use the `mkfs.ext4` utility to convert the block device into an `ext4` file system
3. Fill in the files in the file system as needed.

An unexpected but incredibly useful trick is that we can use Docker for step 3. We can mount the block device as a folder and then map that folder to a folder inside the Docker image. If we run the setup script inside the Docker image and then unmount the file system, our `rootfs.ext4` file will be a snapshot of what the Docker image looked like when it finished.

Here's a sample script that does just that:

```
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

Here we're using the public `alpline` Docker image to run a script, `setup-alpine.sh` that will modify the file system to build what we're looking for. Note that we've actually mounted the `openrc-service.sh` script to `/etc/init.d/agent`. This effectively copies this file into the new root file system, setting up our OpenRC service.

Let's see what `setup-alpine.sh` might look like:

```
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

# This is our script that runs nex-agent
rc-update add agent boot

for d in bin etc lib root sbin usr; do tar c "/$d" | tar x -C /my-rootfs; done
for dir in dev proc run sys var tmp; do mkdir /my-rootfs/${dir}; done

chmod 1777 /my-rootfs/tmp
mkdir -p /my-rootfs/home/nex/
chown 1000:1000 /my-rootfs/home/nex/
```

This script adds `openrc` and `util-linux` to to the bare `alpine` image, and then uses `rc-update` to add the `agent` script to the `boot` phase.

We currently use a combination of code and scripts to automatically generate a vetted root file system that can be automatically downloaded via the `nex preflight` command.