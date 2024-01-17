# Installing Nex
All of the functionality you need for Nex is conveniently wrapped up in a single command line tool. To install it, all you need to do is use the following `go` command (A more formal release image will be added soon).

```
go install github.com/ConnectEverything/nex/nex@latest
```

{% hint style="info" %}
**Note** that while the `nex` binary can be run on any operating system, all of the node functionality is only available on 64-bit Linux because of the requirements dictated by [Firecracker](https://firecracker-microvm.github.io). Also note that running Linux inside docker won't satisfy those requirements.
{% endhint %}

Once you've installed it, you should be able to check the CLI version with `nex version`. Once you have the `nex` binary installed and you have an instance of a NATS server available, you can move on to the next step in this guide.

## Performing the Preflight Check
Starting a Nex node involves the use of the Linux kernel, the `firecracker` binary, a few CNI configuration files, an `ext4` root file system, and machine configuration. That's a lot to keep track of, so Nex has conveniently provided a _preflight check_. Before you can run a preflight check, however, you need to create a node configuration file.

### Creating a Node Configuration
The easiest way to create a node configuration file is to copy one from the Nex examples folder, such as the [simple.json](https://github.com/ConnectEverything/nex/blob/main/examples/nodeconfigs/simple.json) file, which contains the following JSON:

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

This configuration file will look for a linux kernel file (`vmlinux`) and a root file system (`rootfs.ext4`) in the default resource directory. You can override either of these filenames by supplying the `kernel_file` or `rootfs_file` fields.

Put this configuration file anywhere you like, but `preflight` will check `./config.json` by default. For each dependency `preflight` doesn't find, it can create default configuration files and download missing dependencies such as the `firecracker` binary, a Linux kernel, and our vetted root file system.

After you've run `preflight` and it downloaded all of the missing components, run it one more time to make sure your output looks similar to what is shown below. There should be a green checkmark for each of the checklist items. Make sure everything checks out before continuing.

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

With a running NATS server and a passing pre-flight checklist, you're ready to start running workloads on NATS!