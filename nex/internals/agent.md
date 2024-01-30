# Nex Agent
The **Nex Agent** is responsible for managing _only one_ workload. Through the agent's API, the node can request that a workload be deployed, undeployed, or (for functions) triggered.

Internal to the agent is the logic that determines how the workload is managed. We have a provider system in the Go code that makes it easy for us to expand and enhance the types of workloads we support. 

Workloads are currently handled as follows:

* **elf** (64-bit Linux) _service_ - This binary is executed as a child process of the agent upon workload deployment. The environment variables from the deploy request as passed to the binary after decryption.
* **JavaScript** _function_ - This function is deployed idle and then triggered in response to a configured set of stimuli defined in the deployment request. For example, you can define a set of subjects and wildcards that will be used to trigger the JavaScript function.
* **WebAssembly** _function_ - This function is deployed idle and then trigered in response to configured stimuli (declared the same way as with all function types).

All function-type workloads must rely on [host services](../host_services/readme.md) in order to interact with managed resources like key-value buckets, publication/request, object stores, and more.

## Agent Startup
The agent process is the `nex-agent` binary produced by [this Go code](https://github.com/synadia-io/nex/tree/main/agent). This binary is _not_ executed directly by the Node process, nor is it ever launched by developers or users.

The agent resides within the [root file system](./rootfs.md). When you launch a Firecracker virtual machine, it isn't quite like issuing a Docker `run` command. Launching a Firecracker VM is like booting an operating system. In order to tell a Linux operating system what processes to start when launched (e.g. when the Firecracker VM boots), we need an [init](https://en.wikipedia.org/wiki/Init) system. 

Init systems can be confusing and intimidating. When you distill it down to the core, the `init` process in Linux is just the first process started during boot. Depending on which application you use for `init`, you configure your startup services and other boot-time launch activity differently.

For reasons that we won't get into here, it's not a good idea to make a process like `nex-agent` be the init process. Rather, we want the init process to spawn and manage the `nex-agent`. 

To do this, we're using [OpenRC](https://github.com/OpenRC/openrc/blob/master/user-guide.md). The default OpenRC configuration used for the agent is as follows:

```
#!/sbin/openrc-run

name=$RC_SVCNAME
description="Nex Agent"
supervisor="supervise-daemon"
command="/usr/local/bin/agent"
pidfile="/run/agent.pid"
command_user="nex:nex"
output_log="/home/nex/nex.log"
error_log="/home/nex/err.log"

depend() {
	after net.eth0
}
```

This script defines the basic properties of our OpenRC _service_. The service, "Nex Agent", runs as the user `nex` within the group `nex` and the executable file is `/usr/local/bin/agent`. It's also important to note that this service cannot be started until after the `net.eth0` device has been initialized.

For more information on _how_ the agent is physically placed into the root file system, continue on to the next section.