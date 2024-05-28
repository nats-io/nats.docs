# Running workloads without Firecracker
Firecracker provides Nex operators with the confidence of being able to safely and securely run untrusted workloads. However, when developers are iterating over
their application code and they want to deploy via Nex during that loop, requiring Firecracker can get in the way. Firecracker will _only_ work on 64-bit
Linux machines that have certain virtualization options enabled in the kernel.

Not only does this limit the developer workstations capable of using the sandbox, but there are a number of cloud virtual machine types that do not support
this kind of virtualization.

To make this easier during development, and to allow Nex to manage workloads at the edge, on small devices, or even on Windows, you can run Nex in "no sandbox" mode.

The following is a configuration file that shows the use of the `no_sandbox` field. It might look a bit awkward to set `no_sandbox` to `true`, but this naming
convention was chosen specifically to make it nearly impossible to accidentally launch a Nex node without a sandbox.

#### Example Configuration File
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
#### NEX Agent
When running in `no_sandbox` mode, the nex node will run workloads directly on your machine.  To do this, it spawns the `nex-agent` as a child process.  In order to 
make sure the nex node can find the agent, you will need to ensure it is placed it somewhere in your PATH.

# Production Use
We strongly recommend the use of the Firecracker sandbox when running in production and suggest that unsafe mode should only be reserved
for development and testing environments or those environments (e.g. macOS, Windows, edge devices) incapable of running Firecracker.
