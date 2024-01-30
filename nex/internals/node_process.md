# Nex Node Process
The Nex node process is the corre of the Nex ecosystem. It exposes a control interface API over NATS, through which client applications can deploy and undeploy workloads as well as interrogate the state of nodes and the workloads currently deployed.

The Nex node maintains a pool of Firecracker virtual machines. It is into this pool that workloads are deployed. The reason we have a pool is that this allows us to have a configurable number of "warm", ready-to-go virtual machines that are eagerly awaiting a workload. This lets us deploy workloads incredibly fast.

In order to maintain this pool of Firecracker VMs, the Nex node needs to interact both with the installed Firecracker application and with installed CNI (Container Networking Initative) plugins, both of which can be downloaded and installed automatically by using the `nex` CLI's `preflight` command.

Because the Nex node process spawns the `firecracker` process, which will in turn attempt to use CNI plugins, this process almost always requires root privilege. When developing locally it's easy to simply use `sudo`. However, in production, you may want to create a special user context in which the Nex node can run.

In isolation, a single Nex node is capable of running hundreds of functions and services. When you strategically place Nex nodes throughout your NATS infrastructure, you create a unified execution cluster capable of scaling to meet virtually any demand.

Informally, we often refer to a cluster of Nex nodes as a _Nexus_.
