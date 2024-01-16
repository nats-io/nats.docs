# Installing Nex
All of the functionality you need for Nex is conveniently wrapped up in a single command line tool. To install it, all you need to do is use the following `go` command. A more formal release binary will be added soon.

```
go install github.com/ConnectEverything/nex/nex@latest
```

{% hint style="info" %}
**Note** that while the `nex` binary can be run on any operating system, all of the `node` functionality is only available on 64-bit Linux because of the requirements dictated by [firecracker](https://firecracker-microvm.github.io). Also note that running Linux inside docker won't satisfy those requirements.
{% endhint %}

Once you've installed it, you should be able to check the CLI version with `nex version`. Once you have the `nex` binary installed and you have an instance of a NATS server available, you can move on to the next step in this guide.

## Performing the Preflight Check
Starting a nex node involves the use of the Linux kernel, the `firecracker` binary, a few CNI configuration files, an `ext4` root file system, and machine configuration. That's a lot to keep track of, so nex has conveniently provided a preflight check. Before you can run a preflight check, however, you need to create a node configuration file.

### Creating a Node Configuration
The easiest way to create a node configuration file is to copy one from the nex examples folder, such as the [simple.json](https://github.com/ConnectEverything/nex/blob/main/examples/nodeconfigs/simple.json) file. This file contains the following JSON:

```json
{
    "kernel_path": "/tmp/wd/vmlinux-5.10",
    "rootfs_path": "/tmp/wd/rootfs.ext4",
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

Put this file anywhere you like. Now you can run `nex node preflight` and it will check all of the prerequisites you'll need. For each one it doesn't find, it can create missing configuration files and download missing dependencies such as the `firecracker` binary, a Linux kernel, and our vetted root file system.

After you've run preflight and it downloaded all of the missing components, run it one more time as shown below - you should have a green checkmark for each of the items. Don't continue with the next step in this guide until your preflight check is all green.
